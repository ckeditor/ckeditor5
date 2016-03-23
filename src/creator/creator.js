/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import BaseCreator from './basecreator.js';

import Document from '../engine/treemodel/document.js';
import DataController from '../engine/treecontroller/datacontroller.js';
import EditingController from '../engine/treecontroller/editingcontroller.js';

/**
 * Basic creator class for browser environment.
 *
 * @memberOf ckeditor5.creator
 * @extends ckeditor5.creator.BaseCreator
 */
export default class Creator extends BaseCreator {
	constructor( editor, dataProcessor ) {
		super( editor );

		editor.document = new Document();
		editor.editing = new EditingController( editor.document );
		editor.data = new DataController( editor.document, dataProcessor );

		/**
		 * The elements replaced by {@link ckeditor5.creator.Creator#_replaceElement} and their replacements.
		 *
		 * @private
		 * @member {Array.<Object>} ckeditor5.creator.Creator#_replacedElements
		 */
		this._replacedElements = [];
	}

	destroy() {
		const editor = this.editor;

		super.destroy();

		editor.document.destroy();
		editor.editing.destroy();
		editor.data.destroy();

		this._restoreElements();
	}

	/**
	 * Updates the {@link ckeditor5.Editor#element editor element}'s content with the data.
	 *
	 * @param [elementName]
	 */
	updateEditorElement( elementName ) {
		if ( !elementName ) {
			elementName = this.editor.firstElementName;
		}

		Creator.setDataInElement( this.editor.elements.get( elementName ), this.editor.getData( elementName ) );
	}

	/**
	 * Updates all {@link ckeditor5.Editor#element editor elements} content with the data taken from
	 * their corresponding editables.
	 */
	updateEditorElements() {
		this.editor.elements.forEach( ( editorElement, elementName ) => {
			this.updateEditorElement( elementName );
		} );
	}

	/**
	 * Loads the data from the given or first {@link ckeditor5.Editor#element editor element} to the editable.
	 *
	 * @param [elementName]
	 */
	loadDataFromEditorElement( elementName ) {
		if ( !elementName ) {
			elementName = this.editor.firstElementName;
		}

		this.editor.setData( Creator.getDataFromElement( this.editor.elements.get( elementName ) ), elementName );
	}

	/**
	 * Loads the data from all {@link ckeditor5.Editor#element editor elements} to their corresponding editables.
	 */
	loadDataFromEditorElements() {
		this.editor.elements.forEach( ( editorElement, elementName ) => {
			this.loadDataFromEditorElement( elementName );
		} );
	}

	/**
	 * Gets data from a given source element.
	 *
	 * @param {HTMLElement} el The element from which the data will be retrieved.
	 * @returns {String} The data string.
	 */
	static getDataFromElement( el ) {
		if ( el instanceof HTMLTextAreaElement ) {
			return el.value;
		}

		return el.innerHTML;
	}

	/**
	 * Sets data in a given element.
	 *
	 * @param {HTMLElement} el The element in which the data will be set.
	 * @param {String} data The data string.
	 */
	static setDataInElement( el, data ) {
		if ( el instanceof HTMLTextAreaElement ) {
			el.value = data;
		}

		el.innerHTML = data;
	}

	/**
	 * Hides one of the {@link ckeditor5.Editor#elements editor elements} and, if specified, inserts the the given element
	 * (e.g. the editor's UI main element) next to it.
	 *
	 * The effect of this method will be automatically reverted by {@link ckeditor5.creator.Creator#destroy destroy}.
	 *
	 * The second argument may not be passed and then the element will be replaced by nothing, so in other words it will
	 * be hidden.
	 *
	 * @protected
	 * @param {HTMLElement} element The element to replace.
	 * @param {HTMLElement} [newElement] The replacement element. If not passed, then the `element` will just be hidden.
	 */
	_replaceElement( element, newElement ) {
		this._replacedElements.push( { element, newElement } );

		element.style.display = 'none';

		if ( newElement ) {
			element.parentNode.insertBefore( newElement, element.nextSibling );
		}
	}

	/**
	 * Restores what the {@link ckeditor5.creator.Creator#_replaceElement _replaceElement} did.
	 *
	 * @protected
	 */
	_restoreElements() {
		this._replacedElements.forEach( ( { element, newElement } ) => {
			element.style.display = '';

			if ( newElement ) {
				newElement.remove();
			}
		} );

		this._replacedElements = [];
	}
}
