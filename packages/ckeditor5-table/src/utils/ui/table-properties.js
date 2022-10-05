/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/utils/ui/table-properties
 */

import { ButtonView, Model } from 'ckeditor5/src/ui';
import { Collection } from 'ckeditor5/src/utils';
import { isColor, isLength, isPercentage } from 'ckeditor5/src/engine';

import ColorInputView from '../../ui/colorinputview';

const isEmpty = val => val === '';

/**
 * Returns an object containing pairs of CSS border style values and their localized UI
 * labels. Used by {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView}
 * and {@link module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView}.
 *
 * @param {module:utils/locale~Locale#t} t The "t" function provided by the editor
 * that is used to localize strings.
 * @returns {Object.<String,String>}
 */
export function getBorderStyleLabels( t ) {
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
 * @param {module:utils/locale~Locale#t} t The "t" function provided by the editor
 * that is used to localize strings.
 * @returns {String}
 */
export function getLocalizedColorErrorText( t ) {
	return t( 'The color is invalid. Try "#FF0000" or "rgb(255,0,0)" or "red".' );
}

/**
 * Returns a localized error string that can be displayed next to length (padding, border width)
 * fields that have an invalid value.
 *
 * @param {module:utils/locale~Locale#t} t The "t" function provided by the editor
 * that is used to localize strings.
 * @returns {String}
 */
export function getLocalizedLengthErrorText( t ) {
	return t( 'The value is invalid. Try "10px" or "2em" or simply "2".' );
}

/**
 * Returns `true` when the passed value is an empty string or a valid CSS color expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isColor}.
 *
 * @param {String} value
 * @returns {Boolean}
 */
export function colorFieldValidator( value ) {
	value = value.trim();

	return isEmpty( value ) || isColor( value );
}

/**
 * Returns `true` when the passed value is an empty string, a number without a unit or a valid CSS length expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isLength}.
 * See {@link module:engine/view/styles/utils~isPercentage}.
 *
 * @param {String} value
 * @returns {Boolean}
 */
export function lengthFieldValidator( value ) {
	value = value.trim();

	return isEmpty( value ) || isNumberString( value ) || isLength( value ) || isPercentage( value );
}

/**
 * Returns `true` when the passed value is an empty string, a number without a unit or a valid CSS length expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isLength}.
 *
 * @param {String} value
 * @returns {Boolean}
 */
export function lineWidthFieldValidator( value ) {
	value = value.trim();

	return isEmpty( value ) || isNumberString( value ) || isLength( value );
}

/**
 * Generates item definitions for a UI dropdown that allows changing the border style of a table or a table cell.
 *
 * @param {module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView|
 * module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView} view
 * @param {String} defaultStyle The default border.
 * @returns {Iterable.<module:ui/dropdown/utils~ListDropdownItemDefinition>}
 */
export function getBorderStyleDefinitions( view, defaultStyle ) {
	const itemDefinitions = new Collection();
	const styleLabels = getBorderStyleLabels( view.t );

	for ( const style in styleLabels ) {
		const definition = {
			type: 'button',
			model: new Model( {
				_borderStyleValue: style,
				label: styleLabels[ style ],
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
 * @param {Object} options
 * @param {module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView|
 * module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView} options.view
 * @param {Array.<String>} options.icons
 * @param {module:ui/toolbar/toolbarview~ToolbarView} options.toolbar
 * @param {Object.<String,String>} labels
 * @param {String} propertyName
 * @param {Function} nameToValue A function that maps a button name to a value. By default names are the same as values.
 */
export function fillToolbar( options ) {
	const { view, icons, toolbar, labels, propertyName, nameToValue, defaultValue } = options;
	for ( const name in labels ) {
		const button = new ButtonView( view.locale );

		button.set( {
			label: labels[ name ],
			icon: icons[ name ],
			tooltip: labels[ name ]
		} );

		// If specified the `nameToValue()` callback, map the value based on the option's name.
		const buttonValue = nameToValue ? nameToValue( name ) : name;

		button.bind( 'isOn' ).to( view, propertyName, value => {
			// `value` comes from `view[ propertyName ]`.
			let valueToCompare = value;

			// If it's empty, and the `defaultValue` is specified, use it instead.
			if ( value === '' && defaultValue ) {
				valueToCompare = defaultValue;
			}

			return buttonValue === valueToCompare;
		} );

		button.on( 'execute', () => {
			view[ propertyName ] = buttonValue;
		} );

		toolbar.items.add( button );
	}
}

/**
 * A default color palette used by various user interfaces related to tables, for instance,
 * by {@link module:table/tablecellproperties/tablecellpropertiesui~TableCellPropertiesUI} or
 * {@link module:table/tableproperties/tablepropertiesui~TablePropertiesUI}.
 *
 * The color palette follows the {@link module:table/table~TableColorConfig table color configuration format}
 * and contains the following color definitions:
 *
 *		const defaultColors = [
 *			{
 *				color: 'hsl(0, 0%, 0%)',
 *				label: 'Black'
 *			},
 *			{
 *				color: 'hsl(0, 0%, 30%)',
 *				label: 'Dim grey'
 *			},
 *			{
 *				color: 'hsl(0, 0%, 60%)',
 *				label: 'Grey'
 *			},
 *			{
 *				color: 'hsl(0, 0%, 90%)',
 *				label: 'Light grey'
 *			},
 *			{
 *				color: 'hsl(0, 0%, 100%)',
 *				label: 'White',
 *				hasBorder: true
 *			},
 *			{
 *				color: 'hsl(0, 75%, 60%)',
 *				label: 'Red'
 *			},
 *			{
 *				color: 'hsl(30, 75%, 60%)',
 *				label: 'Orange'
 *			},
 *			{
 *				color: 'hsl(60, 75%, 60%)',
 *				label: 'Yellow'
 *			},
 *			{
 *				color: 'hsl(90, 75%, 60%)',
 *				label: 'Light green'
 *			},
 *			{
 *				color: 'hsl(120, 75%, 60%)',
 *				label: 'Green'
 *			},
 *			{
 *				color: 'hsl(150, 75%, 60%)',
 *				label: 'Aquamarine'
 *			},
 *			{
 *				color: 'hsl(180, 75%, 60%)',
 *				label: 'Turquoise'
 *			},
 *			{
 *				color: 'hsl(210, 75%, 60%)',
 *				label: 'Light blue'
 *			},
 *			{
 *				color: 'hsl(240, 75%, 60%)',
 *				label: 'Blue'
 *			},
 *			{
 *				color: 'hsl(270, 75%, 60%)',
 *				label: 'Purple'
 *			}
 *		];
 */
export const defaultColors = [
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
 *		const colorInputCreator = getLabeledColorInputCreator( {
 *			colorConfig: [ ... ],
 *			columns: 3,
 *		} );
 *
 *		const labeledInputView = new LabeledFieldView( locale, colorInputCreator );
 *		console.log( labeledInputView.view ); // A color input instance.
 *
 * @private
 * @param options Color input options.
 * @param {module:table/table~TableColorConfig} options.colorConfig The configuration of the color palette
 * displayed in the input's dropdown.
 * @param {Number} options.columns The configuration of the number of columns the color palette consists of
 * in the input's dropdown.
 * @param {String} [options.defaultColorValue] If specified, the color input view will replace the "Remove color" button with
 * the "Restore default" button. Instead of clearing the input field, the default color value will be set.
 * @returns {Function}
 */
export function getLabeledColorInputCreator( options ) {
	return ( labeledFieldView, viewUid, statusUid ) => {
		const colorInputView = new ColorInputView( labeledFieldView.locale, {
			colorDefinitions: colorConfigToColorGridDefinitions( options.colorConfig ),
			columns: options.columns,
			defaultColorValue: options.defaultColorValue
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

// A simple helper method to detect number strings.
// I allows full number notation, so omitting 0 is not allowed:
function isNumberString( value ) {
	const parsedValue = parseFloat( value );

	return !Number.isNaN( parsedValue ) && value === String( parsedValue );
}

// @param {Array.<Object>} colorConfig
// @returns {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>}
function colorConfigToColorGridDefinitions( colorConfig ) {
	return colorConfig.map( item => ( {
		color: item.model,
		label: item.label,
		options: {
			hasBorder: item.hasBorder
		}
	} ) );
}
