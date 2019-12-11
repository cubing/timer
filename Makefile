NODE_BIN = ./node_modules/.bin

.PHONY: dist
dist: clean-dist
	env PROD=true ${NODE_BIN}/webpack-cli

.PHONY: dev
dev:
	npx parcel src/index.html

.PHONY: test
test:
	${NODE_BIN}/mocha -r ts-node/register test/*.ts

.PHONY: clean
clean: clean-dist

.PHONY: clean-dist
clean-dist:
	rm -rf ./dist
