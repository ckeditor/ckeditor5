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
	 * Callback function that will be called before an action starts executing.
	 * This allows real-time observation of actions as they begin.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ ActionsRecorder, ... ],
	 *			actionsRecorder: {
	 *				onBeforeAction: ( record, prevRecords ) => {
	 *					console.log( 'Action starting:', record.event );
	 *					console.log( 'Previous records count:', prevRecords.length );
	 *				}
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 */
	onBeforeAction?: BeforeRecordActionCallback;

	/**
	 * Filter function that determines whether a record should be added to the list.
	 * This is called before the action executes and before the record is stored.
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

	/**
	 * Callback function that will be called after an action completes (either successfully or with an error).
	 * This allows real-time monitoring of action results and errors.
	 *
	 * ```ts
	 *	ClassicEditor
	 *		.create( editorElement, {
	 *			plugins: [ ActionsRecorder, ... ],
	 *			actionsRecorder: {
	 *				onAfterAction: ( record, result, error ) => {
	 *					if ( error ) {
	 *						console.error( 'Action failed:', record.event, error );
	 *					} else {
	 *						console.log( 'Action completed:', record.event, result );
	 *					}
	 *				}
	 *			}
	 *		} )
	 *		.then( ... )
	 *		.catch( ... );
	 * ```
	 */
	onAfterAction?: AfterRecordActionCallback;
}

/**
 * Callback function type for the `onBeforeAction` option in the ActionsRecorderConfig.
 *
 * @param record The action entry that is about to start.
 * @param prevRecords The array of previous action entries.
 */
export type BeforeRecordActionCallback = ( record: ActionEntry, prevRecords: Array<ActionEntry> ) => void;

/**
 * Callback function type for the `onFilter` option in the ActionsRecorderConfig.
 * Called before the action executes to determine if it should be recorded.
 *
 * @param record The action entry to be filtered.
 * @param prevRecords The array of previous action entries.
 */
export type RecordFilterCallback = ( record: ActionEntry, prevRecords: Array<ActionEntry> ) => boolean;

/**
 * Callback function type for the `onAfterAction` option in the ActionsRecorderConfig.
 *
 * @param record The completed action entry.
 * @param result The result of the action (if successful).
 * @param error The error that occurred (if failed).
 */
export type AfterRecordActionCallback = ( record: ActionEntry, result?: any, error?: any ) => void;

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
