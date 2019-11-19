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

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

export default class BodyCollection extends ViewCollection {
	attachToDOM() {
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

		let wrapper = document.querySelector( '.ck-body-wrapper' );

		if ( !wrapper ) {
			wrapper = createElement( document, 'div', { class: 'ck-body-wrapper' } );
			document.body.appendChild( wrapper );
		}

		wrapper.appendChild( this._bodyCollectionContainer );
	}

	detachFromDOM() {
		super.destroy();

		if ( this._bodyCollectionContainer ) {
			this._bodyCollectionContainer.remove();
		}

		const wrapper = document.querySelector( '.ck-body-wrapper' );

		if ( wrapper.childElementCount == 0 ) {
			wrapper.remove();
		}
	}
}
