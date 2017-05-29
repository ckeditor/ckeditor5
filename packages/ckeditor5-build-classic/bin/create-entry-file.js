#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const { bundler } = require( '@ckeditor/ckeditor5-dev-utils' );
const buildConfig = require( '../build-config' );

console.log( 'Creating the entry file...' );

bundler.createEntryFile( 'ckeditor.js', buildConfig );

console.log( 'Done.' );
