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
import Link from '@ckeditor/ckeditor5-link/src/link';

import GeneralHtmlSupport from '../../src/generalhtmlsupport';

/**
 * Client custom plugin extending HTML support for compatibility.
 */
class ExtendHTMLSupport extends Plugin {
	static get requires() {
		return [ GeneralHtmlSupport ];
	}

	init() {
		const { dataSchema, dataFilter } = this.editor.plugins.get( GeneralHtmlSupport );

		// Extend schema with custom `xyz` element.
		dataSchema.registerBlockElement( {
			view: 'xyz',
			model: 'htmlXyz',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		} );

		// Allow some elements, at this point model schema will include information about view-model mapping
		// e.g. article -> ghsArticle
		dataFilter.allowElement( { name: 'article' } );
		dataFilter.allowElement( { name: 'section' } );
		dataFilter.allowElement( { name: /^(details|summary)$/ } );
		dataFilter.allowElement( { name: /^(dl|dd|dt)$/ } );
		dataFilter.allowElement( { name: 'xyz' } );

		// Let's extend 'section' with some attributes. Data filter will take care of
		// creating proper converters and attribute matchers:
		dataFilter.allowAttributes( { name: 'section', attributes: { id: /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: 'section', classes: /[\s\S]+/ } );
		dataFilter.allowAttributes( { name: 'section', styles: { color: 'red' } } );

		// but disallow setting id attribute if it start with `_` prefix:
		dataFilter.disallowAttributes( { name: 'section', attributes: { id: /^_.*/ } } );

		// Let's also add some inline elements support:
		dataFilter.allowElement( { name: /^(span|cite)$/ } );
		dataFilter.allowAttributes( { name: /^(span|cite)$/, attributes: { 'data-foo': /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: /^(span|cite)$/, styles: { color: /[\s\S]+/ } } );
		dataFilter.disallowAttributes( { name: /^(span|cite)$/, styles: { color: 'red' } } );

		dataFilter.allowAttributes( { name: /^(span|cite)$/, attributes: { 'data-order-id': /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: /^(span|cite)$/, attributes: { 'data-item-id': /[\s\S]+/ } } );

		// Allow existing features.
		dataFilter.allowElement( { name: 'p' } );
		dataFilter.allowAttributes( { name: 'p', attributes: { 'data-foo': /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: 'p', styles: { 'background-color': /[\s\S]+/ } } );

		dataFilter.allowElement( { name: 'blockquote' } );
		dataFilter.allowAttributes( { name: 'blockquote', styles: { 'color': /[\s\S]+/ } } );

		dataFilter.allowElement( { name: 'li' } );
		dataFilter.allowAttributes( { name: 'li', styles: { 'color': /[\s\S]+/ } } );

		dataFilter.allowElement( { name: 'a' } );
		dataFilter.allowAttributes( { name: 'a', styles: { 'background-color': /[\s\S]+/ } } );

		dataFilter.allowElement( { name: 'strong' } );
		dataFilter.allowAttributes( { name: 'strong', styles: { 'font-weight': /[\s\S]+/ } } );

		dataFilter.allowElement( { name: 'i' } );
		dataFilter.allowAttributes( { name: 'i', styles: { 'color': /[\s\S]+/ } } );
		dataFilter.allowAttributes( { name: 'i', attributes: { 'data-foo': /[\s\S]+/ } } );

		dataFilter.allowElement( { name: 's' } );
		dataFilter.allowAttributes( { name: 's', styles: { 'color': /[\s\S]+/ } } );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Link,
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
