/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console:false, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';

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

		// Extend schema with custom HTML elements.

		// Inline element
		dataSchema.registerInlineElement( {
			view: 'element-inline',
			model: 'myElementInline'
		} );

		// Custom elements need to be filtered using direct API instead of config.
		dataFilter.allowElement( 'element-inline' );
		dataFilter.allowAttributes( { name: 'element-inline', attributes: { 'data-foo': false }, classes: [ 'foo' ] } );

		// Block element
		dataSchema.registerBlockElement( {
			view: 'element-block',
			model: 'myElementBlock',
			modelSchema: {
				inheritAllFrom: '$block'
			}
		} );

		dataFilter.allowElement( 'element-block' );

		// Inline object element
		dataSchema.registerInlineElement( {
			view: 'object-inline',
			model: 'myObjectInline',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectInline'
			}
		} );

		dataFilter.allowElement( 'object-inline' );

		// Block object element
		dataSchema.registerBlockElement( {
			view: 'object-block',
			model: 'myObjectBlock',
			isObject: true,
			modelSchema: {
				inheritAllFrom: '$htmlObjectBlock'
			}
		} );

		dataFilter.allowElement( 'object-block' );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			Paragraph,
			SourceEditing,
			ExtendHTMLSupport
		],
		toolbar: [
			'sourceediting'
		],
		htmlSupport: {
			allow: [
				{
					name: /.*/,
					attributes: true,
					classes: true,
					styles: true
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
