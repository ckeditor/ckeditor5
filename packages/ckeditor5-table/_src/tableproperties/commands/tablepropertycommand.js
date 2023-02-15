/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableproperties/commands/tablepropertycommand
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The table cell attribute command.
 *
 * This command is a base command for other table property commands.
 *
 * @extends module:core/command~Command
 */
export default class TablePropertyCommand extends Command {
	/**
	 * Creates a new `TablePropertyCommand` instance.
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
		const selection = editor.model.document.selection;

		const table = selection.getFirstPosition().findAncestor( 'table' );

		this.isEnabled = !!table;
		this.value = this._getValue( table );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} [options]
	 * @param {*} [options.value] If set, the command will set the attribute on the selected table.
	 * If not set, the command will remove the attribute from the selected table.
	 * @param {module:engine/model/batch~Batch} [options.batch] Pass the model batch instance to the command to aggregate changes,
	 * for example, to allow a single undo step for multiple executions.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		const { value, batch } = options;

		const table = selection.getFirstPosition().findAncestor( 'table' );
		const valueToSet = this._getValueToSet( value );

		model.enqueueChange( batch, writer => {
			if ( valueToSet ) {
				writer.setAttribute( this.attributeName, valueToSet, table );
			} else {
				writer.removeAttribute( this.attributeName, table );
			}
		} );
	}

	/**
	 * Returns the attribute value for a table.
	 *
	 * @param {module:engine/model/element~Element} table
	 * @returns {String|undefined}
	 * @private
	 */
	_getValue( table ) {
		if ( !table ) {
			return;
		}

		const value = table.getAttribute( this.attributeName );

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
}
