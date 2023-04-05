/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listproperties/liststylecommand
 */

import { Command, type Editor } from 'ckeditor5/src/core';
import { getListTypeFromListStyleType, getSelectedListItems } from '../list/utils';

/**
 * The list style command. It changes the `listStyle` attribute of the selected list items.
 *
 * If the list type (numbered or bulleted) can be inferred from the passed style type,
 * the command tries to convert selected items to a list of that type.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */
export default class ListStyleCommand extends Command {
	declare public isStyleTypeSupported: undefined;

	/**
	 * @inheritDoc
	 * @readonly
	 */
	declare public value: string | null;

	/**
	 * The default type of the list style.
	 */
	public readonly defaultType: string;

	/**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param defaultType The list type that will be used by default if the value was not specified during
	 * the command execution.
	 */
	constructor( editor: Editor, defaultType: string ) {
		super( editor );

		this.defaultType = defaultType;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options.type The type of the list style, e.g. `'disc'` or `'square'`. If `null` is specified, the default
	 * style will be applied.
	 */
	public override execute( options: { type?: string | null } = {} ): void {
		this._tryToConvertItemsToList( options );

		const model = this.editor.model;
		const listItems = getSelectedListItems( model );

		if ( !listItems.length ) {
			return;
		}

		model.change( writer => {
			for ( const item of listItems ) {
				writer.setAttribute( 'listStyle', options.type || this.defaultType, item );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */
	private _getValue() {
		const listItem = this.editor.model.document.selection.getFirstPosition()!.parent;

		if ( listItem && listItem.is( 'element', 'listItem' ) ) {
			return listItem.getAttribute( 'listStyle' ) as string;
		}

		return null;
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */
	private _checkEnabled() {
		const editor = this.editor;

		const numberedList = editor.commands.get( 'numberedList' )!;
		const bulletedList = editor.commands.get( 'bulletedList' )!;

		return numberedList.isEnabled || bulletedList.isEnabled;
	}

	/**
	 * Checks if the provided list style is valid. Also changes the selection to a list if it's not set yet.
	 *
	 * @param The type of the list style. If `null` is specified, the function does nothing.
	*/
	private _tryToConvertItemsToList( options: { type?: string | null } ) {
		if ( !options.type ) {
			return;
		}

		const listType = getListTypeFromListStyleType( options.type );

		if ( !listType ) {
			return;
		}

		const editor = this.editor;
		const commandName = `${ listType }List` as const;
		const command = editor.commands.get( commandName )!;

		if ( !command.value ) {
			editor.execute( commandName );
		}
	}
}
