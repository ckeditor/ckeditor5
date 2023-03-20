/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module autosave/autosave
 */

import {
	Plugin,
	PendingActions,
	type Editor,
	type PendingAction,
	type EditorDestroyEvent,
	type EditorReadyEvent
} from 'ckeditor5/src/core';

import { DomEmitterMixin, type DomEmitter } from 'ckeditor5/src/utils';

import type { DocumentChangeEvent } from 'ckeditor5/src/engine';

import { debounce, type DebouncedFunc } from 'lodash-es';

/* globals window */

/**
 * The {@link module:autosave/autosave~Autosave} plugin allows you to automatically save the data (e.g. send it to the server)
 * when needed (when the user changed the content).
 *
 * It listens to the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`}
 * and `window#beforeunload` events and calls the
 * {@link module:autosave/autosave~AutosaveAdapter#save `config.autosave.save()`} function.
 *
 * ```ts
 * ClassicEditor
 * 	.create( document.querySelector( '#editor' ), {
 * 		plugins: [ ArticlePluginSet, Autosave ],
 * 		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
 * 		image: {
 * 			toolbar: [ 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ],
 * 		},
 * 		autosave: {
 * 			save( editor: Editor ) {
 * 				// The saveData() function must return a promise
 * 				// which should be resolved when the data is successfully saved.
 * 				return saveData( editor.getData() );
 * 			}
 * 		}
 * 	} );
 *	```
 *
 * Read more about this feature in the {@glink installation/getting-started/getting-and-setting-data#autosave-feature Autosave feature}
 * section of the {@glink installation/getting-started/getting-and-setting-data Saving and getting data}.
 */
export default class Autosave extends Plugin {
	/**
	 * The adapter is an object with a `save()` method. That method will be called whenever
	 * the data changes. It might be called some time after the change,
	 * since the event is throttled for performance reasons.
	 */

	public adapter?: AutosaveAdapter;

	/**
	 * The state of this plugin.
	 *
	 * The plugin can be in the following states:
	 *
	 * * synchronized &ndash; When all changes are saved.
	 * * waiting &ndash; When the plugin is waiting for other changes before calling `adapter#save()` and `config.autosave.save()`.
	 * * saving &ndash; When the provided save method is called and the plugin waits for the response.
	 * * error &ndash When the provided save method will throw an error. This state immediately changes to the `saving` state and
	 * the save method will be called again in the short period of time.
	 *
	 * @observable
	 * @readonly
	 */
	declare public state: 'synchronized' | 'waiting' | 'saving' | 'error';

	/**
	 * Debounced save method. The `save()` method is called the specified `waitingTime` after `debouncedSave()` is called,
	 * unless a new action happens in the meantime.
	 */
	private _debouncedSave: DebouncedFunc<( () => void )>;

	/**
	 * The last saved document version.
	 */
	private _lastDocumentVersion: number;

	/**
	 * Promise used for asynchronous save calls.
	 *
	 * Created to handle the autosave call to an external data source. It resolves when that call is finished. It is re-used if
	 * save is called before the promise has been resolved. It is set to `null` if there is no call in progress.
	 */
	private _savePromise: Promise<void> | null;

	/**
	 * DOM emitter.
	 */
	private _domEmitter: DomEmitter;

	/**
	 * The configuration of this plugins.
	 */
	private _config: AutosaveConfig;

	/**
	 * Editor's pending actions manager.
	 */
	private _pendingActions: PendingActions;

	/**
	 * Informs whether there should be another autosave callback performed, immediately after current autosave callback finishes.
	 *
	 * This is set to `true` when there is a save request while autosave callback is already being processed
	 * and the model has changed since the last save.
	 */
	private _makeImmediateSave: boolean;

	/**
	 * An action that will be added to the pending action manager for actions happening in that plugin.
	 */
	private _action: PendingAction | null = null;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Autosave' {
		return 'Autosave';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ PendingActions ] as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		const config: AutosaveConfig = editor.config.get( 'autosave' ) || {};

		// A minimum amount of time that needs to pass after the last action.
		// After that time the provided save callbacks are being called.
		const waitingTime = config.waitingTime || 1000;

		this.set( 'state', 'synchronized' );

		this._debouncedSave = debounce( this._save.bind( this ), waitingTime );
		this._lastDocumentVersion = editor.model.document.version;
		this._savePromise = null;
		this._domEmitter = new ( DomEmitterMixin() )();
		this._config = config;
		this._pendingActions = editor.plugins.get( PendingActions );
		this._makeImmediateSave = false;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const doc = editor.model.document;

		// Add the listener only after the editor is initialized to prevent firing save callback on data init.
		this.listenTo<EditorReadyEvent>( editor, 'ready', () => {
			this.listenTo<DocumentChangeEvent>( doc, 'change:data', ( evt, batch ) => {
				if ( !this._saveCallbacks.length ) {
					return;
				}

				if ( !batch.isLocal ) {
					return;
				}

				if ( this.state === 'synchronized' ) {
					this.state = 'waiting';
					// Set pending action already when we are waiting for the autosave callback.
					this._setPendingAction();
				}

				if ( this.state === 'waiting' ) {
					this._debouncedSave();
				}

				// If the plugin is in `saving` state, it will change its state later basing on the `document.version`.
				// If the `document.version` will be higher than stored `#_lastDocumentVersion`, then it means, that some `change:data`
				// event has fired in the meantime.
			} );
		} );

		// Flush on the editor's destroy listener with the highest priority to ensure that
		// `editor.getData()` will be called before plugins are destroyed.
		this.listenTo<EditorDestroyEvent>( editor, 'destroy', () => this._flush(), { priority: 'highest' } );

		// It's not possible to easy test it because karma uses `beforeunload` event
		// to warn before full page reload and this event cannot be dispatched manually.
		/* istanbul ignore next */
		this._domEmitter.listenTo( window, 'beforeunload', ( evtInfo, domEvt ) => {
			if ( this._pendingActions.hasAny ) {
				domEvt.returnValue = this._pendingActions.first!.message;
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		// There's no need for canceling or flushing the throttled save, as
		// it's done on the editor's destroy event with the highest priority.

		this._domEmitter.stopListening();
		super.destroy();
	}

	/**
	 * Immediately calls autosave callback. All previously queued (debounced) callbacks are cleared. If there is already an autosave
	 * callback in progress, then the requested save will be performed immediately after the current callback finishes.
	 *
	 * @returns A promise that will be resolved when the autosave callback is finished.
	 */
	public save(): Promise<void> {
		this._debouncedSave.cancel();

		return this._save();
	}

	/**
	 * Invokes the remaining `_save()` method call.
	 */
	private _flush(): void {
		this._debouncedSave.flush();
	}

	/**
	 * If the adapter is set and a new document version exists,
	 * the `_save()` method creates a pending action and calls the `adapter.save()` method.
	 * It waits for the result and then removes the created pending action.
	 *
	 * @returns A promise that will be resolved when the autosave callback is finished.
	 */
	private _save(): Promise<void> {
		if ( this._savePromise ) {
			this._makeImmediateSave = this.editor.model.document.version > this._lastDocumentVersion;

			return this._savePromise;
		}

		// Make sure there is a pending action (in case if `_save()` was called through manual `save()` call).
		this._setPendingAction();

		this.state = 'saving';
		this._lastDocumentVersion = this.editor.model.document.version;

		// Wait one promise cycle to be sure that save callbacks are not called inside a conversion or when the editor's state changes.
		this._savePromise = Promise.resolve()
			// Make autosave callback.
			.then( () => Promise.all(
				this._saveCallbacks.map( cb => cb( this.editor ) )
			) )
			// When the autosave callback is finished, always clear `this._savePromise`, no matter if it was successful or not.
			.finally( () => {
				this._savePromise = null;
			} )
			// If the save was successful, we have three scenarios:
			//
			// 1. If a save was requested when an autosave callback was already processed, we need to immediately call
			// another autosave callback. In this case, `this._savePromise` will not be resolved until the next callback is done.
			// 2. Otherwise, if changes happened to the model, make a delayed autosave callback (like the change just happened).
			// 3. If no changes happened to the model, return to the `synchronized` state.
			.then( () => {
				if ( this._makeImmediateSave ) {
					this._makeImmediateSave = false;

					// Start another autosave callback. Return a promise that will be resolved after the new autosave callback.
					// This way promises returned by `_save()` will not be resolved until all changes are saved.
					//
					// If `save()` was called when another (most often automatic) autosave callback was already processed,
					// the promise returned by `save()` call will be resolved only after new changes have been saved.
					//
					// Note that it would not work correctly if `this._savePromise` is not cleared.
					return this._save();
				} else {
					if ( this.editor.model.document.version > this._lastDocumentVersion ) {
						this.state = 'waiting';
						this._debouncedSave();
					} else {
						this.state = 'synchronized';
						this._pendingActions.remove( this._action! );
						this._action = null;
					}
				}
			} )
			// In case of an error, retry the autosave callback after a delay (and also throw the original error).
			.catch( err => {
				// Change state to `error` so that listeners handling autosave error can be called.
				this.state = 'error';
				// Then, immediately change to the `saving` state as described above.
				// Being in the `saving` state ensures that the autosave callback won't be delayed further by the `change:data` listener.
				this.state = 'saving';

				this._debouncedSave();

				throw err;
			} );

		return this._savePromise;
	}

	/**
	 * Creates a pending action if it is not set already.
	 */
	private _setPendingAction(): void {
		const t = this.editor.t;

		if ( !this._action ) {
			this._action = this._pendingActions.add( t( 'Saving changes' ) );
		}
	}

	/**
	 * Saves callbacks.
	 */
	private get _saveCallbacks(): Array<( editor: Editor ) => Promise<unknown>> {
		const saveCallbacks: Array<( editor: Editor ) => Promise<unknown>> = [];

		if ( this.adapter && this.adapter.save ) {
			saveCallbacks.push( this.adapter.save );
		}

		if ( this._config.save ) {
			saveCallbacks.push( this._config.save );
		}

		return saveCallbacks;
	}
}

/**
 * An interface that requires the `save()` method.
 *
 * Used by {@link module:autosave/autosave~Autosave#adapter}.
 */
export interface AutosaveAdapter {

	/**
	 * The method that will be called when the data changes. It should return a promise (e.g. in case of saving content to the database),
	 * so the autosave plugin will wait for that action before removing it from pending actions.
	 */
	save( editor: Editor ): Promise<unknown>;
}

/**
 * The configuration of the {@link module:autosave/autosave~Autosave autosave feature}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		autosave: {
 * 			save( editor: Editor ) {
 * 				// The saveData() function must return a promise
 * 				// which should be resolved when the data is successfully saved.
 * 				return saveData( editor.getData() );
 * 			}
 * 		}
 * 	} );
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor configuration options}.
 *
 * See also the demo of the {@glink installation/getting-started/getting-and-setting-data#autosave-feature autosave feature}.
 */
export interface AutosaveConfig {

	/**
	 * The callback to be executed when the data needs to be saved.
	 *
	 * This function must return a promise which should be resolved when the data is successfully saved.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		autosave: {
	 * 			save( editor: Editor ) {
	 * 				return saveData( editor.getData() );
	 * 			}
	 * 		}
	 * 	} );
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 */
	save?: ( editor: Editor ) => Promise<unknown>;

	/**
	 * The minimum amount of time that needs to pass after the last action to call the provided callback.
	 * By default it is 1000 ms.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		autosave: {
	 * 			save( editor: Editor ) {
	 * 				return saveData( editor.getData() );
	 * 			},
	 * 			waitingTime: 2000
	 * 		}
	 * 	} );
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 */
	waitingTime?: number;
}
