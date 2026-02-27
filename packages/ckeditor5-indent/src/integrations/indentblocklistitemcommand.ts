/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/integrations/indentblocklistitemcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import { type ModelElement } from 'ckeditor5/src/engine.js';
import { type ListUtils } from '@ckeditor/ckeditor5-list';

import type { IndentBehavior } from '../indentcommandbehavior/indentbehavior.js';

/**
 * The indent block list item command.
 *
 * The command is registered by the {@link module:indent/integrations/indentblocklistintegration~IndentBlockListIntegration} as
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
		this.isEnabled = this._getAffectedListItems().length > 0;
	}

	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		const editor = this.editor;
		const model = editor.model;

		model.change( writer => {
			for ( const block of this._getAffectedListItems() ) {
				writer.removeAttribute( 'blockIndentListItem', block );
			}
		} );
	}

	/**
	 * Returns an array of list items which block indentation should be changed.
	 */
	private _getAffectedListItems(): Array<ModelElement> {
		const model = this.editor.model;
		const selection = model.document.selection;
		const listUtils: ListUtils = this.editor.plugins.get( 'ListUtils' );
		const blocksInSelection = Array.from( selection.getSelectedBlocks() );
		const expandedBlocks = listUtils.expandListBlocksToCompleteItems( blocksInSelection );

		return expandedBlocks.filter( block => this._isIndentationChangeAllowed( block ) );
	}

	/**
	 * Returns `true` if changing the block indentation is allowed for the given list item.
	 */
	private _isIndentationChangeAllowed( element: ModelElement ): boolean {
		if ( !element.hasAttribute( 'blockIndentListItem' ) ) {
			return false;
		}

		return this._indentBehavior.checkEnabled( element.getAttribute( 'blockIndentListItem' ) as string );
	}
}
