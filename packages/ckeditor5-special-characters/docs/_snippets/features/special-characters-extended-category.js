/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console, ClassicEditor, SpecialCharactersEssentials */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

function SpecialCharactersExtended( editor ) {
	editor.plugins.get( 'SpecialCharacters' ).addItems( 'Mathematical', [
		{ title: 'alpha', character: 'α' },
		{ title: 'beta', character: 'β' },
		{ title: 'gamma', character: 'γ' }
	] );
}

ClassicEditor
	.create( document.querySelector( '#snippet-special-characters-extended-category' ), {
		extraPlugins: [ SpecialCharactersEssentials, SpecialCharactersExtended ],
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
				'uploadImage',
				'insertTable',
				'|',
				'undo',
				'redo'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
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
