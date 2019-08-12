/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolistcheckedcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

const attributeKey = 'todoListChecked';

/**
 * @extends module:core/command~Command
 */
export default class TodoListCheckCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Flag indicating whether the command is active. The command is active when at least one of
		 * {@link module:engine/model/selection~Selection selected} elements is a todo list item.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */

		/**
		 * List of todo list items selected by the {@link module:engine/model/selection~Selection}.
		 *
		 * @type {Array.<module:engine/model/element~Element>}
		 * @private
		 */
		this._selectedElements = [];

		// Refresh command before executing to be sure all values are up to date.
		// It is needed when selection has changed before command execution, in the same change block.
		this.on( 'execute', () => {
			this.refresh();
		}, { priority: 'highest' } );
	}

	/**
	 * Updates the command's {@link #value} and {@link #isEnabled} based on the current selection.
	 */
	refresh() {
		this._selectedElements = this._getSelectedItems();
		this.value = this._selectedElements.every( element => !!element.getAttribute( 'todoListChecked' ) );
		this.isEnabled = !!this._selectedElements.length;
	}

	/**
	 * Gets all todo list items selected by the {@link module:engine/model/selection~Selection}.
	 *
	 * @private
	 * @returns {Array.<module:engine/model/element~Element>}
	 */
	_getSelectedItems() {
		const model = this.editor.model;
		const schema = model.schema;

		const selectionRange = model.document.selection.getFirstRange();
		const startElement = selectionRange.start.parent;
		const elements = [];

		if ( schema.checkAttribute( startElement, attributeKey ) ) {
			elements.push( startElement );
		}

		for ( const item of selectionRange.getItems() ) {
			if ( schema.checkAttribute( item, attributeKey ) && !elements.includes( item ) ) {
				elements.push( item );
			}
		}

		return elements;
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		this.editor.model.change( writer => {
			for ( const element of this._selectedElements ) {
				if ( !this.value ) {
					writer.setAttribute( attributeKey, true, element );
				} else {
					writer.removeAttribute( attributeKey, element );
				}
			}
		} );
	}
}
