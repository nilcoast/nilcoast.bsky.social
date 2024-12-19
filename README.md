chicago.wthr.cloud
---

Every 5 hours, post the current conditions to @chicago.wthr.cloud

## Basic Flow

                                0, 4, 8, 12, 4, 8, 12, 4, 8
Periodic nomad job set to a cron for 7am, 11pm, 3pm, 7pm, 11pm, 3am

#### Cron wakes up, and gets the current conditions from the wthr.cloud/api

```bash
npm install rss-to-json
```

<!-- target: rss -->
```bash
node ./script.js | jq -r '.items[4].title + " - " + .items[4].description + " - " +.items[4].link'
```

<!-- name: rss -->
```
A group of scientists warns against creating mirror cells. T... - A group of scientists warns against creating mirror cells. This sentence is somehow not sci-fi: “Drug developers might be ab - https://kottke.org/24/12/0045873-a-group-of-scientists-war
```

#### Gets summary from LLM

<!-- target: llm -->
```bash
llama-eval "Create a tweet with the following information. Use emojis and always include a link to the article: A group of scientists warns against creating mirror cells. T... - A group of scientists warns against creating mirror cells. This sentence is somehow not sci-fi: “Drug developers might be ab - https://kottke.org/24/12/0045873-a-group-of-scientists-war"
```

<!-- name: llm -->
```
"🚨 💡 Breaking: A group of scientists warn against creating mirror cells, fearing potential health risks 💉👥. Could the pursuit of 'self-healing' in medicine be a step too far? 🤔 Read more about their concerns and what you need to know: https://kottke.org/24/12/0045873"
```

#### Post result to bluesky account @chicago.wthr.cloud

```python
from atproto import Client
import os

client = Client()
client.login('nilcoast.com', os.environ['NILCOAST_BSKY_PASS'])
post = client.send_post('🚨 💡 Breaking: A group of scientists warn against creating mirror cells, fearing potential health risks 💉👥. Could the pursuit of "self-healing" in medicine be a step too far? 🤔 Read more about their concerns and what you need to know: https://kottke.org/24/12/0045873')
```
