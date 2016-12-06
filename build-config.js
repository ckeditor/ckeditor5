/* jshint browser: false, node: true, strict: true */
'use strict';

module.exports = {
	// Name of CKEditor instance exposed as global variable by a bundle.
	moduleName: 'ClassicEditor',

	// Specify path where bundled editor will be saved.
	destinationPath: './build/dist/',

	editor: 'editor-classic/classic',

	rollupOptions: {
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

		// The format of the generated bundle.
		format: 'iife',
	}
};
