#!/bin/bash

# @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
# For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license

# Symlinks packages from https://github.com/ckeditor/ckeditor5-dev in ckeditor5's node_modules.
# This allows easily switching to dev versions of ckeditor5-dev-* packages.

set -e

# If it doesn't exist the following lines won't work.
if [ ! -d node_modules/@ckeditor ]; then
  mkdir node_modules/@ckeditor
fi

echo "Linking packages from ckeditor5-dev..."

echo "Linking ckeditor5-dev-docs..."
rm -rf node_modules/@ckeditor/ckeditor5-dev-docs
ln -s ../../../ckeditor5-dev/packages/ckeditor5-dev-docs node_modules/@ckeditor

echo "Linking ckeditor5-dev-env..."
rm -rf node_modules/@ckeditor/ckeditor5-dev-env
ln -s ../../../ckeditor5-dev/packages/ckeditor5-dev-env node_modules/@ckeditor

echo "Linking ckeditor5-dev-tests..."
rm -rf node_modules/@ckeditor/ckeditor5-dev-tests
ln -s ../../../ckeditor5-dev/packages/ckeditor5-dev-tests node_modules/@ckeditor

echo "Linking ckeditor5-dev-utils..."
rm -rf node_modules/@ckeditor/ckeditor5-dev-utils
ln -s ../../../ckeditor5-dev/packages/ckeditor5-dev-utils node_modules/@ckeditor

echo "Linking jsdoc-plugins..."
rm -rf node_modules/@ckeditor/jsdoc-plugins
ln -s ../../../ckeditor5-dev/packages/jsdoc-plugins node_modules/@ckeditor

echo "Linking ckeditor5-dev-webpack-plugin..."
rm -rf node_modules/@ckeditor/ckeditor5-dev-webpack-plugin
ln -s ../../../ckeditor5-dev/packages/ckeditor5-dev-webpack-plugin node_modules/@ckeditor

echo "Linking linters packages..."

echo "Linking eslint-config-ckeditor5..."
rm -rf node_modules/eslint-config-ckeditor5
ln -s ../../eslint-config-ckeditor5 node_modules/

echo "Linking eslint-plugin-ckeditor5-rules..."
rm -rf node_modules/eslint-plugin-ckeditor5-rules
ln -s ../../eslint-plugin-ckeditor5-rules node_modules/

echo "Linking stylelint-config-ckeditor5..."
rm -rf node_modules/stylelint-config-ckeditor5
ln -s ../../stylelint-config-ckeditor5 node_modules/
