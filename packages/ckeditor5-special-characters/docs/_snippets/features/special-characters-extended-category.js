/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console, ClassicEditor, SpecialCharactersEssentials */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

function SpecialCharactersArrowsExtended( editor ) {
	editor.plugins.get( 'SpecialCharacters' ).addItems( 'Arrows', [
		{ title: 'simple arrow left', character: '←' },
		{ title: 'simple arrow up', character: '↑' },
		{ title: 'simple arrow right', character: '→' },
		{ title: 'simple arrow down', character: '↓' }
	] );
}

ClassicEditor
	.create( document.querySelector( '#snippet-special-characters-extended-category' ), {
		extraPlugins: [ SpecialCharactersEssentials, SpecialCharactersArrowsExtended ],
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'bulletedList',
				'numberedList',
				'|',
				'fontColor',
				'fontBackgroundColor',
				'|',
				'outdent',
				'indent',
				'|',
				'specialCharacters',
				'link',
				'imageUpload',
				'insertTable',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		image: {
			styles: [
				'full',
				'alignLeft',
				'alignRight'
			],
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:full',
				'imageStyle:alignRight',
				'|',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
