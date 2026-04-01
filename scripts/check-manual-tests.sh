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

PORT_FILE="build/.manual-tests/.port"
rm -f "$PORT_FILE"

# `yarn run` does not forward SIGTERM to process, so we need to use the command directly.
node --max_old_space_size=8192 node_modules/@ckeditor/ckeditor5-dev-tests/bin/testmanual.js --tsconfig ./tsconfig.test.json $MANUAL_TEST_SERVER_OPTIONS &

MANUAL_TEST_SERVER_PROCESS_ID=$!

echo "Waiting for the server..."

# Wait for the port file to be created and written by the server.
# Fall back to the default port if the file is not produced (e.g. older server version).
# Bail out if the server process exits before we detect a port.
DEFAULT_PORT=8125
TIMEOUT=60
ELAPSED=0
PORT=""

while [ -z "$PORT" ]; do
  if ! kill -0 "$MANUAL_TEST_SERVER_PROCESS_ID" 2>/dev/null; then
    echo "Server process exited before producing the port file."
    exit 1
  fi

  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "Port file not found within ${TIMEOUT}s. Falling back to default port ${DEFAULT_PORT}."
    PORT=$DEFAULT_PORT
    break
  fi

  sleep 1
  ELAPSED=$((ELAPSED + 1))

  if [ -f "$PORT_FILE" ]; then
    PORT=$(cat "$PORT_FILE")
  fi
done

node_modules/.bin/wait-on "http://localhost:$PORT" && MANUAL_TEST_PORT=$PORT pnpm run manual:verify

MANUAL_VERIFY_EXIT_CODE=$?

echo "Closing the manual test server..."
kill -9 $MANUAL_TEST_SERVER_PROCESS_ID

# If the web crawler failed, returns non-zero exit code.
if [ "$MANUAL_VERIFY_EXIT_CODE" -ne "0" ]
then
  exit 1
fi
