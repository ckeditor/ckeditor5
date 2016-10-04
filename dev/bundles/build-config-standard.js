'use strict';

module.exports = {
	// Name of CKEditor instance exposed as global variable by a bundle.
	moduleName: 'ClassicEditor',

	// Specify path where bundled editor will be saved.
	path: '.',

	editor: 'editor-classic/classic',

	// List of features.
	features: [
		'basic-styles/bold',
		'basic-styles/italic',
		'enter',
		'heading',
		'link',
		'list',
		'paragraph',
		'typing',
		'undo'
	],

	// The format of the generated bundle.
	format: 'iife'
};
