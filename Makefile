build: release/nilcoast.bsky.social

release/nilcoast.bsky.social: script.js
	bun build script.js --compile --outfile $@
