/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/indentlistblockcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { ModelDocumentSelection, ModelElement } from 'ckeditor5/src/engine.js';
import type { ListUtils } from '../list/listutils.js';

import type { IndentBehavior } from '@ckeditor/ckeditor5-indent';
import { isFirstListItemInList, isListItemBlock } from '../list/utils/model.js';

/**
 * The indent list block command.
 *
 * The command is registered by the {@link module:list/listformatting/listblockindent~ListBlockIndent} as `'indentListBlock'`
 * for indenting lists and `'outdentListBlock'` for outdenting lists.
 *
 * To increase list indentation at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'indentListBlock' );
 * ```
 *
 * To decrease list indentation at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'outdentListBlock' );
 * ```
 */
export class IndentListBlockCommand extends Command {
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

		const currentIndent = listItem.getAttribute( 'listBlockIndent' ) as string;

		this.isEnabled = this._indentBehavior.isForward ?
			!!this._indentBehavior.getNextIndent( currentIndent ) :
			!!currentIndent;
	}

	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		const editor = this.editor;
		const model = editor.model;

		// const blocksToChange = this._getListsToChange();

		model.change( writer => {
			// for ( const block of blocksToChange ) {
			// 	const currentIndent = block.getAttribute( 'listBlockIndent' ) as string;

			// 	const nextIndent = this._indentBehavior.getNextIndent( currentIndent );

			// 	if ( nextIndent ) {
			// 		writer.setAttribute( 'listBlockIndent', nextIndent, block );
			// 	} else {
			// 		writer.removeAttribute( 'listBlockIndent', block );
			// 	}
			// }

			const listItem = this._getFirstListItemIfSelectionIsAtListStart( model.document.selection );

			if ( !listItem ) {
				return;
			}

			const currentIndent = listItem.getAttribute( 'listBlockIndent' ) as string;
			const nextIndent = this._indentBehavior.getNextIndent( currentIndent );

			if ( nextIndent ) {
				writer.setAttribute( 'listBlockIndent', nextIndent, listItem );
			} else {
				writer.removeAttribute( 'listBlockIndent', listItem );
			}
		} );
	}

	/**
	 * Returns the list item at the beginning of the current selection if it is the first top–level list item in the list.
	 * Otherwise, returns `null`.
	 */
	private _getFirstListItemIfSelectionIsAtListStart( selection: ModelDocumentSelection ): ModelElement | null {
		const pos = selection.getFirstPosition();

		if ( !pos ) {
			return null;
		}

		const parent = pos.parent;

		if (
			!pos.isAtStart ||
			!isListItemBlock( parent ) ||
			!isFirstListItemInList( parent ) ||
			parent.getAttribute( 'listIndent' ) !== 0
		) {
			return null;
		}

		return parent;
	}

	/**
	 * Returns lists from selection that should have their indentation changed.
	 */
	private _getListsToChange(): Array<ModelElement> {
		const model = this.editor.model;
		const selection = model.document.selection;
		const blocksInSelection = Array.from( selection.getSelectedBlocks() );

		return blocksInSelection.filter( block => this._isIndentationChangeAllowed( block ) );
	}

	/**
	 * TODO
	 */
	private _isIndentationChangeAllowed( element: ModelElement ): boolean {
		const editor = this.editor;

		if ( !editor.model.schema.checkAttribute( element, 'listBlockIndent' ) ) {
			return false;
		}

		if ( !editor.plugins.has( 'ListUtils' ) ) {
			return true;
		}

		// Only forward indentation is disallowed in list items. This allows the user to outdent blocks that are already indented.
		if ( !this._indentBehavior.isForward ) {
			return true;
		}

		const listUtils: ListUtils = editor.plugins.get( 'ListUtils' );

		return !listUtils.isListItemBlock( element );
	}

	/**
	 * For a collapsed selection, returns the list item if the caret is at the beginning of the first top–level list item.
	 * Otherwise, returns `null`.
	 */
	// private _getListItemForCollapsedSelectionAtListStart(): ModelElement | null {
	// 	const selection = this.editor.model.document.selection;

	// 	if ( !selection.isCollapsed ) {
	// 		return null;
	// 	}

	// 	return this._getListItemAtSelectionStart();
	// }

	/**
	 * For a non–collapsed selection, returns the list item if the selection starts at the beginning of the first top–level list item.
	 * Otherwise, returns `null`.
	 */
	// private _getListItemForSelectionTouchingListStart(): ModelElement | null {
	// 	const selection = this.editor.model.document.selection;

	// 	if ( selection.isCollapsed ) {
	// 		return null;
	// 	}

	// 	return this._getListItemAtSelectionStart();
	// }

	/**
	 * Returns the list item at the beginning of the current selection if it is the first top–level list item in the list.
	 * Otherwise, returns `null`.
	 */
	// private _getListItemAtSelectionStart(): ModelElement | null {
	// 	const selection = this.editor.model.document.selection;
	// 	const pos = selection.getFirstPosition();

	// 	if ( !pos ) {
	// 		return null;
	// 	}

	// 	const parent = pos.parent;

	// 	if (
	// 		!pos.isAtStart ||
	// 		!isListItemBlock( parent ) ||
	// 		!isFirstListItemInList( parent ) ||
	// 		parent.getAttribute( 'listIndent' ) !== 0
	// 	) {
	// 		return null;
	// 	}

	// 	return parent;
	// }
}
