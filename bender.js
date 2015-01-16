/* jshint browser: false, node: true */

'use strict';

var config = {
	plugins: [
		'benderjs-mocha',
		'benderjs-chai',
		'dev/bender/plugins/ckeditor5'
	],

	framework: 'mocha',

	applications: {
		ckeditor: {
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
	}
};

module.exports = config;
