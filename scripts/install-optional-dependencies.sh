#!/bin/sh

# @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
# For licensing, see LICENSE.md.

# Installs optional dev dependencies.
# They are required by the following tasks:
#
# * gulp docs
# * gulp changelog:dependencies
# * gulp release:dependencies
# * gulp translations:*

set -e

npm i @ckeditor/ckeditor5-dev-env umberto

cd scripts/docs/snippet-adapter
npm i
cd ../..
