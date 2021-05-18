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
		const dataFilter = this.editor.plugins.get( 'DataFilter' );
		const dataSchema = this.editor.plugins.get( 'DataSchema' );

		// Extend schema with custom `xyz` element.
		dataSchema.registerBlockElement( {
			view: 'xyz',
			model: 'htmlXyz',
			modelSchema: {
				inheritAllFrom: '$htmlBlock'
			}
		} );
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
		],
		contentCompatibility: {
			allowed: [
				{ name: 'article' },

				{ name: 'section', attributes: { id: /[\s\S]+/ } },
				{ name: 'section', classes: /[\s\S]+/ },
				{ name: 'section', styles: { color: 'red' } },

				{ name: /^(details|summary)$/ },
				{ name: /^(dl|dd|dt)$/ },
				{ name: 'xyz' },

				{ name: /^(span|cite)$/, attributes: { 'data-foo': /[\s\S]+/ } },
				{ name: /^(span|cite)$/, styles: { color: /[\s\S]+/ } },
				{ name: /^(span|cite)$/, attributes: { 'data-order-id': /[\s\S]+/ } },
				{ name: /^(span|cite)$/, attributes: { 'data-item-id': /[\s\S]+/ } },

				{ name: 'p', attributes: { 'data-foo': /[\s\S]+/ } },
				{ name: 'p', styles: { 'background-color': /[\s\S]+/ } },

				{ name: 'blockquote', styles: { 'color': /[\s\S]+/ } },
				{ name: 'li', styles: { 'color': /[\s\S]+/ } },
				{ name: 'a', styles: { 'background-color': /[\s\S]+/ } },
				{ name: 'strong', styles: { 'font-weight': /[\s\S]+/ } },
				{ name: 'i', styles: { 'color': /[\s\S]+/ } },
				{ name: 'i', attributes: { 'data-foo': /[\s\S]+/ } },
				{ name: 's', styles: { 'color': /[\s\S]+/ } }
			],
			disallowed: [
				{ name: 'section', attributes: { id: /^_.*/ } },
				{ name: /^(span|cite)$/, styles: { color: 'red' } }
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
