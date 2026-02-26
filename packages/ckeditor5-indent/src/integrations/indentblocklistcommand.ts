/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/integrations/indentblocklistcommand
 */

import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import type { ModelDocumentSelection, ModelElement } from '@ckeditor/ckeditor5-engine';
import { _isListItemBlock } from '@ckeditor/ckeditor5-list';

import type { IndentBehavior } from '../indentcommandbehavior/indentbehavior.js';

/**
 * The indent block list command.
 *
 * The command is registered by the {@link module:indent/integrations/indentblocklistintegration~IndentBlockListIntegration} as
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

		this.isEnabled = !!listItem && this._indentBehavior.checkEnabled( listItem.getAttribute( 'blockIndentList' ) as string );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Command options.
	 * @param options.firstListOnly When `true`, indentation is applied only to the first list at the beginning of the selection.
	 * When `false` or omitted, indentation is applied to all lists of the selection.
	 */
	public override execute( options: { firstListOnly?: boolean } = {} ): void {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			const listItem = this._getFirstListItemIfSelectionIsAtListStart( selection )!;
			const listItems = [];

			if ( !options.firstListOnly ) {
				const blocks = Array.from( selection.getSelectedBlocks() );

				for ( const block of blocks ) {
					if (
						_isListItemBlock( block ) &&
						block.getAttribute( 'listIndent' ) === 0 &&
						model.schema.checkAttribute( block, 'blockIndentList' )
					) {
						listItems.push( block );
					}
				}
			} else {
				listItems.push( listItem );
			}

			for ( const item of listItems ) {
				const currentIndent = item.getAttribute( 'blockIndentList' ) as string;
				const nextIndent = this._indentBehavior.getNextIndent( currentIndent );

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
		const position = selection.getFirstPosition()!;
		const listUtils = this.editor.plugins.get( 'ListUtils' );
		const parent = position.parent as ModelElement;
		const schema = this.editor.model.schema;

		if (
			position.isAtStart &&
			_isListItemBlock( parent ) &&
			parent.getAttribute( 'listIndent' ) == 0 &&
			schema.checkAttribute( parent, 'blockIndentList' ) &&
			listUtils.isFirstListItemInList( parent )
		) {
			return parent;
		}

		return null;
	}
}
