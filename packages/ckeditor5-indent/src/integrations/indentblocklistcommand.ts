/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/integrations/blockindentlistcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { ModelDocumentSelection, ModelElement } from 'ckeditor5/src/engine.js';
import { _isListItemBlock } from '@ckeditor/ckeditor5-list';

import type { IndentBehavior } from '../indentcommandbehavior/indentbehavior.js';

/**
 * The indent block list command.
 *
 * The command is registered by the {@link module:indent/integrations/listintegration~ListIntegration} as
 * `'indentBlockList'` for indenting lists and `'outdentBlockList'` for outdenting lists.
 *
 * To increase/decrease block indentation of the list the selection must be at the start of the first top–level list item
 * in the list.
 *
 * To increase block indentation of the list, execute the command:
 *
 * ```ts
 * editor.execute( 'indentBlockList' );
 * ```
 *
 * To decrease block indentation of the list, execute the command:
 *
 * ```ts
 * editor.execute( 'outdentBlockList' );
 * ```
 */
export class IndentBlockListCommand extends Command {
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
		const listItem = this._getFirstListItemIfSelectionIsAtListStart( this.editor.model.document.selection );

		if ( !listItem ) {
			this.isEnabled = false;
			return;
		}

		const currentIndent = listItem.getAttribute( 'blockIndentList' ) as string;
		const indentValue = parseFloat( currentIndent );

		// Special case: if the current indent is negative, only allow forward indentation to make it possible to reset indentation to 0.
		if ( indentValue < 0 ) {
			this.isEnabled = this._indentBehavior.isForward;
			return;
		}

		this.isEnabled = this._indentBehavior.isForward ?
			!!this._indentBehavior.getNextIndent( currentIndent ) :
			!!currentIndent;
	}

	/**
	 * @inheritDoc
	 */
	public override execute( options: { source?: string } = {} ): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			const listItem = this._getFirstListItemIfSelectionIsAtListStart( selection )!;

			const listItems = [];

			// If the command was not triggered by keyboard (i.e. from the toolbar), include all list from the selection.
			if ( options.source !== 'keyboard' ) {
				const blocks = Array.from( selection.getSelectedBlocks() );

				for ( const block of blocks ) {
					if ( _isListItemBlock( block ) && block.getAttribute( 'listIndent' ) === 0 ) {
						listItems.push( block );
					}
				}
			} else {
				listItems.push( listItem );
			}

			for ( const item of listItems ) {
				const currentIndent = item.getAttribute( 'blockIndentList' ) as string;
				const indentValue = parseFloat( currentIndent );
				const nextIndent = indentValue < 0 ? 0 : this._indentBehavior.getNextIndent( currentIndent );

				if ( nextIndent ) {
					writer.setAttribute( 'blockIndentList', nextIndent, item );
				} else {
					writer.removeAttribute( 'blockIndentList', item );
				}
			}
		} );
	}

	/**
	 * Returns the list item at the beginning of the current selection if it is the first top–level list item in the list.
	 * Otherwise, returns `null`.
	 */
	private _getFirstListItemIfSelectionIsAtListStart( selection: ModelDocumentSelection ): ModelElement | null {
		const pos = selection.getFirstPosition()!;
		const listUtils = this.editor.plugins.get( 'ListUtils' );
		const parent = pos.parent as ModelElement;

		if (
			!pos.isAtStart ||
			!_isListItemBlock( parent ) ||
			!listUtils.isFirstListItemInList( parent ) ||
			parent.getAttribute( 'listIndent' ) !== 0
		) {
			return null;
		}

		return parent;
	}
}
