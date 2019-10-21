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

		// Table attributes.

		// Border
		schema.extend( 'table', {
			allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle' ]
		} );
		upcastBorderStyles( conversion, 'table' );
		downcastTableAttribute( conversion, 'borderColor', 'border-color' );
		downcastTableAttribute( conversion, 'borderStyle', 'border-style' );
		downcastTableAttribute( conversion, 'borderWidth', 'border-width' );

		// Background
		schema.extend( 'table', {
			allowAttributes: [ 'backgroundColor' ]
		} );
		upcastAttribute( conversion, 'table', 'backgroundColor', 'background-color' );
		downcastTableAttribute( conversion, 'backgroundColor', 'background-color' );

		// Width
		schema.extend( 'table', {
			allowAttributes: [ 'width' ]
		} );
		upcastAttribute( conversion, 'table', 'width', 'width' );
		downcastTableAttribute( conversion, 'width', 'width' );

		// Height
		schema.extend( 'table', {
			allowAttributes: [ 'height' ]
		} );
		upcastAttribute( conversion, 'table', 'height', 'height' );
		downcastTableAttribute( conversion, 'height', 'height' );

		// Table row attributes.
		schema.extend( 'tableRow', {
			allowAttributes: [ 'height' ]
		} );
		upcastAttribute( conversion, 'tableRow', 'height', 'height' );
		downcastToStyle( conversion, 'tableRow', 'height', 'height' );

		// Table cell attributes.
		schema.extend( 'tableCell', {
			allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle' ]
		} );
		upcastBorderStyles( conversion, 'td' );
		upcastBorderStyles( conversion, 'th' );
		downcastToStyle( conversion, 'tableCell', 'borderStyle', 'border-style' );
		downcastToStyle( conversion, 'tableCell', 'borderColor', 'border-color' );
		downcastToStyle( conversion, 'tableCell', 'borderWidth', 'border-width' );

		schema.extend( 'tableCell', {
			allowAttributes: [ 'backgroundColor' ]
		} );
		upcastAttribute( conversion, 'tableCell', 'backgroundColor', 'background-color' );
		downcastToStyle( conversion, 'tableCell', 'backgroundColor', 'background-color' );

		schema.extend( 'tableCell', {
			allowAttributes: [ 'padding' ]
		} );
		upcastAttribute( conversion, 'tableCell', 'padding', 'padding' );
		downcastToStyle( conversion, 'tableCell', 'padding', 'padding' );

		schema.extend( 'tableCell', {
			allowAttributes: [ 'verticalAlignment' ]
		} );
		upcastAttribute( conversion, 'tableCell', 'verticalAlignment', 'vertical-align' );
		downcastToStyle( conversion, 'tableCell', 'verticalAlignment', 'vertical-align' );

		schema.extend( 'tableCell', {
			allowAttributes: [ 'width' ]
		} );
		upcastAttribute( conversion, 'tableCell', 'width', 'width' );
		downcastToStyle( conversion, 'tableCell', 'width', 'width' );
	}
}

function upcastAttribute( conversion, modelElement, modelAttribute, styleName ) {
	conversion.for( 'upcast' ).attributeToAttribute( {
		view: {
			styles: {
				[ styleName ]: /[\s\S]+/
			}
		},
		model: {
			name: modelElement,
			key: modelAttribute,
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

		conversionApi.writer.setAttribute( 'borderStyle', data.viewItem.getNormalizedStyle( 'border-style' ), modelElement );
		conversionApi.writer.setAttribute( 'borderColor', data.viewItem.getNormalizedStyle( 'border-color' ), modelElement );
		conversionApi.writer.setAttribute( 'borderWidth', data.viewItem.getNormalizedStyle( 'border-width' ), modelElement );
	} ) );
}

function downcastToStyle( conversion, modelElement, modelAttribute, styleName ) {
	conversion.for( 'downcast' ).attributeToAttribute( {
		model: {
			name: modelElement,
			key: modelAttribute
		},
		view: modelAttributeValue => ( {
			key: 'style',
			value: {
				[ styleName ]: modelAttributeValue
			}
		} )
	} );
}

// Properly downcast table border attribute on <table> and not on <figure>.
function downcastTableAttribute( conversion, modelAttribute, styleName ) {
	conversion.for( 'downcast' ).add( dispatcher => dispatcher.on( `attribute:${ modelAttribute }:table`, ( evt, data, conversionApi ) => {
		const { item, attributeNewValue } = data;
		const { mapper, writer } = conversionApi;

		const table = [ ...mapper.toViewElement( item ).getChildren() ].find( child => child.is( 'table' ) );

		writer.setStyle( styleName, attributeNewValue, table );
	} ) );
}
