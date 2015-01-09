/* jshint browser: false, node: true */

'use strict';

var config = {
	plugins: [
		'benderjs-mocha',
		'benderjs-chai'
	],

	framework: 'mocha',

	tests: {
		all: {
			paths: [
				'tests/**',
				'node_modules/ckeditor5-*/tests/**'
			]
		}
	}
};

module.exports = config;
