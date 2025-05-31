/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/indentblockcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { Element } from 'ckeditor5/src/engine.js';
import type { ListUtils } from '@ckeditor/ckeditor5-list';
import { first } from 'ckeditor5/src/utils.js';

import type { IndentBehavior } from './indentcommandbehavior/indentbehavior.js';

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

		if ( !block || !this._isIndentationChangeAllowed( block ) ) {
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
		const blocksInSelection = Array.from( selection.getSelectedBlocks() );

		return blocksInSelection.filter( block => this._isIndentationChangeAllowed( block ) );
	}

	/**
	 * Returns false if indentation cannot be applied, i.e.:
	 * - for blocks disallowed by schema declaration
	 * - for blocks in Document Lists (disallowed forward indentation only). See https://github.com/ckeditor/ckeditor5/issues/14155.
	 * Otherwise returns true.
	 */
	private _isIndentationChangeAllowed( element: Element ): boolean {
		const editor = this.editor;

		if ( !editor.model.schema.checkAttribute( element, 'blockIndent' ) ) {
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
}
