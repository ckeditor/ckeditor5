/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar.js';

const editorShadow = document.querySelector( '#editor-wrapper' ).attachShadow( { mode: 'open' } );
const bodyCollectionWrapperShadow = document.querySelector( '.ck-body-wrapper' ).attachShadow( { mode: 'open' } );

const editorElement = document.createElement( 'div' );

editorShadow.appendChild( editorElement );

for ( const sheet of document.styleSheets ) {
	if ( sheet.ownerNode?.dataset?.cke ) {
		const shadowSheet = new CSSStyleSheet();
		shadowSheet.replaceSync( sheet.ownerNode.textContent.replace( /:root/g, ':host' ) );

		editorShadow.adoptedStyleSheets = [ shadowSheet ];
		bodyCollectionWrapperShadow.adoptedStyleSheets = [ shadowSheet ];

		sheet.disabled = true;
		break;
	}
}

ClassicEditor
	.create( editorElement, {
		plugins: [ ArticlePluginSet, BlockToolbar ],
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
		blockToolbar: [
			'heading',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		initialData: document.querySelector( '#editor' ).innerHTML
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
