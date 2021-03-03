/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import DataTransfer from '@ckeditor/ckeditor5-clipboard/src/datatransfer';
import InsertImage from '@ckeditor/ckeditor5-image/src/imageinsert';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, InsertImage ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function pasteFromClipboard() {
	window.navigator.clipboard.read().then( async ( [ clipboardItem ] ) => {
		let text;

		for ( const type of clipboardItem.types ) {
			if ( type === 'text/html' ) {
				text = await clipboardItem.getType( type ).then( type => type.text() );

				break;
			}
		}

		const editor = window.editor;

		const viewDocument = editor.editing.view.document;
		const eventInfo = new EventInfo( viewDocument, 'clipboardInput' );
		const dataTransfer = new DataTransfer( {
			getData: () => text,
            types: clipboardItem.types
		} );
		const targetRanges = Array.from( viewDocument.selection.getRanges() );

		viewDocument.fire( eventInfo, {
			dataTransfer,
			targetRanges
		} );
	} );
}

document.querySelector( '#paste' ).addEventListener( 'click', pasteFromClipboard );
