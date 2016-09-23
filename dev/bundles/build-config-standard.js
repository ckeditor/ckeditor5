'use strict';

module.exports = {
	// Name of CKEditor instance exposed as global variable by a bundle.
	moduleName: 'ClassicEditor',

	// Specify path where bundled editor will be saved.
	path: '.',

	editor: 'editor-classic/classic',

	// List of features.
	features: [
		'typing',
		'undo',
		'basic-styles/bold',
		'basic-styles/italic',
		'heading',
		'paragraph',
		'enter'
	],

	// The format of the generated bundle.
	format: 'iife'
};
