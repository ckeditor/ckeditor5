/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import View from '../view.js';
import Template from '../template.js';

/**
 * The EditorUIView class. Base class for the editor main views.
 *
 * See {@link ui.editorUI.EditorUI}.
 *
 * @memberOf ui.editorUI
 * @extends ui.View
 */
export default class EditorUIView extends View {
	/**
	 * Creates an instance of the EditorUIView class.
	 *
	 * @param {utils.Locale} [locale] The {@link ckeditor5.Editor#locale editor's locale} instance.
	 */
	constructor( locale ) {
		super( locale );

		this._createBodyRegion();

		/**
		 * The element holding elements of the 'body' region.
		 *
		 * @private
		 * @member {HTMLElement} ui.editorUI.EditorUIView#_bodyRegionContainer
		 */
	}

	destroy() {
		this._bodyRegionContainer.remove();
		this._bodyRegionContainer = null;
	}

	/**
	 * Creates and appends to `<body>` the 'body' region container.
	 *
	 * @private
	 */
	_createBodyRegion() {
		const bodyElement = document.createElement( 'div' );
		document.body.appendChild( bodyElement );

		new Template( {
			attributes: {
				class: 'ck-body ck-reset-all'
			}
		} ).apply( bodyElement );

		this._bodyRegionContainer = bodyElement;

		this.register( 'body', () => bodyElement );
	}
}
