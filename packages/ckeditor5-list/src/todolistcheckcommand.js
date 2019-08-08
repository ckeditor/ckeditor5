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
	 * @param {module:core/editor/editor~Editor} editor
	 */
	constructor( editor ) {
		super( editor );

		this._selectedElements = [];

		/**
		 * Flag indicating whether the command is active. The command is active when the
		 * {@link module:engine/model/selection~Selection#hasAttribute selection has the attribute} which means that:
		 *
		 * * If the selection is not empty &ndash; That the attribute is set on the first node in the selection that allows this attribute.
		 * * If the selection is empty &ndash; That the selection has the attribute itself (which means that newly typed
		 * text will have this attribute, too).
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean} #value
		 */
	}

	/**
	 * Updates the command's {@link #value} and {@link #isEnabled} based on the current selection.
	 */
	refresh() {
		this._selectedElements = this._getSelectedItems();
		this.value = this._selectedElements.every( element => !!element.getAttribute( 'todoListChecked' ) );
		this.isEnabled = !!this._selectedElements.length;
	}

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
