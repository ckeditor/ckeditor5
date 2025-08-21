/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module watchdog/actionsrecorderconfig
 */

import type { ActionsRecorder } from './actionsrecorder.js';

/**
 * The configuration of the ActionsRecorder plugin.
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

	/**
	 * Filter function that determines whether a record should be added to the list.
	 * This is called before the action executes and before the record is stored.
	 * It allows to reduce memory usage by filtering out unnecessary records.
	 *
	 * If this function returns `false`, the record will not be stored in the entries array.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ ActionsRecorder, ... ],
	 *			actionsRecorder: {
	 *				onFilter: ( entry, prevEntries ) => {
	 *					// Only record command executions.
	 *					return entry.event.startsWith( 'commands.' );
	 *				}
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 */
	onFilter?: ActionsRecorderFilterCallback;

	/**
	 * Callback function that will be called on caught error.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ ActionsRecorder, ... ],
	 *			actionsRecorder: {
	 *				onError: ( error, entries ) => {
	 *					console.error( 'Error caught:', error );
	 *					console.log( 'Actions recorded before error:', entries );
	 *				}
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 */
	onError?: ActionsRecorderErrorCallback;

	/**
	 * TODO
	 */
	onMaxEntries?: ActionsRecorderMaxEntriesCallback;
}

/**
 * Callback function type for the `onFilter` option in the ActionsRecorderConfig.
 * Called before the action executes to determine if it should be recorded.
 *
 * @param entry The action entry to be filtered.
 * @param prevEntries The array of previous action entries.
 */
export type ActionsRecorderFilterCallback = (
	this: ActionsRecorder,
	entry: ActionsRecorderEntry,
	prevEntries: Array<ActionsRecorderEntry>
) => boolean;

/**
 * Callback function type for the `onError` option in the ActionsRecorderConfig.
 *
 * @param error The error that occurred.
 * @param entries The log of actions before the error was encountered.
 */
export type ActionsRecorderErrorCallback = (
	this: ActionsRecorder,
	error: any,
	entries: Array<ActionsRecorderEntry>
) => void;

/**
 * TODO
 */
export type ActionsRecorderMaxEntriesCallback = (
	this: ActionsRecorder
) => void;

/**
 * Represents the state snapshot of the editor at a specific point in time.
 */
export interface ActionsRecorderEntryEditorSnapshot {
	documentVersion: number;
	editorReadOnly: boolean;
	editorFocused: boolean;
	modelSelection: any;
}

/**
 * Represents a recorded action entry with context and state information.
 */
export interface ActionsRecorderEntry {
	timeStamp: string;
	parentEntry?: ActionsRecorderEntry;
	action: string;
	params?: Array<any>;
	before: ActionsRecorderEntryEditorSnapshot;
	after?: ActionsRecorderEntryEditorSnapshot;
	result?: any;
	error?: any;
}
