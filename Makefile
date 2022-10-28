.PHONY: build
build: clean-dist
	npx parcel-bundler build --public-url ./ src/index.html

.PHONY: dev
dev:
	node script/dev.js

SFTP_PATH = "towns.dreamhost.com:~/timer.cubing.net/"
URL       = "https://timer.cubing.net/"

.PHONY: deploy
deploy: build
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/ \
		${SFTP_PATH}
	echo "\nDone deploying. Go to ${URL}\n"


.PHONY: clean
clean: clean-dist

.PHONY: clean-dist
clean-dist:
	rm -rf ./dist
