/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

module.exports = {
	destinationPath: './build/',
	editor: '@ckeditor/ckeditor5-editor-classic/src/classic',
	plugins: [
		'@ckeditor/ckeditor5-autoformat/src/autoformat',
		'@ckeditor/ckeditor5-clipboard/src/clipboard',
		'@ckeditor/ckeditor5-basic-styles/src/bold',
		'@ckeditor/ckeditor5-basic-styles/src/italic',
		'@ckeditor/ckeditor5-enter/src/enter',
		'@ckeditor/ckeditor5-heading/src/heading',
		'@ckeditor/ckeditor5-image/src/image',
		'@ckeditor/ckeditor5-image/src/imagecaption',
		'@ckeditor/ckeditor5-image/src/imagestyle',
		'@ckeditor/ckeditor5-image/src/imagetoolbar',
		'@ckeditor/ckeditor5-link/src/link',
		'@ckeditor/ckeditor5-list/src/list',
		'@ckeditor/ckeditor5-paragraph/src/paragraph',
		'@ckeditor/ckeditor5-typing/src/typing',
		'@ckeditor/ckeditor5-undo/src/undo',
	],
	moduleName: 'ClassicEditor',
	editorConfig: {
		toolbar: [
			'headings',
			'bold',
			'italic',
			'link',
			'unlink',
			'bulletedList',
			'numberedList',
			'undo',
			'redo'
		]
	}
};
