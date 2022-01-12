/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
 * @param {String} options.modelAttribute The attribute to set.
 * @param {String} options.styleName The style name to convert.
 * @param {String} options.viewElement The view element name that should be converted.
 * @param {String} options.defaultValue The default value for the specified `modelAttribute`.
 * @param {Boolean} [options.reduceBoxSides=false]
 */
export function upcastStyleToAttribute( conversion, options ) {
	const { viewElement, defaultValue, modelAttribute, styleName, reduceBoxSides = false } = options;

	conversion.for( 'upcast' ).attributeToAttribute( {
		view: {
			name: viewElement,
			styles: {
				[ styleName ]: /[\s\S]+/
			}
		},
		model: {
			key: modelAttribute,
			value: viewElement => {
				const normalized = viewElement.getNormalizedStyle( styleName );
				const value = reduceBoxSides ? reduceBoxSidesValue( normalized ) : normalized;

				if ( defaultValue !== value ) {
					return value;
				}
			}
		}
	} );
}

/**
 * Conversion helper for upcasting border styles for view elements.
 *
 * @param {module:engine/conversion/conversion~Conversion} conversion
 * @param {String} viewElementName
 * @param {Object} modelAttributes
 * @param {Object} defaultBorder The default border values.
 * @param {String} defaultBorder.color The default `borderColor` value.
 * @param {String} defaultBorder.style The default `borderStyle` value.
 * @param {String} defaultBorder.width The default `borderWidth` value.
 */
export function upcastBorderStyles( conversion, viewElementName, modelAttributes, defaultBorder ) {
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

		const normalizedBorder = {
			style: data.viewItem.getNormalizedStyle( 'border-style' ),
			color: data.viewItem.getNormalizedStyle( 'border-color' ),
			width: data.viewItem.getNormalizedStyle( 'border-width' )
		};

		const reducedBorder = {
			style: reduceBoxSidesValue( normalizedBorder.style ),
			color: reduceBoxSidesValue( normalizedBorder.color ),
			width: reduceBoxSidesValue( normalizedBorder.width )
		};

		if ( reducedBorder.style !== defaultBorder.style ) {
			conversionApi.writer.setAttribute( modelAttributes.style, reducedBorder.style, modelElement );
		}

		if ( reducedBorder.color !== defaultBorder.color ) {
			conversionApi.writer.setAttribute( modelAttributes.color, reducedBorder.color, modelElement );
		}

		if ( reducedBorder.width !== defaultBorder.width ) {
			conversionApi.writer.setAttribute( modelAttributes.width, reducedBorder.width, modelElement );
		}
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
