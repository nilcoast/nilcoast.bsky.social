const { parse } = require('rss-to-json');
const { AtpAgent, RichText } = require('@atproto/api');

function shuffle(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function selectRandomPost(items, retries = 5) {
  if (retries <= 0) {
    throw new Error('could not find random post');
  }

  shuffle(items);
  const item = items[0];

  const res = await alreadyPosted(item);
  if (res) {
    selectRandomPost(items, --retries);
  }

  return item;
}

async function main() {
  const { items } = await parse('https://enlace.space/~erik/rss.xml');
  const rando = await selectRandomPost(items);

  console.log({ rando });

  if (!rando) {
    console.error('no random item');
    return;
  }

  const prompt = `
    You are nilcoast.com. You are a news aggregator and you share helpful links that @benoist.dev collections'
    From the provided link and description, come up with a 240 character or less
    "tweet" style message.

    Always include relevant emojis.
    Always include the original link.
    Include 1 hashtag if it's relevant to the article description.
    Never mention @benoist.dev in a tweet.

    Article Title: ${rando.title}
    Article Description: ${rando.description}
    Article Link: ${rando.link}

    Do not make up anything.
  `;

  const resp = await fetch('https://ollama.home.benoist.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OLLAMA_KEY}`
    },
    body: JSON.stringify({
      model: 'llama3.2',
      messages: [{
        role: 'user',
        content: prompt,
      }]
    }),
  });
  if (!resp.ok) {
    console.error(`could not fetch from llm: ${resp}`);
  }

  const data = await resp.json();
  const msg = data.choices[0].message.content.replaceAll('"','');

  const agent = new AtpAgent({
    service: 'https://bsky.social',
  });

  console.log(`going to login`);

  await agent.login({
    identifier: 'nilcoast.com',
    password: process.env.NILCOAST_BSKY_PASS,
  });

  console.log(`got login ${resp}`);

  const rt = new RichText({
    text: msg,
  });

  await rt.detectFacets(agent)

  await agent.post({
    $type: 'app.bsky.feed.post',
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  });

  await markArticle(rando);
}

async function markArticle(item) {
  const id = btoa(item.link);
  const resp = await fetch(`https://webdis.home.benoist.dev/SET/nilbot:${id}/true`, {
    headers: {
      'Authorization': `Basic ${btoa('nilcoast' + ':' + process.env.WEBDIS_RW_PASS)}`
    }
  });

  if (!resp.ok) {
    console.error('could not save record in wedbis');
  }

  return resp;
}

async function alreadyPosted(item) {
  const id = btoa(item.link);
  const resp = await fetch(`https://webdis.home.benoist.dev/GET/nilbot:${id}`);
  if (!resp.ok) {
    console.error('could get record in wedbis');
  }

  const data = await resp.json();

  console.log({ data });

  return !!data.get;
}

main();
