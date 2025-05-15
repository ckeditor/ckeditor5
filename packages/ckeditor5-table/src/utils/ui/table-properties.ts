/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/utils/ui/table-properties
 */

import {
	ButtonView,
	ViewModel,
	type ColorOption,
	type LabeledFieldView,
	type ListDropdownItemDefinition,
	type NormalizedColorOption,
	type ToolbarView,
	type View,
	type ColorPickerConfig
} from 'ckeditor5/src/ui.js';

import { Collection, type LocaleTranslate } from 'ckeditor5/src/utils.js';
import { isColor, isLength, isPercentage } from 'ckeditor5/src/engine.js';

import type TableCellPropertiesView from '../../tablecellproperties/ui/tablecellpropertiesview.js';
import type TablePropertiesView from '../../tableproperties/ui/tablepropertiesview.js';

import ColorInputView from '../../ui/colorinputview.js';

const isEmpty = ( val: string ) => val === '';

/**
 * Returns an object containing pairs of CSS border style values and their localized UI
 * labels. Used by {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView}
 * and {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView}.
 *
 * @param t The "t" function provided by the editor that is used to localize strings.
 */
export function getBorderStyleLabels( t: LocaleTranslate ): Record<string, string> {
	return {
		none: t( 'None' ),
		solid: t( 'Solid' ),
		dotted: t( 'Dotted' ),
		dashed: t( 'Dashed' ),
		double: t( 'Double' ),
		groove: t( 'Groove' ),
		ridge: t( 'Ridge' ),
		inset: t( 'Inset' ),
		outset: t( 'Outset' )
	};
}

/**
 * Returns a localized error string that can be displayed next to color (background, border)
 * fields that have an invalid value.
 *
 * @param t The "t" function provided by the editor that is used to localize strings.
 */
export function getLocalizedColorErrorText( t: LocaleTranslate ): string {
	return t( 'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".' );
}

/**
 * Returns a localized error string that can be displayed next to length (padding, border width)
 * fields that have an invalid value.
 *
 * @param t The "t" function provided by the editor that is used to localize strings.
 */
export function getLocalizedLengthErrorText( t: LocaleTranslate ): string {
	return t( 'The value is invalid. Try "10px" or "2em" or simply "2".' );
}

/**
 * Returns `true` when the passed value is an empty string or a valid CSS color expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isColor}.
 */
export function colorFieldValidator( value: string ): boolean {
	value = value.trim().toLowerCase();

	return isEmpty( value ) || isColor( value );
}

/**
 * Returns `true` when the passed value is an empty string, a number without a unit or a valid CSS length expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isLength}.
 * See {@link module:engine/view/styles/utils~isPercentage}.
 */
export function lengthFieldValidator( value: string ): boolean {
	value = value.trim();

	return isEmpty( value ) || isNumberString( value ) || isLength( value ) || isPercentage( value );
}

/**
 * Returns `true` when the passed value is an empty string, a number without a unit or a valid CSS length expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isLength}.
 */
export function lineWidthFieldValidator( value: string ): boolean {
	value = value.trim();

	return isEmpty( value ) || isNumberString( value ) || isLength( value );
}

/**
 * Generates item definitions for a UI dropdown that allows changing the border style of a table or a table cell.
 *
 * @param defaultStyle The default border.
 */
export function getBorderStyleDefinitions(
	view: TableCellPropertiesView | TablePropertiesView,
	defaultStyle: string
): Collection<ListDropdownItemDefinition> {
	const itemDefinitions: Collection<ListDropdownItemDefinition> = new Collection();
	const styleLabels = getBorderStyleLabels( view.t! );

	for ( const style in styleLabels ) {
		const definition: ListDropdownItemDefinition = {
			type: 'button',
			model: new ViewModel( {
				_borderStyleValue: style,
				label: styleLabels[ style ],
				role: 'menuitemradio',
				withText: true
			} )
		};

		if ( style === 'none' ) {
			definition.model.bind( 'isOn' ).to( view, 'borderStyle', value => {
				if ( defaultStyle === 'none' ) {
					return !value;
				}

				return value === style;
			} );
		} else {
			definition.model.bind( 'isOn' ).to( view, 'borderStyle', value => {
				return value === style;
			} );
		}

		itemDefinitions.add( definition );
	}

	return itemDefinitions;
}

/**
 * A helper that fills a toolbar with buttons that:
 *
 * * have some labels,
 * * have some icons,
 * * set a certain UI view property value upon execution.
 *
 * @param options Configuration options
 * @param options.view The view that has the observable property.
 * @param options.icons Object with button icons.
 * @param options.toolbar The toolbar to fill with buttons.
 * @param options.labels Object with button labels.
 * @param options.propertyName The name of the observable property in the view.
 * @param options.nameToValue A function that maps a button name to a value. By default names are the same as values.
 * @param options.defaultValue Default value for the property.
 */
export function fillToolbar<TView extends View, TPropertyName extends keyof TView>(
	options: {
		view: TView;
		icons: Record<string, string>;
		toolbar: ToolbarView;
		labels: Record<number, string>;
		propertyName: TPropertyName;
		nameToValue?: ( name: string ) => string;
		defaultValue?: string;
	}
): void {
	const { view, icons, toolbar, labels, propertyName, nameToValue, defaultValue } = options;
	for ( const name in labels ) {
		const button = new ButtonView( view.locale );

		button.set( {
			role: 'radio',
			isToggleable: true,
			label: labels[ name ],
			icon: icons[ name ],
			tooltip: labels[ name ]
		} );

		// If specified the `nameToValue()` callback, map the value based on the option's name.
		const buttonValue = nameToValue ? nameToValue( name ) : name;

		button.bind( 'isOn' ).to( view, propertyName, value => {
			// `value` comes from `view[ propertyName ]`.
			let valueToCompare: unknown = value;

			// If it's empty, and the `defaultValue` is specified, use it instead.
			if ( value === '' && defaultValue ) {
				valueToCompare = defaultValue;
			}

			return buttonValue === valueToCompare;
		} );

		button.on( 'execute', () => {
			// Allow toggling alignment if there is no default value specified (especially for layout tables).
			if ( !defaultValue && buttonValue && view[ propertyName ] === buttonValue ) {
				view[ propertyName ] = undefined as any;
			} else {
				view[ propertyName ] = buttonValue as any;
			}
		} );

		toolbar.items.add( button );
	}
}

/**
 * A default color palette used by various user interfaces related to tables, for instance,
 * by {@link module:table/tablecellproperties/tablecellpropertiesui~TableCellPropertiesUI} or
 * {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI}.
 *
 * The color palette follows the {@link module:table/tableconfig~TableColorConfig table color configuration format}
 * and contains the following color definitions:
 *
 * ```ts
 * const defaultColors = [
 *   {
 *     color: 'hsl(0, 0%, 0%)',
 *     label: 'Black'
 *   },
 *   {
 *     color: 'hsl(0, 0%, 30%)',
 *     label: 'Dim grey'
 *   },
 *   {
 *     color: 'hsl(0, 0%, 60%)',
 *     label: 'Grey'
 *   },
 *   {
 *     color: 'hsl(0, 0%, 90%)',
 *     label: 'Light grey'
 *   },
 *   {
 *     color: 'hsl(0, 0%, 100%)',
 *     label: 'White',
 *     hasBorder: true
 *   },
 *   {
 *     color: 'hsl(0, 75%, 60%)',
 *     label: 'Red'
 *   },
 *   {
 *     color: 'hsl(30, 75%, 60%)',
 *     label: 'Orange'
 *   },
 *   {
 *     color: 'hsl(60, 75%, 60%)',
 *     label: 'Yellow'
 *   },
 *   {
 *     color: 'hsl(90, 75%, 60%)',
 *     label: 'Light green'
 *   },
 *   {
 *     color: 'hsl(120, 75%, 60%)',
 *     label: 'Green'
 *   },
 *   {
 *     color: 'hsl(150, 75%, 60%)',
 *     label: 'Aquamarine'
 *   },
 *   {
 *     color: 'hsl(180, 75%, 60%)',
 *     label: 'Turquoise'
 *   },
 *   {
 *     color: 'hsl(210, 75%, 60%)',
 *     label: 'Light blue'
 *   },
 *   {
 *     color: 'hsl(240, 75%, 60%)',
 *     label: 'Blue'
 *   },
 *   {
 *     color: 'hsl(270, 75%, 60%)',
 *     label: 'Purple'
 *   }
 * ];
 * ```
 */
export const defaultColors: Array<ColorOption> = [
	{
		color: 'hsl(0, 0%, 0%)',
		label: 'Black'
	},
	{
		color: 'hsl(0, 0%, 30%)',
		label: 'Dim grey'
	},
	{
		color: 'hsl(0, 0%, 60%)',
		label: 'Grey'
	},
	{
		color: 'hsl(0, 0%, 90%)',
		label: 'Light grey'
	},
	{
		color: 'hsl(0, 0%, 100%)',
		label: 'White',
		hasBorder: true
	},
	{
		color: 'hsl(0, 75%, 60%)',
		label: 'Red'
	},
	{
		color: 'hsl(30, 75%, 60%)',
		label: 'Orange'
	},
	{
		color: 'hsl(60, 75%, 60%)',
		label: 'Yellow'
	},
	{
		color: 'hsl(90, 75%, 60%)',
		label: 'Light green'
	},
	{
		color: 'hsl(120, 75%, 60%)',
		label: 'Green'
	},
	{
		color: 'hsl(150, 75%, 60%)',
		label: 'Aquamarine'
	},
	{
		color: 'hsl(180, 75%, 60%)',
		label: 'Turquoise'
	},
	{
		color: 'hsl(210, 75%, 60%)',
		label: 'Light blue'
	},
	{
		color: 'hsl(240, 75%, 60%)',
		label: 'Blue'
	},
	{
		color: 'hsl(270, 75%, 60%)',
		label: 'Purple'
	}
];

/**
 * Returns a creator for a color input with a label.
 *
 * For given options, it returns a function that creates an instance of a
 * {@link module:table/ui/colorinputview~ColorInputView color input} logically related to
 * a {@link module:ui/labeledfield/labeledfieldview~LabeledFieldView labeled view} in the DOM.
 *
 * The helper does the following:
 *
 * * It sets the color input `id` and `ariaDescribedById` attributes.
 * * It binds the color input `isReadOnly` to the labeled view.
 * * It binds the color input `hasError` to the labeled view.
 * * It enables a logic that cleans up the error when the user starts typing in the color input.
 *
 * Usage:
 *
 * ```ts
 * const colorInputCreator = getLabeledColorInputCreator( {
 *   colorConfig: [ ... ],
 *   columns: 3,
 * } );
 *
 * const labeledInputView = new LabeledFieldView( locale, colorInputCreator );
 * console.log( labeledInputView.view ); // A color input instance.
 * ```
 *
 * @internal
 * @param options Color input options.
 * @param options.colorConfig The configuration of the color palette displayed in the input's dropdown.
 * @param options.columns The configuration of the number of columns the color palette consists of in the input's dropdown.
 * @param options.defaultColorValue If specified, the color input view will replace the "Remove color" button with
 * the "Restore default" button. Instead of clearing the input field, the default color value will be set.
 * @param options.colorPickerConfig The configuration of the color picker. You could disable it or define your output format.
 */
export function getLabeledColorInputCreator(
	options: {
		colorConfig: Array<NormalizedColorOption>;
		columns: number;
		defaultColorValue?: string;
		colorPickerConfig: false | ColorPickerConfig;
	}
) {
	return ( labeledFieldView: LabeledFieldView, viewUid: string, statusUid: string ): ColorInputView => {
		const colorInputView = new ColorInputView( labeledFieldView.locale!, {
			colorDefinitions: colorConfigToColorGridDefinitions( options.colorConfig ),
			columns: options.columns,
			defaultColorValue: options.defaultColorValue,
			colorPickerConfig: options.colorPickerConfig
		} );

		colorInputView.inputView.set( {
			id: viewUid,
			ariaDescribedById: statusUid
		} );

		colorInputView.bind( 'isReadOnly' ).to( labeledFieldView, 'isEnabled', value => !value );
		colorInputView.bind( 'hasError' ).to( labeledFieldView, 'errorText', value => !!value );

		colorInputView.on( 'input', () => {
			// UX: Make the error text disappear and disable the error indicator as the user
			// starts fixing the errors.
			labeledFieldView.errorText = null;
		} );

		labeledFieldView.bind( 'isEmpty', 'isFocused' ).to( colorInputView );

		return colorInputView;
	};
}

/**
 * A simple helper method to detect number strings.
 * I allows full number notation, so omitting 0 is not allowed:
 */
function isNumberString( value: string ) {
	const parsedValue = parseFloat( value );

	return !Number.isNaN( parsedValue ) && value === String( parsedValue );
}

function colorConfigToColorGridDefinitions( colorConfig: Array<NormalizedColorOption> ) {
	return colorConfig.map( item => ( {
		color: item.model,
		label: item.label,
		options: {
			hasBorder: item.hasBorder
		}
	} ) );
}
