all: deploy open

.PHONY: deploy
deploy:
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		cubing.net:~/cubing.net/inspection/
	echo "\nDone deploying. Go to http://cubing.net/inspection\n"

.PHONY: deploy-test
deploy-test:
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		alg.cubing.net:~/cubing.net/inspection-test/
	echo "\nDone deploying. Go to http://cubing.net/inspection-test/\n"

.PHONY: open
open:
	open "http://cubing.net/inspection/"
