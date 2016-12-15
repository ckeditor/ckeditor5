/* jshint browser: false, node: true, strict: true */

'use strict';

module.exports = {
	// Specify path where bundled editor will be saved.
	destinationPath: './build/dist/',

	editor: 'editor-classic/classic',

	// List of plugins.
	plugins: [
		'autoformat',
		'basic-styles/bold',
		'basic-styles/italic',
		'clipboard',
		'enter',
		'heading',
		'image',
		'link',
		'list',
		'paragraph',
		'typing',
		'undo'
	],

	rollupOptions: {
		// Name of CKEditor instance exposed as global variable by a bundle.
		moduleName: 'ClassicEditor',

		// The format of the generated bundle.
		format: 'iife',
	}
};
