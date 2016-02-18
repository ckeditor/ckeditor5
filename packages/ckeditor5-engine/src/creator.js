/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Plugin from './plugin.js';

/**
 * Basic creator class.
 *
 * @class core.Creator
 * @extends core.Plugin
 */

export default class Creator extends Plugin {
	/**
	 * The element used to {@link core.Creator#_replaceElement _replaceElement} the editor element.
	 *
	 * @member core.Creator#_elementReplacement
	 * @private
	 * @type {HTMLElement}
	 */

	/**
	 * The creator's trigger. This method is called by the editor to finalize
	 * the editor creation.
	 *
	 * @method core.Creator#create
	 * @returns {Promise}
	 */
	create() {
		if ( this.editor.ui ) {
			return this.editor.ui.init();
		} else {
			return Promise.resolve();
		}
	}

	/**
	 * Method called by the editor on its destruction. It should destroy what the creator created.
	 *
	 * @method core.Creator#destroy
	 * @returns {Promise}
	 */
	destroy() {
		super.destroy();

		if ( this._elementReplacement ) {
			this._restoreElement();
		}

		const ui = this.editor.ui;
		let promise = Promise.resolve();

		if ( ui ) {
			promise = promise
				.then( ui.destroy.bind( ui ) )
				.then( () => {
					this.editor.ui = null;
				} );
		}

		return promise;
	}

	/**
	 * Updates the {@link core.Editor#element editor element}'s content with the data.
	 *
	 * @method core.Creator#updateEditorElement
	 */
	updateEditorElement() {
		Creator.setDataInElement( this.editor.element, this.editor.getData() );
	}

	/**
	 * Loads the data from the {@link core.Editor#element editor element} to the editable.
	 *
	 * @method core.Creator#loadDataFromEditorElement
	 */
	loadDataFromEditorElement() {
		this.editor.setData( Creator.getDataFromElement( this.editor.element ) );
	}

	/**
	 * Gets data from a given source element.
	 *
	 * @method core.Creator.getDataFromElement
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
	 * @method core.Creator.setDataInElement
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
	 * Hides the {@link core.Editor#element editor element} and inserts the the given element
	 * (usually, editor's UI main element) next to it.
	 *
	 * The effect of this method will be automatically reverted by {@link core.Creator#destroy destroy}.
	 *
	 * @method core.Creator#_replaceElement
	 * @protected
	 * @param {HTMLElement} [newElement] The replacement element. If not passed, then the main editor's UI view element
	 * will be used.
	 */
	_replaceElement( newElement ) {
		if ( !newElement ) {
			newElement = this.editor.ui.view.element;
		}

		this._elementReplacement = newElement;

		const editorEl = this.editor.element;

		editorEl.style.display = 'none';
		editorEl.parentNode.insertBefore( newElement, editorEl.nextSibling );
	}

	/**
	 * Restores what the {@link core.Creator#_replaceElement _replaceElement} did.
	 *
	 * @method core.Creator#_restoreElement
	 * @protected
	 */
	_restoreElement() {
		this.editor.element.style.display = '';
		this._elementReplacement.remove();
		this._elementReplacement = null;
	}
}
