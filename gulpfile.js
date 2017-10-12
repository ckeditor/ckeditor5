/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const gulp = require( 'gulp' );

const assertIsInstalled = require( './scripts/util/assertisinstalled' );

// Releasing. -----------------------------------------------------------------

gulp.task( 'changelog:dependencies', () => {
	assertIsInstalled( '@ckeditor/ckeditor5-dev-env' );

	return require( '@ckeditor/ckeditor5-dev-env' )
		.generateChangelogForSubRepositories( {
			cwd: process.cwd(),
			packages: 'packages'
		} );
} );

gulp.task( 'release:dependencies', () => {
	assertIsInstalled( '@ckeditor/ckeditor5-dev-env' );

	return require( '@ckeditor/ckeditor5-dev-env' )
		.releaseSubRepositories( {
			cwd: process.cwd(),
			packages: 'packages'
		} );
} );
