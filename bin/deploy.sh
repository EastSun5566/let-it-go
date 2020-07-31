#!/bin/sh

cd demo/

# make sure pkg is latest version
yarn add let-it-go

# build
yarn build

# navigate into the build output directory
cd dist

git init
git add -A
git commit -m 'deploy let-it-go demo'

git push -f git@github.com:EastSun5566/let-it-go.git master:gh-pages

cd --
