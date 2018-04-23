/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/commands/mergecellcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Range from '../../../ckeditor5-engine/src/model/range';

/**
 * The merge cell command.
 *
 * @extends module:core/command~Command
 */
export default class MergeCellCommand extends Command {
	/**
	 * @param editor
	 * @param options
	 */
	constructor( editor, options ) {
		super( editor );

		this.direction = options.direction;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._checkEnabled();
	}

	_checkEnabled() {
		const model = this.editor.model;
		const doc = model.document;
		const element = doc.selection.getFirstPosition().parent;

		const siblingToMerge = this.direction == 'right' ? element.nextSibling : element.previousSibling;

		if ( !element.is( 'tableCell' ) || !siblingToMerge ) {
			return false;
		}

		const rowspan = parseInt( element.getAttribute( 'rowspan' ) || 1 );

		const nextCellRowspan = parseInt( siblingToMerge.getAttribute( 'rowspan' ) || 1 );

		return nextCellRowspan === rowspan;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;
		const tableCell = doc.selection.getFirstPosition().parent;

		const siblingToMerge = this.direction == 'right' ? tableCell.nextSibling : tableCell.previousSibling;

		model.change( writer => {
			writer.move( Range.createIn( siblingToMerge ), Position.createAt( tableCell, this.direction == 'right' ? 'end' : undefined ) );
			writer.remove( siblingToMerge );

			const colspan = parseInt( tableCell.getAttribute( 'colspan' ) || 1 );
			const nextTableCellColspan = parseInt( siblingToMerge.getAttribute( 'colspan' ) || 1 );

			writer.setAttribute( 'colspan', colspan + nextTableCellColspan, tableCell );
		} );
	}
}
