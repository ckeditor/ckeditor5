#!/bin/bash

# @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
# For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license

set -e

read -p "Are you sure? " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
	# Update the `stable` branch in the `ckeditor5` repository.
	git checkout stable && git merge master && git checkout master

	# Push the `#stable` branch.
	git push origin stable master

	echo "Success! 🎂"
fi
