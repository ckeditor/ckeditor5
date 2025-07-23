import { Command } from 'ckeditor5/src/core';

import { getNewTableProperty } from '../../utils/table-properties';

import type { Batch } from 'ckeditor5/src/engine';

/**
 * The table border left style command.
 *
 * The command is registered by {@link module:table/tableproperties/tablepropertiesediting~TablePropertiesEditing} as
 * the `'tableBorderLeftStyle'` editor command.
 *
 * To change the left border style of a table, execute the command:
 *
 *		editor.execute( 'tableBorderLeftStyle', {
 *			value: 'dashed'
 *		} );
 */
export class TableBorderLeftStyleCommand extends Command {
	/**
	 * The default border style.
	 */
	declare public readonly defaultValue: string;

	/**
	 * @inheritDoc
	 */
	constructor( editor, defaultValue ) {
		super( editor );

		this.defaultValue = defaultValue;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const model = editor.model;
		const document = model.document;

		const table = document.selection.getFirstPosition().findAncestor( 'table' );

		this.isEnabled = !!table;
		this.value = this.isEnabled ? table.getAttribute( 'borderLeftStyle' ) || this.defaultValue : this.defaultValue;
	}

	/**
	 * @inheritDoc
	 */
	public override execute( options: { value?: unknown; batch?: Batch } = {} ): void {
		this.editor.model.change( writer => {
			const value = getNewTableProperty( options.value, this.value, this.defaultValue );
			const selectedCells = this.editor.model.document.selection.getSelectedCells();

			for ( const cell of selectedCells ) {
				writer.setAttribute( 'borderLeftStyle', value, cell );
			}
		} );
	}
}
