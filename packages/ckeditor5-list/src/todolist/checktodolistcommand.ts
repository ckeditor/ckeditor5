/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/todolist/checktodolistcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { Element } from 'ckeditor5/src/engine.js';
import { getAllListItemBlocks } from '../list/utils/model.js';

/**
 * The check to-do command.
 *
 * The command is registered by the {@link module:list/todolist/todolistediting~TodoListEditing} as
 * the `checkTodoList` editor command.
 */
export default class CheckTodoListCommand extends Command {
	/**
	 * A list of to-do list items selected by the {@link module:engine/model/selection~Selection}.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: boolean;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		// Refresh command before executing to be sure all values are up to date.
		// It is needed when selection has changed before command execution, in the same change block.
		this.on( 'execute', () => {
			this.refresh();
		}, { priority: 'highest' } );
	}

	/**
	 * Updates the command's {@link #value} and {@link #isEnabled} properties based on the current selection.
	 */
	public override refresh(): void {
		const selectedElements = this._getSelectedItems();

		this.value = this._getValue( selectedElements );
		this.isEnabled = !!selectedElements.length;
	}

	/**
	 * Executes the command.
	 *
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will apply
	 * the attribute. Otherwise, the command will remove the attribute. If not set, the command will look for its current
	 * value to decide what it should do.
	 */
	public override execute( options: { forceValue?: boolean } = {} ): void {
		this.editor.model.change( writer => {
			const selectedElements = this._getSelectedItems();
			const value = ( options.forceValue === undefined ) ? !this._getValue( selectedElements ) : options.forceValue;

			for ( const element of selectedElements ) {
				if ( value ) {
					writer.setAttribute( 'todoListChecked', true, element );
				} else {
					writer.removeAttribute( 'todoListChecked', element );
				}
			}
		} );
	}

	/**
	 * Returns a value for the command.
	 */
	private _getValue( selectedElements: Array<Element> ): boolean {
		return selectedElements.every( element => element.getAttribute( 'todoListChecked' ) );
	}

	/**
	 * Gets all to-do list items selected by the {@link module:engine/model/selection~Selection}.
	 */
	private _getSelectedItems() {
		const model = this.editor.model;
		const schema = model.schema;

		const selectionRange = model.document.selection.getFirstRange()!;
		const startElement = selectionRange.start.parent as Element;
		const elements: Array<Element> = [];

		if ( schema.checkAttribute( startElement, 'todoListChecked' ) ) {
			elements.push( ...getAllListItemBlocks( startElement ) );
		}

		for ( const item of selectionRange.getItems( { shallow: true } ) as Iterable<Element> ) {
			if ( schema.checkAttribute( item, 'todoListChecked' ) && !elements.includes( item ) ) {
				elements.push( ...getAllListItemBlocks( item ) );
			}
		}

		return elements;
	}
}
