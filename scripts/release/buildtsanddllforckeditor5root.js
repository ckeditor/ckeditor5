#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = function buildTsAndDllForCkeditor5Root() {
	tools.shExec( 'yarn run build' );
	tools.shExec( 'yarn run dll:build --skip-packages-dll' );
};
