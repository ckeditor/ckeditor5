/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/converters/tableproperites
 */

/**
 * Conversion helper for upcasting attributes using normalized styles.
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion
 * @param {Object} options
 * @param {String} options.modelElement
 * @param {String} options.modelAttribute
 * @param {String} options.styleName
 * @param {Boolean} [options.reduceBoxSides=false]
 */
export function upcastStyleToAttribute( conversion, { modelElement, modelAttribute, styleName, reduceBoxSides = false } ) {
	conversion.for( 'upcast' ).attributeToAttribute( {
		view: {
			styles: {
				[ styleName ]: /[\s\S]+/
			}
		},
		model: {
			name: modelElement,
			key: modelAttribute,
			value: viewElement => {
				const normalized = viewElement.getNormalizedStyle( styleName );

				return reduceBoxSides ? reduceBoxSidesValue( normalized ) : normalized;
			}
		}
	} );
}

/**
 * Conversion helper for upcasting border styles for view elements.
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion
 * @param {String} viewElementName
 */
export function upcastBorderStyles( conversion, viewElementName ) {
	conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:' + viewElementName, ( evt, data, conversionApi ) => {
		// If the element was not converted by element-to-element converter,
		// we should not try to convert the style. See #8393.
		if ( !data.modelRange ) {
			return;
		}

		// Check the most detailed properties. These will be always set directly or
		// when using the "group" properties like: `border-(top|right|bottom|left)` or `border`.
		const stylesToConsume = [
			'border-top-width',
			'border-top-color',
			'border-top-style',
			'border-bottom-width',
			'border-bottom-color',
			'border-bottom-style',
			'border-right-width',
			'border-right-color',
			'border-right-style',
			'border-left-width',
			'border-left-color',
			'border-left-style'
		].filter( styleName => data.viewItem.hasStyle( styleName ) );

		if ( !stylesToConsume.length ) {
			return;
		}

		const matcherPattern = {
			styles: stylesToConsume
		};

		// Try to consume appropriate values from consumable values list.
		if ( !conversionApi.consumable.test( data.viewItem, matcherPattern ) ) {
			return;
		}

		const modelElement = [ ...data.modelRange.getItems( { shallow: true } ) ].pop();

		conversionApi.consumable.consume( data.viewItem, matcherPattern );

		const normalizedBorderStyle = data.viewItem.getNormalizedStyle( 'border-style' );
		const normalizedBorderColor = data.viewItem.getNormalizedStyle( 'border-color' );
		const normalizedBorderWidth = data.viewItem.getNormalizedStyle( 'border-width' );

		conversionApi.writer.setAttribute( 'borderStyle', reduceBoxSidesValue( normalizedBorderStyle ), modelElement );
		conversionApi.writer.setAttribute( 'borderColor', reduceBoxSidesValue( normalizedBorderColor ), modelElement );
		conversionApi.writer.setAttribute( 'borderWidth', reduceBoxSidesValue( normalizedBorderWidth ), modelElement );
	} ) );
}

/**
 * Conversion helper for downcasting an attribute to a style.
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion
 * @param {Object} options
 * @param {String} options.modelElement
 * @param {String} options.modelAttribute
 * @param {String} options.styleName
 */
export function downcastAttributeToStyle( conversion, { modelElement, modelAttribute, styleName } ) {
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

/**
 * Conversion helper for downcasting attributes from the model table to a view table (not to `<figure>`).
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion
 * @param {Object} options
 * @param {String} options.modelAttribute
 * @param {String} options.styleName
 */
export function downcastTableAttribute( conversion, { modelAttribute, styleName } ) {
	conversion.for( 'downcast' ).add( dispatcher => dispatcher.on( `attribute:${ modelAttribute }:table`, ( evt, data, conversionApi ) => {
		const { item, attributeNewValue } = data;
		const { mapper, writer } = conversionApi;

		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const table = [ ...mapper.toViewElement( item ).getChildren() ].find( child => child.is( 'element', 'table' ) );

		if ( attributeNewValue ) {
			writer.setStyle( styleName, attributeNewValue, table );
		} else {
			writer.removeStyle( styleName, table );
		}
	} ) );
}

// Reduces the full top, right, bottom, left object to a single string if all sides are equal.
function reduceBoxSidesValue( style ) {
	if ( !style ) {
		return;
	}

	const commonValue = [ 'top', 'right', 'bottom', 'left' ]
		.map( side => style[ side ] )
		.reduce( ( result, side ) => result == side ? result : null );

	return commonValue || style;
}
