/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editorui/bodycollection
 */

/* globals document */

import Template from '../template.js';
import ViewCollection from '../viewcollection.js';
import type View from '../view.js';

import { createElement, type Locale } from '@ckeditor/ckeditor5-utils';

/**
 * This is a special {@link module:ui/viewcollection~ViewCollection} dedicated to elements that are detached
 * from the DOM structure of the editor, like panels, icons, etc.
 *
 * The body collection is available in the {@link module:ui/editorui/editoruiview~EditorUIView#body `editor.ui.view.body`} property.
 * Any plugin can add a {@link module:ui/view~View view} to this collection.
 * These views will render in a container placed directly in the `<body>` element.
 * The editor will detach and destroy this collection when the editor will be {@link module:core/editor/editor~Editor#destroy destroyed}.
 *
 * If you need to control the life cycle of the body collection on your own, you can create your own instance of this class.
 *
 * A body collection will render itself automatically in the DOM body element as soon as you call {@link ~BodyCollection#attachToDom}.
 * If you create multiple body collections, this class will create a special wrapper element in the DOM to limit the number of
 * elements created directly in the body and remove it when the last body collection will be
 * {@link ~BodyCollection#detachFromDom detached}.
 */
export default class BodyCollection extends ViewCollection {
	/**
	 * The {@link module:core/editor/editor~Editor#locale editor's locale} instance.
	 * See the view {@link module:ui/view~View#locale locale} property.
	 */
	public readonly locale: Locale;

	/**
	 * The element holding elements of the body region.
	 */
	private _bodyCollectionContainer?: HTMLElement;

	/**
	 * Creates a new instance of the {@link module:ui/editorui/bodycollection~BodyCollection}.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor editor's locale} instance.
	 * @param initialItems The initial items of the collection.
	 */
	constructor( locale: Locale, initialItems: Iterable<View> = [] ) {
		super( initialItems );

		this.locale = locale;
	}

	/**
	 * The element holding elements of the body region.
	 */
	public get bodyCollectionContainer(): HTMLElement | undefined {
		return this._bodyCollectionContainer;
	}

	/**
	 * Attaches the body collection to the DOM body element. You need to execute this method to render the content of
	 * the body collection.
	 */
	public attachToDom(): void {
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
				role: 'application'
			},
			children: this
		} ).render() as HTMLElement;

		let wrapper = document.querySelector( '.ck-body-wrapper' );

		if ( !wrapper ) {
			wrapper = createElement( document, 'div', { class: 'ck-body-wrapper' } );
			document.body.appendChild( wrapper );
		}

		wrapper.appendChild( this._bodyCollectionContainer );
	}

	/**
	 * Detaches the collection from the DOM structure. Use this method when you do not need to use the body collection
	 * anymore to clean-up the DOM structure.
	 */
	public detachFromDom(): void {
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
