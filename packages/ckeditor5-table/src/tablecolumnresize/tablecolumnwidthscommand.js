/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/tablecolumnwidthscommand
 */

import { Command } from 'ckeditor5/src/core';
import { getTableColumnGroup, normalizeColumnWidths } from './utils';

/**
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableColumnWidthsCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		// The command is always enabled as it doesn't care about the actual selection - table can be resized
		// even if the selection is elsewhere.
		this.isEnabled = true;
	}

	/**
	 * Changes the `columnWidth` attribute values for the columns of the given table.
	 *
	 * @param {Object} options
	 * @param {Array.<string>} [options.columnWidths] New value of the `columnWidths` attribute.
	 * @param {module:engine/model/element~Element} [options.table] The table that is having the columns resized.
	 */
	execute( options = {} ) {
		const { model } = this.editor;
		const {
			table = model.document.selection.getSelectedElement(),
			columnWidths
		} = options;

		model.change( writer => {
			const tableColumnGroup = getTableColumnGroup( table );

			if ( !columnWidths && !tableColumnGroup ) {
				return;
			}

			if ( !columnWidths ) {
				return writer.remove( tableColumnGroup );
			}

			const widths = normalizeColumnWidths( columnWidths );

			if ( !tableColumnGroup ) {
				const colGroupElement = writer.createElement( 'tableColumnGroup' );

				widths.forEach( columnWidth => writer.appendElement( 'tableColumn', { columnWidth }, colGroupElement ) );
				writer.append( colGroupElement, table );
			} else {
				Array
					.from( tableColumnGroup.getChildren() )
					.forEach( ( column, index ) => writer.setAttribute( 'columnWidth', widths[ index ], column ) );
			}
		} );
	}
}
