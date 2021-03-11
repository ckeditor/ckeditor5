#!/bin/bash

# @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
# For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license

set -e

while getopts f:r:i: flag
do
    case "${flag}" in
        f) FILES=${OPTARG};;
        r) REPOSITORY=${OPTARG};;
        i) IDENTITY_FILE=${OPTARG};;
    esac
done

MANUAL_TEST_SERVER_OPTIONS="-r $REPOSITORY"

if [ ! -z "$FILES" ]
then
      MANUAL_TEST_SERVER_OPTIONS="$MANUAL_TEST_SERVER_OPTIONS -f $FILES"
fi

if [ ! -z "$IDENTITY_FILE" ]
then
      MANUAL_TEST_SERVER_OPTIONS="$MANUAL_TEST_SERVER_OPTIONS -i $IDENTITY_FILE"
fi

echo "Starting the manual test server..."

# `yarn run` does not forward SIGTERM to process, so we need to use the command directly.
node --max_old_space_size=8192 node_modules/@ckeditor/ckeditor5-dev-tests/bin/test-manual.js $MANUAL_TEST_SERVER_OPTIONS &

MANUAL_TEST_SERVER_PROCESS_ID=$!

echo "Waiting for the server..."
node_modules/.bin/wait-on http://localhost:8125 && yarn run manual:verify

echo "Closing the manual test server..."
kill -9 $MANUAL_TEST_SERVER_PROCESS_ID
