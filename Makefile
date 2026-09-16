.PHONY: build
build: clean setup
	bun run -- ./script/build.ts

.PHONY: check
check: lint build

.PHONY: dev
dev: setup
	bun run -- ./script/dev.ts

.PHONY: format
format: setup
	bun x -- bun-dx --package @biomejs/biome biome -- check --write

.PHONY: lint
lint: lint-biome lint-tsc

.PHONY: lint-biome
lint-biome: setup
	bun x -- bun-dx --package @biomejs/biome biome -- check

.PHONY: lint-tsc
lint-tsc: setup
	bun x -- bun-dx --package typescript tsc -- --project ./tsconfig.json

.PHONY: setup
setup:
	bun install --frozen-lockfile

.PHONY: test
test: lint

.PHONY: prepublishOnly
prepublishOnly: clean test

.PHOHY: deploy
deploy: build
	bun x -- bun-dx --package @cubing/deploy deploy --

.PHONY: clean
clean:
	rm -rf ./dist ./package-lock.json

.PHONY: reset
reset: clean
	rm -rf ./node_modules
