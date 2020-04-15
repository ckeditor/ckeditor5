#!/bin/bash

# @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
# For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license

packages=$(ls packages -1 | sed -e 's#^ckeditor5\?-\(.\+\)$#\1#')

errorOccured=0

rm -r -f _coverage
mkdir _coverage
rm -r -f .nyc_output
mkdir .nyc_output

failedTestsPackages=""
failedCoveragePackages=""

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

for package in $packages; do

  echo -e "Running tests for: ${GREEN}$package${NC}"

  # Ignoring stdout for readability. Stderro is ignored too, because we get regular "(node:14303) DeprecationWarning: Tapable.plugin is deprecated. Use new API on `.hooks` instead".
  testsOutput=$(yarn run test -f $package --reporter=dots --production --coverage 2>&1 /dev/null)

  if [ "$?" -ne "0" ]; then
    echo "$testsOutput"
    echo

    echo -e "💥 ${RED}$package${NC} failed to pass unit tests 💥"
    failedTestsPackages="$failedTestsPackages $package"
    errorOccured=1
  fi

  mkdir _coverage/$package

  cp coverage/*/coverage-final.json .nyc_output

  # Keep a copy that will be used for merging to make a combined report.
  cp .nyc_output/coverage-final.json _coverage/coverage-$package.json

  npx nyc check-coverage --branches 100 --functions 100 --lines 100 --statements 100

  if [ "$?" -ne "0" ]; then
    echo -e "💥 ${RED}$package${NC} doesn't have required code coverage 💥"
    failedCoveragePackages="$failedCoveragePackages $package"
    errorOccured=1
  fi
done;

echo "Creating a combined code coverage report"

# Combined file will be used for full coverage (as if yarn run test -c was run).
npx nyc merge _coverage .nyc_output/coverage-final.json

# You could attempt to check-coverage here too, but since each subpackage had a correct CC there's no point in doing this
# for combined result.

codecov -f .nyc_output/coverage-final.json

if [ "$errorOccured" -eq "1" ]; then
  echo
  echo "---"
  echo

  if ! [[ -z $failedTestsPackages ]]; then
    echo -e "Following packages did not pass unit tests:${RED}$failedTestsPackages${NC}"
  fi

  if ! [[ -z $failedCoveragePackages ]]; then
    echo -e "Following packages did not provide required code coverage:${RED}$failedCoveragePackages${NC}"
  fi

  echo
  exit 1 # Will break the CI build
fi
