/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/commands/tablecellheightcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor } from './utils';

/**
 * The table cell height command.
 *
 * The command is registered by {@link module:table/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * `'tableCellHeight'` editor command.
 *
 * To change cell height of the selected cell, execute the command:
 *
 *		editor.execute( 'tableCellHeight', {
 *			value: '5px'
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class TableCellHeightCommand extends Command {
	constructor( editor ) {
		super( editor );

		this.attributeName = 'height';
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		const tableCell = findAncestor( 'tableCell', selection.getFirstPosition() );

		this.isEnabled = !!tableCell;
		this.value = this._getValue( tableCell );
	}

	_getValue( tableCell ) {
		if ( !tableCell ) {
			return;
		}

		return tableCell.getAttribute( this.attributeName );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} [options]
	 * @param {Boolean} [options.value] If set the command will set height. If height is not set the command will remove the attribute.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		const { value } = options;

		const tableCells = Array.from( selection.getSelectedBlocks() )
			.map( element => findAncestor( 'tableCell', model.createPositionAt( element, 0 ) ) );

		model.change( writer => {
			if ( value ) {
				tableCells.forEach( tableCell => writer.setAttribute( this.attributeName, value, tableCell ) );
			} else {
				tableCells.forEach( tableCell => writer.removeAttribute( this.attributeName, tableCell ) );
			}
		} );
	}
}
