#!/bin/bash

# @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
# For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options

# `set -e` cannot be used because if the web crawler will fail, the HTTP server will not be closed.

while getopts f:r:i: flag
do
  case "${flag}" in
    f) FILES=${OPTARG};;
    r) REPOSITORY=${OPTARG};;
    i) IDENTITY_FILE=${OPTARG};;
  esac
done

MANUAL_TEST_SERVER_OPTIONS="--disable-watch --silent -r $REPOSITORY"

if [ ! -z "$FILES" ]
then
  MANUAL_TEST_SERVER_OPTIONS="$MANUAL_TEST_SERVER_OPTIONS -f $FILES"
fi

if [ ! -z "$IDENTITY_FILE" ]
then
  MANUAL_TEST_SERVER_OPTIONS="$MANUAL_TEST_SERVER_OPTIONS -i $IDENTITY_FILE"
else
  MANUAL_TEST_SERVER_OPTIONS="$MANUAL_TEST_SERVER_OPTIONS --no-identity-file"
fi

echo "Starting the manual test server..."

# Find a free port for the manual test server. The port is discovered by binding to port 0
# (which lets the OS assign an ephemeral port) and then reading back the assigned port.
# There is a small race window between releasing this port and the server binding to it,
# but the server's EADDRINUSE retry logic handles that safely.
PORT=$(node -e "const s=require('net').createServer();s.listen(0,()=>{process.stdout.write(String(s.address().port));s.close()})")

# `yarn run` does not forward SIGTERM to process, so we need to use the command directly.
node --max_old_space_size=8192 node_modules/@ckeditor/ckeditor5-dev-tests/bin/testmanual.js --tsconfig ./tsconfig.test.json --port $PORT $MANUAL_TEST_SERVER_OPTIONS &

MANUAL_TEST_SERVER_PROCESS_ID=$!

echo "Waiting for the server on port $PORT..."

node_modules/.bin/wait-on "http://localhost:$PORT" && pnpm run manual:verify --port $PORT

MANUAL_VERIFY_EXIT_CODE=$?

echo "Closing the manual test server..."
kill -9 $MANUAL_TEST_SERVER_PROCESS_ID

# If the web crawler failed, returns non-zero exit code.
if [ "$MANUAL_VERIFY_EXIT_CODE" -ne "0" ]
then
  exit 1
fi
