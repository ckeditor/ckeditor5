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
 * Returns `true` when the passed value is an empty string, number without unit or a valid CSS length expression.
 * Otherwise, `false` is returned.
 *
 * See {@link module:engine/view/styles/utils~isLength}.
 *
 * @param {String} value
 * @returns {Boolean}
 */
export function lengthFieldValidator( value ) {
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
 * @param {Function} [nameToValue] Optional function that maps button name to value. By default names are the same as values.
 */
export function fillToolbar( { view, icons, toolbar, labels, propertyName, nameToValue = name => name } ) {
	for ( const name in labels ) {
		const button = new ButtonView( view.locale );

		button.set( {
			label: labels[ name ],
			icon: icons[ name ]
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

// A simple helper method to detect number strings.
// I allows full number notation, so omitting 0 is not allowed:
function isNumberString( value ) {
	const parsedValue = parseFloat( value );

	return !Number.isNaN( parsedValue ) && value === String( parsedValue );
}
