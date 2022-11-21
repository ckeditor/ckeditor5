/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );
const fs = require( 'fs' );
const { execSync } = require( 'child_process' );

const EXTERNAL_DIR_PATH = path.resolve( __dirname, '..', 'external' );

fs.readdirSync( EXTERNAL_DIR_PATH ).forEach( externalPackage => {
	execSync( 'npm run prepare --if-present', {
		stdio: 'inherit',
		cwd: path.join( EXTERNAL_DIR_PATH, externalPackage )
	} );
} );
