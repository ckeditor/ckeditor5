#!/bin/bash

# @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
# For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options

# Get branch name.
INITIAL_BRANCH=$( git branch --show-current )

# Prepare CKEditor 5 DLL builds.
yarn dll:build

# Check out to the latest tag.
LAST_TAG=$( git tag --sort=-creatordate | head -1 )
git checkout $LAST_TAG

# Prepare a DLL build for a single feature.
cd packages/ckeditor5-basic-styles
yarn dll:build
cd ../..

# Compile manual tests and verify whether they work.
npx --yes start-server-and-test "yarn manual -f ckeditor5/all-features-dll --no-dll" "http://localhost:8125" "yarn manual:verify"

git checkout $INITIAL_BRANCH
