/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Creator from './creator.js';
import Document from '../engine/model/document.js';
import DataController from '../engine/datacontroller.js';
import EditingController from '../engine/editingcontroller.js';
import HtmlDataProcessor from '../engine/dataprocessor/htmldataprocessor.js';
import KeystrokeHandler from '../keystrokehandler.js';

/**
 * Standard creator for browser environment.
 *
 * @memberOf ckeditor5.creator
 * @extends ckeditor5.creator.Creator
 */
export default class StandardCreator extends Creator {
	/**
	 * Creates an instance of the standard creator. Initializes the engine ({@link engine.model.Document document},
	 * {@link engine.EditingController editing controller} and
	 * {@link engine.DataController data controller}).
	 *
	 * @param {ckeditor5.Editor} editor The editor instance.
	 * @param {engine.dataProcessor.DataProcessor} [dataProcessor=engine.dataProcessor.HtmlDataProcessor] The data
	 * processor to use. If no data processor is provided {@link engine.dataProcessor.HtmlDataProcessor HtmlDataProcessor}
	 * will be used.
	 */
	constructor( editor, dataProcessor = new HtmlDataProcessor() ) {
		super( editor );

		editor.document = new Document();
		editor.editing = new EditingController( editor.document );
		editor.data = new DataController( editor.document, dataProcessor );
		editor.keystrokes = new KeystrokeHandler( editor );

		/**
		 * The elements replaced by {@link ckeditor5.creator.StandardCreator#_replaceElement} and their replacements.
		 *
		 * @private
		 * @member {Array.<Object>} ckeditor5.creator.StandardCreator#_replacedElements
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
	 * @param [elementName] If not specified, the first element will be used.
	 */
	updateEditorElement( elementName ) {
		if ( !elementName ) {
			elementName = this.editor.firstElementName;
		}

		StandardCreator.setDataInElement( this.editor.elements.get( elementName ), this.editor.getData( elementName ) );
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
	 * Loads the data from the given {@link ckeditor5.Editor#element editor element} to the editable.
	 *
	 * @param [elementName] If not specified, the first element will be used.
	 */
	loadDataFromEditorElement( elementName ) {
		if ( !elementName ) {
			elementName = this.editor.firstElementName;
		}

		this.editor.setData( StandardCreator.getDataFromElement( this.editor.elements.get( elementName ) ), elementName );
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
	 * The effect of this method will be automatically reverted by {@link ckeditor5.creator.StandardCreator#destroy destroy}.
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
	 * Restores what the {@link ckeditor5.creator.StandardCreator#_replaceElement _replaceElement} did.
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
