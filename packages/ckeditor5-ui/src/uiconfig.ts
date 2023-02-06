/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { ToolbarConfig } from '@ckeditor/ckeditor5-core';

/**
 * @module ui/toolbar/balloon/balloontoolbar
 */

/**
 * Contextual toolbar configuration. Used by the {@link module:ui/toolbar/balloon/balloontoolbar~BalloonToolbar}
 * feature.
 *
 * ## Configuring toolbar items
 *
 *		const config = {
 *			balloonToolbar: [ 'bold', 'italic', 'undo', 'redo' ]
 *		};
 *
 * You can also use `'|'` to create a separator between groups of items:
 *
 *		const config = {
 *			balloonToolbar: [ 'bold', 'italic', '|', 'undo', 'redo' ]
 *		};
 *
 * Read also about configuring the main editor toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * ## Configuring items grouping
 *
 * You can prevent automatic items grouping by setting the `shouldNotGroupWhenFull` option:
 *
 *		const config = {
 *			balloonToolbar: {
 *				items: [ 'bold', 'italic', 'undo', 'redo' ],
 *				shouldNotGroupWhenFull: true
 *			},
 *		};
 *
 * @member {Array.<String>|Object} module:core/editor/editorconfig~EditorConfig#balloonToolbar
 */
declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {
		balloonToolbar?: ToolbarConfig;

		/**
		 * The block toolbar configuration. Used by the {@link module:ui/toolbar/block/blocktoolbar~BlockToolbar}
		 * feature.
		 *
		 *		const config = {
		 *			blockToolbar: [ 'paragraph', 'heading1', 'heading2', 'bulletedList', 'numberedList' ]
		 *		};
		 *
		 * You can also use `'|'` to create a separator between groups of items:
		 *
		 *		const config = {
		 *			blockToolbar: [ 'paragraph', 'heading1', 'heading2', '|', 'bulletedList', 'numberedList' ]
		 *		};
		 *
		 * ## Configuring items grouping
		 *
		 * You can prevent automatic items grouping by setting the `shouldNotGroupWhenFull` option:
		 *
		 *		const config = {
		 *			blockToolbar: {
		 *				items: [ 'paragraph', 'heading1', 'heading2', '|', 'bulletedList', 'numberedList' ],
		 *				shouldNotGroupWhenFull: true
		 *			},
		 *		};
		 *
		 * Read more about configuring the main editor toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
		 *
		 * @member {Array.<String>|Object} module:core/editor/editorconfig~EditorConfig#blockToolbar
		 */
		blockToolbar?: ToolbarConfig;
	}
}
