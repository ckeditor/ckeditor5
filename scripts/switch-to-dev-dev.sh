#!/bin/sh

# @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
# For licensing, see LICENSE.md.

set -e

# If it doesn't exist the following lines won't work.
if [ ! -d node_modules/@ckeditor ]; then
  mkdir node_modules/@ckeditor
fi

echo "Linking ckeditor5-dev-docs..."

rm -rf node_modules/@ckeditor/ckeditor5-dev-docs
ln -s ../../../ckeditor5-dev/packages/ckeditor5-dev-docs node_modules/@ckeditor

echo "Linking ckeditor5-dev-env..."

rm -rf node_modules/@ckeditor/ckeditor5-dev-env
ln -s ../../../ckeditor5-dev/packages/ckeditor5-dev-env node_modules/@ckeditor

echo "Linking ckeditor5-dev-lint..."

rm -rf node_modules/@ckeditor/ckeditor5-dev-lint
ln -s ../../../ckeditor5-dev/packages/ckeditor5-dev-lint node_modules/@ckeditor

echo "Linking ckeditor5-dev-tests..."

rm -rf node_modules/@ckeditor/ckeditor5-dev-tests
ln -s ../../../ckeditor5-dev/packages/ckeditor5-dev-tests node_modules/@ckeditor

echo "Linking ckeditor5-dev-webpack-plugin..."

rm -rf node_modules/@ckeditor/ckeditor5-dev-webpack-plugin
ln -s ../../../ckeditor5-dev/packages/ckeditor5-dev-webpack-plugin node_modules/@ckeditor
