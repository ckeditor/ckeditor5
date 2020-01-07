/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: {
			items: [
				'heading',
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
				'imageStyle:full',
				'imageStyle:side',
				'|',
				'imageTextAlternative'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const schema = editor.model.schema;

		schema.addAttributeCheck( ( ctx, attributeName ) => {
			if ( ctx.endsWith( 'heading1 $text' ) && [ 'linkHref', 'italic' ].includes( attributeName ) ) {
				return false;
			}

			if ( ctx.endsWith( 'heading2 $text' ) && attributeName == 'italic' ) {
				return false;
			}

			if ( ctx.endsWith( 'heading2 $text' ) && attributeName == 'italic' ) {
				return false;
			}

			if ( ctx.endsWith( 'blockQuote listItem $text' ) && attributeName == 'linkHref' ) {
				return false;
			}

			if ( ctx.endsWith( 'paragraph $text' ) && attributeName == 'bold' ) {
				return false;
			}
		} );

		schema.addChildCheck( ( ctx, childDef ) => {
			if ( ctx.endsWith( '$root' ) && childDef.name == 'heading3' ) {
				return false;
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
