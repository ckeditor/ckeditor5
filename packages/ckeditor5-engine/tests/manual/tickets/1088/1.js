/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

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
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:wrapText',
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
