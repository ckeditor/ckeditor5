/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

module.exports = {
	destinationPath: './build/',
	editor: '@ckeditor/ckeditor5-editor-classic/src/classic',
	plugins: [
		'@ckeditor/ckeditor5-presets/src/article'
	],
	moduleName: 'ClassicEditor',
	editorConfig: {
		toolbar: [ 'image', 'headings' ]
	}
};
