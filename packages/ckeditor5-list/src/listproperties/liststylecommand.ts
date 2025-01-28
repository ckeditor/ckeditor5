/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listproperties/liststylecommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import { first } from 'ckeditor5/src/utils.js';
import {
	expandListBlocksToCompleteList,
	isListItemBlock
} from '../list/utils/model.js';
import { getListTypeFromListStyleType } from './utils/style.js';

/**
 * The list style command. It changes `listStyle` attribute of the selected list items,
 * letting the user choose styles for the list item markers.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */
export default class ListStyleCommand extends Command {
	/**
	 * @inheritDoc
	 */
	declare public value: string | null;

	/**
	 * The default type of the list style.
	 */
	public readonly defaultType: string;

	/**
	 * The list of supported style types by this command.
	 */
	private _supportedTypes: Array<string> | undefined;

	/**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param defaultType The list type that will be used by default if the value was not specified during
	 * the command execution.
	 * @param supportedTypes The list of supported style types by this command.
	 */
	constructor( editor: Editor, defaultType: string, supportedTypes?: Array<string> ) {
		super( editor );

		this.defaultType = defaultType;
		this._supportedTypes = supportedTypes;
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
		const model = this.editor.model;
		const document = model.document;

		model.change( writer => {
			this._tryToConvertItemsToList( options );

			let blocks = Array.from( document.selection.getSelectedBlocks() )
				.filter( block => block.hasAttribute( 'listType' ) );

			if ( !blocks.length ) {
				return;
			}

			blocks = expandListBlocksToCompleteList( blocks );

			for ( const block of blocks ) {
				writer.setAttribute( 'listStyle', options.type || this.defaultType, block );
			}
		} );
	}

	/**
	 * Checks if the given style type is supported by this plugin.
	 */
	public isStyleTypeSupported( value: string ): boolean {
		if ( !this._supportedTypes ) {
			return true;
		}

		return this._supportedTypes.includes( value );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */
	private _getValue() {
		const listItem = first( this.editor.model.document.selection.getSelectedBlocks() );

		if ( isListItemBlock( listItem ) ) {
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
	 * Check if the provided list style is valid. Also change the selection to a list if it's not set yet.
	 *
	 * @param options.type The type of the list style. If `null` is specified, the function does nothing.
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
