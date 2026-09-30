/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/editorui/bodycollection
 */

import { Template } from '../template.js';
import { ViewCollection } from '../viewcollection.js';
import { type View } from '../view.js';

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
 * * Calling {@link ~BodyCollection#destroy} will remove the collection from the DOM and destroy its views.
 *
 * **Note**: The shared collection wrapper (`<div class="ck-body-wrapper">...</div>`) gets automatically removed from DOM when the
 * last body collection is {@link ~BodyCollection#destroy destroyed} and does not require any special handling.
 */
export class BodyCollection extends ViewCollection {
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
	 * The mount target the {@link #_bodyCollectionContainer} is currently attached to (through the shared
	 * wrapper): the `document.body` for editors in the light DOM, or a `ShadowRoot` (or a configured element)
	 * for editors living inside a shadow root. Tracked so the collection can be re-mounted into a different
	 * target and cleaned up from the right wrapper.
	 */
	private _mountTarget?: HTMLElement | ShadowRoot;

	/**
	 * The shared wrapper elements that hold the {@link #_bodyCollectionContainer} elements, keyed by the
	 * mount target (the element or shadow root the wrapper is attached to – not the editor's editing root).
	 * Body collections attached to the same target (e.g. the same shadow root) share a single wrapper;
	 * body collections attached to different targets get separate wrappers.
	 */
	private static _bodyWrappers = new Map<HTMLElement | ShadowRoot, HTMLElement>();

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
	 * The element holding elements of the body collection. It is created on demand – the first time it is
	 * accessed or the collection is {@link #attachToDom attached} – and reused afterwards. Creating it does
	 * not attach it to the DOM (that happens in {@link #attachToDom}), so it is available for focus tracking
	 * and styling even while the collection is not mounted yet.
	 */
	public get bodyCollectionContainer(): HTMLElement {
		if ( !this._bodyCollectionContainer ) {
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
		}

		return this._bodyCollectionContainer;
	}

	/**
	 * The mount target (element or shadow root) the collection is currently attached to, or `undefined`
	 * before {@link #attachToDom} is called or after {@link #unmountFromDom} or {@link #destroy}.
	 */
	public get mountTarget(): HTMLElement | ShadowRoot | undefined {
		return this._mountTarget;
	}

	/**
	 * Attaches the body collection to the DOM. You need to execute this method to render the content of
	 * the body collection.
	 *
	 * By default the collection mounts in a shared wrapper under the `document.body`. Pass a `target` to
	 * mount it elsewhere – for example inside the {@link module:utils/dom/isshadowroot~isShadowRoot shadow root}
	 * an editor lives in, so that floating UI (balloons, dialogs, tooltips) can be styled within that
	 * boundary. The `target` may be a regular element or a shadow root, open or closed. Calling this method
	 * again with a different `target` re-mounts the already rendered collection into the new location.
	 *
	 * @param target The element or shadow root to mount the body collection in. Defaults to `document.body`.
	 */
	public attachToDom( target?: HTMLElement | ShadowRoot ): void {
		const mountTarget: HTMLElement | ShadowRoot = target || document.body;
		const previousMountTarget = this._mountTarget;

		// Moving the container also moves its rendered child views, so a re-mount preserves them.
		BodyCollection._getBodyWrapper( mountTarget ).appendChild( this.bodyCollectionContainer );
		this._mountTarget = mountTarget;

		// A re-mount into a different target may have left the previous wrapper empty.
		if ( previousMountTarget && previousMountTarget !== mountTarget ) {
			BodyCollection._removeBodyWrapperIfEmpty( previousMountTarget );
		}

		if ( previousMountTarget !== mountTarget ) {
			this.fire<BodyCollectionRemountEvent>( 'remount' );
		}
	}

	/**
	 * Keeps the collection mounted in the given target: attaches it there when the target differs from the
	 * current {@link #mountTarget} (see {@link #attachToDom}), unmounts it on a `null` target (see
	 * {@link #unmountFromDom}), and leaves the DOM untouched when the collection already sits in the target.
	 *
	 * Designed for repeated calls with a freshly resolved target (for example on every editor UI update, or
	 * with the result of {@link module:utils/dom/getoverlaymountroot~getOverlayMountRoot}), as opposed to
	 * {@link #attachToDom}, which re-appends the container even when the target did not change.
	 *
	 * @param target The element or shadow root to mount the body collection in, or `null` to unmount it.
	 */
	public syncMountTarget( target: HTMLElement | ShadowRoot | null ): void {
		if ( target ) {
			if ( this._mountTarget !== target ) {
				this.attachToDom( target );
			}
		} else if ( this._mountTarget ) {
			this.unmountFromDom();
		}
	}

	/**
	 * Destroys the body collection: destroys its views and removes their shared container from the DOM. Use this
	 * method when you do not need the body collection anymore. For a reversible removal that keeps the views so the
	 * collection can be {@link #attachToDom attached} again, use {@link #unmountFromDom} instead.
	 */
	public override destroy(): void {
		super.destroy();

		this._removeFromDom();
	}

	/**
	 * Removes the collection's container from the DOM without destroying its views, so it can be attached
	 * again later with {@link #attachToDom} – for example when the editor is temporarily disconnected from
	 * the document. For permanent teardown use {@link #destroy} instead.
	 */
	public unmountFromDom(): void {
		this._removeFromDom();
	}

	/**
	 * Removes the collection's container (and the shared wrapper, if now empty) from the DOM, keeping the
	 * container instance so it can be re-attached.
	 */
	private _removeFromDom(): void {
		const wasMounted = !!this._mountTarget;

		if ( this._bodyCollectionContainer ) {
			this._bodyCollectionContainer.remove();
		}

		BodyCollection._removeBodyWrapperIfEmpty( this._mountTarget );
		this._mountTarget = undefined;

		if ( wasMounted ) {
			this.fire<BodyCollectionRemountEvent>( 'remount' );
		}
	}

	/**
	 * Returns the shared wrapper element for the given mount target, creating (and attaching) it if it does
	 * not exist yet or is no longer contained by the target. Body collections sharing a target share a wrapper.
	 *
	 * The staleness check asks whether the target still contains the wrapper rather than testing `isConnected`,
	 * so a wrapper stays reused when the target itself is legitimately detached from the document (for example a
	 * configured {@link module:core/editor/editorconfig~UiConfig#overlayContainer `ui.overlayContainer`} that
	 * is inserted later). Testing `isConnected` there would treat the still-attached wrapper as stale and build
	 * a duplicate wrapper for every body collection sharing that target.
	 *
	 * @param mountTarget The element or shadow root the wrapper is (or should be) attached to.
	 */
	private static _getBodyWrapper( mountTarget: HTMLElement | ShadowRoot ): HTMLElement {
		let wrapper = BodyCollection._bodyWrappers.get( mountTarget );

		if ( !wrapper || !mountTarget.contains( wrapper ) ) {
			wrapper = createElement( mountTarget.ownerDocument!, 'div', { class: 'ck-body-wrapper' } );
			mountTarget.appendChild( wrapper );

			BodyCollection._bodyWrappers.set( mountTarget, wrapper );
		}

		return wrapper;
	}

	/**
	 * Removes the shared wrapper for the given mount target (and forgets it) once it holds no more body
	 * collections.
	 *
	 * @param mountTarget The element or shadow root the wrapper is attached to.
	 */
	private static _removeBodyWrapperIfEmpty( mountTarget?: HTMLElement | ShadowRoot ): void {
		if ( !mountTarget ) {
			return;
		}

		const wrapper = BodyCollection._bodyWrappers.get( mountTarget );

		if ( wrapper && !wrapper.childElementCount ) {
			wrapper.remove();
			BodyCollection._bodyWrappers.delete( mountTarget );
		}
	}
}

/**
 * Fired when the collection's {@link module:ui/editorui/bodycollection~BodyCollection#mountTarget mount target}
 * changes – it is {@link module:ui/editorui/bodycollection~BodyCollection#attachToDom attached}, re-attached to a
 * different target, or {@link module:ui/editorui/bodycollection~BodyCollection#unmountFromDom unmounted}.
 *
 * @eventName ~BodyCollection#remount
 */
export type BodyCollectionRemountEvent = {
	name: 'remount';
	args: [];
};
