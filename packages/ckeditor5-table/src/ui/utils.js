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
import { isColor, isLength } from '@ckeditor/ckeditor5-engine/src/view/styles/utils';
import { getTableWidgetAncestor } from '../utils';
import { findAncestor } from '../commands/utils';

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
 * @param {String} target Either "cell" or "table". Determines the the target the balloon will
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
	const firstPosition = editor.model.document.selection.getFirstPosition();
	const modelTableCell = findAncestor( 'tableCell', firstPosition );
	const viewTableCell = editor.editing.mapper.toViewElement( modelTableCell );

	return {
		target: editor.editing.view.domConverter.viewToDom( viewTableCell ),
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
		outset: t( 'Outset' ),
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
 * Returns `true` when the passed value is an empty string or a valid CSS length expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isLength}.
 *
 * @param {String} value
 * @returns {Boolean}
 */
export function lengthFieldValidator( value ) {
	value = value.trim();

	return isEmpty( value ) || isLength( value );
}

/**
 * Generates item definitions for a UI dropdown that allows changing the border style of a table or a table cell.
 *
 * @param {module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView|
 * module:table/tableproperties/ui/tablepropertiesview~TablePropertiesView}
 * @returns {Iterable.<module:ui/dropdown/utils~ListDropdownItemDefinition>}
 */
export function getBorderStyleDefinitions( view ) {
	const itemDefinitions = new Collection();
	const styleLabels = getBorderStyleLabels( view.t );

	for ( const style in styleLabels ) {
		const definition = {
			type: 'button',
			model: new Model( {
				_borderStyleValue: style,
				label: styleLabels[ style ],
				withText: true,
			} )
		};

		definition.model.bind( 'isOn' ).to( view, 'borderStyle', value => {
			return value === style;
		} );

		itemDefinitions.add( definition );
	}

	return itemDefinitions;
}

/**
 * A helper that fills a toolbar toolbar with buttons that:
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
 */
export function fillToolbar( { view, icons, toolbar, labels, propertyName } ) {
	for ( const name in labels ) {
		const button = new ButtonView( view.locale );

		button.set( {
			label: labels[ name ],
			icon: icons[ name ],
		} );

		button.bind( 'isOn' ).to( view, propertyName, value => {
			return value === name;
		} );

		button.on( 'execute', () => {
			view[ propertyName ] = name;
		} );

		toolbar.items.add( button );
	}
}

/**
 * TODO
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
 * TODO
 *
 * @param {*} config
 */
export function colorConfigToColorGridDefinitions( config ) {
	return config.map( item => ( {
		color: item.model,
		label: item.label,
		options: {
			hasBorder: item.hasBorder
		}
	} ) );
}

/**
 * A helper that creates a labeled color input factory.
 *
 * It creates an instance of a {@link TODO color input text} that is
 * logically related to a {@link module:ui/labeledview/labeledview~LabeledView labeled view} in DOM.
 *
 * The helper does the following:
 *
 * * It sets input's `id` and `ariaDescribedById` attributes.
 * * It binds input's `isReadOnly` to the labeled view.
 * * It binds input's `hasError` to the labeled view.
 * * It enables a logic that cleans up the error when user starts typing in the input..
 *
 * Usage:
 *
 *		const colorInputCreator = getLabeledColorInputCreator( {
 *			colorDefinitions: [ ... ]
 *		} );
 *
 *		const labeledInputView = new LabeledView( locale, colorInputCreator );
 *		console.log( labeledInputView.view ); // An color input instance.
 *
 * @private
 * @param options TODO
 * @param {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>} options.colorDefinitions TODO
 * @returns {Function}
 */
export function getLabeledColorInputCreator( options ) {
	// @param {module:ui/labeledview/labeledview~LabeledView} labeledView The instance of the labeled view.
	// @param {String} viewUid An UID string that allows DOM logical connection between the
	// {@link module:ui/labeledview/labeledview~LabeledView#labelView labeled view's label} and the input.
	// @param {String} statusUid An UID string that allows DOM logical connection between the
	// {@link module:ui/labeledview/labeledview~LabeledView#statusView labeled view's status} and the input.
	// @returns {module:ui/inputtext/inputtextview~InputTextView} The input text view instance.
	return ( labeledView, viewUid, statusUid ) => {
		const inputView = new ColorInputView( labeledView.locale, {
			colorDefinitions: colorConfigToColorGridDefinitions( options.colorDefinitions ),
			columns: options.columns
		} );

		inputView.set( {
			id: viewUid,
			ariaDescribedById: statusUid
		} );

		inputView.bind( 'isReadOnly' ).to( labeledView, 'isEnabled', value => !value );
		inputView.bind( 'errorText' ).to( labeledView );

		inputView.on( 'input', () => {
			// UX: Make the error text disappear and disable the error indicator as the user
			// starts fixing the errors.
			labeledView.errorText = null;
		} );

		return inputView;
	};
}
