rollup:
	@ yarn run rollup -c

devtools-transpile:
	@ yarn run riot ./components/rmdevtools.riot -f esm

devtools-generate:
	@ node ./scripts/generateDevtools

build-files:
	@ make devtools-transpile
	@ make devtools-generate
	@ make rollup

run-tests:
	@ yarn run mocha -r @babel/register -r @babel/polyfill --recursive

watch:
	@ nodemon -w lib -w test --ignore lib/rmdevtools.js -x 'make build-files && make run-tests'

preview:
	@ make build-files
	@ npx http-server . -o

publish:
	@ make build-files
	@ yarn run semantic-release
