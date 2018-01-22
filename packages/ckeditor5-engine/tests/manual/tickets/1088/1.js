/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: {
			items: [
				'headings',
				'bold',
				'italic',
				'link',
				'bulletedList',
				'numberedList',
				'blockQuote',
				'undo',
				'redo'
			]
		},
		image: {
			toolbar: [
				'imageStyleFull',
				'imageStyleSide',
				'|',
				'imageTextAlternative'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const schema = editor.model.schema;

		schema.on( 'checkAttribute', ( evt, args ) => {
			const ctx = args[ 0 ];
			const attributeName = args[ 1 ];

			if ( ctx.endsWith( 'heading1 $text' ) && [ 'linkHref', 'italic' ].includes( attributeName ) ) {
				evt.stop();
				evt.return = false;
			}

			if ( ctx.endsWith( 'heading2 $text' ) && attributeName == 'italic' ) {
				evt.stop();
				evt.return = false;
			}

			if ( ctx.endsWith( 'heading2 $text' ) && attributeName == 'italic' ) {
				evt.stop();
				evt.return = false;
			}

			if ( ctx.endsWith( 'blockQuote listItem $text' ) && attributeName == 'linkHref' ) {
				evt.stop();
				evt.return = false;
			}

			if ( ctx.endsWith( 'paragraph $text' ) && attributeName == 'bold' ) {
				evt.stop();
				evt.return = false;
			}
		} );

		schema.on( 'checkChild', ( evt, args ) => {
			const childRule = args[ 1 ];

			if ( args[ 0 ].endsWith( '$root' ) && childRule.name == 'heading3' ) {
				evt.stop();
				evt.return = false;
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
