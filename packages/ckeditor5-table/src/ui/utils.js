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

/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the table in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export function repositionContextualBalloon( editor ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );

	if ( getTableWidgetAncestor( editor.editing.view.document.selection ) ) {
		const position = getBalloonCellPositionData( editor );

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
 * TODO
 *
 * @param {module:utils/locale~Locale#t} t
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
 * Generates border style item definitions for a list dropdown.
 *
 * @param {module:TODO}
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
 * Fills an alignment toolbar with buttons that have certain labels and interact with a certain view
 * property upon execution.
 *
 * TODO
 *
 * @param {Object} options
 * @param {TODO} options.view
 * @param {Array.<String>} options.icons
 * @param {module:ui/toolbar/toolbarview~ToolbarView} options.toolbar
 * @param {Array.<String>} labels
 * @param {String} propertyName
 */
export function fillAlignmentToolbar( { view, icons, toolbar, labels, propertyName } ) {
	for ( const alignment in labels ) {
		const button = new ButtonView( view.locale );

		button.set( {
			label: labels[ alignment ],
			icon: icons[ alignment ],
		} );

		button.bind( 'isOn' ).to( view, propertyName, value => {
			return value === alignment;
		} );

		button.on( 'execute', () => {
			view[ propertyName ] = alignment;
		} );

		toolbar.items.add( button );
	}
}
