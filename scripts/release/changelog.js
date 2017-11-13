#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const assertIsInstalled = require( './../utils/assertisinstalled' );

assertIsInstalled( '@ckeditor/ckeditor5-dev-env' );

const devEnv = require( '@ckeditor/ckeditor5-dev-env' );
const commonOptions = {
	cwd: process.cwd(),
	packages: 'packages'
};
const editorBuildsGlob = '@ckeditor/ckeditor5-build-*';

const optionsForDependencies = Object.assign( {}, commonOptions, {
	skipPackages: editorBuildsGlob
} );
const optionsForBuilds = Object.assign( {}, commonOptions, {
	scope: editorBuildsGlob
} );

Promise.resolve()
	.then( () => devEnv.generateChangelogForSubRepositories( optionsForDependencies ) )
	.then( () => devEnv.generateSummaryChangelog( optionsForBuilds ) )
	.then( () => {
		console.log( 'Done!' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
