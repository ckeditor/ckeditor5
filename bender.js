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
		ckeditor: {
			path: '.',
			files: [
				'node_modules/requirejs/require.js'
			],
			basePath: '/apps/ckeditor/build/amd/'
		}
	},

	tests: {
		all: {
			applications: [ 'ckeditor' ],
			paths: [
				'build/amd/tests/**',
				'!build/amd/tests/**/@(_utils|_assets)/**'
			]
		}
	},

	coverage: {
		paths: [
			'build/amd/ckeditor.js',
			'build/amd/ckeditor5/**/*.js',
			'build/amd/tests/**/_*/*.js',
			'!build/amd/ckeditor5/*/lib/**'
		]
	}
};

module.exports = config;
