/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

module.exports = {
	moduleName: 'MyCKEditor',
	creator: './build/esnext/ckeditor5/editor-classic/classic.js',
	features: [
		'enter',
		'paragraph',
		'./build/esnext/ckeditor5/typing/typing.js',
		'./build/esnext/ckeditor5/undo/undo.js',
		'./build/esnext/ckeditor5/headings/headings.js'
	]
};
