#!/bin/bash

# @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
# For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license

# Get branch name.
INITIAL_BRANCH=$( git branch --show-current )

# Build dlls for core.
yarn dll:build

# Checkout previous commit.
LAST_TAG=$( git tag --sort=committerdate | grep -E '[0-9]' --color=none | tail -1 )
git checkout $LAST_TAG

# Build dll for an example package.
cd packages/ckeditor5-basic-styles
yarn dll:build
cd ../..

# Serve manual for ckeditor5 and run crawler to check for errors.
npx --yes start-server-and-test "yarn manual -f ckeditor5/all-features-dll --no-dll" "http://localhost:8125" "yarn manual:verify"

git checkout $INITIAL_BRANCH
