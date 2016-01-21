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
	create() {
		return this.editor.ui.init();
	}

	destroy() {
		super.destroy();

		if ( this._elementReplacement ) {
			this.editor.element.style.display = '';
			this._elementReplacement.remove();
		}

		const ui = this.editor.ui;
		this.editor.ui = null;

		return ui.destroy();
	}

	updateEditorElement() {
		Creator.setDataInElement( this.editor.element, this.editor.getData() );
	}

	loadDataFromEditorElement() {
		this.editor.setData( Creator.getDataFromElement( this.editor.element ) );
	}

	/**
	 * @param {HTMLElement} [newElement]
	 */
	_replaceElement( newElement ) {
		if ( !newElement ) {
			newElement = this.editor.ui.chrome.view.element;
		}

		this._elementReplacement = newElement;

		const editorEl = this.editor.element;

		editorEl.style.display = 'none';
		editorEl.parentNode.insertBefore( newElement, editorEl.nextSibling );
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
}
