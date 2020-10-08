#!/bin/sh

# check out & sync master
git checkout master
git pull

npm run build

# Update & tag version
npm version patch

# push update
git push --follow-tags
git checkout -

npm publish
