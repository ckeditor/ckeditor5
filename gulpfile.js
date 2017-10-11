/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const gulp = require( 'gulp' );

const assertIsInstalled = require( './scripts/util/assertisinstalled' );

// Translations. --------------------------------------------------------------

gulp.task( 'translations:collect', () => {
	assertIsInstalled( '@ckeditor/ckeditor5-dev-env' );

	return require( '@ckeditor/ckeditor5-dev-env' ).collectTranslations();
} );

gulp.task( 'translations:upload', () => {
	assertIsInstalled( '@ckeditor/ckeditor5-dev-env' );

	return require( '@ckeditor/ckeditor5-dev-env' ).uploadTranslations();
} );

gulp.task( 'translations:download', () => {
	assertIsInstalled( '@ckeditor/ckeditor5-dev-env' );

	return require( '@ckeditor/ckeditor5-dev-env' ).downloadTranslations();
} );

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
