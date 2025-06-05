/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/editorui/bodycollection
 */

import Template from '../template.js';
import ViewCollection from '../viewcollection.js';
import type View from '../view.js';

import { createElement, type Locale } from '@ckeditor/ckeditor5-utils';

/**
 * This is a special {@link module:ui/viewcollection~ViewCollection} dedicated to elements that are detached from the DOM structure of
 * the editor, like floating panels, floating toolbars, dialogs, etc.
 *
 * The body collection is available under the {@link module:ui/editorui/editoruiview~EditorUIView#body `editor.ui.view.body`} property.
 * Any plugin can add a {@link module:ui/view~View view} to this collection.
 *
 * All views added to a body collection render in a dedicated DOM container (`<div class="ck ck-body ...">...</div>`). All body collection
 * containers render in a common shared (`<div class="ck-body-wrapper">...</div>`) in the DOM to limit the pollution of
 * the `<body>` element. The resulting DOM structure is as follows:
 *
 * ```html
 * <body>
 * 	<!-- Content of the webpage... -->
 *
 * 	<!-- The shared wrapper for all body collection containers. -->
 * 	<div class="ck-body-wrapper">
 * 		<!-- The container of the first body collection instance. -->
 * 		<div class="ck ck-body ...">
 * 			<!-- View elements belonging to the first body collection -->
 * 		</div>
 *
 * 		<!-- The container of the second body collection instance. -->
 * 		<div class="ck ck-body ...">...</div>
 *
 * 		<!-- More body collection containers for the rest of instances... -->
 * 	</div>
 * </body>
 * ```
 *
 * By default, the {@link module:ui/editorui/editoruiview~EditorUIView `editor.ui.view`} manages the life cycle of the
 * {@link module:ui/editorui/editoruiview~EditorUIView#body `editor.ui.view.body`} collection, attaching and detaching it
 * when the editor gets created or {@link module:core/editor/editor~Editor#destroy destroyed}.
 *
 * # Custom body collection instances
 *
 * Even though most editor instances come with a built-in body collection
 * ({@link module:ui/editorui/editoruiview~EditorUIView#body `editor.ui.view.body`}), you can create your own instance of this
 * class if you need to control their life cycle.
 *
 * The life cycle of a custom body collection must be handled manually by the developer using the dedicated API:
 * * A body collection will render itself automatically in the DOM as soon as you call {@link ~BodyCollection#attachToDom}.
 * * Calling {@link ~BodyCollection#detachFromDom} will remove the collection from the DOM.
 *
 * **Note**: The shared collection wrapper (`<div class="ck-body-wrapper">...</div>`) gets automatically removed from DOM when the
 * last body collection is {@link ~BodyCollection#detachFromDom detached} and does not require any special handling.
 */
export default class BodyCollection extends ViewCollection {
	/**
	 * The {@link module:core/editor/editor~Editor#locale editor's locale} instance.
	 * See the view {@link module:ui/view~View#locale locale} property.
	 */
	public readonly locale: Locale;

	/**
	 * The element holding elements of the body collection.
	 */
	private _bodyCollectionContainer?: HTMLElement;

	/**
	 * The wrapper element that holds all of the {@link #_bodyCollectionContainer} elements.
	 */
	private static _bodyWrapper?: HTMLElement;

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
	 * The element holding elements of the body collection.
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

		// Create a shared wrapper if there were none or the previous one got disconnected from DOM.
		if ( !BodyCollection._bodyWrapper || !BodyCollection._bodyWrapper.isConnected ) {
			BodyCollection._bodyWrapper = createElement( document, 'div', { class: 'ck-body-wrapper' } );
			document.body.appendChild( BodyCollection._bodyWrapper );
		}

		BodyCollection._bodyWrapper.appendChild( this._bodyCollectionContainer );
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

		if ( BodyCollection._bodyWrapper && !BodyCollection._bodyWrapper.childElementCount ) {
			BodyCollection._bodyWrapper.remove();
			delete BodyCollection._bodyWrapper;
		}
	}
}
