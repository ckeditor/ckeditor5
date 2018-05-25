/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/setheadercolumncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { getParentTable, updateNumericAttribute } from './utils';

/**
 * The header coloumn command.
 *
 * @extends module:core/command~Command
 */
export default class SetHeaderColumnCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;

		const position = selection.getFirstPosition();
		const tableParent = getParentTable( position );

		this.isEnabled = !!tableParent;

		this.value = this.isEnabled && this._isInHeading( position.parent, tableParent );
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;
		const selection = doc.selection;
		const tableUtils = this.editor.plugins.get( 'TableUtils' );

		const position = selection.getFirstPosition();
		const tableCell = position.parent;
		const tableRow = tableCell.parent;
		const table = tableRow.parent;

		const currentHeadingColumns = parseInt( table.getAttribute( 'headingColumns' ) || 0 );

		const { column } = tableUtils.getCellLocation( tableCell );

		const columnsToSet = column + 1 !== currentHeadingColumns ? column + 1 : column;

		model.change( writer => {
			updateNumericAttribute( 'headingColumns', columnsToSet, table, writer, 0 );
		} );
	}

	/**
	 * Checks if table cell is in heading section.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @param {module:engine/model/element~Element} table
	 * @returns {Boolean}
	 * @private
	 */
	_isInHeading( tableCell, table ) {
		const headingColumns = parseInt( table.getAttribute( 'headingColumns' ) || 0 );

		const tableUtils = this.editor.plugins.get( 'TableUtils' );

		const { column } = tableUtils.getCellLocation( tableCell );

		return !!headingColumns && column < headingColumns;
	}
}
