/* jshint browser: false, node: true */

'use strict';

const config = {
	plugins: [
		'benderjs-chai',
		'benderjs-coverage',
		'benderjs-mocha',
		'benderjs-promise',
		'benderjs-sinon',
		'dev/bender/plugins/ckeditor5'
	],

	framework: 'mocha',

	applications: {
		'ckeditor': {
			path: '.',
			files: [
				'node_modules/requirejs/require.js'
			],
			basePath: '/apps/ckeditor/dist/amd/'
		}
	},

	tests: {
		all: {
			applications: [ 'ckeditor' ],
			paths: [
				'dist/amd/tests/**',
				'!**/_*/**'
			]
		}
	},

	coverage: {
		paths: [
			'dist/amd/ckeditor.js',
			'dist/amd/ckeditor5/**/*.js',
			'!dist/amd/ckeditor5/*/lib/**'
		]
	}
};

module.exports = config;
