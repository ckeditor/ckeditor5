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

for i in "$@"
do
	svgo --config=./scripts/svgo.config.json -i $i
done
