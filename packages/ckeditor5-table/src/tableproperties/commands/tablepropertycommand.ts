/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tableproperties/commands/tablepropertycommand
 */

import type { Batch, Element } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { getSelectionAffectedTable } from '../../utils/common.js';

export interface TablePropertyCommandExecuteOptions {
	batch?: Batch;
	columnWidths?: string;
	table?: Element;
	tableWidth?: string;
	value?: string;
}

/**
 * The table cell attribute command.
 *
 * This command is a base command for other table property commands.
 */
export default class TablePropertyCommand extends Command {
	/**
	 * The attribute that will be set by the command.
	 */
	public readonly attributeName: string;

	/**
	 * The default value for the attribute.
	 *
	 * @readonly
	 */
	protected _defaultValue: string | undefined;

	/**
	 * The default value for the attribute for the content table.
	 */
	private readonly _defaultContentTableValue: string | undefined;

	/**
	 * The default value for the attribute for the layout table.
	 */
	private readonly _defaultLayoutTableValue: string | undefined;

	/**
	 * Creates a new `TablePropertyCommand` instance.
	 *
	 * @param editor An editor in which this command will be used.
	 * @param attributeName Table cell attribute name.
	 * @param defaultValue The default value of the attribute.
	 */
	constructor( editor: Editor, attributeName: string, defaultValue?: string ) {
		super( editor );

		this.attributeName = attributeName;
		this._defaultContentTableValue = defaultValue;
		this._defaultLayoutTableValue = attributeName === 'tableBorderStyle' ? 'none' : undefined;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		const table = getSelectionAffectedTable( selection );

		this._defaultValue = !table || table.getAttribute( 'tableType' ) !== 'layout' ?
			this._defaultContentTableValue :
			this._defaultLayoutTableValue;

		this.isEnabled = !!table;
		this.value = this._getValue( table );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options.value If set, the command will set the attribute on the selected table.
	 * If not set, the command will remove the attribute from the selected table.
	 * @param options.batch Pass the model batch instance to the command to aggregate changes,
	 * for example, to allow a single undo step for multiple executions.
	 */
	public override execute( options: TablePropertyCommandExecuteOptions = {} ): void {
		const model = this.editor.model;
		const selection = model.document.selection;

		const { value, batch } = options;

		const table = getSelectionAffectedTable( selection );
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
	 */
	protected _getValue( table: Element ): unknown {
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
	 */
	protected _getValueToSet( value: string | number | undefined ): unknown {
		if ( value === this._defaultValue ) {
			return;
		}

		return value;
	}
}
