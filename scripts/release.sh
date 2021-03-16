#!/bin/sh

# check out & sync master
git checkout master
git pull

# Update & tag version
yarn version
git push --follow-tags

yarn publish

git checkout -