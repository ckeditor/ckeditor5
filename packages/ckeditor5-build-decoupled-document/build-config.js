/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

module.exports = {
	// The editor creator to use.
	editor: '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor',

	// The name under which the editor will be exported.
	moduleName: 'DecoupledEditor',

	// Plugins to include in the build.
	plugins: [
		'@ckeditor/ckeditor5-essentials/src/essentials',

		'@ckeditor/ckeditor5-alignment/src/alignment',
		'@ckeditor/ckeditor5-font/src/fontsize',
		'@ckeditor/ckeditor5-font/src/fontfamily',
		'@ckeditor/ckeditor5-highlight/src/highlight',
		'@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter',
		'@ckeditor/ckeditor5-autoformat/src/autoformat',
		'@ckeditor/ckeditor5-basic-styles/src/bold',
		'@ckeditor/ckeditor5-basic-styles/src/italic',
		'@ckeditor/ckeditor5-basic-styles/src/strikethrough',
		'@ckeditor/ckeditor5-basic-styles/src/underline',
		'@ckeditor/ckeditor5-block-quote/src/blockquote',
		'@ckeditor/ckeditor5-easy-image/src/easyimage',
		'@ckeditor/ckeditor5-heading/src/heading',
		'@ckeditor/ckeditor5-image/src/image',
		'@ckeditor/ckeditor5-image/src/imagecaption',
		'@ckeditor/ckeditor5-image/src/imagestyle',
		'@ckeditor/ckeditor5-image/src/imagetoolbar',
		'@ckeditor/ckeditor5-image/src/imageupload',
		'@ckeditor/ckeditor5-link/src/link',
		'@ckeditor/ckeditor5-list/src/list',
		'@ckeditor/ckeditor5-paragraph/src/paragraph',
		'@ckeditor/ckeditor5-table/src/table',
		'@ckeditor/ckeditor5-table/src/tabletoolbar'
	],

	// Editor config.
	config: {
		toolbar: {
			items: [
				'heading',
				'|',
				'fontsize',
				'fontfamily',
				'|',
				'bold',
				'italic',
				'underline',
				'strikethrough',
				'highlight',
				'|',
				'alignment',
				'|',
				'numberedList',
				'bulletedList',
				'|',
				'link',
				'blockquote',
				'imageUpload',
				'insertTable',
				'|',
				'undo',
				'redo'
			]
		},

		image: {
			styles: [
				'full',
				'alignLeft',
				'alignRight'
			],
			toolbar: [ 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight', '|', 'imageTextAlternative' ]
		},

		table: {
			toolbar: [ 'tableColumn', 'tableRow', 'mergeCell' ]
		},

		// UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
		language: 'en'
	}
};
