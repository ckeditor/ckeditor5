#!/bin/bash

# @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
# For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license

packages=$(ls packages -1 | sed -e 's#^ckeditor5\?-\(.\+\)$#\1#')

errorOccured=0

failedTestsPackages=""
failedCoveragePackages=""

RED='\033[0;31m'
NC='\033[0m'

# Travis functions inspired by https://github.com/travis-ci/travis-rubies/blob/a10ba31e3f508650204017332a608ef9bce2c733/build.sh.
function travis_nanoseconds() {
  local cmd="date"
  local format="+%s%N"
  local os=$(uname)

  if hash gdate > /dev/null 2>&1; then
    cmd="gdate" # use gdate if available
  elif [[ "$os" = Darwin ]]; then
    format="+%s000000000" # fallback to second precision on darwin (does not support %N)
  fi

  $cmd -u $format
}

travis_time_start() {
  travis_timer_id=$(printf %08x $(( RANDOM * RANDOM )))
  travis_start_time=$(travis_nanoseconds)
  echo -en "travis_time:start:$travis_timer_id\r${ANSI_CLEAR}"
}

travis_time_finish() {
  local result=$?
  travis_end_time=$(travis_nanoseconds)
  local duration=$(($travis_end_time-$travis_start_time))
  echo -en "\ntravis_time:end:$travis_timer_id:start=$travis_start_time,finish=$travis_end_time,duration=$duration\r${ANSI_CLEAR}"
  return $result
}


fold_start() {
  echo -e "travis_fold:start:$1\033[33;1m$2\033[0m"
  travis_time_start
}

fold_end() {
  travis_time_finish
  echo -e "\ntravis_fold:end:$1\n"

}

for package in $packages; do

  fold_start "pkg-$package" "Testing $package${NC}"

  yarn run test -f $package --reporter=dots --production --coverage

  if [ "$?" -ne "0" ]; then
    echo

    echo -e "💥 ${RED}$package${NC} failed to pass unit tests 💥"
    failedTestsPackages="$failedTestsPackages $package"
    errorOccured=1
  fi

  npx nyc check-coverage --branches 100 --functions 100 --lines 100 --statements 100

  if [ "$?" -ne "0" ]; then
    echo -e "💥 ${RED}$package${NC} doesn't have required code coverage 💥"
    failedCoveragePackages="$failedCoveragePackages $package"
    errorOccured=1
  fi

  fold_end "pkg-$package"
done;

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
