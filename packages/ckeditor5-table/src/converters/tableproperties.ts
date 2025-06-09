/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/tableproperties
 */

import type { Conversion, UpcastConversionApi, UpcastConversionData, ViewElement } from 'ckeditor5/src/engine.js';
import { first } from 'ckeditor5/src/utils.js';

/**
 * Conversion helper for upcasting attributes using normalized styles.
 *
 * @param options.modelAttribute The attribute to set.
 * @param options.styleName The style name to convert.
 * @param options.attributeName The HTML attribute name to convert.
 * @param options.attributeType The HTML attribute type for value normalization.
 * @param options.viewElement The view element name that should be converted.
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 * @param options.shouldUpcast The function which returns `true` if style should be upcasted from this element.
 */
export function upcastStyleToAttribute(
	conversion: Conversion,
	options: {
		modelAttribute: string;
		styleName: string;
		attributeName?: string;
		attributeType?: 'length' | 'color';
		viewElement: string | RegExp;
		defaultValue: string;
		reduceBoxSides?: boolean;
	}
): void {
	const {
		modelAttribute,
		styleName,
		attributeName,
		attributeType,
		viewElement,
		defaultValue,
		reduceBoxSides = false
	} = options;

	conversion.for( 'upcast' ).attributeToAttribute( {
		view: {
			name: viewElement,
			styles: {
				[ styleName ]: /[\s\S]+/
			}
		},
		model: {
			key: modelAttribute,
			value: ( viewElement: ViewElement, conversionApi: UpcastConversionApi, data: UpcastConversionData<ViewElement> ) => {
				// Ignore table elements inside figures and figures without the table class.
				if (
					viewElement.name == 'table' && viewElement.parent!.name == 'figure' ||
					viewElement.name == 'figure' && !viewElement.hasClass( 'table' )
				) {
					return;
				}

				const localDefaultValue = getDefaultValueAdjusted( defaultValue, '', data );

				const normalized = viewElement.getNormalizedStyle( styleName ) as Record<Side, string>;
				const value = reduceBoxSides ? reduceBoxSidesValue( normalized ) : normalized;

				if ( localDefaultValue !== value ) {
					return value;
				}

				// Consume the style even if not applied to the element so it won't be processed by other converters.
				conversionApi.consumable.consume( viewElement, { styles: styleName } );
			}
		}
	} );

	if ( attributeName ) {
		conversion.for( 'upcast' ).attributeToAttribute( {
			view: {
				name: viewElement,
				attributes: {
					[ attributeName ]: /.+/
				}
			},
			model: {
				key: modelAttribute,
				value: ( viewElement: ViewElement, conversionApi: UpcastConversionApi, data: UpcastConversionData<ViewElement> ) => {
					// Convert attributes of table and table cell elements, ignore figure.
					// Do not convert attribute if related style is set as it has a higher priority.
					// Do not convert attribute if the element is a table inside a figure with the related style set.
					if (
						viewElement.name == 'figure' ||
						viewElement.hasStyle( styleName ) ||
						viewElement.name == 'table' && viewElement.parent!.name == 'figure' && viewElement.parent!.hasStyle( styleName )
					) {
						return;
					}

					const localDefaultValue = getDefaultValueAdjusted( defaultValue, '', data );
					let value = viewElement.getAttribute( attributeName );

					if ( value && attributeType == 'length' && !value.endsWith( 'px' ) ) {
						value += 'px';
					}

					if ( localDefaultValue !== value ) {
						return value;
					}

					// Consume the attribute even if not applied to the element so it won't be processed by other converters.
					conversionApi.consumable.consume( viewElement, { attributes: attributeName } );
				}
			}
		} );
	}
}

export interface StyleValues {
	color: string;
	style: string;
	width: string;
}

/**
 * Conversion helper for upcasting border styles for view elements.
 *
 * @param defaultBorder The default border values.
 * @param defaultBorder.color The default `borderColor` value.
 * @param defaultBorder.style The default `borderStyle` value.
 * @param defaultBorder.width The default `borderWidth` value.
 */
export function upcastBorderStyles(
	conversion: Conversion,
	viewElementName: string,
	modelAttributes: StyleValues,
	defaultBorder: StyleValues
): void {
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
		const tableElement = modelElement.findAncestor( 'table', { includeSelf: true } );

		let localDefaultBorder = defaultBorder;

		if ( tableElement && tableElement.getAttribute( 'tableType' ) == 'layout' ) {
			localDefaultBorder = {
				style: 'none',
				color: '',
				width: ''
			};
		}

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

		if ( reducedBorder.style !== localDefaultBorder.style ) {
			conversionApi.writer.setAttribute( modelAttributes.style, reducedBorder.style, modelElement );
		}

		if ( reducedBorder.color !== localDefaultBorder.color ) {
			conversionApi.writer.setAttribute( modelAttributes.color, reducedBorder.color, modelElement );
		}

		if ( reducedBorder.width !== localDefaultBorder.width ) {
			conversionApi.writer.setAttribute( modelAttributes.width, reducedBorder.width, modelElement );
		}
	} ) );
}

/**
 * Conversion helper for downcasting an attribute to a style.
 */
export function downcastAttributeToStyle(
	conversion: Conversion,
	options: {
		modelElement: string;
		modelAttribute: string;
		styleName: string;
	}
): void {
	const { modelElement, modelAttribute, styleName } = options;

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
 */
export function downcastTableAttribute(
	conversion: Conversion,
	options: {
		modelAttribute: string;
		styleName: string;
	}
): void {
	const { modelAttribute, styleName } = options;

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

/**
 * Returns the default value for table or table cell property adjusted for layout tables.
 */
export function getDefaultValueAdjusted(
	defaultValue: string,
	layoutTableDefault: string,
	data: UpcastConversionData<ViewElement>
): string {
	const modelElement = data.modelRange && first( data.modelRange.getItems( { shallow: true } ) );
	const tableElement = modelElement && modelElement.is( 'element' ) && modelElement.findAncestor( 'table', { includeSelf: true } );

	if ( tableElement && tableElement.getAttribute( 'tableType' ) === 'layout' ) {
		return layoutTableDefault;
	}

	return defaultValue;
}

type Side = 'top' | 'right' | 'bottom' | 'left';
type Style = Record<Side, string>;

/**
 * Reduces the full top, right, bottom, left object to a single string if all sides are equal.
 * Returns original style otherwise.
 */
function reduceBoxSidesValue( style?: Style ): undefined | string | Style {
	if ( !style ) {
		return;
	}
	const sides: Array<Side> = [ 'top', 'right', 'bottom', 'left' ];
	const allSidesDefined = sides.every( side => style[ side ] );

	if ( !allSidesDefined ) {
		return style;
	}

	const topSideStyle = style.top;
	const allSidesEqual = sides.every( side => style[ side ] === topSideStyle );

	if ( !allSidesEqual ) {
		return style;
	}

	return topSideStyle;
}
