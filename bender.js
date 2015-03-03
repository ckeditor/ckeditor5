/* jshint browser: false, node: true */

'use strict';

// Set it to true to test with the build version.
var isBuild = false;

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
		}
	},

	tests: {
		all: {
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

if ( isBuild ) {
	// Change the 'ckeditor' application to point to the build.
	config.applications[ 'ckeditor' ] = {
		path: 'build',
		files: [
			'ckeditor.js'
		]
	};
}

module.exports = config;
