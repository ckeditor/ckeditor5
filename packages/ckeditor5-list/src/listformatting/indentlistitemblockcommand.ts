/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/indentlistitemblockcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { ModelElement } from 'ckeditor5/src/engine.js';
import type { ListUtils } from '../list/listutils.js';

import type { IndentBehavior } from '@ckeditor/ckeditor5-indent';

/**
 * TODO
 */
export class IndentListItemBlockCommand extends Command {
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
				writer.removeAttribute( 'listItemBlockIndent', block );
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
		const editor = this.editor;

		if ( !editor.model.schema.checkAttribute( element, 'listItemBlockIndent' ) ) {
			return false;
		}

		if ( !editor.plugins.has( 'ListUtils' ) ) {
			return false;
		}

		const listUtils: ListUtils = editor.plugins.get( 'ListUtils' );

		return listUtils.isListItemBlock( element ) && element.hasAttribute( 'listItemBlockIndent' );
	}
}
