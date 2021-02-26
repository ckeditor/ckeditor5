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

import DataSchema from '../../src/dataschema';
import DataFilter from '../../src/datafilter';

class ExtendHTMLSupport extends Plugin {
	init() {
		const dataSchema = new DataSchema();
		const dataFilter = new DataFilter( this.editor, dataSchema );

		dataFilter.allowElement( { name: /article|section/ } );

		dataFilter.allowAttributes( { name: 'section', attributes: { id: /[^]/ } } );
		dataFilter.allowAttributes( { name: 'section', classes: /[^]/ } );
		dataFilter.allowAttributes( { name: 'section', styles: { color: /[^]/ } } );

		dataFilter.allowElement( { name: /details|summary/ } );

		dataFilter.allowElement( { name: /dl|dt|dd/ } );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, Strikethrough, ExtendHTMLSupport ],
		toolbar: [ 'bold', 'italic', 'strikethrough', 'contentTags' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
