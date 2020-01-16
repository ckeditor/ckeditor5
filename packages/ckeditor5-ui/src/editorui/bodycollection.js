/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editorui/bodycollection
 */

/* globals document */

import Template from '../template';
import ViewCollection from '../viewcollection';

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

/**
 * This is a special {@link module:ui/viewcollection~ViewCollection} dedicated to elements that are detached
 * from the DOM structure of the editor, like panels, icons, etc.
 *
 * The body collection is available in the {@link module:ui/editorui/editoruiview~EditorUIView#body `editor.ui.view.body`} property.
 * Any plugin can add a {@link module:ui/view~View view} to this collection.
 * Those views will render in a container placed directly in the `<body>` element.
 * The editor will detach and destroy this collection when the editor will be {@link module:core/editor/editor~Editor#destroy destroyed}.
 *
 * If you need to control the life cycle of the body collection on your own, you can create your own instance of this class.
 *
 * A body collection will render itself automatically in the DOM body element as soon as you call {@link ~BodyCollection#attachToDom}.
 * If you create multiple body collections this class will create a special wrapper element in the DOM to limit the number of
 * elements created directly in the body and remove it when the last body collection will be
 * {@link ~BodyCollection#detachFromDom detached}.
 *
 * @extends module:ui/viewcollection~ViewCollection
 */
export default class BodyCollection extends ViewCollection {
	/**
	 * Attaches the body collection to the DOM body element. You need to execute this method to render the content of
	 * the body collection.
	 */
	attachToDom() {
		/**
		 * The element holding elements of the body region.
		 *
		 * @protected
		 * @member {HTMLElement} #_bodyCollectionContainer
		 */
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

	/**
	 * Detach the collection from the DOM structure. Use this method when you do not need to use the body collection
	 * anymore to clean-up the DOM structure.
	 */
	detachFromDom() {
		super.destroy();

		if ( this._bodyCollectionContainer ) {
			this._bodyCollectionContainer.remove();
		}

		const wrapper = document.querySelector( '.ck-body-wrapper' );

		if ( wrapper && wrapper.childElementCount == 0 ) {
			wrapper.remove();
		}
	}
}
