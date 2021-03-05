/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/ConversionEnhancements
 */

import { Plugin } from 'ckeditor5/src/core';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Table from '@ckeditor/ckeditor5-table/src/table';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';

export default class ConversionEnhancements extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Paragraph, Table,

			Indent, Alignment ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ConversionEnhancements';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._preserveParagraphStyle( 'font-size' );
		this._preserveParagraphStyle( 'margin-top' );
		this._preserveParagraphStyle( 'margin-bottom' );

		this._preserveTableStyle( 'margin-left' );
		this._preserveTableStyle( 'float' );
	}

	/**
	 *
	 * @param {String} styleName E.g. 'font-style'.
	 */
	_preserveParagraphStyle( styleName ) {
		const { editor } = this;

		// To simplify things up, model name will be the same.
		const modelAttributeName = styleName;

		// Schema.
		editor.model.schema.extend( 'paragraph', { allowAttributes: modelAttributeName } );

		editor.model.schema.setAttributeProperties( modelAttributeName, {
			isFormatting: true
		} );

		// Conversion.
		editor.conversion.for( 'downcast' ).attributeToAttribute( {
			model: {
				name: 'paragraph',
				key: modelAttributeName
			},
			view: modelAttributeValue => ( {
				key: 'style',
				value: {
					[ styleName ]: modelAttributeValue
				}
			} )
		} );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				styles: {
					[ styleName ]: /[\s\S]+/
				}
			},
			model: {
				name: 'paragraph',
				key: modelAttributeName,
				value: viewElement => viewElement.getStyle( styleName )
			}
		} );
	}

	_preserveTableStyle( styleName ) {;
		const { editor } = this;
		const modelElement = 'table';
		const modelAttributeName = styleName; // For simplification.

		editor.model.schema.extend( 'table', {
			allowAttributes: [ modelAttributeName ]
		} );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				styles: {
					[ styleName ]: /[\s\S]+/
				}
			},
			model: {
				name: modelElement,
				key: modelAttributeName,
				value: viewElement => viewElement.getStyle( styleName )
			}
		} );

		editor.conversion.for( 'downcast' ).attributeToAttribute( {
			model: {
				name: modelElement,
				key: modelAttributeName
			},
			view: modelAttributeValue => ( {
				key: 'style',
				value: {
					[ styleName ]: modelAttributeValue
				}
			} )
		} );
	}
}
