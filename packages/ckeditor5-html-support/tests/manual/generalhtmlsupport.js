/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
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
				inheritAllFrom: '$htmlSection'
			}
		} );

		// Custom elements need to be filtered using direct API instead of config.
		dataFilter.allowElement( 'xyz' );
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
			Strikethrough,
			SourceEditing
		],
		toolbar: [
			'sourceEditing',
			'bold',
			'italic',
			'strikethrough',
			'|',
			'numberedList',
			'bulletedList',
			'|',
			'blockquote'
		],
		htmlSupport: {
			allow: [
				{ name: 'article' },
				{ name: /^(details|summary)$/ },
				{ name: /^(dl|dd|dt)$/ },

				{ name: 'a', styles: { 'background-color': true } },
				{ name: 'blockquote', styles: { 'color': true } },
				{ name: 'li', styles: { 'color': true } },
				{ name: 's', styles: { 'color': true } },
				{ name: 'strong', styles: { 'font-weight': true } },

				{
					name: 'i',
					styles: { 'color': true },
					attributes: { 'data-foo': true }
				},
				{
					name: 'section',
					attributes: {
						id: true,
						'data-section-id': /^\d+$/
					},
					classes: true,
					styles: { color: 'red' }
				},
				{
					name: /^(span|cite)$/,
					styles: { color: true },
					attributes: [ 'data-foo', 'data-order-id', 'data-item-id' ]
				},
				{
					name: 'p',
					attributes: [
						{
							key: /^data-/,
							value: true
						}
					],
					styles: { 'background-color': true }
				}
			],
			disallow: [
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
