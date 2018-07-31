all: deploy open

SFTP_PATH      = "towns.dreamhost.com:~/timer.cubing.net/"
URL            = "https://timer.cubing.net/"

SFTP_TEST_PATH = "towns.dreamhost.com:~/timer.cubing.net/test/"
TEST_URL       = "https://timer.cubing.net/test/"


.PHONY: deploy
deploy:
	echo ""
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		${SFTP_PATH}
	echo "\nDone deploying. Go to ${URL}\n"

.PHONY: deploy-test
deploy-test:
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		${SFTP_TEST_PATH}
	echo "\nDone deploying. Go to ${TEST_URL}\n"


.PHONY: open
open:
	open ${URL}
