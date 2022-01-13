#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const buildApiDocs = require( './buildapi' );

buildApiDocs()
	.catch( () => {
		process.exitCode = 1;
	} );
