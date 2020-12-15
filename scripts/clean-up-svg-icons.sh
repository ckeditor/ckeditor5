#!/bin/bash

# @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
# For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license

# Cleans up and optimizes SVG files using the SVGO utility.
# The configuration file is located in svgo.config.json.
#
# Usage:
#	yarn run clean-up-svg-icons path/to/icons/foo.svg
#
# To optimize the entire project:
#	yarn clean-up-svg-icons packages/**/theme/icons

# A list of icons that should not NOT be cleaned up. Their internal structure should not be changed
# because, for instance, CSS animations may depend on it.
BLACKLIST=("return-arrow.svg")

for i in "$@"
do
	if [[ " ${BLACKLIST[@]} " =~ " $(basename $i) " ]]
	then
		echo "\x1B[33m[clean-up-svg-icons]\x1B[0m Note: \"$i\" is blacklisted, skipping."
	else
		svgo --config=./scripts/svgo.config.json -i $i
	fi
done
