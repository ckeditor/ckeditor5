/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-multi-root/multirooteditor
 */

import {
	Editor,
	secureSourceElement,
	type EditorConfig,
	type EditorReadyEvent
} from 'ckeditor5/src/core.js';

import {
	CKEditorError,
	getDataFromElement,
	setDataInElement,
	logWarning,
	type CollectionAddEvent,
	type DecoratedMethodEvent
} from 'ckeditor5/src/utils.js';

import MultiRootEditorUI from './multirooteditorui.js';
import MultiRootEditorUIView from './multirooteditoruiview.js';

import { isElement as _isElement } from 'lodash-es';
import {
	type RootElement,
	type ViewRootEditableElement,
	type Writer,
	type ModelCanEditAtEvent
} from 'ckeditor5/src/engine.js';

/**
 * The multi-root editor implementation.
 *
 * The multi-root editor provides multiple inline editable elements and a toolbar. All editable areas are controlled by one editor
 * instance, which means that they share common configuration, document ID, or undo stack.
 *
 * This type of editor is dedicated to integrations which require a customized UI with an open structure, featuring multiple editable areas,
 * allowing developers to have a control over the exact location of these editable areas.
 *
 * In order to create a multi-root editor instance, use the static
 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`} method.
 *
 * Note that you will need to attach the editor toolbar to your web page manually, in a desired place, after the editor is initialized.
 */
export default class MultiRootEditor extends Editor {
	/**
	 * @inheritDoc
	 */
	public readonly ui: MultiRootEditorUI;

	/**
	 * The elements on which the editor has been initialized.
	 */
	public readonly sourceElements: Record<string, HTMLElement>;

	/**
	 * Holds attributes keys that were passed in {@link module:core/editor/editorconfig~EditorConfig#rootsAttributes `rootsAttributes`}
	 * config property and should be returned by {@link #getRootsAttributes}.
	 */
	private readonly _registeredRootsAttributesKeys = new Set<string>();

	/**
	 * A set of lock IDs for enabling or disabling particular root.
	 */
	private readonly _readOnlyRootLocks = new Map<string, Set<symbol | string>>();

	/**
	 * Creates an instance of the multi-root editor.
	 *
	 * **Note:** Do not use the constructor to create editor instances. Use the static
	 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`} method instead.
	 *
	 * @param sourceElementsOrData The DOM elements that will be the source for the created editor
	 * or the editor's initial data. The editor will initialize multiple roots with names according to the keys in the passed object.
	 * For more information see {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`}.
	 * @param config The editor configuration.
	 */
	protected constructor( sourceElementsOrData: Record<string, HTMLElement> | Record<string, string>, config: EditorConfig = {} ) {
		const rootNames = Object.keys( sourceElementsOrData );
		const sourceIsData = rootNames.length === 0 || typeof sourceElementsOrData[ rootNames[ 0 ] ] === 'string';

		if ( sourceIsData && config.initialData !== undefined && Object.keys( config.initialData ).length > 0 ) {
			// Documented in core/editor/editorconfig.jsdoc.
			// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
			throw new CKEditorError( 'editor-create-initial-data', null );
		}

		super( config );

		if ( !sourceIsData ) {
			this.sourceElements = sourceElementsOrData as Record<string, HTMLElement>;
		} else {
			this.sourceElements = {};
		}

		if ( this.config.get( 'initialData' ) === undefined ) {
			// Create initial data object containing data from all roots.
			const initialData: Record<string, string> = {};

			for ( const rootName of rootNames ) {
				initialData[ rootName ] = getInitialData( sourceElementsOrData[ rootName ] );
			}

			this.config.set( 'initialData', initialData );
		}

		if ( !sourceIsData ) {
			for ( const rootName of rootNames ) {
				secureSourceElement( this, sourceElementsOrData[ rootName ] as HTMLElement );
			}
		}

		this.editing.view.document.roots.on<CollectionAddEvent<ViewRootEditableElement>>( 'add', ( evt, viewRoot ) => {
			// Here we change the standard binding of readOnly flag by adding
			// additional constraint that multi-root has (enabling / disabling particular root).
			viewRoot.unbind( 'isReadOnly' );
			viewRoot.bind( 'isReadOnly' ).to( this.editing.view.document, 'isReadOnly', isReadOnly => {
				return isReadOnly || this._readOnlyRootLocks.has( viewRoot.rootName );
			} );

			// Hacky solution to nested editables.
			// Nested editables should be managed each separately and do not base on view document or view root.
			viewRoot.on( 'change:isReadOnly', ( evt, prop, value ) => {
				const viewRange = this.editing.view.createRangeIn( viewRoot );

				for ( const viewItem of viewRange.getItems() ) {
					if ( viewItem.is( 'editableElement' ) ) {
						viewItem.unbind( 'isReadOnly' );
						viewItem.isReadOnly = value;
					}
				}
			} );
		} );

		for ( const rootName of rootNames ) {
			// Create root and `UIView` element for each editable container.
			this.model.document.createRoot( '$root', rootName );
		}

		if ( this.config.get( 'lazyRoots' ) ) {
			for ( const rootName of this.config.get( 'lazyRoots' )! ) {
				const root = this.model.document.createRoot( '$root', rootName );

				root._isLoaded = false;
			}
		}

		if ( this.config.get( 'rootsAttributes' ) ) {
			const rootsAttributes = this.config.get( 'rootsAttributes' )!;

			for ( const [ rootName, attributes ] of Object.entries( rootsAttributes ) ) {
				if ( !this.model.document.getRoot( rootName ) ) {
					/**
					 * Trying to set attributes on a non-existing root.
					 *
					 * Roots specified in {@link module:core/editor/editorconfig~EditorConfig#rootsAttributes} do not match initial
					 * editor roots.
					 *
					 * @error multi-root-editor-root-attributes-no-root
					 */
					throw new CKEditorError( 'multi-root-editor-root-attributes-no-root', null );
				}

				for ( const key of Object.keys( attributes ) ) {
					this.registerRootAttribute( key );
				}
			}

			this.data.on( 'init', () => {
				this.model.enqueueChange( { isUndoable: false }, writer => {
					for ( const [ name, attributes ] of Object.entries( rootsAttributes ) ) {
						const root = this.model.document.getRoot( name )!;

						for ( const [ key, value ] of Object.entries( attributes ) ) {
							if ( value !== null ) {
								writer.setAttribute( key, value, root! );
							}
						}
					}
				} );
			} );
		}

		const options = {
			shouldToolbarGroupWhenFull: !this.config.get( 'toolbar.shouldNotGroupWhenFull' ),
			editableElements: sourceIsData ? undefined : sourceElementsOrData as Record<string, HTMLElement>,
			label: this.config.get( 'label' )
		};

		const view = new MultiRootEditorUIView( this.locale, this.editing.view, rootNames, options );

		this.ui = new MultiRootEditorUI( this, view );

		this.model.document.on( 'change:data', () => {
			const changedRoots = this.model.document.differ.getChangedRoots();

			// Fire detaches first. If there are multiple roots removed and added in one batch, it should be easier to handle if
			// changes aren't mixed. Detaching will usually lead to just removing DOM elements. Detaching first will lead to a clean DOM
			// when new editables are added in `addRoot` event.
			for ( const changes of changedRoots ) {
				const root = this.model.document.getRoot( changes.name )!;

				if ( changes.state == 'detached' ) {
					this.fire<DetachRootEvent>( 'detachRoot', root );
				}
			}

			for ( const changes of changedRoots ) {
				const root = this.model.document.getRoot( changes.name )!;

				if ( changes.state == 'attached' ) {
					this.fire<AddRootEvent>( 'addRoot', root );
				}
			}
		} );

		// Overwrite `Model#canEditAt()` decorated method.
		// Check if the provided selection is inside a read-only root. If so, return `false`.
		this.listenTo<ModelCanEditAtEvent>( this.model, 'canEditAt', ( evt, [ selection ] ) => {
			// Skip empty selections.
			if ( !selection ) {
				return;
			}

			let selectionInReadOnlyRoot = false;

			for ( const range of selection.getRanges() ) {
				const root = range.root as RootElement;

				if ( this._readOnlyRootLocks.has( root.rootName ) ) {
					selectionInReadOnlyRoot = true;

					break;
				}
			}

			// If selection is in read-only root, return `false` and prevent further processing.
			// Otherwise, allow for other callbacks (or default callback) to evaluate.
			if ( selectionInReadOnlyRoot ) {
				evt.return = false;
				evt.stop();
			}
		}, { priority: 'high' } );

		this.decorate( 'loadRoot' );
		this.on<LoadRootEvent>( 'loadRoot', ( evt, [ rootName ] ) => {
			const root = this.model.document.getRoot( rootName )!;

			if ( !root ) {
				/**
				 * The root to load does not exist.
				 *
				 * @error multi-root-editor-load-root-no-root
				 */
				throw new CKEditorError( 'multi-root-editor-load-root-no-root', this, { rootName } );
			}

			if ( root._isLoaded ) {
				/**
				 * The root to load was already loaded before. The `loadRoot()` call has no effect.
				 *
				 * @error multi-root-editor-load-root-already-loaded
				 */
				logWarning( 'multi-root-editor-load-root-already-loaded' );

				evt.stop();
			}
		}, { priority: 'highest' } );
	}

	/**
	 * Destroys the editor instance, releasing all resources used by it.
	 *
	 * Updates the original editor element with the data if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`}
	 * configuration option is set to `true`.
	 *
	 * **Note**: The multi-root editor does not remove the toolbar and editable when destroyed. You can
	 * do that yourself in the destruction chain, if you need to:
	 *
	 * ```ts
	 * editor.destroy().then( () => {
	 * 	// Remove the toolbar from DOM.
	 * 	editor.ui.view.toolbar.element.remove();
	 *
	 * 	// Remove editable elements from DOM.
	 * 	for ( const editable of Object.values( editor.ui.view.editables ) ) {
	 * 	    editable.element.remove();
	 * 	}
	 *
	 * 	console.log( 'Editor was destroyed' );
	 * } );
	 * ```
	 */
	public override destroy(): Promise<unknown> {
		const shouldUpdateSourceElement = this.config.get( 'updateSourceElementOnDestroy' );
		// Cache the data and editable DOM elements, then destroy.
		// It's safe to assume that the model->view conversion will not work after `super.destroy()`,
		// same as `ui.getEditableElement()` method will not return editables.
		const data: Record<string, string> = {};

		for ( const rootName of Object.keys( this.sourceElements ) ) {
			data[ rootName ] = shouldUpdateSourceElement ? this.getData( { rootName } ) : '';
		}

		this.ui.destroy();

		return super.destroy()
			.then( () => {
				for ( const rootName of Object.keys( this.sourceElements ) ) {
					setDataInElement( this.sourceElements[ rootName ], data[ rootName ] );
				}
			} );
	}

	/**
	 * Adds a new root to the editor.
	 *
	 * ```ts
	 * editor.addRoot( 'myRoot', { data: '<p>Initial root data.</p>' } );
	 * ```
	 *
	 * After a root is added, you will be able to modify and retrieve its data.
	 *
	 * All root names must be unique. An error will be thrown if you will try to create a root with the name same as
	 * an already existing, attached root. However, you can call this method for a detached root. See also {@link #detachRoot}.
	 *
	 * Whenever a root is added, the editor instance will fire {@link #event:addRoot `addRoot` event}. The event is also called when
	 * the root is added indirectly, e.g. by the undo feature or on a remote client during real-time collaboration.
	 *
	 * Note, that this method only adds a root to the editor model. It **does not** create a DOM editable element for the new root.
	 * Until such element is created (and attached to the root), the root is "virtual": it is not displayed anywhere and its data can
	 * be changed only using the editor API.
	 *
	 * To create a DOM editable element for the root, listen to {@link #event:addRoot `addRoot` event} and call {@link #createEditable}.
	 * Then, insert the DOM element in a desired place, that will depend on the integration with your application and your requirements.
	 *
	 * ```ts
	 * editor.on( 'addRoot', ( evt, root ) => {
	 * 	const editableElement = editor.createEditable( root );
	 *
	 * 	// You may want to create a more complex DOM structure here.
	 * 	//
	 * 	// Alternatively, you may want to create a DOM structure before
	 * 	// calling `editor.addRoot()` and only append `editableElement` at
	 * 	// a proper place.
	 *
	 * 	document.querySelector( '#editors' ).appendChild( editableElement );
	 * } );
	 *
	 * // ...
	 *
	 * editor.addRoot( 'myRoot' ); // Will create a root, a DOM editable element and append it to `#editors` container element.
	 * ```
	 *
	 * You can set root attributes on the new root while you add it:
	 *
	 * ```ts
	 * // Add a collapsed root at fourth position from top.
	 * // Keep in mind that these are just examples of attributes. You need to provide your own features that will handle the attributes.
	 * editor.addRoot( 'myRoot', { attributes: { isCollapsed: true, index: 4 } } );
	 * ```
	 *
	 * Note that attributes added together with a root are automatically registered.
	 *
	 * See also {@link ~MultiRootEditor#registerRootAttribute `MultiRootEditor#registerRootAttribute()`} and
	 * {@link module:core/editor/editorconfig~EditorConfig#rootsAttributes `config.rootsAttributes` configuration option}.
	 *
	 * By setting `isUndoable` flag to `true`, you can allow for detaching the root using the undo feature.
	 *
	 * Additionally, you can group adding multiple roots in one undo step. This can be useful if you add multiple roots that are
	 * combined into one, bigger UI element, and want them all to be undone together.
	 *
	 * ```ts
	 * let rowId = 0;
	 *
	 * editor.model.change( () => {
	 * 	editor.addRoot( 'left-row-' + rowId, { isUndoable: true } );
	 * 	editor.addRoot( 'center-row-' + rowId, { isUndoable: true } );
	 * 	editor.addRoot( 'right-row-' + rowId, { isUndoable: true } );
	 *
	 * 	rowId++;
	 * } );
	 * ```
	 *
	 * @param rootName Name of the root to add.
	 * @param options Additional options for the added root.
	 */
	public addRoot(
		rootName: string,
		{ data = '', attributes = {}, elementName = '$root', isUndoable = false }: AddRootOptions = {}
	): void {
		const _addRoot = ( writer: Writer ) => {
			const root = writer.addRoot( rootName, elementName );

			if ( data ) {
				writer.insert( this.data.parse( data, root ), root, 0 );
			}

			for ( const key of Object.keys( attributes ) ) {
				this.registerRootAttribute( key );
				writer.setAttribute( key, attributes[ key ], root );
			}
		};

		if ( isUndoable ) {
			this.model.change( _addRoot );
		} else {
			this.model.enqueueChange( { isUndoable: false }, _addRoot );
		}
	}

	/**
	 * Detaches a root from the editor.
	 *
	 * ```ts
	 * editor.detachRoot( 'myRoot' );
	 * ```
	 *
	 * A detached root is not entirely removed from the editor model, however it can be considered removed.
	 *
	 * After a root is detached all its children are removed, all markers inside it are removed, and whenever something is inserted to it,
	 * it is automatically removed as well. Finally, a detached root is not returned by
	 * {@link module:engine/model/document~Document#getRootNames} by default.
	 *
	 * It is possible to re-add a previously detached root calling {@link #addRoot}.
	 *
	 * Whenever a root is detached, the editor instance will fire {@link #event:detachRoot `detachRoot` event}. The event is also
	 * called when the root is detached indirectly, e.g. by the undo feature or on a remote client during real-time collaboration.
	 *
	 * Note, that this method only detached a root in the editor model. It **does not** destroy the DOM editable element linked with
	 * the root and it **does not** remove the DOM element from the DOM structure of your application.
	 *
	 * To properly remove a DOM editable element after a root was detached, listen to {@link #event:detachRoot `detachRoot` event}
	 * and call {@link #detachEditable}. Then, remove the DOM element from your application.
	 *
	 * ```ts
	 * editor.on( 'detachRoot', ( evt, root ) => {
	 * 	const editableElement = editor.detachEditable( root );
	 *
	 * 	// You may want to do an additional DOM clean-up here.
	 *
	 * 	editableElement.remove();
	 * } );
	 *
	 * // ...
	 *
	 * editor.detachRoot( 'myRoot' ); // Will detach the root, and remove the DOM editable element.
	 * ```
	 *
	 * By setting `isUndoable` flag to `true`, you can allow for re-adding the root using the undo feature.
	 *
	 * Additionally, you can group detaching multiple roots in one undo step. This can be useful if the roots are combined into one,
	 * bigger UI element, and you want them all to be re-added together.
	 *
	 * ```ts
	 * editor.model.change( () => {
	 * 	editor.detachRoot( 'left-row-3', true );
	 * 	editor.detachRoot( 'center-row-3', true );
	 * 	editor.detachRoot( 'right-row-3', true );
	 * } );
	 * ```
	 *
	 * @param rootName Name of the root to detach.
	 * @param isUndoable Whether detaching the root can be undone (using the undo feature) or not.
	 */
	public detachRoot( rootName: string, isUndoable = false ): void {
		if ( isUndoable ) {
			this.model.change( writer => writer.detachRoot( rootName ) );
		} else {
			this.model.enqueueChange( { isUndoable: false }, writer => writer.detachRoot( rootName ) );
		}
	}

	/**
	 * Creates and returns a new DOM editable element for the given root element.
	 *
	 * The new DOM editable is attached to the model root and can be used to modify the root content.
	 *
	 * @param root Root for which the editable element should be created.
	 * @param placeholder Placeholder for the editable element. If not set, placeholder value from the
	 * {@link module:core/editor/editorconfig~EditorConfig#placeholder editor configuration} will be used (if it was provided).
	 * @param label The accessible label text describing the editable to the assistive technologies.
	 * @returns The created DOM element. Append it in a desired place in your application.
	 */
	public createEditable( root: RootElement, placeholder?: string, label?: string ): HTMLElement {
		const editable = this.ui.view.createEditable( root.rootName, undefined, label );

		this.ui.addEditable( editable, placeholder );

		this.editing.view.forceRender();

		return editable.element!;
	}

	/**
	 * Detaches the DOM editable element that was attached to the given root.
	 *
	 * @param root Root for which the editable element should be detached.
	 * @returns The DOM element that was detached. You may want to remove it from your application DOM structure.
	 */
	public detachEditable( root: RootElement ): HTMLElement {
		const rootName = root.rootName;
		const editable = this.ui.view.editables[ rootName ];

		this.ui.removeEditable( editable );
		this.ui.view.removeEditable( rootName );

		return editable.element!;
	}

	/**
	 * Loads a root that has previously been declared in {@link module:core/editor/editorconfig~EditorConfig#lazyRoots `lazyRoots`}
	 * configuration option.
	 *
	 * Only roots specified in the editor config can be loaded. A root cannot be loaded multiple times. A root cannot be unloaded and
	 * loading a root cannot be reverted using the undo feature.
	 *
	 * When a root becomes loaded, it will be treated by the editor as though it was just added. This, among others, means that all
	 * related events and mechanisms will be fired, including {@link ~MultiRootEditor#event:addRoot `addRoot` event},
	 * {@link module:engine/model/document~Document#event:change `model.Document` `change` event}, model post-fixers and conversion.
	 *
	 * Until the root becomes loaded, all above mechanisms are suppressed.
	 *
	 * This method is {@link module:utils/observablemixin~Observable#decorate decorated}.
	 *
	 * Note that attributes loaded together with a root are automatically registered.
	 *
	 * See also {@link ~MultiRootEditor#registerRootAttribute `MultiRootEditor#registerRootAttribute()`} and
	 * {@link module:core/editor/editorconfig~EditorConfig#rootsAttributes `config.rootsAttributes` configuration option}.
	 *
	 * When this method is used in real-time collaboration environment, its effects become asynchronous as the editor will first synchronize
	 * with the remote editing session, before the root is added to the editor.
	 *
	 * If the root has been already loaded by any other client, the additional data passed in `loadRoot()` parameters will be ignored.
	 *
	 * @param rootName Name of the root to load.
	 * @param options Additional options for the loaded root.
	 * @fires loadRoot
	 */
	public loadRoot(
		rootName: string,
		{ data = '', attributes = {} as Record<string, unknown> }: LoadRootOptions = {}
	): void {
		// `root` will be defined as it is guaranteed by a check in a higher priority callback.
		const root = this.model.document.getRoot( rootName )!;

		this.model.enqueueChange( { isUndoable: false }, writer => {
			if ( data ) {
				writer.insert( this.data.parse( data, root ), root, 0 );
			}

			for ( const key of Object.keys( attributes ) ) {
				this.registerRootAttribute( key );

				writer.setAttribute( key, attributes[ key ], root );
			}

			root._isLoaded = true;

			this.model.document.differ._bufferRootLoad( root );
		} );
	}

	/**
	 * Returns the document data for all attached roots.
	 *
	 * @param options Additional configuration for the retrieved data.
	 * Editor features may introduce more configuration options that can be set through this parameter.
	 * @param options.trim Whether returned data should be trimmed. This option is set to `'empty'` by default,
	 * which means that whenever editor content is considered empty, an empty string is returned. To turn off trimming
	 * use `'none'`. In such cases exact content will be returned (for example `'<p>&nbsp;</p>'` for an empty editor).
	 * @returns The full document data.
	 */
	public getFullData( options?: Record<string, unknown> ): Record<string, string> {
		const data: Record<string, string> = {};

		for ( const rootName of this.model.document.getRootNames() ) {
			data[ rootName ] = this.data.get( { ...options, rootName } );
		}

		return data;
	}

	/**
	 * Returns attributes for all attached roots.
	 *
	 * Note: all and only {@link ~MultiRootEditor#registerRootAttribute registered} roots attributes will be returned.
	 * If a registered root attribute is not set for a given root, `null` will be returned.
	 *
	 * @returns Object with roots attributes. Keys are roots names, while values are attributes set on given root.
	 */
	public getRootsAttributes(): Record<string, RootAttributes> {
		const rootsAttributes: Record<string, RootAttributes> = {};

		for ( const rootName of this.model.document.getRootNames() ) {
			rootsAttributes[ rootName ] = this.getRootAttributes( rootName );
		}

		return rootsAttributes;
	}

	/**
	 * Returns attributes for the specified root.
	 *
	 * Note: all and only {@link ~MultiRootEditor#registerRootAttribute registered} roots attributes will be returned.
	 * If a registered root attribute is not set for a given root, `null` will be returned.
	 */
	public getRootAttributes( rootName: string ): RootAttributes {
		const rootAttributes: RootAttributes = {};
		const root = this.model.document.getRoot( rootName )!;

		for ( const key of this._registeredRootsAttributesKeys ) {
			rootAttributes[ key ] = root.hasAttribute( key ) ? root.getAttribute( key ) : null;
		}

		return rootAttributes;
	}

	/**
	 * Registers given string as a root attribute key. Registered root attributes are added to
	 * {@link module:engine/model/schema~Schema schema}, and also returned by
	 * {@link ~MultiRootEditor#getRootAttributes `getRootAttributes()`} and
	 * {@link ~MultiRootEditor#getRootsAttributes `getRootsAttributes()`}.
	 *
	 * Note: attributes passed in {@link module:core/editor/editorconfig~EditorConfig#rootsAttributes `config.rootsAttributes`} are
	 * automatically registered as the editor is initialized. However, registering the same attribute twice does not have any negative
	 * impact, so it is recommended to use this method in any feature that uses roots attributes.
	 */
	public registerRootAttribute( key: string ): void {
		if ( this._registeredRootsAttributesKeys.has( key ) ) {
			return;
		}

		this._registeredRootsAttributesKeys.add( key );
		this.editing.model.schema.extend( '$root', { allowAttributes: key } );
	}

	/**
	 * Switches given editor root to the read-only mode.
	 *
	 * In contrary to {@link module:core/editor/editor~Editor#enableReadOnlyMode `enableReadOnlyMode()`}, which switches the whole editor
	 * to the read-only mode, this method turns only a particular root to the read-only mode. This can be useful when you want to prevent
	 * editing only a part of the editor content.
	 *
	 * When you switch a root to the read-only mode, you need provide a unique identifier (`lockId`) that will identify this request. You
	 * will need to provide the same `lockId` when you will want to
	 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor#enableRoot re-enable} the root.
	 *
	 * ```ts
	 * const model = editor.model;
	 * const myRoot = model.document.getRoot( 'myRoot' );
	 *
	 * editor.disableRoot( 'myRoot', 'my-lock' );
	 * model.canEditAt( myRoot ); // `false`
	 *
	 * editor.disableRoot( 'myRoot', 'other-lock' );
	 * editor.disableRoot( 'myRoot', 'other-lock' ); // Multiple locks with the same ID have no effect.
	 * model.canEditAt( myRoot ); // `false`
	 *
	 * editor.enableRoot( 'myRoot', 'my-lock' );
	 * model.canEditAt( myRoot ); // `false`
	 *
	 * editor.enableRoot( 'myRoot', 'other-lock' );
	 * model.canEditAt( myRoot ); // `true`
	 * ```
	 *
	 * See also {@link module:core/editor/editor~Editor#enableReadOnlyMode `Editor#enableReadOnlyMode()`} and
	 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor#enableRoot `MultiRootEditor#enableRoot()`}.
	 *
	 * @param rootName Name of the root to switch to read-only mode.
	 * @param lockId A unique ID for setting the editor to the read-only state.
	 */
	public disableRoot( rootName: string, lockId: string | symbol ): void {
		if ( rootName == '$graveyard' ) {
			/**
			 * You cannot disable the `$graveyard` root.
			 *
			 * @error multi-root-editor-cannot-disable-graveyard-root
			 */
			throw new CKEditorError( 'multi-root-editor-cannot-disable-graveyard-root', this );
		}

		const locksForGivenRoot = this._readOnlyRootLocks.get( rootName );

		if ( locksForGivenRoot ) {
			locksForGivenRoot.add( lockId );
		} else {
			this._readOnlyRootLocks.set( rootName, new Set( [ lockId ] ) );

			const editableRootElement = this.editing.view.document.getRoot( rootName )!;

			editableRootElement.isReadOnly = true;

			// Since one of the roots has changed read-only state, we need to refresh all commands that affect data.
			Array.from( this.commands.commands() ).forEach( command => command.affectsData && command.refresh() );
		}
	}

	/**
	 * Removes given read-only lock from the given root.
	 *
	 * See {@link module:editor-multi-root/multirooteditor~MultiRootEditor#disableRoot `disableRoot()`}.
	 *
	 * @param rootName Name of the root to switch back from the read-only mode.
	 * @param lockId A unique ID for setting the editor to the read-only state.
	 */
	public enableRoot( rootName: string, lockId: string | symbol ): void {
		const locksForGivenRoot = this._readOnlyRootLocks.get( rootName );

		if ( !locksForGivenRoot || !locksForGivenRoot.has( lockId ) ) {
			return;
		}

		if ( locksForGivenRoot.size === 1 ) {
			this._readOnlyRootLocks.delete( rootName );

			const editableRootElement = this.editing.view.document.getRoot( rootName )!;

			editableRootElement.isReadOnly = this.isReadOnly;

			// Since one of the roots has changed read-only state, we need to refresh all commands that affect data.
			Array.from( this.commands.commands() ).forEach( command => command.affectsData && command.refresh() );
		} else {
			locksForGivenRoot.delete( lockId );
		}
	}

	/**
	 * Creates a new multi-root editor instance.
	 *
	 * **Note:** remember that `MultiRootEditor` does not append the toolbar element to your web page, so you have to do it manually
	 * after the editor has been initialized.
	 *
	 * There are a few different ways to initialize the multi-root editor.
	 *
	 * # Using existing DOM elements:
	 *
	 * ```ts
	 * MultiRootEditor.create( {
	 * 	intro: document.querySelector( '#editor-intro' ),
	 * 	content: document.querySelector( '#editor-content' ),
	 * 	sidePanelLeft: document.querySelector( '#editor-side-left' ),
	 * 	sidePanelRight: document.querySelector( '#editor-side-right' ),
	 * 	outro: document.querySelector( '#editor-outro' )
	 * } )
	 * .then( editor => {
	 * 	console.log( 'Editor was initialized', editor );
	 *
	 * 	// Append the toolbar inside a provided DOM element.
	 * 	document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
	 * } )
	 * .catch( err => {
	 * 	console.error( err.stack );
	 * } );
	 * ```
	 *
	 * The elements' content will be used as the editor data and elements will become editable elements.
	 *
	 * # Creating a detached editor
	 *
	 * Alternatively, you can initialize the editor by passing the initial data directly as strings.
	 * In this case, you will have to manually append both the toolbar element and the editable elements to your web page.
	 *
	 * ```ts
	 * MultiRootEditor.create( {
	 * 	intro: '<p><strong>Exciting</strong> intro text to an article.</p>',
	 * 	content: '<p>Lorem ipsum dolor sit amet.</p>',
	 * 	sidePanelLeft: '<blockquote>Strong quotation from article.</blockquote>',
	 * 	sidePanelRight: '<p>List of similar articles...</p>',
	 * 	outro: '<p>Closing text.</p>'
	 * } )
	 * .then( editor => {
	 * 	console.log( 'Editor was initialized', editor );
	 *
	 * 	// Append the toolbar inside a provided DOM element.
	 * 	document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
	 *
	 * 	// Append DOM editable elements created by the editor.
	 * 	const editables = editor.ui.view.editables;
	 * 	const container = document.querySelector( '#editable-container' );
	 *
	 * 	container.appendChild( editables.intro.element );
	 * 	container.appendChild( editables.content.element );
	 * 	container.appendChild( editables.outro.element );
	 * } )
	 * .catch( err => {
	 * 	console.error( err.stack );
	 * } );
	 * ```
	 *
	 * This lets you dynamically append the editor to your web page whenever it is convenient for you. You may use this method if your
	 * web page content is generated on the client side and the DOM structure is not ready at the moment when you initialize the editor.
	 *
	 * # Using an existing DOM element (and data provided in `config.initialData`)
	 *
	 * You can also mix these two ways by providing a DOM element to be used and passing the initial data through the configuration:
	 *
	 * ```ts
	 * MultiRootEditor.create( {
	 * 	intro: document.querySelector( '#editor-intro' ),
	 * 	content: document.querySelector( '#editor-content' ),
	 * 	sidePanelLeft: document.querySelector( '#editor-side-left' ),
	 * 	sidePanelRight: document.querySelector( '#editor-side-right' ),
	 * 	outro: document.querySelector( '#editor-outro' )
	 * }, {
	 * 	initialData: {
	 * 		intro: '<p><strong>Exciting</strong> intro text to an article.</p>',
	 * 		content: '<p>Lorem ipsum dolor sit amet.</p>',
	 * 		sidePanelLeft '<blockquote>Strong quotation from article.</blockquote>':
	 * 		sidePanelRight '<p>List of similar articles...</p>':
	 * 		outro: '<p>Closing text.</p>'
	 * 	}
	 * } )
	 * .then( editor => {
	 * 	console.log( 'Editor was initialized', editor );
	 *
	 * 	// Append the toolbar inside a provided DOM element.
	 * 	document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
	 * } )
	 * .catch( err => {
	 * 	console.error( err.stack );
	 * } );
	 * ```
	 *
	 * This method can be used to initialize the editor on an existing element with the specified content in case if your integration
	 * makes it difficult to set the content of the source element.
	 *
	 * Note that an error will be thrown if you pass the initial data both as the first parameter and also in the configuration.
	 *
	 * # Configuring the editor
	 *
	 * See the {@link module:core/editor/editorconfig~EditorConfig editor configuration documentation} to learn more about
	 * customizing plugins, toolbar and more.
	 *
	 * @param sourceElementsOrData The DOM elements that will be the source for the created editor
	 * or the editor's initial data. The editor will initialize multiple roots with names according to the keys in the passed object.
	 *
	 * If DOM elements are passed, their content will be automatically loaded to the editor upon initialization and the elements will be
	 * used as the editor's editable areas. The editor data will be set back to the original element once the editor is destroyed if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy updateSourceElementOnDestroy} option
	 * is set to `true`.
	 *
	 * If the initial data is passed, a detached editor will be created. For each entry in the passed object, one editor root and one
	 * editable DOM element will be created. You will need to attach the editable elements into the DOM manually. The elements are available
	 * through the {@link module:editor-multi-root/multirooteditorui~MultiRootEditorUI#getEditableElement `editor.ui.getEditableElement()`}
	 * method.
	 * @param config The editor configuration.
	 * @returns A promise resolved once the editor is ready. The promise resolves with the created editor instance.
	 */
	public static override create(
		sourceElementsOrData: Record<string, HTMLElement> | Record<string, string>,
		config: EditorConfig = {}
	): Promise<MultiRootEditor> {
		return new Promise( resolve => {
			for ( const sourceItem of Object.values( sourceElementsOrData ) ) {
				if ( isElement( sourceItem ) && sourceItem.tagName === 'TEXTAREA' ) {
					// Documented in core/editor/editor.js
					// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
					throw new CKEditorError( 'editor-wrong-element', null );
				}
			}

			const editor = new this( sourceElementsOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.ui.init() )
					.then( () => {
						// This is checked directly before setting the initial data,
						// as plugins may change `EditorConfig#initialData` value.
						editor._verifyRootsWithInitialData();

						return editor.data.init( editor.config.get( 'initialData' )! );
					} )
					.then( () => editor.fire<EditorReadyEvent>( 'ready' ) )
					.then( () => editor )
			);
		} );
	}

	/**
	 * @internal
	 */
	private _verifyRootsWithInitialData(): void {
		const initialData = this.config.get( 'initialData' ) as Record<string, string>;

		// Roots that are not in the initial data.
		for ( const rootName of this.model.document.getRootNames() ) {
			if ( !( rootName in initialData ) ) {
				/**
				 * Editor roots do not match the
				 * {@link module:core/editor/editorconfig~EditorConfig#initialData `initialData` configuration}.
				 *
				 * This may happen for one of the two reasons:
				 *
				 * * Configuration error. The `sourceElementsOrData` parameter in
				 * {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`} contains different
				 * roots than {@link module:core/editor/editorconfig~EditorConfig#initialData `initialData` configuration}.
				 * * As the editor was initialized, the {@link module:core/editor/editorconfig~EditorConfig#initialData `initialData`}
				 * configuration value or the state of the editor roots has been changed.
				 *
				 * @error multi-root-editor-root-initial-data-mismatch
				 */
				throw new CKEditorError( 'multi-root-editor-root-initial-data-mismatch', null );
			}
		}

		// Roots that are not in the editor.
		for ( const rootName of Object.keys( initialData ) ) {
			const root = this.model.document.getRoot( rootName );

			if ( !root || !root.isAttached() ) {
				// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
				throw new CKEditorError( 'multi-root-editor-root-initial-data-mismatch', null );
			}
		}
	}
}

function getInitialData( sourceElementOrData: HTMLElement | string ): string {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}

function isElement( value: any ): value is Element {
	return _isElement( value );
}

/**
 * Fired whenever a root is {@link ~MultiRootEditor#addRoot added or re-added} to the editor model.
 *
 * Use this event to {@link ~MultiRootEditor#createEditable create a DOM editable} for the added root and append the DOM element
 * in a desired place in your application.
 *
 * The event is fired after all changes from a given batch are applied. The event is not fired, if the root was added and detached
 * in the same batch.
 *
 * @eventName ~MultiRootEditor#addRoot
 * @param root The root that was added.
 */
export type AddRootEvent = {
	name: 'addRoot';
	args: [ root: RootElement ];
};

/**
 * Fired whenever a root is {@link ~MultiRootEditor#detachRoot detached} from the editor model.
 *
 * Use this event to {@link ~MultiRootEditor#detachEditable destroy a DOM editable} for the detached root and remove the DOM element
 * from your application.
 *
 * The event is fired after all changes from a given batch are applied. The event is not fired, if the root was detached and re-added
 * in the same batch.
 *
 * @eventName ~MultiRootEditor#detachRoot
 * @param root The root that was detached.
 */
export type DetachRootEvent = {
	name: 'detachRoot';
	args: [ root: RootElement ];
};

/**
 * Event fired when {@link ~MultiRootEditor#loadRoot} method is called.
 *
 * The {@link ~MultiRootEditor#loadRoot default action of that method} is implemented as a
 * listener to this event, so it can be fully customized by the features.
 *
 * @eventName ~MultiRootEditor#loadRoot
 * @param args The arguments passed to the original method.
 */
export type LoadRootEvent = DecoratedMethodEvent<MultiRootEditor, 'loadRoot'>;

/**
 * Additional options available when adding a root.
 */
export type AddRootOptions = {

	/**
	 * Initial data for the root.
	 */
	data?: string;

	/**
	 * Initial attributes for the root.
	 */
	attributes?: RootAttributes;

	/**
	 * Element name for the root element in the model. It can be used to set different schema rules for different roots.
	 */
	elementName?: string;

	/**
	 * Whether creating the root can be undone (using the undo feature) or not.
	 */
	isUndoable?: boolean;
};

/**
 * Additional options available when loading a root.
 */
export type LoadRootOptions = Omit<AddRootOptions, 'elementName' | 'isUndoable'>;

/**
 * Attributes set on a model root element.
 */
export type RootAttributes = Record<string, unknown>;
