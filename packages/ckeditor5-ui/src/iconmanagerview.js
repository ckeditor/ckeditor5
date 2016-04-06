/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import View from './view.js';

/**
 * Icon manager view using {@link ui.iconManager.IconManagerModel}.
 *
 * @memberOf ui.iconManager
 * @extends ui.View
 */

export default class IconManagerView extends View {
	constructor( model, locale ) {
		super( model, locale );

		this.template = {
			tag: 'svg',
			ns: 'http://www.w3.org/2000/svg',
			attributes: {
				class: 'ck-icon-manager-sprite'
			}
		};
	}

	init() {
		this.element.innerHTML = this.model.sprite;

		return super.init();
	}
}
