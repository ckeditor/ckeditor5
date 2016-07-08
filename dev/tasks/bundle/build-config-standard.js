'use strict';

module.exports = {
	// Name of CKEditor instance exposed as global variable by a bundle.
	moduleName: 'ClassicEditor',

	editor: 'editor-classic/classic',

	// List of features.
	features: [
		'delete',
		'typing',
		'undo',
		'basic-styles/bold',
		'basic-styles/italic',
		'headings',
		'paragraph',
		'enter'
	]
};
