/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/ui/utils
 */

import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import ColorInputView from './colorinputview';
import { isColor, isLength, isPercentage } from '@ckeditor/ckeditor5-engine/src/view/styles/utils';
import { getTableWidgetAncestor } from '../utils';
import { findAncestor } from '../commands/utils';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';

const DEFAULT_BALLOON_POSITIONS = BalloonPanelView.defaultPositions;
const BALLOON_POSITIONS = [
	DEFAULT_BALLOON_POSITIONS.northArrowSouth,
	DEFAULT_BALLOON_POSITIONS.northArrowSouthWest,
	DEFAULT_BALLOON_POSITIONS.northArrowSouthEast,
	DEFAULT_BALLOON_POSITIONS.southArrowNorth,
	DEFAULT_BALLOON_POSITIONS.southArrowNorthWest,
	DEFAULT_BALLOON_POSITIONS.southArrowNorthEast
];

const isEmpty = val => val === '';

/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the table in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @param {String} target Either "cell" or "table". Determines the target the balloon will
 * be attached to.
 */
export function repositionContextualBalloon( editor, target ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );

	if ( getTableWidgetAncestor( editor.editing.view.document.selection ) ) {
		let position;

		if ( target === 'cell' ) {
			position = getBalloonCellPositionData( editor );
		} else {
			position = getBalloonTablePositionData( editor );
		}

		balloon.updatePosition( position );
	}
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected table in the editor content.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:utils/dom/position~Options}
 */
export function getBalloonTablePositionData( editor ) {
	const firstPosition = editor.model.document.selection.getFirstPosition();
	const modelTable = findAncestor( 'table', firstPosition );
	const viewTable = editor.editing.mapper.toViewElement( modelTable );

	return {
		target: editor.editing.view.domConverter.viewToDom( viewTable ),
		positions: BALLOON_POSITIONS
	};
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected table cell in the editor content.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:utils/dom/position~Options}
 */
export function getBalloonCellPositionData( editor ) {
	const mapper = editor.editing.mapper;
	const domConverter = editor.editing.view.domConverter;
	const selection = editor.model.document.selection;

	if ( selection.rangeCount > 1 ) {
		return {
			target: () => createBoundingRect( selection.getRanges(), modelRange => {
				const modelTableCell = getTableCellAtPosition( modelRange.start );
				const viewTableCell = mapper.toViewElement( modelTableCell );
				return new Rect( domConverter.viewToDom( viewTableCell ) );
			} ),
			positions: BALLOON_POSITIONS
		};
	}

	const modelTableCell = getTableCellAtPosition( selection.getFirstPosition() );
	const viewTableCell = mapper.toViewElement( modelTableCell );

	return {
		target: domConverter.viewToDom( viewTableCell ),
		positions: BALLOON_POSITIONS
	};
}

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
 * @returns {Iterable.<module:ui/dropdown/utils~ListDropdownItemDefinition>}
 */
export function getBorderStyleDefinitions( view ) {
	const itemDefinitions = new Collection();
	const styleLabels = getBorderStyleLabels( view.t );

	for ( const style in styleLabels ) {
		const definition = {
			type: 'button',
			model: new Model( {
				_borderStyleValue: style === 'none' ? '' : style,
				label: styleLabels[ style ],
				withText: true
			} )
		};

		if ( style === 'none' ) {
			definition.model.bind( 'isOn' ).to( view, 'borderStyle', value => !value );
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
export function fillToolbar( { view, icons, toolbar, labels, propertyName, nameToValue } ) {
	for ( const name in labels ) {
		const button = new ButtonView( view.locale );

		button.set( {
			label: labels[ name ],
			icon: icons[ name ],
			tooltip: labels[ name ]
		} );

		button.bind( 'isOn' ).to( view, propertyName, value => {
			return value === nameToValue( name );
		} );

		button.on( 'execute', () => {
			view[ propertyName ] = nameToValue( name );
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
 * @returns {Function}
 */
export function getLabeledColorInputCreator( options ) {
	return ( labeledFieldView, viewUid, statusUid ) => {
		const inputView = new ColorInputView( labeledFieldView.locale, {
			colorDefinitions: colorConfigToColorGridDefinitions( options.colorConfig ),
			columns: options.columns
		} );

		inputView.set( {
			id: viewUid,
			ariaDescribedById: statusUid
		} );

		inputView.bind( 'isReadOnly' ).to( labeledFieldView, 'isEnabled', value => !value );
		inputView.bind( 'errorText' ).to( labeledFieldView );

		inputView.on( 'input', () => {
			// UX: Make the error text disappear and disable the error indicator as the user
			// starts fixing the errors.
			labeledFieldView.errorText = null;
		} );

		return inputView;
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

// Returns the first selected table cell from a multi-cell or in-cell selection.
//
// @param {module:engine/model/position~Position} position Document position.
// @returns {module:engine/model/element~Element}
function getTableCellAtPosition( position ) {
	const isTableCellSelected = position.nodeAfter && position.nodeAfter.is( 'tableCell' );

	return isTableCellSelected ? position.nodeAfter : findAncestor( 'tableCell', position );
}

// Returns bounding rect for list of rects.
//
// @param {Array.<module:utils/dom/rect~Rect>|Array.<*>} list List of `Rect`s or any list to map by `mapFn`.
// @param {Function} mapFn Mapping function for list elements.
// @returns {module:utils/dom/rect~Rect}
function createBoundingRect( list, mapFn ) {
	const rectData = {
		left: Number.POSITIVE_INFINITY,
		top: Number.POSITIVE_INFINITY,
		right: Number.NEGATIVE_INFINITY,
		bottom: Number.NEGATIVE_INFINITY
	};

	for ( const item of list ) {
		const rect = mapFn( item );

		rectData.left = Math.min( rectData.left, rect.left );
		rectData.top = Math.min( rectData.top, rect.top );
		rectData.right = Math.max( rectData.right, rect.right );
		rectData.bottom = Math.max( rectData.bottom, rect.bottom );
	}

	rectData.width = rectData.right - rectData.left;
	rectData.height = rectData.bottom - rectData.top;

	return new Rect( rectData );
}
