/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module watchdog/editorwatchdog
 */

/* globals console */

// eslint-disable-next-line ckeditor5-rules/no-cross-package-imports
import type { CKEditorError } from 'ckeditor5/src/utils';

// eslint-disable-next-line ckeditor5-rules/no-cross-package-imports
import type { Editor, EditorConfig, Context, EditorReadyEvent } from 'ckeditor5/src/core';

import areConnectedThroughProperties from './utils/areconnectedthroughproperties';
import Watchdog, { type WatchdogConfig } from './watchdog';

import { throttle, cloneDeepWith, isElement, type DebouncedFunc } from 'lodash-es';

// eslint-disable-next-line ckeditor5-rules/no-cross-package-imports
import type { Node, Text, Element, Writer } from 'ckeditor5/src/engine';

// eslint-disable-next-line ckeditor5-rules/no-cross-package-imports
import type { CommentsRepository } from '@ckeditor/ckeditor5-comments';

// eslint-disable-next-line ckeditor5-rules/no-cross-package-imports
import type { TrackChanges, SuggestionJSON } from '@ckeditor/ckeditor5-track-changes';

// eslint-disable-next-line ckeditor5-rules/no-cross-package-imports,ckeditor5-rules/allow-imports-only-from-main-package-entry-point
import type { CommentThreadDataJSON } from '@ckeditor/ckeditor5-comments/src/comments/commentsrepository';

/**
 * A watchdog for CKEditor 5 editors.
 *
 * See the {@glink features/watchdog Watchdog feature guide} to learn the rationale behind it and
 * how to use it.
 */
export default class EditorWatchdog<TEditor extends Editor = Editor> extends Watchdog {
	/**
	 * The current editor instance.
	 */
	private _editor: TEditor | null = null;

	/**
	 * Throttled save method. The `save()` method is called the specified `saveInterval` after `throttledSave()` is called,
	 * unless a new action happens in the meantime.
	 */
	private _throttledSave: DebouncedFunc<() => void>;

	/**
	 * The latest saved editor data represented as a root name -> root data object.
	 */
	private _data?: EditorData;

	/**
	 * The latest saved editor collaboration data (comment threads and suggestions).
	 */
	private _collaborationData?: CollaborationData;

	/**
	 * The last document version.
	 */
	private _lastDocumentVersion?: number;

	/**
	 * The editor source element or data.
	 */
	private _elementOrData?: HTMLElement | string | Record<string, string>;

	/**
	 * The editor configuration.
	 */
	private _config?: EditorConfig;

	/**
	 * The creation method.
	 *
	 * @see #setCreator
	 */
	declare protected _creator: EditorCreatorFunction<TEditor>;

	/**
	 * The destruction method.
	 *
	 * @see #setDestructor
	 */
	declare protected _destructor: ( editor: Editor ) => Promise<unknown>;

	private _excludedProps?: Set<unknown>;

	/**
	 * @param Editor The editor class.
	 * @param watchdogConfig The watchdog plugin configuration.
	 */
	constructor( Editor: { create( ...args: any ): Promise<TEditor> } | null, watchdogConfig: WatchdogConfig = {} ) {
		super( watchdogConfig );

		// this._editorClass = Editor;

		this._throttledSave = throttle(
			this._save.bind( this ),
			typeof watchdogConfig.saveInterval === 'number' ? watchdogConfig.saveInterval : 5000
		);

		// Set default creator and destructor functions:
		if ( Editor ) {
			this._creator = ( ( elementOrData, config ) => Editor.create( elementOrData, config ) );
		}

		this._destructor = editor => editor.destroy();
	}

	/**
	 * The current editor instance.
	 */
	public get editor(): TEditor | null {
		return this._editor;
	}

	/**
	 * @internal
	 */
	public get _item(): TEditor | null {
		return this._editor;
	}

	/**
	 * Sets the function that is responsible for the editor creation.
	 * It expects a function that should return a promise.
	 *
	 * ```ts
	 * watchdog.setCreator( ( element, config ) => ClassicEditor.create( element, config ) );
	 * ```
	 */
	public setCreator( creator: EditorCreatorFunction<TEditor> ): void {
		this._creator = creator;
	}

	/**
	 * Sets the function that is responsible for the editor destruction.
	 * Overrides the default destruction function, which destroys only the editor instance.
	 * It expects a function that should return a promise or `undefined`.
	 *
	 * ```ts
	 * watchdog.setDestructor( editor => {
	 * 	// Do something before the editor is destroyed.
	 *
	 * 	return editor
	 * 		.destroy()
	 * 		.then( () => {
	 * 			// Do something after the editor is destroyed.
	 * 		} );
	 * } );
	 * ```
	 */
	public setDestructor( destructor: ( editor: Editor ) => Promise<unknown> ): void {
		this._destructor = destructor;
	}

	/**
	 * Restarts the editor instance. This method is called whenever an editor error occurs. It fires the `restart` event and changes
	 * the state to `initializing`.
	 *
	 * @fires restart
	 */
	protected override _restart(): Promise<unknown> {
		return Promise.resolve()
			.then( () => {
				this.state = 'initializing';
				this._fire( 'stateChange' );

				return this._destroy();
			} )
			.catch( err => {
				console.error( 'An error happened during the editor destroying.', err );
			} )
			.then( () => {
				const existingRoots = Object.keys( this._data!.roots ).reduce( ( acc, rootName ) => {
					acc[ rootName ] = '';

					return acc;
				}, {} as Record<string, string> );

				const updatedConfig = {
					...this._config,
					extraPlugins: this._config!.extraPlugins || [],
					_watchdogInitialData: {
						...this._data!,
						...this._collaborationData!
					}
				};

				updatedConfig.extraPlugins!.push( EditorWatchdogInitPlugin as any );

				if ( typeof this._elementOrData === 'string' ) {
					return this.create( existingRoots, updatedConfig, updatedConfig!.context );
				} else {
					updatedConfig.initialData = existingRoots;

					return this.create( this._elementOrData, updatedConfig, updatedConfig.context );
				}
			} )
			.then( () => {
				this._fire( 'restart' );
			} );
	}

	/**
	 * Creates the editor instance and keeps it running, using the defined creator and destructor.
	 *
	 * @param elementOrData The editor source element or the editor data.
	 * @param config The editor configuration.
	 * @param context A context for the editor.
	 */
	public create(
		elementOrData: HTMLElement | string | Record<string, string> = this._elementOrData!,
		config: EditorConfig = this._config!,
		context?: Context
	): Promise<unknown> {
		return Promise.resolve()
			.then( () => {
				super._startErrorHandling();

				this._elementOrData = elementOrData;

				// Clone configuration because it might be shared within multiple watchdog instances. Otherwise,
				// when an error occurs in one of these editors, the watchdog will restart all of them.
				this._config = this._cloneEditorConfiguration( config ) || {};

				this._config!.context = context;

				return this._creator( elementOrData, this._config! );
			} )
			.then( editor => {
				this._editor = editor;

				editor.model.document.on( 'change:data', this._throttledSave );

				this._data = this._getData();
				this._collaborationData = this._getCollaborationData();
				this._lastDocumentVersion = editor.model.document.version;

				this.state = 'ready';
				this._fire( 'stateChange' );
			} );
	}

	/**
	 * Destroys the watchdog and the current editor instance. It fires the callback
	 * registered in {@link #setDestructor `setDestructor()`} and uses it to destroy the editor instance.
	 * It also sets the state to `destroyed`.
	 */
	public override destroy(): Promise<unknown> {
		return Promise.resolve()
			.then( () => {
				this.state = 'destroyed';
				this._fire( 'stateChange' );

				super.destroy();

				return this._destroy();
			} );
	}

	private _destroy(): Promise<unknown> {
		return Promise.resolve()
			.then( () => {
				this._stopErrorHandling();

				// Save data if there is a remaining editor data change.
				this._throttledSave.flush();

				const editor = this._editor;

				this._editor = null;

				// Remove the `change:data` listener before destroying the editor.
				// Incorrectly written plugins may trigger firing `change:data` events during the editor destruction phase
				// causing the watchdog to call `editor.getData()` when some parts of editor are already destroyed.
				editor!.model.document.off( 'change:data', this._throttledSave );

				return this._destructor( editor! );
			} );
	}

	/**
	 * Saves the editor data, so it can be restored after the crash even if the data cannot be fetched at
	 * the moment of the crash.
	 */
	private _save(): void {
		const version = this._editor!.model.document.version;

		try {
			this._data = this._getData();
			this._collaborationData = this._getCollaborationData();
			this._lastDocumentVersion = version;
		} catch ( err ) {
			console.error(
				err,
				'An error happened during restoring editor data. ' +
				'Editor will be restored from the previously saved data.'
			);
		}
	}

	/**
	 * @internal
	 */
	public _setExcludedProperties( props: Set<unknown> ): void {
		this._excludedProps = props;
	}

	/**
	 * Gets the all data that are required to reinitialize editor instance.
	 */
	private _getData(): EditorData {
		const editor = this.editor!;
		const rootNames = editor.model.document.getRootNames();
		const data: EditorData = {
			roots: {},
			markers: {}
		};

		rootNames.forEach( rootName => {
			const root = editor.model.document.getRoot( rootName )!;

			data.roots[ rootName ] = {
				content: JSON.stringify( Array.from( root.getChildren() ) ),
				attributes: JSON.stringify( Array.from( root.getAttributes() ) )
			};
		} );

		for ( const marker of editor.model.markers ) {
			if ( !marker._affectsData ) {
				continue;
			}

			data.markers[ marker.name ] = {
				rangeJSON: marker.getRange().toJSON() as any,
				usingOperation: marker._managedUsingOperations,
				affectsData: marker._affectsData
			};
		}

		return data;
	}

	/**
	 * Gets the collaboration data - comment threads and suggestions.
	 */
	private _getCollaborationData(): CollaborationData {
		const { plugins } = this._editor!;

		const commentsRepository = plugins.has( 'CommentsRepository' ) && plugins.get( 'CommentsRepository' ) as CommentsRepository;
		const trackChanges = plugins.has( 'TrackChanges' ) && plugins.get( 'TrackChanges' ) as TrackChanges;

		return {
			commentThreads: JSON.stringify(
				commentsRepository ?
					commentsRepository.getCommentThreads( { toJSON: true, skipNotAttached: true } ) :
					[]
			),
			suggestions: JSON.stringify(
				trackChanges ?
					trackChanges.getSuggestions( { toJSON: true, skipNotAttached: true } ) :
					[]
			)
		};
	}

	/**
	 * Traverses the error context and the current editor to find out whether these structures are connected
	 * to each other via properties.
	 *
	 * @internal
	 */
	public _isErrorComingFromThisItem( error: CKEditorError ): boolean {
		return areConnectedThroughProperties( this._editor, error.context, this._excludedProps );
	}

	/**
	 * Clones the editor configuration.
	 */
	private _cloneEditorConfiguration( config: EditorConfig ): EditorConfig {
		return cloneDeepWith( config, ( value, key ) => {
			// Leave DOM references.
			if ( isElement( value ) ) {
				return value;
			}

			if ( key === 'context' ) {
				return value;
			}
		} );
	}
}

/**
 * Internal plugin that is used to stop the default editor initialization and restoring the editor state
 * based on the `editor.config._watchdogInitialData` data.
 */
class EditorWatchdogInitPlugin {
	public editor: Editor;

	private _data: EditorData & CollaborationData;

	constructor( editor: Editor ) {
		this.editor = editor;

		this._data = editor.config.get( '_watchdogInitialData' )!;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		// Stops the default editor initialization and use the saved data to restore the editor state.
		// Some of data could not be initialize as a config properties. It is important to keep the data
		// in the same form as it was before the restarting.
		this.editor.data.on( 'init', evt => {
			evt.stop();

			this.editor.model.enqueueChange( { isUndoable: true }, writer => {
				this._restoreCollaborationData();
				this._restoreEditorData( writer );
			} );

			this.editor.data.fire<EditorReadyEvent>( 'ready' );

			// Keep priority `'high' - 1` to be sure that RTC initialization will be first.
		}, { priority: 1000 - 1 } );
	}

	private _createNode( writer: Writer, jsonNode: any ): Text | Element {
		if ( 'name' in jsonNode ) {
			// If child has name property, it is an Element.
			const element = writer.createElement( jsonNode.name, jsonNode.attributes );

			if ( jsonNode.children ) {
				for ( const child of jsonNode.children ) {
					element._appendChild( this._createNode( writer, child ) );
				}
			}

			return element;
		} else {
			// Otherwise, it is a Text node.
			return writer.createText( jsonNode.data, jsonNode.attributes );
		}
	}

	/**
	 * Restores the editor by setting all operations, attributes and markers.
	 */
	private _restoreEditorData( writer: Writer ): void {
		const editor = this.editor!;

		Object.entries( this._data!.roots ).forEach( ( [ rootName, { content, attributes } ] ) => {
			const parsedNodes: Array<Node | Element> = JSON.parse( content );
			const parsedAttributes: Array<[ string, unknown ]> = JSON.parse( attributes );

			const rootElement = editor.model.document.getRoot( rootName )!;

			for ( const [ key, value ] of parsedAttributes ) {
				writer.setAttribute( key, value, rootElement );
			}

			for ( const child of parsedNodes ) {
				const node = this._createNode( writer, child );

				writer.insert( node, rootElement, 'end' );
			}
		} );

		Object.entries( this._data!.markers ).forEach( ( [ markerName, markerOptions ] ) => {
			const { document } = editor.model;
			const {
				rangeJSON: { start, end },
				...options
			} = markerOptions;

			const root = document.getRoot( start.root )!;
			const startPosition = writer.createPositionFromPath( root, start.path, start.stickiness );
			const endPosition = writer.createPositionFromPath( root, end.path, end.stickiness );

			const range = writer.createRange( startPosition, endPosition );

			writer.addMarker( markerName, {
				range,
				...options
			} );
		} );
	}

	/**
	 * Restores the editor collaboration data - comment threads and suggestions.
	 */
	private _restoreCollaborationData() {
		const parsedCommentThreads: Array<CommentThreadDataJSON> = JSON.parse( this._data.commentThreads );
		const parsedSuggestions: Array<SuggestionJSON> = JSON.parse( this._data.suggestions );

		parsedCommentThreads.forEach( commentThread => {
			const channelId = this.editor.config.get( 'collaboration.channelId' )!;
			const commentsRepository = this.editor!.plugins.get( 'CommentsRepository' ) as CommentsRepository;

			commentsRepository.addCommentThread( { channelId, ...commentThread } );
		} );

		parsedSuggestions.forEach( suggestion => {
			const trackChanges = this.editor!.plugins.get( 'TrackChanges' ) as TrackChanges;

			trackChanges.addSuggestion( suggestion );
		} );
	}
}

export type EditorData = {
	roots: Record<string, {
		content: string;
		attributes: string;
	}>;
	markers: Record<string, {
		rangeJSON: { start: any; end: any };
		usingOperation: boolean;
		affectsData: boolean;
	}>;
};

export type CollaborationData = {
	commentThreads: string;
	suggestions: string;
};

/**
 * Fired after the watchdog restarts the error in case of a crash.
 *
 * @eventName ~EditorWatchdog#restart
 */
export type EditorWatchdogRestartEvent = {
	name: 'restart';
	args: [];
	return: undefined;
};

export type EditorCreatorFunction<TEditor = Editor> = (
	elementOrData: HTMLElement | string | Record<string, string>,
	config: EditorConfig
) => Promise<TEditor>;
