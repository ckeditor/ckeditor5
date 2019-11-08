/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editorui/BodyCollection
 */

/* globals document */

import Template from '../template';
import ViewCollection from '../viewcollection';

export default class BodyCollection extends ViewCollection {
	render() {
		this._bodyCollectionContainer = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-reset_all',
					'ck-body',
					'ck-rounded-corners'
				],
				dir: this.locale.uiLanguageDirection,
			},
			children: this
		} ).render();

		document.body.appendChild( this._bodyCollectionContainer );
	}

	destroy() {
		super.destroy();

		if ( this._bodyCollectionContainer ) {
			this._bodyCollectionContainer.remove();
		}
	}
}
