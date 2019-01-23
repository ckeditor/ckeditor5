#!/bin/bash

# @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
# For licensing, see LICENSE.md.

# Cleans up and optimizes SVG files using the SVGO utility.
# The configuration file is located in svgo.config.json.
#
# Usage:
#	npm run clean-up-svg-icons path/to/icons/*.svg

for i in "$@"
do
	svgo --config=./scripts/svgo.config.json -i $i
done
