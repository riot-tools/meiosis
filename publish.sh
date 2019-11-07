#!/usr/bin/env bash

npm run test

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

echo "Version update? (major, minor, patch)"

read versionCommand

echo "npm version $versionCommand"

rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

echo "Commit message: "

read commitMessage

echo "git commit -am $commitMessage"

# rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi

echo "git push origin master"

echo "npm publish"