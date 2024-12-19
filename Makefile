build: release/nilcoast.bsky.social

deploy: release/nilcoast.bsky.social
	curl -k -T release/nilcoast.bsky.social "https://nilcoast:${WEBDAV_RW_PASS}@webdav.home.benoist.dev/nilcoast.bsky.social"

release/nilcoast.bsky.social: script.js
	bun build script.js --target=bun-linux-x64-baseline --compile --outfile $@
