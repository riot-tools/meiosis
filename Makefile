build:
	@ npm run rollup

test:
	@ npm run lint
	@ npm run test

deploy:
	@ ./scripts/publish.sh
