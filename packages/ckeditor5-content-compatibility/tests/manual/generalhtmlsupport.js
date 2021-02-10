/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import GeneralHTMLSupport from '../../src/generalhtmlsupport';

class ExtendHTMLSupport extends Plugin {
	static get requires() {
		return [ GeneralHTMLSupport ];
	}

	init() {
		const dataSchema = this.editor.plugins.get( 'GeneralHTMLSupport' ).dataSchema;

		dataSchema.allowElement( { name: 'article' } );
		dataSchema.allowElement( { name: 'section' } );

		dataSchema.allowAttributes( { name: 'section', attributes: { id: /[^]/ } } );
		dataSchema.allowAttributes( { name: 'section', classes: /[^]/ } );
		dataSchema.allowAttributes( { name: 'section', styles: { color: /[^]/ } } );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, Strikethrough, GeneralHTMLSupport, ExtendHTMLSupport ],
		toolbar: [ 'bold', 'italic', 'strikethrough', 'contentTags' ]
	} )
	.then( editor => {
		window.editor = editor;
		window.dataSchema = editor.plugins.get( 'GeneralHTMLSupport' ).dataSchema;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
