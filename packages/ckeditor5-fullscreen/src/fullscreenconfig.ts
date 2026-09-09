/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/fullscreenconfig
 */

/**
 * The configuration of the fullscreen mode feature.
 *
 * The properties defined in this config are set in the `config.fullscreen` namespace.
 *
 * ```ts
 * ClassicEditor
 * 	.create( {
 * 		fullscreen: {
 * 			// Fullscreen mode configuration.
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface FullscreenConfig {

	/**
	 * Customizable callback that is called when you enter the fullscreen mode.
	 * It's executed after the editor UI elements are moved to the fullscreen mode.
	 *
	 * @default `() => {}`
	 */
	onEnterCallback?: ( container: HTMLElement ) => void;

	/**
	 * Customizable callback that is called when you leave the fullscreen mode.
	 * It's executed before the editor UI elements are moved back to the normal mode.
	 *
	 * @default `() => {}`
	 */
	onLeaveCallback?: ( container: HTMLElement ) => void;

	/**
	 * The container element for the fullscreen mode. This should be a reference to an existing, positioned element in the DOM.
	 *
	 * By default, the fullscreen mode is appended to the shared {@link module:core/editor/editorconfig~UiConfig#overlayContainer
	 * `ui.overlayContainer`} if it is set, otherwise to the shadow root the editor lives in (open or closed), otherwise to
	 * the `<body>` element. Mounting it in the root the editor lives in is what keeps the editor UI moved to the fullscreen
	 * mode (editable, toolbar, menu bar, sidebars) styled – in a shadow root, the editor stylesheets are adopted by that
	 * root only.
	 *
	 * Setting it to anything else than that default also keeps the page scrollable, as the fullscreen mode then fills an
	 * element of the page layout instead of covering the viewport.
	 */
	container?: HTMLElement | ShadowRoot;

	/**
	 * The configuration of the menu bar in the fullscreen mode.
	 */
	menuBar?: {

		/**
		 * Whether the menu bar is visible in the fullscreen mode.
		 *
		 * @default true
		 */
		isVisible?: boolean;
	};

	/**
	 * The configuration of the toolbar in the fullscreen mode.
	 */
	toolbar?: {

		/**
		 * Whether toolbar should be grouping items for which there is not enough space.
		 * By default, toolbar will behave the same as outside the fullscreen mode. You can specify this option to change this behavior
		 * independently for the fullscreen mode.
		 *
		 * @default `!!config.toolbar.shouldNotGroupWhenFull`
		 */
		shouldNotGroupWhenFull?: boolean;
	};
}
