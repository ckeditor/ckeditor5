/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const gulp = require( 'gulp' );
const jsdoc = require( 'gulp-jsdoc3' );
const path = require( 'path' );

module.exports = ( config ) => {
	gulp.task( 'docs', [ 'build:js:esnext' ], function( cb ) {
		const esnextBuildPath = path.join( config.ROOT_DIR, config.BUILD_DIR, 'esnext' );
		const jsDocConfig = {
			opts: {
				encoding: 'utf8',
				destination: path.join( config.BUILD_DIR, 'docs' ),
				recurse: true,
				access: 'all'
			},
			plugins: [
				'node_modules/jsdoc/plugins/markdown',
				'dev/tasks/docs/plugins/comment-fixer'
			]
		};

		const patterns = [
			'README.md',
			// Add all js and jsdoc files, including tests (which can contain utils).
			path.join( esnextBuildPath, '**', '*.@(js|jsdoc)' ),
			// Filter out libs.
			'!' + path.join( esnextBuildPath, 'ckeditor5', '*', 'lib', '**', '*' )
		];

		gulp.src( patterns, { read: false } )
			.pipe( jsdoc( jsDocConfig, cb ) );
	} );
};
