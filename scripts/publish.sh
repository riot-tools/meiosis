#!/usr/bin/env bash

npm run prepare
npm run test

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

npm run commit

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

npm run release

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

git push origin master

npm publish