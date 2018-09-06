/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/utils
 */

import { isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { findAncestor } from './commands/utils';

const tableSymbol = Symbol( 'isTable' );

/**
 * Converts a given {@link module:engine/view/element~Element} to a table widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the table widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
 * @param {String} label The element's label. It will be concatenated with the table `alt` attribute if one is present.
 * @returns {module:engine/view/element~Element}
 */
export function toTableWidget( viewElement, writer ) {
	writer.setCustomProperty( tableSymbol, true, viewElement );

	return toWidget( viewElement, writer, { hasSelectionHandler: true } );
}

/**
 * Checks if a given view element is a table widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isTableWidget( viewElement ) {
	return !!viewElement.getCustomProperty( tableSymbol ) && isWidget( viewElement );
}

/**
 * Checks if a table widget is the only selected element.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {Boolean}
 */
export function isTableWidgetSelected( selection ) {
	const viewElement = selection.getSelectedElement();

	return !!( viewElement && isTableWidget( viewElement ) );
}

/**
 * Checks if a table widget content is selected.
 *
 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
 * @returns {Boolean}
 */
export function isTableContentSelected( selection ) {
	const parentTable = findAncestor( 'table', selection.getFirstPosition() );

	return !!( parentTable && isTableWidget( parentTable.parent ) );
}
