.PHONY: build
build: clean
	node script/build.js

.PHONY: dev
dev:
	node script/dev.js

.PHONY: format
format:
	npx rome format --write ./src

.PHONY: lint
lint:
	npx rome check ./src

SFTP_PATH = "towns.dreamhost.com:~/timer.cubing.net/"
URL       = "https://timer.cubing.net/"

.PHONY: deploy
deploy: build
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/timer.cubing.net/ \
		${SFTP_PATH}
	echo "\nDone deploying. Go to ${URL}\n"

.PHONY: clean
clean:
	rm -rf ./dist
