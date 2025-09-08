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
	 *					return entry.action.startsWith( 'commands.' );
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

	/**
	 * The document version. See {@link module:engine/model/document~ModelDocument#version}.
	 */
	documentVersion: number;

	/**
	 * Whether the editor is in the read-only mode. See {@link module:core/editor/editor~Editor#isReadOnly}.
	 */
	editorReadOnly: boolean;

	/**
	 * True if document is focused. See {@link module:engine/view/document~ViewDocument#isFocused}.
	 */
	editorFocused: boolean;

	/**
	 * The current model selection. See {@link module:engine/model/document~ModelDocument#selection}.
	 */
	modelSelection: any;
}

/**
 * Represents a recorded action entry with context and state information.
 */
export interface ActionsRecorderEntry {

	/**
	 * Entry timestamp in ISO date time format.
	 */
	timeStamp: string;

	/**
	 * For nested actions this is a reference to parent action (nesting of try-catch blocks).
	 *
	 * For example when user clicks a button in a toolbar it could generate such nested tree:
	 * * `component.bold:execute`
	 * 	* `commands.bold:execute`
	 * 		* `model.applyOperation`
	 */
	parentEntry?: ActionsRecorderEntry;

	/**
	 * The name of the action.
	 *
	 * For example:
	 * * `component.bold:execute` Main action for toolbar button `bold` was executed.
	 * * `commands.bold:execute` The `bold` command was executed.
	 * * `model.applyOperation` The low-level operation was applied to the model.
	 * * `observers:paste` The `paste` DOM event was dispatched in the editing root.
	 * * `model.insertContent` The `model#insertContent()` was called.
	 * * `model-selection:change:range` The model selection range was changed.
	 */
	action: string;

	/**
	 * The editor state before the action was executed.
	 */
	before: ActionsRecorderEntryEditorSnapshot;

	/**
	 * The editor state after the action was executed.
	 */
	after?: ActionsRecorderEntryEditorSnapshot;

	/**
	 * Params provided for the executed action. They depend on the actual action.
	 */
	params?: Array<any>;

	/**
	 * The result returned by the executed action. It depends on the actual action.
	 */
	result?: any;

	/**
	 * The error if the action throws one.
	 */
	error?: any;
}
