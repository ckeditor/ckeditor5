/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/tableproperties
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import type {
	Conversion,
	UpcastConversionApi,
	UpcastConversionData,
	ViewElement,
	UpcastElementEvent,
	Consumables
} from '@ckeditor/ckeditor5-engine';
import { first } from '@ckeditor/ckeditor5-utils';

const ALIGN_VALUES_REG_EXP = /^(left|center|right)$/;
const FLOAT_VALUES_REG_EXP = /^(left|none|right)$/;

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
 * @internal
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
		shouldUpcast?: ( viewElement: ViewElement ) => boolean;
	}
): void {
	const {
		modelAttribute,
		styleName,
		attributeName,
		attributeType,
		viewElement,
		defaultValue,
		shouldUpcast = () => true,
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
				if ( !shouldUpcast( viewElement ) ) {
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

					if ( value && attributeType == 'length' ) {
						value = parseFloat( value ) + ( value.endsWith( '%' ) ? '%' : 'px' );
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

/**
 * The style values for border styles.
 *
 * @internal
 */
export interface StyleValues {
	color: string;
	style: string;
	width: string;
}

/**
 * Conversion helper for upcasting border styles for view elements.
 *
 * @param editor The editor instance.
 * @param defaultBorder The default border values.
 * @param defaultBorder.color The default `borderColor` value.
 * @param defaultBorder.style The default `borderStyle` value.
 * @param defaultBorder.width The default `borderWidth` value.
 * @internal
 */
export function upcastBorderStyles(
	editor: Editor,
	viewElementName: string,
	modelAttributes: StyleValues,
	defaultBorder: StyleValues
): void {
	const { conversion } = editor;

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

	// If parent table has `border="0"` attribute then set border style to `none`
	// all table cells of that table and table itself.
	conversion.for( 'upcast' ).add( dispatcher => {
		dispatcher.on<UpcastElementEvent>( `element:${ viewElementName }`, ( evt, data, conversionApi ) => {
			const { modelRange, viewItem } = data;

			const viewTable = (
				viewItem.is( 'element', 'table' ) ?
					viewItem :
					viewItem.findAncestor( 'table' )
			)!;

			// If something already consumed the border attribute on the nearest table element, skip the conversion.
			if ( !conversionApi.consumable.test( viewTable, { attributes: 'border' } ) ) {
				return;
			}

			// Ignore tables with border different than "0".
			if ( viewTable.getAttribute( 'border' ) !== '0' ) {
				return;
			}

			const modelElement = modelRange?.start?.nodeAfter;

			// If model element has any non-default border attribute, skip the conversion.
			if (
				!modelElement ||
				Object.values( modelAttributes ).some( attributeName => modelElement.hasAttribute( attributeName ) )
			) {
				return;
			}

			conversionApi.writer.setAttribute( modelAttributes.style, 'none', modelElement );

			if ( viewItem.is( 'element', 'table' ) ) {
				conversionApi.consumable.consume( viewItem, { attributes: 'border' } );
			}
		} );
	} );
}

/**
 * Conversion helper for downcasting an attribute to a style.
 *
 * @internal
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
 *
 * @internal
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
 *
 * @internal
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

/**
 * Default table alignment options.
 */
export const DEFAULT_TABLE_ALIGNMENT_OPTIONS = {
	left: { className: 'table-style-align-left' },
	center: { className: 'table-style-align-center' },
	right: { className: 'table-style-align-right' },
	blockLeft: { className: 'table-style-block-align-left' },
	blockRight: { className: 'table-style-block-align-right' }
};

/**
 * Configuration for upcasting table alignment from view to model.
 */
export const upcastTableAlignmentConfig: Array<UpcastTableAlignmentConfig> = [
	// Support for the `float:*;` CSS definition for the table alignment.
	{
		view: {
			name: /^(table|figure)$/,
			styles: {
				float: FLOAT_VALUES_REG_EXP
			}
		},
		getAlign: ( viewElement: ViewElement ): string | undefined => {
			let align = viewElement.getStyle( 'float' );

			if ( align === 'none' ) {
				align = 'center';
			}

			return align;
		},
		getConsumables( viewElement: ViewElement ): Consumables {
			const float = viewElement.getStyle( 'float' );
			const styles: Array<string> = [ 'float' ];

			if ( float === 'left' && viewElement.hasStyle( 'margin-right' ) ) {
				styles.push( 'margin-right' );
			} else if ( float === 'right' && viewElement.hasStyle( 'margin-left' ) ) {
				styles.push( 'margin-left' );
			}

			return { styles };
		}
	},
	// Support for the `margin-left:auto; margin-right:auto;` CSS definition for the table alignment.
	{
		view: {
			name: /^(table|figure)$/,
			styles: {
				'margin-left': 'auto',
				'margin-right': 'auto'
			}
		},
		getAlign: (): string => 'center',
		getConsumables: (): Consumables => {
			return { styles: [ 'margin-left', 'margin-right' ] };
		}
	},
	// Support for the left alignment using CSS classes.
	{
		view: {
			name: /^(table|figure)$/,
			key: 'class',
			value: 'table-style-align-left'
		},
		getAlign: (): string => 'left',
		getConsumables(): Consumables {
			return { classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.left.className };
		}
	},
	// Support for the right alignment using CSS classes.
	{
		view: {
			name: /^(table|figure)$/,
			key: 'class',
			value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.right.className
		},
		getAlign: (): string => 'right',
		getConsumables(): Consumables {
			return { classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.right.className };
		}
	},
	// Support for the center alignment using CSS classes.
	{
		view: {
			name: /^(table|figure)$/,
			key: 'class',
			value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.center.className
		},
		getAlign: (): string => 'center',
		getConsumables(): Consumables {
			return { classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.center.className };
		}
	},
	// Support for the block alignment left using CSS classes.
	{
		view: {
			name: /^(table|figure)$/,
			key: 'class',
			value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockLeft.className
		},
		getAlign: (): string => 'blockLeft',
		getConsumables(): Consumables {
			return { classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockLeft.className };
		}
	},
	// Support for the block alignment right using CSS classes.
	{
		view: {
			name: /^(table|figure)$/,
			key: 'class',
			value: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockRight.className
		},
		getAlign: (): string => 'blockRight',
		getConsumables(): Consumables {
			return { classes: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockRight.className };
		}
	},
	// Support for the block alignment left using margin CSS styles.
	{
		view: {
			name: /^(table|figure)$/,
			styles: {
				'margin-left': '0',
				'margin-right': 'auto'
			}
		},
		getAlign: (): string => 'blockLeft',
		getConsumables(): Consumables {
			return { styles: [ 'margin-left', 'margin-right' ] };
		}
	},
	// Support for the block alignment right using margin CSS styles.
	{
		view: {
			name: /^(table|figure)$/,
			styles: {
				'margin-left': 'auto',
				'margin-right': '0'
			}
		},
		getAlign: (): string => 'blockRight',
		getConsumables(): Consumables {
			return { styles: [ 'margin-left', 'margin-right' ] };
		}
	},
	// Support for the `align` attribute as the backward compatibility while pasting from other sources.
	{
		view: {
			name: 'table',
			attributes: {
				align: ALIGN_VALUES_REG_EXP
			}
		},
		getAlign: ( viewElement: ViewElement ): string | undefined => viewElement.getAttribute( 'align' ),
		getConsumables(): Consumables {
			return { attributes: 'align' };
		}
	}
];

export const downcastTableAlignmentConfig: Record<TableAlignmentValues, { align: string | undefined; style: string; className: string }> = {
	center: {
		align: 'center',
		style: 'margin-left: auto; margin-right: auto;',
		className: 'table-style-align-center'
	},
	left: {
		align: 'left',
		style: 'float: left;',
		className: 'table-style-align-left'
	},
	right: {
		align: 'right',
		style: 'float: right;',
		className: 'table-style-align-right'
	},
	blockLeft: {
		align: undefined,
		style: 'margin-left: 0; margin-right: auto;',
		className: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockLeft.className
	},
	blockRight: {
		align: undefined,
		style: 'margin-left: auto; margin-right: 0;',
		className: DEFAULT_TABLE_ALIGNMENT_OPTIONS.blockRight.className
	}
};

type UpcastTableAlignmentConfig = {
	view: {
		name: RegExp | string;
		styles?: Record<string, RegExp | string>;
		attributes?: Record<string, RegExp | string>;
		key?: string;
		value?: RegExp | string;
	};
	getAlign: ( ( viewElement: ViewElement ) => string | undefined ) | ( () => string );
	getConsumables: ( viewElement: ViewElement ) => Consumables;
};

export type TableAlignmentValues = 'left' | 'center' | 'right' | 'blockLeft' | 'blockRight';
