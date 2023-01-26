/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecolumnresize/tablecolumnwidthscommand
 */

import { normalizeColumnWidths } from './utils';
import TablePropertyCommand from '../tableproperties/commands/tablepropertycommand';

/**
 * @extends module:table/tableproperties/commands/tablepropertycommand~TablePropertyCommand
 */
export default class TableColumnWidthsCommand extends TablePropertyCommand {
	/**
	 * Creates a new `TableColumnWidthsCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor, defaultValue ) {
		super( editor, 'columnWidths', defaultValue );
	}

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
	 * @param {Array.<number>} [options.columnWidths] New value of the `columnWidths` attribute.
	 * @param {module:engine/model/element~Element} [options.table] The table that is having the columns resized.
	 */
	execute( options = {} ) {
		const { model } = this.editor;
		const {
			table = model.document.selection.getSelectedElement(),
			columnWidths
		} = options;

		model.change( writer => {
			const tableColumnGroup = Array
				.from( table.getChildren() )
				.find( element => element.is( 'element', 'tableColumnGroup' ) );

			if ( !columnWidths && !tableColumnGroup ) {
				return;
			}

			if ( !columnWidths ) {
				return writer.remove( tableColumnGroup );
			}

			let widths = columnWidths.map( widths => Number( widths.replace( '%', '' ) ) );
			widths = normalizeColumnWidths( widths ).map( width => `${ width }%` );

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
