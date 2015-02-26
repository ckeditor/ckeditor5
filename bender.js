/* jshint browser: false, node: true */

'use strict';

var config = {
	plugins: [
		// Uncomment to enable code coverage.
		// 'benderjs-coverage',

		'benderjs-mocha',
		'benderjs-chai',
		'benderjs-sinon',
		'dev/bender/plugins/ckeditor5'
	],

	framework: 'mocha',

	applications: {
		'ckeditor': {
			path: '.',
			files: [
				'node_modules/requirejs/require.js',
				'ckeditor.js'
			]
		},

		'ckeditor-build': {
			path: 'build',
			files: [
				'ckeditor.js'
			]
		}
	},

	tests: {
		all: {
			// Swap the following "applications" lines to test the build version.
			// applications: [ 'ckeditor-build' ],
			applications: [ 'ckeditor' ],
			paths: [
				'tests/**',
				'node_modules/ckeditor5-*/tests/**'
			]
		}
	},

	coverage: {
		paths: [
			'ckeditor.js',
			'src/**/*.js',
			'node_modules/ckeditor5-*/src/**/*.js',
			'!node_modules/ckeditor5-*/src/lib/**'
		]
	}
};

module.exports = config;
