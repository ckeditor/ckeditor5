/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/fullscreensconfig
 */

/**
 * The configuration of the fullscreen mode feature.
 *
 * The properties defined in this config are set in the `config.fullscreen` namespace.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
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
export default interface FullscreenConfig {

	/**
	 * Customizable callback that is called when the fullscreen mode is enabled.
	 * It's executed after the editor UI elements are moved to the fullscreen mode.
	 *
	 * @default () => {}
	 */
	enableCallback?: ( container: HTMLElement ) => void;

	/**
	 * Customizable callback that is called when the fullscreen mode is disabled.
	 * It's executed before the editor UI elements are moved back to the normal mode.
	 *
	 * @default () => {}
	 */
	disableCallback?: ( container: HTMLElement ) => void;

	/**
	 * The container element for the fullscreen mode. This should be a reference to an existing, positioned element in the DOM.
	 * By default, the fullscreen mode is appended to the `<body>` element.
	 */
	container?: HTMLElement;

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
