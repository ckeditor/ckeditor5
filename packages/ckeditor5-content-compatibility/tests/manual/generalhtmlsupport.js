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
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import List from '@ckeditor/ckeditor5-list/src/list';

import DataSchema from '../../src/dataschema';
import DataFilter from '../../src/datafilter';

/**
 * Client custom plugin extending HTML support for compatibility.
 */
class ExtendHTMLSupport extends Plugin {
	init() {
		// Create data schema object including default configuration based on CKE4
		// DTD elements, missing dedicated feature in CKEditor 5.
		// Data schema only behaves as container for DTD definitions, it doesn't change
		// anything inside the editor itself. Registered elements are not extending editor
		// model schema at this point.
		const dataSchema = new DataSchema();

		// Extend schema with custom `xyz` element.
		dataSchema.register( {
			view: 'xyz',
			model: 'ghsXyz',
			schema: {
				inheritAllFrom: '$ghsBlock'
			}
		} );

		// Create data filter which will register editor model schema and converters required
		// to allow elements and filter attributes.
		const dataFilter = new DataFilter( this.editor, dataSchema );

		// Allow some elements, at this point model schema will include information about view-model mapping
		// e.g. article -> ghsArticle
		dataFilter.allowElement( { name: 'article' } );
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowElement( { name: /^details|summary$/ } );
		dataFilter.allowElement( { name: /^dl|dd|dt$/ } );
		dataFilter.allowElement( { name: 'xyz' } );

		// Let's extend 'section' with some attributes. Data filter will take care of
		// creating proper converters and attribute matchers:
		dataFilter.allowAttributes( { name: 'section', attributes: { id: /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: 'section', classes: /[\s\S]+/ } );
		dataFilter.allowAttributes( { name: 'section', styles: { color: 'red' } } );

		// but disallow setting id attribute if it start with `_` prefix:
		dataFilter.disallowAttributes( { name: 'section', attributes: { id: /^_.*/ } } );

		// Let's also add some inline elements support:
		dataFilter.allowElement( { name: /^span|cite$/ } );
		dataFilter.allowAttributes( { name: /^span|cite$/, attributes: { 'data-foo': /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: /^span|cite$/, styles: { color: /[\s\S]+/ } } );
		// dataFilter.disallowAttributes( { name: /^span|cite$/, styles: { color: 'red' } } );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			BlockQuote,
			Bold,
			Essentials,
			ExtendHTMLSupport,
			Italic,
			List,
			Paragraph,
			Strikethrough
		],
		toolbar: [
			'bold',
			'italic',
			'strikethrough',
			'|',
			'numberedList',
			'bulletedList',
			'|',
			'blockquote'
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
