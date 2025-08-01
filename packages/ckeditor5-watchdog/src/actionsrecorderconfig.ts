/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog/actionsrecorderconfig
 */

/**
 * The configuration of the ActionsRecorder plugin.
 *
 * Read more about {@glink features/watchdog#configuration configuring the ActionsRecorder feature}.
 *
 * ```ts
 *	ClassicEditor
 *		.create( editorElement, {
 *			actionsRecorder: ... // ActionsRecorder feature options.
 *		} )
 *		.then( ... )
 *		.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 */
export interface ActionsRecorderConfig {

	/**
	 * Whether the actions recorder is enabled.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ ActionsRecorder, ... ],
	 *			actionsRecorder: {
	 *				isEnabled: true
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 *
	 * @default true
	 */
	isEnabled?: boolean;

	/**
	 * The maximum number of action entries to keep in memory.
	 * When this limit is reached, older entries will be removed.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ ActionsRecorder, ... ],
	 *			actionsRecorder: {
	 *				maxEntries: 1000
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 *
	 * @default 1000
	 */
	maxEntries?: number;
}
