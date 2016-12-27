/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/iconmanager/iconmanagerview
 */

/* globals document */

import View from '../view';
import Template from '../template';

/**
 * The icon manager view class.
 *
 * @extends module:ui/view~View
 */
export default class IconManagerView extends View {
	/**
	 * Creates an instance of the icon manager view.
	 *
	 * @param {String} sprite The SVG (HTML) string of the icons to be injected into DOM.
	 * @param {Array.<String>} icons List of icon names available in the manager.
	 */
	constructor( sprite, icons ) {
		super();

		this.template = new Template( {
			tag: 'svg',
			ns: 'http://www.w3.org/2000/svg',
			attributes: {
				class: 'ck-icon-manager__sprite'
			}
		} );

		/**
		 * The actual SVG (HTML) of the icons to be injected in DOM.
		 *
		 * @member {String}
		 */
		this.sprite = sprite;

		/**
		 * List of icon names available in the manager.
		 *
		 * @readonly
		 * @member {Array.<String>}
		 */
		this.icons = icons;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Note: In MS Edge it's not enough to set:
		//
		//		this.element.innerHTML = this.sprite;
		//
		// because for some reason the browser won't parse the symbols string
		// properly as svg content. Instead, an explicit parsing is needed (#55).
		const tmp = document.createElement( 'div' );

		tmp.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${ this.sprite }</svg>`;

		const symbols = tmp.firstChild.childNodes;

		// Pick symbols from the tmp and put them into icon manager.
		// Note: MS Edge does not support forEach or Symbol.iterator for NodeList.
		for ( let i = 0; i < symbols.length; ++i ) {
			this.element.appendChild( document.importNode( symbols[ i ], true ) );
		}

		return super.init();
	}
}
