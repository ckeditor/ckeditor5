#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const assertIsInstalled = require( './../util/assertisinstalled' );

assertIsInstalled( '@ckeditor/ckeditor5-dev-env' );

require( '@ckeditor/ckeditor5-dev-env' )
	.generateChangelogForSubRepositories( {
		cwd: process.cwd(),
		packages: 'packages'
	} );
