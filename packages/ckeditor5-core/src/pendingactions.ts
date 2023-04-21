/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/pendingactions
 */

import ContextPlugin from './contextplugin';

import {
	CKEditorError,
	Collection,
	ObservableMixin,
	type CollectionAddEvent,
	type CollectionRemoveEvent,
	type Observable
} from '@ckeditor/ckeditor5-utils';

/**
 * The list of pending editor actions.
 *
 * This plugin should be used to synchronise plugins that execute long-lasting actions
 * (e.g. file upload) with the editor integration. It gives the developer who integrates the editor
 * an easy way to check if there are any actions pending whenever such information is needed.
 * All plugins that register a pending action also provide a message about the action that is ongoing
 * which can be displayed to the user. This lets them decide if they want to interrupt the action or wait.
 *
 * Adding and updating a pending action:
 *
 * ```ts
 * const pendingActions = editor.plugins.get( 'PendingActions' );
 * const action = pendingActions.add( 'Upload in progress: 0%.' );
 *
 * // You can update the message:
 * action.message = 'Upload in progress: 10%.';
 * ```
 *
 * Removing a pending action:
 *
 * ```ts
 * const pendingActions = editor.plugins.get( 'PendingActions' );
 * const action = pendingActions.add( 'Unsaved changes.' );
 *
 * pendingActions.remove( action );
 * ```
 *
 * Getting pending actions:
 *
 * ```ts
 * const pendingActions = editor.plugins.get( 'PendingActions' );
 *
 * const action1 = pendingActions.add( 'Action 1' );
 * const action2 = pendingActions.add( 'Action 2' );
 *
 * pendingActions.first; // Returns action1
 * Array.from( pendingActions ); // Returns [ action1, action2 ]
 * ```
 *
 * This plugin is used by features like {@link module:upload/filerepository~FileRepository} to register their ongoing actions
 * and by features like {@link module:autosave/autosave~Autosave} to detect whether there are any ongoing actions.
 * Read more about saving the data in the {@glink installation/getting-started/getting-and-setting-data Saving and getting data} guide.
 */
export default class PendingActions extends ContextPlugin implements Iterable<PendingAction> {
	/**
	 * Defines whether there is any registered pending action.
	 *
	 * @readonly
	 * @observable
	 */
	declare public hasAny: boolean;

	/**
	 * A list of pending actions.
	 */
	private _actions!: Collection<PendingAction>;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'PendingActions' {
		return 'PendingActions';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this.set( 'hasAny', false );

		this._actions = new Collection( { idProperty: '_id' } );
		this._actions.delegate( 'add', 'remove' ).to( this );
	}

	/**
	 * Adds an action to the list of pending actions.
	 *
	 * This method returns an action object with an observable message property.
	 * The action object can be later used in the {@link #remove} method. It also allows you to change the message.
	 *
	 * @param message The action message.
	 * @returns An observable object that represents a pending action.
	 */
	public add( message: string ): PendingAction {
		if ( typeof message !== 'string' ) {
			/**
			 * The message must be a string.
			 *
			 * @error pendingactions-add-invalid-message
			 */
			throw new CKEditorError( 'pendingactions-add-invalid-message', this );
		}

		const action = new ( ObservableMixin() )() as PendingAction;

		action.set( 'message', message );
		this._actions.add( action );
		this.hasAny = true;

		return action;
	}

	/**
	 * Removes an action from the list of pending actions.
	 *
	 * @param action An action object.
	 */
	public remove( action: PendingAction ): void {
		this._actions.remove( action );
		this.hasAny = !!this._actions.length;
	}

	/**
	 * Returns the first action from the list or null if the list is empty
	 *
	 * @returns The pending action object.
	 */
	public get first(): PendingAction | null {
		return this._actions.get( 0 );
	}

	/**
	 * Iterable interface.
	 */
	public [ Symbol.iterator ](): Iterator<PendingAction> {
		return this._actions[ Symbol.iterator ]();
	}
}

export interface PendingAction extends Observable {
	message: string;
}

/**
 * Fired when an action is added to the list.
 *
 * @eventName ~PendingActions#add
 * @param action The added action.
 */
export type PendingActionsAddEvent = CollectionAddEvent<PendingAction>;

/**
 * Fired when an action is removed from the list.
 *
 * @eventName ~PendingActions#remove
 * @param action The removed action.
 */
export type PendingActionsRemoveEvent = CollectionRemoveEvent<PendingAction>;
