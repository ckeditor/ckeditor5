#!/usr/bin/env bash

echo "Building 'build/ckeditor.compat.js'..."
echo ""

webpack --config webpack.compat.config.js

echo ""
echo "Done."
