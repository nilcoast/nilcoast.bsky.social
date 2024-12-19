build: nilcoast.bsky.social

nilcoast.bsky.social: script.js
	bun build script.js --compile --outfile $@
