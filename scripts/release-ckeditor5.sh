#!/bin/sh

# @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
# For licensing, see LICENSE.md.

set -e

read -p "Did you update the README.md? " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
	# Release the CKEditor5 repository.
	node ./scripts/release/release-ckeditor5.js

    # Update the `stable` branch in the ckeditor5 repository.
	git checkout stable && git merge master && git checkout master

	# Update all `stable` branches in all packages.
	mgit exec 'git checkout stable && git merge master && git checkout master'

	# Make sure that `mgit.json` for `stable` and `master` branches is correct.
	# `stable` branch.
	git checkout stable && \
	node -e "require( './scripts/release/update-mgit-branches' )( 'stable' );" && \
	git commit -a -m "Internal: Use stable branches. [skip ci]".

	# `master` branch.
	git checkout master && \
	git merge stable && \
	node -e "require( './scripts/release/update-mgit-branches' )( 'master' );" && \
	git commit -a -m "Internal: Use master branches. [skip ci]"

	# Push the `stable` branches.
	git push origin stable master && \
	mgit exec 'git push origin stable'

	# Add `stable` branches in all repos which don't have them yet.
	mgit exec 'git checkout -b stable && git push origin stable && git checkout master'
else
	echo "Update the \"Releases\" section in README.md before starting the release process."
fi
