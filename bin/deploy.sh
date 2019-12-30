#!/bin/sh

cd demo/

# make sure pkg is latest version
yarn add get-some-cool-emojis

# build
yarn build

# navigate into the build output directory
cd dist

git init
git add -A
git commit -m 'Deploy demo'

git push -f git@github.com:EastSun5566/let-it-go.git master:gh-pages

cd --
