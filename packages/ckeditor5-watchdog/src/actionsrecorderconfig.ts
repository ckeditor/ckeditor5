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
	 * This behavior can be modified by providing {@link #onMaxEntries `onMaxEntries`} callback.
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
	 * This is called before the action executes and before the entry is stored.
	 * It allows to reduce memory usage by filtering out unnecessary records.
	 *
	 * If this function returns `false`, the record will not be stored in the entries array.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ ActionsRecorder, ... ],
	 *			actionsRecorder: {
	 *				onFilter( entry, prevEntries ) {
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
	 * Callback function called on caught error.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ ActionsRecorder, ... ],
	 *			actionsRecorder: {
	 *				onError( error, entries ) {
	 *					console.error( 'ActionsRecorder - Error detected:', error );
	 *					console.warn( 'Actions recorded before error:', entries );
	 *
	 * 					this.flushEntries();
	 *				}
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 */
	onError?: ActionsRecorderErrorCallback;

	/**
	 * Callback function called when recorded entries count reaches {@link #maxEntries `maxEntries`}.
	 *
	 * ```ts
	 * 	ClassicEditor
	 * 		.create( editorElement, {
	 * 			plugins: [ ActionsRecorder, ... ],
	 * 			actionsRecorder: {
	 * 				onMaxEntries() {
	 * 					const entries = this.getEntries();
	 *
	 * 					this.flushEntries();
	 *
	 * 					console.log( 'ActionsRecorder - Batch of entries:', entries );
	 * 				}
	 * 			}
	 * 		} )
	 * 		.then( ... )
	 * 		.catch( ... );
	 * ```
	 *
	 * By default, when this callback is not provided, the list of entries is shifted so it does not include more than
	 * {@link #maxEntries `maxEntries`}.
	 */
	onMaxEntries?: ActionsRecorderMaxEntriesCallback;
}

/**
 * Callback function type for the {@link ~ActionsRecorderConfig#onFilter `onFilter`} option.
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
 * Callback function type for the {@link ~ActionsRecorderConfig#onError `onError`} option.
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
 * Callback function type for the {@link ~ActionsRecorderConfig#onMaxEntries `onMaxEntries`} option.
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
