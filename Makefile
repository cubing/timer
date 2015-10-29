all: deploy open

# Offline caching code depends on the manifest script from:
# https://github.com/lgarron/offline-bootstrap
# The `manifest` lines can be safely removed, but might result in debugging issues.

MANIFEST_FILE  = "cache.manifest"

SFTP_PATH      = "towns.dreamhost.com:~/timer.cubing.net/"
URL            = "http://timer.cubing.net/"

SFTP_TEST_PATH = "towns.dreamhost.com:~/timer.cubing.net/test/"
TEST_URL       = "http://timer.cubing.net/test/"


.PHONY: deploy
deploy:
	# manifest --update ${MANIFEST_FILE}
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		${SFTP_PATH}
	# manifest --revert ${MANIFEST_FILE}
	echo "\nDone deploying. Go to ${URL}\n"

.PHONY: deploy-test
deploy-test:
	# manifest --update ${MANIFEST_FILE}
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		${SFTP_TEST_PATH}
	# manifest --revert ${MANIFEST_FILE}
	echo "\nDone deploying. Go to ${TEST_URL}\n"


.PHONY: open
open:
	open ${URL}
