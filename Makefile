all: deploy open

# Offline caching code depends on the manifest script from:
# https://github.com/lgarron/offline-bootstrap
# The `manifest` lines can be safely removed, but might result in debugging issues.

MANIFEST_FILE  = "cache.manifest"

SFTP_PATH      = "cubing.net:~/cubing.net/inspection/"
URL            = "http://cubing.net/inspection"

SFTP_TEST_PATH = "cubing.net:~/cubing.net/inspection-test/"
TEST_URL       = "http://cubing.net/inspection-test/"


.PHONY: deploy
deploy:
	manifest --update ${MANIFEST_FILE}
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		${SFTP_PATH}
	manifest --revert ${MANIFEST_FILE}
	echo "\nDone deploying. Go to ${URL}\n"

.PHONY: deploy-test
deploy-test:
	manifest --update ${MANIFEST_FILE}
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		--exclude .gitignore \
		--exclude .gitmodules \
		./ \
		${SFTP_TEST_PATH}
	manifest --revert ${MANIFEST_FILE}
	echo "\nDone deploying. Go to ${TEST_URL}\n"


.PHONY: open
open:
	open ${URL}
