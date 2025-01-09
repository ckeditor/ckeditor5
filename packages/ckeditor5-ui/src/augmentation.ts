/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	BalloonToolbar,
	BlockToolbar,
	ContextualBalloon,
	Notification,
	Dialog,
	AccessibilityHelp
} from './index.js';

import type {
	ToolbarConfig
} from '@ckeditor/ckeditor5-core';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * Contextual toolbar configuration. Used by the {@link module:ui/toolbar/balloon/balloontoolbar~BalloonToolbar}
		 * feature.
		 *
		 * ## Configuring toolbar items
		 *
		 * ```ts
		 * const config = {
		 * 	balloonToolbar: [ 'bold', 'italic', 'undo', 'redo' ]
		 * };
		 * ```
		 *
		 * You can also use `'|'` to create a separator between groups of items:
		 *
		 * ```ts
		 * const config = {
		 * 	balloonToolbar: [ 'bold', 'italic', '|', 'undo', 'redo' ]
		 * };
		 * ```
		 *
		 * Read also about configuring the main editor toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
		 *
		 * ## Configuring items grouping
		 *
		 * You can prevent automatic items grouping by setting the `shouldNotGroupWhenFull` option:
		 *
		 * ```ts
		 * const config = {
		 * 	balloonToolbar: {
		 * 		items: [ 'bold', 'italic', 'undo', 'redo' ],
		 * 		shouldNotGroupWhenFull: true
		 * 	},
		 * };
		 * ```
		 */
		balloonToolbar?: ToolbarConfig;

		/**
		 * The block toolbar configuration. Used by the {@link module:ui/toolbar/block/blocktoolbar~BlockToolbar}
		 * feature.
		 *
		 * ```ts
		 * const config = {
		 * 	blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'bulletedList', 'numberedList' ]
		 * };
		 * ```
		 *
		 * You can also use `'|'` to create a separator between groups of items:
		 *
		 * ```ts
		 * const config = {
		 * 	blockToolbar: [ 'paragraph', 'heading1', 'heading2', '|', 'bulletedList', 'numberedList' ]
		 * };
		 * ```
		 *
		 * ## Configuring items grouping
		 *
		 * You can prevent automatic items grouping by setting the `shouldNotGroupWhenFull` option:
		 *
		 * ```ts
		 * const config = {
		 * 	blockToolbar: {
		 * 		items: [ 'paragraph', 'heading1', 'heading2', '|', 'bulletedList', 'numberedList' ],
		 * 		shouldNotGroupWhenFull: true
		 * 	},
		 * };
		 * ```
		 *
		 * Read more about configuring the main editor toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
		 */
		blockToolbar?: ToolbarConfig;
	}

	interface PluginsMap {
		[ BalloonToolbar.pluginName ]: BalloonToolbar;
		[ BlockToolbar.pluginName ]: BlockToolbar;
		[ ContextualBalloon.pluginName ]: ContextualBalloon;
		[ Dialog.pluginName ]: Dialog;
		[ Notification.pluginName ]: Notification;
		[ AccessibilityHelp.pluginName ]: AccessibilityHelp;
	}
}
