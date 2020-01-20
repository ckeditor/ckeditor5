/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellbordercolorcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

import { findAncestor, getSingleValue } from '../../commands/utils';

/**
 * The table cell border color command.
 *
 * The command is registered by {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * `'tableCellBorderColor'` editor command.
 *
 * To change cell border color of the selected cell, execute the command:
 *
 *		editor.execute( 'tableCellBorderColor', {
 *			value: '5px'
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class TableCellBorderColorCommand extends Command {
	constructor( editor ) {
		super( editor );

		this.attributeName = 'borderColor';
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

		return getSingleValue( tableCell.getAttribute( this.attributeName ) );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} [options]
	 * @param {Boolean} [options.value] If set the command will set border color.
	 * If border color is not set the command will remove the attribute.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		const { value, batch } = options;

		const tableCells = Array.from( selection.getSelectedBlocks() )
			.map( element => findAncestor( 'tableCell', model.createPositionAt( element, 0 ) ) );

		model.enqueueChange( batch || 'default', writer => {
			if ( value ) {
				tableCells.forEach( tableCell => writer.setAttribute( this.attributeName, value, tableCell ) );
			} else {
				tableCells.forEach( tableCell => writer.removeAttribute( this.attributeName, tableCell ) );
			}
		} );
	}
}

