/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellproperties/commands/tablecellpropertycommand
 */

import { Command } from 'ckeditor5/src/core';
import { getSelectionAffectedTableCells } from '../../utils/selection';

/**
 * The table cell attribute command.
 *
 * The command is a base command for other table cell property commands.
 *
 * @extends module:core/command~Command
 */
export default class TableCellPropertyCommand extends Command {
	/**
	 * Creates a new `TableCellPropertyCommand` instance.
	 *
	 * @param {module:core/editor/editor~Editor} editor An editor in which this command will be used.
	 * @param {String} attributeName Table cell attribute name.
	 * @param {String} defaultValue The default value of the attribute.
	 */
	constructor( editor, attributeName, defaultValue ) {
		super( editor );

		/**
		 * The attribute that will be set by the command.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.attributeName = attributeName;

		/**
		 * The default value for the attribute.
		 *
		 * @readonly
		 * @protected
		 * @member {String}
		 */
		this._defaultValue = defaultValue;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const selectedTableCells = getSelectionAffectedTableCells( editor.model.document.selection );

		this.isEnabled = !!selectedTableCells.length;
		this.value = this._getSingleValue( selectedTableCells );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} [options]
	 * @param {*} [options.value] If set, the command will set the attribute on selected table cells.
	 * If it is not set, the command will remove the attribute from the selected table cells.
	 * @param {module:engine/model/batch~Batch} [options.batch] Pass the model batch instance to the command to aggregate changes,
	 * for example to allow a single undo step for multiple executions.
	 */
	execute( options = {} ) {
		const { value, batch } = options;
		const model = this.editor.model;
		const tableCells = getSelectionAffectedTableCells( model.document.selection );
		const valueToSet = this._getValueToSet( value );

		model.enqueueChange( batch, writer => {
			if ( valueToSet ) {
				tableCells.forEach( tableCell => writer.setAttribute( this.attributeName, valueToSet, tableCell ) );
			} else {
				tableCells.forEach( tableCell => writer.removeAttribute( this.attributeName, tableCell ) );
			}
		} );
	}

	/**
	 * Returns the attribute value for a table cell.
	 *
	 * @param {module:engine/model/element~Element} tableCell
	 * @returns {String|undefined}
	 * @private
	 */
	_getAttribute( tableCell ) {
		if ( !tableCell ) {
			return;
		}

		const value = tableCell.getAttribute( this.attributeName );

		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}

	/**
	 * Returns the proper model value. It can be used to add a default unit to numeric values.
	 *
	 * @private
	 * @param {*} value
	 * @returns {*}
	 */
	_getValueToSet( value ) {
		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}

	/**
	 * Returns a single value for all selected table cells. If the value is the same for all cells,
	 * it will be returned (`undefined` otherwise).
	 *
	 * @param {Array.<module:engine/model/element~Element>} tableCell
	 * @returns {*}
	 * @private
	 */
	_getSingleValue( tableCell ) {
		const firstCellValue = this._getAttribute( tableCell[ 0 ] );

		const everyCellHasAttribute = tableCell.every( tableCell => this._getAttribute( tableCell ) === firstCellValue );

		return everyCellHasAttribute ? firstCellValue : undefined;
	}
}
