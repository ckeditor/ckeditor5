/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/utils
 */

import { toWidget, isWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { getParentTable } from './commands/utils';

const tableSymbol = Symbol( 'isImage' );

/**
 * Converts a given {@link module:engine/view/element~Element} to a table widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the table widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/view/writer~Writer} writer An instance of the view writer.
 * @param {String} label The element's label. It will be concatenated with the table `alt` attribute if one is present.
 * @returns {module:engine/view/element~Element}
 */
export function toTableWidget( viewElement, writer ) {
	writer.setCustomProperty( tableSymbol, true, viewElement );

	return toWidget( viewElement, writer );
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
	const parentTable = getParentTable( selection.getFirstPosition() );

	return !!( parentTable && isTableWidget( parentTable ) );
}
