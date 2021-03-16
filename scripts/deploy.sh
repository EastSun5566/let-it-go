#!/bin/sh

set -e

cd demo

yarn add let-it-go@latest
yarn build

cd dist

git init
git add -A
git commit -m 'chore(deploy): deploy demo'

git push -f git@github.com:EastSun5566/let-it-go.git master:gh-pages

cd --
