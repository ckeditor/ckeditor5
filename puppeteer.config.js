/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

const mkdirp = require( 'mkdirp' );
const path = require( 'path' );

const ROOT_DIRECTORY = __dirname;
const CACHE_DIRECTORY = path.join( ROOT_DIRECTORY, 'node_modules', '.cache' );
const PUPPETEER_CACHE_DIRECTORY = path.join( CACHE_DIRECTORY, 'puppeteer' );

// Make sure the cache directory exists.
mkdirp.sync( PUPPETEER_CACHE_DIRECTORY );

module.exports = {
	cacheDirectory: PUPPETEER_CACHE_DIRECTORY
};
