/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent/indentblockcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core';
import type { Element, Model } from 'ckeditor5/src/engine';
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

		// Command should be disabled for block items in Document List items. See https://github.com/ckeditor/ckeditor5/issues/14155.
		const isForwardAndInListItem = this._indentBehavior.isForward && block && block.hasAttribute( 'listItemId' );

		if ( !block || !model.schema.checkAttribute( block, 'blockIndent' ) || isForwardAndInListItem ) {
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

		const blocksToChange = getBlocksToChange( model, this._indentBehavior.isForward );

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
}

/**
 * Returns blocks from selection that should have blockIndent selection set.
 */
function getBlocksToChange( model: Model, isForward: boolean ): Array<Element> {
	const selection = model.document.selection;
	const schema = model.schema;
	const blocksInSelection = Array.from( selection.getSelectedBlocks() );

	return blocksInSelection.filter( block => {
		// Do not add blockIndent to block items in Document List items. See https://github.com/ckeditor/ckeditor5/issues/14155.
		if ( isForward ) {
			return schema.checkAttribute( block, 'blockIndent' ) && !block.hasAttribute( 'listItemId' );
		}

		return schema.checkAttribute( block, 'blockIndent' );
	} );
}
