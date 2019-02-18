#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const buildApiDocs = require( './buildapi' );

buildApiDocs()
	.catch( () => {
		process.exitCode = 1;
	} );
