.PHONY: build
build: clean setup
	bun run script/build.ts

.PHONY: dev
dev: setup
	bun run script/dev.ts

.PHONY: format
format: setup
	bun x @biomejs/biome check --write

.PHONY: lint
lint: setup
	bun x @biomejs/biome check

.PHONY: setup
setup:
	bun install --no-save

.PHONY: test
test: lint

.PHONY: prepublishOnly
prepublishOnly: clean test

.PHONY: deploy
deploy: build
	bun x @cubing/deploy

.PHONY: clean
clean:
	rm -rf ./dist ./package-lock.json

.PHONY: reset
reset: clean
	rm -rf ./node_modules
