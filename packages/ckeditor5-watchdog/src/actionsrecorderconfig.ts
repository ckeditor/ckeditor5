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

	/**
	 * Callback function that will be called whenever a new action record is created.
	 * This allows real-time observation of editor actions.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ ActionsRecorder, ... ],
	 *			actionsRecorder: {
	 *				onRecord: ( record ) => {
	 *					console.log( 'New action recorded:', record );
	 *				}
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 */
	onRecord?: RecordActionCallback;

	/**
	 * Filter function that determines whether a record should be added to the list.
	 * If this function returns `false`, the record will not be stored in the entries array.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ ActionsRecorder, ... ],
	 *			actionsRecorder: {
	 *				onFilter: ( record ) => {
	 *					// Only record command executions
	 *					return record.event.startsWith( 'commands.' );
	 *				}
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 */
	onFilter?: RecordFilterCallback;
}

/**
 * Callback function type for the `onRecord` option in the ActionsRecorderConfig.
 *
 * @param record The newly created action entry.
 * @param prevRecords The array of previous action entries.
 */
export type RecordActionCallback = ( record: ActionEntry, prevRecords: Array<ActionEntry> ) => void;

/**
 * Callback function type for the `filter` option in the ActionsRecorderConfig.
 *
 * @param record The action entry to be filtered.
 */
export type RecordFilterCallback = ( record: ActionEntry, prevRecords: Array<ActionEntry> ) => boolean;

/**
 * Represents the state snapshot of the editor at a specific point in time.
 */
export interface ActionEntryEditorSnapshot {
	documentVersion: number;
	editorReadOnly: boolean;
	editorFocused: boolean;
	modelSelection: any;
}

/**
 * Represents a recorded action entry with context and state information.
 */
export interface ActionEntry {
	timeStamp: string;
	parentFrame?: ActionEntry;
	event: string;
	params?: Array<any>;
	before: ActionEntryEditorSnapshot;
	after?: ActionEntryEditorSnapshot;
	result?: any;
	error?: any;
}
