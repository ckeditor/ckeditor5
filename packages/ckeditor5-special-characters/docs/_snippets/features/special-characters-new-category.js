/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console, ClassicEditor, SpecialCharactersEssentials */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

function SpecialCharactersBorders( editor ) {
	editor.plugins.get( 'SpecialCharacters' ).addItems( 'Borders', [
		{ title: 'horizontal', character: ' ━ ' },
		{ title: 'vertical', character: '┃' },
		{ title: 'top left', character: '┏' },
		{ title: 'top right', character: '┓' },
		{ title: 'bottom left', character: '┗' },
		{ title: 'bottom right', character: '┛' },
		{ title: 'cross', character: '╋' }
	], { label: 'Borders' } );
}

ClassicEditor
	.create( document.querySelector( '#snippet-special-characters-new-category' ), {
		extraPlugins: [ SpecialCharactersEssentials, SpecialCharactersBorders ],
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'bulletedList',
				'numberedList',
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
