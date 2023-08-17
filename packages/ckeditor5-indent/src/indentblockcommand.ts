/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent/indentblockcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core';
import type { Element } from 'ckeditor5/src/engine';
import type { DocumentListUtils } from '@ckeditor/ckeditor5-list';
import { first } from 'ckeditor5/src/utils';

import type { IndentBehavior } from './indentcommandbehavior/indentbehavior';

/**
 * The indent block command.
 *
 * The command is registered by the {@link module:indent/indentblock~IndentBlock} as `'indentBlock'` for indenting blocks and
 * `'outdentBlock'` for outdenting blocks.
 *
 * To increase block indentation at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'indentBlock' );
 * ```
 *
 * To decrease block indentation at the current selection, execute the command:
 *
 * ```ts
 * editor.execute( 'outdentBlock' );
 * ```
 */
export default class IndentBlockCommand extends Command {
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
		const editor = this.editor;
		const model = editor.model;

		const block = first( model.document.selection.getSelectedBlocks() );

		if ( !block || !model.schema.checkAttribute( block, 'blockIndent' ) || !this._isIndentationChangeAllowed( block ) ) {
			this.isEnabled = false;
			return;
		}

		this.isEnabled = this._indentBehavior.checkEnabled( block.getAttribute( 'blockIndent' ) as string );
	}

	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		const model = this.editor.model;

		const blocksToChange = this._getBlocksToChange();

		model.change( writer => {
			for ( const block of blocksToChange ) {
				const currentIndent = block.getAttribute( 'blockIndent' ) as string;

				const nextIndent = this._indentBehavior.getNextIndent( currentIndent );

				if ( nextIndent ) {
					writer.setAttribute( 'blockIndent', nextIndent, block );
				} else {
					writer.removeAttribute( 'blockIndent', block );
				}
			}
		} );
	}

	/**
	 * Returns blocks from selection that should have blockIndent selection set.
	 */
	private _getBlocksToChange(): Array<Element> {
		const model = this.editor.model;
		const selection = model.document.selection;
		const schema = model.schema;
		const blocksInSelection = Array.from( selection.getSelectedBlocks() );

		return blocksInSelection.filter( block => {
			return schema.checkAttribute( block, 'blockIndent' ) && this._isIndentationChangeAllowed( block );
		} );
	}

	/**
	 * Returns false for blocks in Document Lists (forward indentation only). See https://github.com/ckeditor/ckeditor5/issues/14155.
	 * Otherwise returns true.
	 */
	private _isIndentationChangeAllowed( element: Element ): boolean {
		if ( !this.editor.plugins.has( 'DocumentListUtils' ) ) {
			return true;
		}

		// Disallow indenting a block in a list item. Outdenting a block is still allowed, because if the user already has
		// a list item with an indented block in their content, it should be possible to reduce the indentation of the block.
		if ( !this._indentBehavior.isForward ) {
			return true;
		}

		const DocumentListUtils: DocumentListUtils = this.editor.plugins.get( 'DocumentListUtils' );

		return !DocumentListUtils.isListItemBlock( element );
	}
}
