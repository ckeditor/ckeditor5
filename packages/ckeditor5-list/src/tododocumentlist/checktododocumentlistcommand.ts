/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/tododocumentlist/checktododocumentlistcommand
 */

import { Command } from 'ckeditor5/src/core';
import type {
	Element,
	DocumentSelection,
	Selection
} from 'ckeditor5/src/engine';
import { getAllListItemBlocks } from '../documentlist/utils/model';

const attributeKey = 'todoListChecked';

/**
 * The check to-do command.
 *
 * TODO
 *
 * The command is registered by the {@link module:list/todolist/todolistediting~TodoListEditing} as
 * the `checkTodoList` editor command and it is also available via aliased `todoListCheck` name.
 */
export default class CheckTodoDocumentListCommand extends Command {
	/**
	 * A list of to-do list items selected by the {@link module:engine/model/selection~Selection}.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: boolean;

	/**
	 * Updates the command's {@link #value} and {@link #isEnabled} properties based on the current selection.
	 */
	public override refresh(): void {
		const selectedElements = this._getSelectedItems( this.editor.model.document.selection );

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
	public override execute( options: {
		forceValue?: boolean;
		selection?: Selection | DocumentSelection;
	} = {} ): void {
		this.editor.model.change( writer => {
			const selectedElements = this._getSelectedItems( options.selection || this.editor.model.document.selection );
			const value = ( options.forceValue === undefined ) ? !this._getValue( selectedElements ) : options.forceValue;

			for ( const element of selectedElements ) {
				if ( value ) {
					writer.setAttribute( attributeKey, true, element );
				} else {
					writer.removeAttribute( attributeKey, element );
				}
			}
		} );
	}

	/**
	 * TODO
	 */
	private _getValue( selectedElements: Array<Element> ): boolean {
		return selectedElements.every( element => !!element.getAttribute( attributeKey ) );
	}

	/**
	 * Gets all to-do list items selected by the {@link module:engine/model/selection~Selection}.
	 */
	private _getSelectedItems( selection: Selection | DocumentSelection ) {
		const model = this.editor.model;
		const schema = model.schema;

		const selectionRange = selection.getFirstRange()!;
		const startElement = selectionRange.start.parent as Element;
		const elements: Array<Element> = [];

		if ( schema.checkAttribute( startElement, attributeKey ) ) {
			elements.push( ...getAllListItemBlocks( startElement ) );
		}

		for ( const item of selectionRange.getItems() as Iterable<Element> ) {
			if ( schema.checkAttribute( item, attributeKey ) && !elements.includes( item ) ) {
				elements.push( ...getAllListItemBlocks( item ) );
			}
		}

		return elements;
	}
}
