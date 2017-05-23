/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );
const gulp = require( 'gulp' );

// Lint tasks. ---------------------------------------------------------------

const ckeditor5Lint = require( '@ckeditor/ckeditor5-dev-lint' );

gulp.task( 'lint', () => ckeditor5Lint.lint() );
gulp.task( 'lint-staged', () => ckeditor5Lint.lintStaged() );
gulp.task( 'pre-commit', [ 'lint-staged' ] );

// Tests. ---------------------------------------------------------------------

gulp.task( 'test', () => {
	return require( '@ckeditor/ckeditor5-dev-tests' )
		.runAutomatedTests( getTestOptions() );
} );

gulp.task( 'test:manual', () => {
	return require( '@ckeditor/ckeditor5-dev-tests' )
		.runManualTests( getTestOptions() );
} );

function getTestOptions() {
	return require( '@ckeditor/ckeditor5-dev-tests' )
		.parseArguments( process.argv.slice( 2 ) );
}

// Documentation. -------------------------------------------------------------

gulp.task( 'docs', () => {
	assertIsInstalled( '@ckeditor/ckeditor5-dev-docs' );
	assertIsInstalled( 'umberto' );

	const umberto = require( 'umberto' );
	const ckeditor5Docs = require( '@ckeditor/ckeditor5-dev-docs' );

	if ( process.argv[ 3 ] == '--no-api' ) {
		return runUmberto();
	}

	return ckeditor5Docs
		.build( {
			readmePath: path.join( process.cwd(), 'README.md' ),
			sourceFiles: [
				process.cwd() + '/packages/ckeditor5-*/src/**/*.@(js|jsdoc)',
				'!' + process.cwd() + '/packages/ckeditor5-*/src/lib/**/*.js'
			]
		} )
		.then( runUmberto );

	function runUmberto() {
		return umberto.buildSingleProject( {
			configDir: 'docs',
			clean: true
		} );
	}
} );

gulp.task( 'docs:api-json', () => {
	assertIsInstalled( '@ckeditor/ckeditor5-dev-docs' );

	const ckeditor5Docs = require( '@ckeditor/ckeditor5-dev-docs' );

	return ckeditor5Docs
		.build( {
			readmePath: path.join( process.cwd(), 'README.md' ),
			sourceFiles: [
				process.cwd() + '/packages/ckeditor5-*/src/**/*.@(js|jsdoc)',
				'!' + process.cwd() + '/packages/ckeditor5-*/src/lib/**/*.js'
			]
		} );
} );

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

// Utils. ---------------------------------------------------------------------

function assertIsInstalled( packageName ) {
	try {
		require( packageName + '/package.json' );
	} catch ( err ) {
		console.error( `Error: Cannot find package '${ packageName }'.\n` );
		console.error( 'You need to install optional dependencies.' );
		console.error( 'Run: \'npm run install-optional-dependencies\'.' );

		process.exit( 1 );
	}
}
