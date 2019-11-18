#!/bin/bash

# Fetch tags from upstream first
git fetch -t git@github.com:klaytn/caver-js.git

VERSION=$(cat package.json | jq -r '.["version"]')
echo "Trying to tag v$VERSION"
git tag | grep "$VERSION\$"
if [ $? -eq 0 ]; then
  echo "$VERSION is found in git tag!!! You should upgrade version number first!!!"
  echo "Exiting..."
  exit 1
fi

PREV_RCVERSION_FULL=`git tag | grep "$VERSION" | sort | tail -1`
RCSUFFIX="1"
if [ ! -z "$PREV_RCVERSION_FULL" ]; then
  RCSUFFIX=$(echo "${PREV_RCVERSION_FULL##*.}"+1 | bc)
fi

RCVERSION="v$VERSION-rc.$RCSUFFIX"
echo "tagging $RCVERSION"

git tag $RCVERSION
git push upstream $RCVERSION
