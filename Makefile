.PHONY: build
build: clean
	bun run script/build.ts

.PHONY: dev
dev:
	bun run script/dev.ts

.PHONY: format
format:
	bun x @biomejs/biome format --write ./script ./src

.PHONY: lint
lint:
	bun x @biomejs/biome check ./script ./src

.PHONY: setup
setup:
	bun install

SFTP_PATH = "timer.cubing.net:~/timer.cubing.net/"
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
	rm -rf ./dist ./package-lock.json
