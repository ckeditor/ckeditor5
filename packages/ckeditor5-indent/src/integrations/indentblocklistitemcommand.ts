/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/integrations/blockindentlistitemcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import { type ModelElement } from 'ckeditor5/src/engine.js';
import { type ListUtils } from '@ckeditor/ckeditor5-list';

import type { IndentBehavior } from '../indentcommandbehavior/indentbehavior.js';

/**
 * The indent block list item command.
 *
 * The command is registered by the {@link module:indent/integrations/listintegration~ListIntegration} as
 * `'indentBlockListItem'` for indenting list items and `'outdentBlockListItem'` for outdenting list items.
 *
 * It's only possible to reset the block indentation of a list item to `0`.
 * This means that if a list item has negative block indentation, the command will only allow forward indentation
 * to make it possible to reset it to `0` and if a list item has positive block indentation, the command
 * will only allow backward indentation to make it possible to reset it to `0`.
 *
 * To increase block indentation of the list item, execute the command:
 *
 * ```ts
 * editor.execute( 'indentBlockListItem' );
 * ```
 *
 * To decrease block indentation of the list item, execute the command:
 *
 * ```ts
 * editor.execute( 'outdentBlockListItem' );
 * ```
 */
export class IndentBlockListItemCommand extends Command {
	/**
	 * The command's indentation behavior.
	 */
	private readonly _indentBehavior: IndentBehavior;

	/**
	 * Creates an instance of the command.
	 */
	constructor( editor: Editor, indentBehavior: IndentBehavior ) {
		super( editor );

		this._indentBehavior = indentBehavior;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const listItems = this._getAffectedListItems();

		if ( listItems.length === 0 ) {
			this.isEnabled = false;
			return;
		}

		this.isEnabled = true;
	}

	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		const editor = this.editor;
		const model = editor.model;

		const blocksToChange = this._getAffectedListItems();

		model.change( writer => {
			for ( const block of blocksToChange ) {
				writer.removeAttribute( 'blockIndentListItem', block );
			}
		} );
	}

	/**
	 * TODO
	 */
	private _getAffectedListItems(): Array<ModelElement> {
		const model = this.editor.model;
		const selection = model.document.selection;
		const blocksInSelection = Array.from( selection.getSelectedBlocks() );

		return blocksInSelection.filter( block => this._isIndentationChangeAllowed( block ) );
	}

	/**
	 * TODO
	 */
	private _isIndentationChangeAllowed( element: ModelElement ): boolean {
		const listUtils: ListUtils = this.editor.plugins.get( 'ListUtils' );

		if ( !listUtils.isListItemBlock( element ) ) {
			return false;
		}

		const currentIndent = parseFloat( element.getAttribute( 'blockIndentListItem' ) as string );

		return this._indentBehavior.isForward && currentIndent < 0 ||
			!this._indentBehavior.isForward && currentIndent > 0;
	}
}
