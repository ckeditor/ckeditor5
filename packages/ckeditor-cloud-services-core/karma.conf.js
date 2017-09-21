/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const path = require( 'path' );

const webpack = require( 'webpack' );

module.exports = function( config ) {
	config.set( {
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// frameworks to use. Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: [ 'mocha', 'chai', 'sinon' ],

		// list of files / patterns to load in the browser
		files: [
			'tests/**/*.js'
		],

		// list of files to exclude
		exclude: [
			'tests/**/@(_utils|_assets)/**'
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'tests/**/*.js': [ 'webpack', 'sourcemap' ],
			'src/**/*.js': [ 'webpack', 'sourcemap' ]
		},

		webpack: {
			resolve: {
				modules: [
					path.join( __dirname, 'src' ),
					'node_modules'
				]
			},

			module: {
				loaders: [
					{
						test: /\.js$/,
						exclude: /(node_modules\/((?!ckeditor)[a-z-]+))/,
						loader: 'babel-loader',
						enforce: 'pre',
						query: {
							plugins: [
								'transform-es2015-modules-commonjs',
								[
									'istanbul',
									{ 'exclude': [ 'tests/**/*.js', 'node_modules/**' ] }
								]
							]
						}
					}
				]
			},

			plugins: [
				new webpack.DefinePlugin( {
					VERSION: JSON.stringify( require( './package.json' ).version )
				} )
			],

			devtool: 'inline-source-map'
		},

		webpackMiddleware: {
			noInfo: true,
			stats: 'errors-only'
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: [ 'mocha', 'coverage' ],

		coverageReporter: {
			dir: 'coverage/',
			reporters: [
				{ type: 'html', subdir: 'report-html' },
				{ type: 'lcov', subdir: 'report-lcov' },
				{ type: 'text', subdir: '.', file: 'text.txt' }
			]
		},

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: [ 'Chrome' ],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	} );
};
