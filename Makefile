.PHONY: build
build: clean-dist
	npx parcel build --public-url ./ src/index.html

.PHONY: dev
dev:
	npx parcel src/index.html

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
	rm -rf ./.cache

.PHONY: clean-dist
clean-dist:
	rm -rf ./dist
