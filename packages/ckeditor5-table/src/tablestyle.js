/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablestyle
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The table editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const conversion = editor.conversion;

		schema.extend( 'table', {
			allowAttributes: [ 'border', 'background-color', 'width', 'height' ]
		} );

		schema.extend( 'tableRow', {
			allowAttributes: [ 'height' ]
		} );

		schema.extend( 'tableCell', {
			allowAttributes: [ 'border', 'background-color', 'padding', 'vertical-align', 'width', 'height' ]
		} );

		// Table attributes.
		setupTableConversion( conversion, 'border' );
		setupTableConversion( conversion, 'background-color' );
		setupTableConversion( conversion, 'width' );
		setupTableConversion( conversion, 'height' );

		// Table row attributes.
		setupConversion( conversion, 'height', 'tableRow' );

		// Table cell attributes.
		setupConversion( conversion, 'border', 'tableCell' );
		setupConversion( conversion, 'background-color', 'tableCell' );
		setupConversion( conversion, 'padding', 'tableCell' );
		setupConversion( conversion, 'vertical-align', 'tableCell' );
		setupConversion( conversion, 'width', 'tableCell' );
	}
}

function setupConversion( conversion, styleName, modelName ) {
	// General upcast 'border' attribute (requires model border attribute to be allowed).
	upcastAttribute( conversion, styleName, modelName );

	// Downcast table cell only (table has own downcast converter).
	conversion.for( 'downcast' ).attributeToAttribute( {
		model: {
			name: modelName,
			key: styleName
		},
		view: modelAttributeValue => ( {
			key: 'style',
			value: {
				[ styleName ]: modelAttributeValue
			}
		} )
	} );
}

function upcastAttribute( conversion, styleName, modelName ) {
	conversion.for( 'upcast' ).attributeToAttribute( {
		view: {
			styles: {
				[ styleName ]: /[\s\S]+/
			}
		},
		model: {
			name: modelName,
			key: styleName,
			value: viewElement => viewElement.getNormalizedStyle( styleName )
		}
	} );
}

function setupTableConversion( conversion, styleName ) {
	upcastAttribute( conversion, styleName, 'table' );

	// Properly downcast table border attribute on <table> and not on <figure>.
	conversion.for( 'downcast' ).add( dispatcher => dispatcher.on( `attribute:${ styleName }:table`, ( evt, data, conversionApi ) => {
		const { item, attributeNewValue } = data;
		const { mapper, writer } = conversionApi;

		const table = [ ...mapper.toViewElement( item ).getChildren() ].find( child => child.is( 'table' ) );

		writer.setStyle( styleName, attributeNewValue, table );
	} ) );
}
