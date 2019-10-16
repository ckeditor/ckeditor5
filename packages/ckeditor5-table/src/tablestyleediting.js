/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablestyleediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The tablestyle editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableStyleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const conversion = editor.conversion;

		schema.extend( 'table', {
			allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle', 'background-color', 'width', 'height' ]
		} );

		schema.extend( 'tableRow', {
			allowAttributes: [ 'height' ]
		} );

		schema.extend( 'tableCell', {
			allowAttributes: [
				'borderWidth', 'borderColor', 'borderStyle',
				'background-color', 'padding', 'vertical-align', 'width', 'height' ]
		} );

		// Table attributes.
		setupTableConversion( conversion, 'background-color' );
		setupTableConversion( conversion, 'width' );
		setupTableConversion( conversion, 'height' );

		// Table row attributes.
		setupConversion( conversion, 'height', 'tableRow' );

		upcastBorderStyles( conversion, 'td' );
		upcastBorderStyles( conversion, 'th' );
		upcastBorderStyles( conversion, 'table' );

		downcastToStyle( conversion, 'borderStyle', 'border-style' );
		downcastToStyle( conversion, 'borderColor', 'border-color' );
		downcastToStyle( conversion, 'borderWidth', 'border-width' );

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

function upcastBorderStyles( conversion, viewElement ) {
	conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:' + viewElement, ( evt, data, conversionApi ) => {
		let matcherPattern;

		if ( data.viewItem.hasStyle( 'border' ) ) {
			matcherPattern = {
				styles: [ 'border' ]
			};
		} else {
			const stylesToConsume = [
				'border-top',
				'border-right',
				'border-bottom',
				'border-left'
			].filter( styleName => data.viewItem.hasStyle( styleName ) );

			if ( stylesToConsume.length ) {
				matcherPattern = {
					styles: stylesToConsume
				};
			} else {
				return;
			}
		}

		// Try to consume appropriate values from consumable values list.
		const toMatch = matcherPattern;

		if ( !conversionApi.consumable.test( data.viewItem, toMatch ) ) {
			return;
		}

		const modelElement = [ ...data.modelRange.getItems( { shallow: true } ) ].pop();

		conversionApi.consumable.consume( data.viewItem, toMatch );

		if ( conversionApi.schema.checkAttribute( modelElement, 'borderStyle' ) ) {
			conversionApi.writer.setAttribute( 'borderStyle', data.viewItem.getNormalizedStyle( 'border-style' ), modelElement );
		}

		if ( conversionApi.schema.checkAttribute( modelElement, 'borderColor' ) ) {
			conversionApi.writer.setAttribute( 'borderColor', data.viewItem.getNormalizedStyle( 'border-color' ), modelElement );
		}

		if ( conversionApi.schema.checkAttribute( modelElement, 'borderWidth' ) ) {
			conversionApi.writer.setAttribute( 'borderWidth', data.viewItem.getNormalizedStyle( 'border-width' ), modelElement );
		}
	} ) );
}

function downcastToStyle( conversion, modelAttribute, viewStyleName ) {
	conversion.for( 'downcast' ).attributeToAttribute( {
		model: modelAttribute,
		view: modelAttributeValue => ( {
			key: 'style',
			value: {
				[ viewStyleName ]: modelAttributeValue
			}
		} )
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
