#!/usr/bin/env bash

npm run prepare
npm run test

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

echo "Commit message: "

read commitMessage

git add .
git commit -am "$commitMessage"

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

echo "Version update? (major, minor, patch)"

read versionCommand

npm version $versionCommand

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi


git push origin master

npm publish