/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import View from './view.js';

/**
 * Base class for the editor main views.
 *
 * @memberOf ui.iconManager
 * @extends ui.View
 */

export default class IconManagerView extends View {
	constructor( model, locale ) {
		super( model, locale );

		this.template = {
			tag: 'div',
			attributes: {
				class: 'ck-icon-manager'
			}
		};
	}

	init() {
		this._setupSprite();

		return super.init();
	}

	/**
	 * Injects icon sprite into DOM.
	 *
	 * @protected
	 */
	_setupSprite() {
		// Note: Creating SVG icons with with Template class is not possible
		// because of CSS limitations of document.createEleentNS–created elements.
		this.element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="ck-sprite">
				${ this.model.sprite }
			</svg>`;
	}
}
