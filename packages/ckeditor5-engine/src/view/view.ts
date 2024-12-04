/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/view
 */

import Document, { type ViewDocumentLayoutChangedEvent } from './document.js';
import DowncastWriter from './downcastwriter.js';
import Renderer from './renderer.js';
import DomConverter from './domconverter.js';
import Position, { type PositionOffset } from './position.js';
import Range from './range.js';
import Selection, {
	type PlaceOrOffset,
	type Selectable,
	type SelectionOptions
} from './selection.js';

import type { default as Observer, ObserverConstructor } from './observer/observer.js';
import type { ViewDocumentSelectionChangeEvent } from './documentselection.js';
import type { StylesProcessor } from './stylesmap.js';
import type Element from './element.js';
import type { default as Node, ViewNodeChangeEvent } from './node.js';
import type Item from './item.js';

import KeyObserver from './observer/keyobserver.js';
import FakeSelectionObserver from './observer/fakeselectionobserver.js';
import MutationObserver, { type ViewDocumentMutationsEvent } from './observer/mutationobserver.js';
import SelectionObserver from './observer/selectionobserver.js';
import FocusObserver, { type ViewDocumentBlurEvent } from './observer/focusobserver.js';
import CompositionObserver from './observer/compositionobserver.js';
import InputObserver from './observer/inputobserver.js';
import ArrowKeysObserver from './observer/arrowkeysobserver.js';
import TabObserver from './observer/tabobserver.js';

import {
	CKEditorError,
	env,
	ObservableMixin,
	scrollViewportToShowTarget,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';
import { injectUiElementHandling } from './uielement.js';
import { injectQuirksHandling } from './filler.js';

import { cloneDeep } from 'lodash-es';

type IfTrue<T> = T extends true ? true : never;
type DomRange = globalThis.Range;

/**
 * Editor's view controller class. Its main responsibility is DOM - View management for editing purposes, to provide
 * abstraction over the DOM structure and events and hide all browsers quirks.
 *
 * View controller renders view document to DOM whenever view structure changes. To determine when view can be rendered,
 * all changes need to be done using the {@link module:engine/view/view~View#change} method, using
 * {@link module:engine/view/downcastwriter~DowncastWriter}:
 *
 * ```ts
 * view.change( writer => {
 * 	writer.insert( position, writer.createText( 'foo' ) );
 * } );
 * ```
 *
 * View controller also register {@link module:engine/view/observer/observer~Observer observers} which observes changes
 * on DOM and fire events on the {@link module:engine/view/document~Document Document}.
 * Note that the following observers are added by the class constructor and are always available:
 *
 * * {@link module:engine/view/observer/selectionobserver~SelectionObserver},
 * * {@link module:engine/view/observer/focusobserver~FocusObserver},
 * * {@link module:engine/view/observer/keyobserver~KeyObserver},
 * * {@link module:engine/view/observer/fakeselectionobserver~FakeSelectionObserver}.
 * * {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 * * {@link module:engine/view/observer/inputobserver~InputObserver}.
 * * {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver}.
 * * {@link module:engine/view/observer/tabobserver~TabObserver}.
 *
 * This class also {@link module:engine/view/view~View#attachDomRoot binds the DOM and the view elements}.
 *
 * If you do not need full a DOM - view management, and only want to transform a tree of view elements to a tree of DOM
 * elements you do not need this controller. You can use the {@link module:engine/view/domconverter~DomConverter DomConverter} instead.
 */
export default class View extends /* #__PURE__ */ ObservableMixin() {
	/**
	 * Instance of the {@link module:engine/view/document~Document} associated with this view controller.
	 */
	public readonly document: Document;

	/**
	 * Instance of the {@link module:engine/view/domconverter~DomConverter domConverter} used by
	 * {@link module:engine/view/view~View#_renderer renderer}
	 * and {@link module:engine/view/observer/observer~Observer observers}.
	 */
	public readonly domConverter: DomConverter;

	/**
	 * Roots of the DOM tree. Map on the `HTMLElement`s with roots names as keys.
	 */
	public readonly domRoots: Map<string, HTMLElement> = new Map();

	/**
	 * Used to prevent calling {@link #forceRender} and {@link #change} during rendering view to the DOM.
	 *
	 * @observable
	 * @readonly
	 */
	declare public isRenderingInProgress: boolean;

	/**
	 * Informs whether the DOM selection is inside any of the DOM roots managed by the view.
	 *
	 * @observable
	 * @readonly
	 */
	declare public hasDomSelection: boolean;

	/**
	 * Instance of the {@link module:engine/view/renderer~Renderer renderer}.
	 */
	private readonly _renderer: Renderer;

	/**
	 * A DOM root attributes cache. It saves the initial values of DOM root attributes before the DOM element
	 * is {@link module:engine/view/view~View#attachDomRoot attached} to the view so later on, when
	 * the view is destroyed ({@link module:engine/view/view~View#detachDomRoot}), they can be easily restored.
	 * This way, the DOM element can go back to the (clean) state as if the editing view never used it.
	 */
	private readonly _initialDomRootAttributes: WeakMap<HTMLElement, Record<string, string>> = new WeakMap();

	/**
	 * Map of registered {@link module:engine/view/observer/observer~Observer observers}.
	 */
	private readonly _observers: Map<ObserverConstructor, Observer> = new Map();

	/**
	 * DowncastWriter instance used in {@link #change change method} callbacks.
	 */
	private readonly _writer: DowncastWriter;

	/**
	 * Is set to `true` when {@link #change view changes} are currently in progress.
	 */
	private _ongoingChange: boolean = false;

	/**
	 * Used to prevent calling {@link #forceRender} and {@link #change} during rendering view to the DOM.
	 */
	private _postFixersInProgress: boolean = false;

	/**
	 * Internal flag to temporary disable rendering. See the usage in the {@link #_disableRendering}.
	 */
	private _renderingDisabled: boolean = false;

	/**
	 * Internal flag that disables rendering when there are no changes since the last rendering.
	 * It stores information about changed selection and changed elements from attached document roots.
	 */
	private _hasChangedSinceTheLastRendering: boolean = false;

	/**
	 * @param stylesProcessor The styles processor instance.
	 */
	constructor( stylesProcessor: StylesProcessor ) {
		super();

		this.document = new Document( stylesProcessor );
		this.domConverter = new DomConverter( this.document );

		this.set( 'isRenderingInProgress', false );
		this.set( 'hasDomSelection', false );

		this._renderer = new Renderer( this.domConverter, this.document.selection );
		this._renderer.bind( 'isFocused', 'isSelecting', 'isComposing' )
			.to( this.document, 'isFocused', 'isSelecting', 'isComposing' );

		this._writer = new DowncastWriter( this.document );

		// Add default observers.
		// Make sure that this list matches AlwaysRegisteredObservers type.
		this.addObserver( MutationObserver );
		this.addObserver( FocusObserver );
		this.addObserver( SelectionObserver );
		this.addObserver( KeyObserver );
		this.addObserver( FakeSelectionObserver );
		this.addObserver( CompositionObserver );
		this.addObserver( ArrowKeysObserver );
		this.addObserver( InputObserver );
		this.addObserver( TabObserver );

		// Inject quirks handlers.
		injectQuirksHandling( this );
		injectUiElementHandling( this );

		// Use 'normal' priority so that rendering is performed as first when using that priority.
		this.on<ViewRenderEvent>( 'render', () => {
			this._render();

			// Informs that layout has changed after render.
			this.document.fire<ViewDocumentLayoutChangedEvent>( 'layoutChanged' );

			// Reset the `_hasChangedSinceTheLastRendering` flag after rendering.
			this._hasChangedSinceTheLastRendering = false;
		} );

		// Listen to the document selection changes directly.
		this.listenTo<ViewDocumentSelectionChangeEvent>( this.document.selection, 'change', () => {
			this._hasChangedSinceTheLastRendering = true;
		} );

		// Trigger re-render if only the focus changed.
		this.listenTo<ObservableChangeEvent>( this.document, 'change:isFocused', () => {
			this._hasChangedSinceTheLastRendering = true;
		} );

		// Remove ranges from DOM selection if editor is blurred.
		// See https://github.com/ckeditor/ckeditor5/issues/5753.
		if ( env.isiOS ) {
			this.listenTo<ViewDocumentBlurEvent>( this.document, 'blur', ( evt, data ) => {
				const relatedViewElement = this.domConverter.mapDomToView( data.domEvent.relatedTarget as HTMLElement );

				// Do not modify DOM selection if focus is moved to other editable of the same editor.
				if ( !relatedViewElement ) {
					this.domConverter._clearDomSelection();
				}
			} );
		}

		// Listen to external content mutations (directly in the DOM) and mark them to get verified by the renderer.
		this.listenTo<ViewDocumentMutationsEvent>( this.document, 'mutations', ( evt, { mutations } ) => {
			mutations.forEach( mutation => this._renderer.markToSync( mutation.type, mutation.node ) );
		}, { priority: 'low' } );

		// After all mutated nodes were marked to sync we can trigger view to DOM synchronization
		// to make sure the DOM structure matches the view.
		this.listenTo<ViewDocumentMutationsEvent>( this.document, 'mutations', () => {
			this.forceRender();
		}, { priority: 'lowest' } );
	}

	/**
	 * Attaches a DOM root element to the view element and enable all observers on that element.
	 * Also {@link module:engine/view/renderer~Renderer#markToSync mark element} to be synchronized
	 * with the view what means that all child nodes will be removed and replaced with content of the view root.
	 *
	 * This method also will change view element name as the same as tag name of given dom root.
	 * Name is always transformed to lower case.
	 *
	 * **Note:** Use {@link #detachDomRoot `detachDomRoot()`} to revert this action.
	 *
	 * @param domRoot DOM root element.
	 * @param name Name of the root.
	 */
	public attachDomRoot( domRoot: HTMLElement, name: string = 'main' ): void {
		const viewRoot = this.document.getRoot( name )!;

		// Set view root name the same as DOM root tag name.
		viewRoot._name = domRoot.tagName.toLowerCase();

		const initialDomRootAttributes: Record<string, string> = {};

		// 1. Copy and cache the attributes to remember the state of the element before attaching.
		//    The cached attributes will be restored in detachDomRoot() so the element goes to the
		//    clean state as if the editing view never used it.
		// 2. Apply the attributes using the view writer, so they all go under the control of the engine.
		//    The editing view takes over the attribute management completely because various
		//    features (e.g. addPlaceholder()) require dynamic changes of those attributes and they
		//    cannot be managed by the engine and the UI library at the same time.
		for ( const { name, value } of Array.from( domRoot.attributes ) ) {
			initialDomRootAttributes[ name ] = value;

			// Do not use writer.setAttribute() for the class attribute. The EditableUIView class
			// and its descendants could have already set some using the writer.addClass() on the view
			// document root. They haven't been rendered yet so they are not present in the DOM root.
			// Using writer.setAttribute( 'class', ... ) would override them completely.
			if ( name === 'class' ) {
				this._writer.addClass( value.split( ' ' ), viewRoot );
			} else {
				// There is a chance that some attributes have already been set on the view root before attaching
				// the DOM root and should be preserved. This is a similar case to the "class" attribute except
				// this time there is no workaround using a some low-level API.
				if ( !viewRoot.hasAttribute( name ) ) {
					this._writer.setAttribute( name, value, viewRoot );
				}
			}
		}

		this._initialDomRootAttributes.set( domRoot, initialDomRootAttributes );

		const updateContenteditableAttribute = () => {
			this._writer.setAttribute( 'contenteditable', ( !viewRoot.isReadOnly ).toString(), viewRoot );

			if ( viewRoot.isReadOnly ) {
				this._writer.addClass( 'ck-read-only', viewRoot );
			} else {
				this._writer.removeClass( 'ck-read-only', viewRoot );
			}
		};

		// Set initial value.
		updateContenteditableAttribute();

		this.domRoots.set( name, domRoot );
		this.domConverter.bindElements( domRoot, viewRoot );
		this._renderer.markToSync( 'children', viewRoot );
		this._renderer.markToSync( 'attributes', viewRoot );
		this._renderer.domDocuments.add( domRoot.ownerDocument );

		viewRoot.on<ViewNodeChangeEvent>( 'change:children', ( evt, node ) => this._renderer.markToSync( 'children', node ) );
		viewRoot.on<ViewNodeChangeEvent>( 'change:attributes', ( evt, node ) => this._renderer.markToSync( 'attributes', node ) );
		viewRoot.on<ViewNodeChangeEvent>( 'change:text', ( evt, node ) => this._renderer.markToSync( 'text', node ) );
		viewRoot.on<ObservableChangeEvent>( 'change:isReadOnly', () => this.change( updateContenteditableAttribute ) );

		viewRoot.on( 'change', () => {
			this._hasChangedSinceTheLastRendering = true;
		} );

		for ( const observer of this._observers.values() ) {
			observer.observe( domRoot, name );
		}
	}

	/**
	 * Detaches a DOM root element from the view element and restores its attributes to the state before
	 * {@link #attachDomRoot `attachDomRoot()`}.
	 *
	 * @param name Name of the root to detach.
	 */
	public detachDomRoot( name: string ): void {
		const domRoot = this.domRoots.get( name )!;

		// Remove all root attributes so the DOM element is "bare".
		Array.from( domRoot.attributes ).forEach( ( { name } ) => domRoot.removeAttribute( name ) );

		const initialDomRootAttributes = this._initialDomRootAttributes.get( domRoot );

		// Revert all view root attributes back to the state before attachDomRoot was called.
		for ( const attribute in initialDomRootAttributes ) {
			domRoot.setAttribute( attribute, initialDomRootAttributes[ attribute ] );
		}

		this.domRoots.delete( name );
		this.domConverter.unbindDomElement( domRoot );

		for ( const observer of this._observers.values() ) {
			observer.stopObserving( domRoot );
		}
	}

	/**
	 * Gets DOM root element.
	 *
	 * @param name  Name of the root.
	 * @returns DOM root element instance.
	 */
	public getDomRoot( name: string = 'main' ): HTMLElement | undefined {
		return this.domRoots.get( name );
	}

	/**
	 * Creates observer of the given type if not yet created, {@link module:engine/view/observer/observer~Observer#enable enables} it
	 * and {@link module:engine/view/observer/observer~Observer#observe attaches} to all existing and future
	 * {@link #domRoots DOM roots}.
	 *
	 * Note: Observers are recognized by their constructor (classes). A single observer will be instantiated and used only
	 * when registered for the first time. This means that features and other components can register a single observer
	 * multiple times without caring whether it has been already added or not.
	 *
	 * @param ObserverConstructor The constructor of an observer to add.
	 * Should create an instance inheriting from {@link module:engine/view/observer/observer~Observer}.
	 * @returns Added observer instance.
	 */
	public addObserver( ObserverConstructor: ObserverConstructor ): Observer {
		let observer = this._observers.get( ObserverConstructor );

		if ( observer ) {
			return observer;
		}

		observer = new ObserverConstructor( this );

		this._observers.set( ObserverConstructor, observer );

		for ( const [ name, domElement ] of this.domRoots ) {
			observer.observe( domElement, name );
		}

		observer.enable();

		return observer;
	}

	public getObserver<T extends ObserverConstructor>( ObserverConstructor: T ):
		T extends AlwaysRegisteredObservers ? InstanceType<T> : InstanceType<T> | undefined;

	/**
	 * Returns observer of the given type or `undefined` if such observer has not been added yet.
	 *
	 * @param ObserverConstructor The constructor of an observer to get.
	 * @returns Observer instance or undefined.
	 */
	public getObserver<T extends ObserverConstructor>( ObserverConstructor: T ): InstanceType<T> | undefined {
		return this._observers.get( ObserverConstructor ) as ( InstanceType<T> | undefined );
	}

	/**
	 * Disables all added observers.
	 */
	public disableObservers(): void {
		for ( const observer of this._observers.values() ) {
			observer.disable();
		}
	}

	/**
	 * Enables all added observers.
	 */
	public enableObservers(): void {
		for ( const observer of this._observers.values() ) {
			observer.enable();
		}
	}

	/**
	 * Scrolls the page viewport and {@link #domRoots} with their ancestors to reveal the
	 * caret, **if not already visible to the user**.
	 *
	 * **Note**: Calling this method fires the {@link module:engine/view/view~ViewScrollToTheSelectionEvent} event that
	 * allows custom behaviors.
	 *
	 * @param options Additional configuration of the scrolling behavior.
	 * @param options.viewportOffset A distance between the DOM selection and the viewport boundary to be maintained
	 * while scrolling to the selection (default is 20px). Setting this value to `0` will reveal the selection precisely at
	 * the viewport boundary.
	 * @param options.ancestorOffset A distance between the DOM selection and scrollable DOM root ancestor(s) to be maintained
	 * while scrolling to the selection (default is 20px). Setting this value to `0` will reveal the selection precisely at
	 * the scrollable ancestor(s) boundary.
	 * @param options.alignToTop When set `true`, the DOM selection will be aligned to the top of the viewport if not already visible
	 * (see `forceScroll` to learn more).
	 * @param options.forceScroll When set `true`, the DOM selection will be aligned to the top of the viewport and scrollable ancestors
	 * whether it is already visible or not. This option will only work when `alignToTop` is `true`.
	 */
	public scrollToTheSelection<T extends boolean, U extends IfTrue<T>>( {
		alignToTop,
		forceScroll,
		viewportOffset = 20,
		ancestorOffset = 20
	}: {
		readonly viewportOffset?: number | { top: number; bottom: number; left: number; right: number };
		readonly ancestorOffset?: number;
		readonly alignToTop?: T;
		readonly forceScroll?: U;
	} = {} ): void {
		const range = this.document.selection.getFirstRange();

		if ( !range ) {
			return;
		}

		// Clone to make sure properties like `viewportOffset` are not mutated in the event listeners.
		const originalArgs = cloneDeep( { alignToTop, forceScroll, viewportOffset, ancestorOffset } );

		if ( typeof viewportOffset === 'number' ) {
			viewportOffset = {
				top: viewportOffset,
				bottom: viewportOffset,
				left: viewportOffset,
				right: viewportOffset
			};
		}

		const options = {
			target: this.domConverter.viewRangeToDom( range ),
			viewportOffset,
			ancestorOffset,
			alignToTop,
			forceScroll
		};

		this.fire<ViewScrollToTheSelectionEvent>( 'scrollToTheSelection', options, originalArgs );

		scrollViewportToShowTarget( options );
	}

	/**
	 * It will focus DOM element representing {@link module:engine/view/editableelement~EditableElement EditableElement}
	 * that is currently having selection inside.
	 */
	public focus(): void {
		if ( !this.document.isFocused ) {
			const editable = this.document.selection.editableElement;

			if ( editable ) {
				this.domConverter.focus( editable );
				this.forceRender();
			} else {
				// Before focusing view document, selection should be placed inside one of the view's editables.
				// Normally its selection will be converted from model document (which have default selection), but
				// when using view document on its own, we need to manually place selection before focusing it.
				//
				// @if CK_DEBUG // console.warn( 'There is no selection in any editable to focus.' );
			}
		}
	}

	/**
	 * The `change()` method is the primary way of changing the view. You should use it to modify any node in the view tree.
	 * It makes sure that after all changes are made the view is rendered to the DOM (assuming that the view will be changed
	 * inside the callback). It prevents situations when the DOM is updated when the view state is not yet correct. It allows
	 * to nest calls one inside another and still performs a single rendering after all those changes are made.
	 * It also returns the return value of its callback.
	 *
	 * ```ts
	 * const text = view.change( writer => {
	 * 	const newText = writer.createText( 'foo' );
	 * 	writer.insert( position1, newText );
	 *
	 * 	view.change( writer => {
	 * 		writer.insert( position2, writer.createText( 'bar' ) );
	 * 	} );
	 *
	 * 	writer.remove( range );
	 *
	 * 	return newText;
	 * } );
	 * ```
	 *
	 * When the outermost change block is done and rendering to the DOM is over the
	 * {@link module:engine/view/view~View#event:render `View#render`} event is fired.
	 *
	 * This method throws a `applying-view-changes-on-rendering` error when
	 * the change block is used after rendering to the DOM has started.
	 *
	 * @param callback Callback function which may modify the view.
	 * @returns Value returned by the callback.
	 */
	public change<TReturn>( callback: ( writer: DowncastWriter ) => TReturn ): TReturn {
		if ( this.isRenderingInProgress || this._postFixersInProgress ) {
			/**
			 * Thrown when there is an attempt to make changes to the view tree when it is in incorrect state. This may
			 * cause some unexpected behaviour and inconsistency between the DOM and the view.
			 * This may be caused by:
			 *
			 * * calling {@link module:engine/view/view~View#change} or {@link module:engine/view/view~View#forceRender} during rendering
			 * process,
			 * * calling {@link module:engine/view/view~View#change} or {@link module:engine/view/view~View#forceRender} inside of
			 *   {@link module:engine/view/document~Document#registerPostFixer post-fixer function}.
			 *
			 * @error cannot-change-view-tree
			 */
			throw new CKEditorError(
				'cannot-change-view-tree',
				this
			);
		}

		try {
			// Recursive call to view.change() method - execute listener immediately.
			if ( this._ongoingChange ) {
				return callback( this._writer );
			}

			// This lock will assure that all recursive calls to view.change() will end up in same block - one "render"
			// event for all nested calls.
			this._ongoingChange = true;
			const callbackResult = callback( this._writer );
			this._ongoingChange = false;

			// This lock is used by editing controller to render changes from outer most model.change() once. As plugins might call
			// view.change() inside model.change() block - this will ensures that postfixers and rendering are called once after all
			// changes. Also, we don't need to render anything if there're no changes since last rendering.
			if ( !this._renderingDisabled && this._hasChangedSinceTheLastRendering ) {
				this._postFixersInProgress = true;
				this.document._callPostFixers( this._writer );
				this._postFixersInProgress = false;

				this.fire<ViewRenderEvent>( 'render' );
			}

			return callbackResult;
		} catch ( err: any ) {
			// @if CK_DEBUG // throw err;
			/* istanbul ignore next -- @preserve */
			CKEditorError.rethrowUnexpectedError( err, this );
		}
	}

	/**
	 * Forces rendering {@link module:engine/view/document~Document view document} to DOM. If any view changes are
	 * currently in progress, rendering will start after all {@link #change change blocks} are processed.
	 *
	 * Note that this method is dedicated for special cases. All view changes should be wrapped in the {@link #change}
	 * block and the view will automatically check whether it needs to render DOM or not.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `applying-view-changes-on-rendering` when
	 * trying to re-render when rendering to DOM has already started.
	 */
	public forceRender(): void {
		this._hasChangedSinceTheLastRendering = true;
		this.getObserver( FocusObserver ).flush();
		this.change( () => {} );
	}

	/**
	 * Destroys this instance. Makes sure that all observers are destroyed and listeners removed.
	 */
	public destroy(): void {
		for ( const observer of this._observers.values() ) {
			observer.destroy();
		}

		this.document.destroy();

		this.stopListening();
	}

	/**
	 * Creates position at the given location. The location can be specified as:
	 *
	 * * a {@link module:engine/view/position~Position position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'end'` (sets position at the end of that element),
	 * * {@link module:engine/view/item~Item view item} and `'before'` or `'after'` (sets position before or after given view item).
	 *
	 * This method is a shortcut to other constructors such as:
	 *
	 * * {@link #createPositionBefore},
	 * * {@link #createPositionAfter},
	 *
	 * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	public createPositionAt( itemOrPosition: Item | Position, offset?: PositionOffset ): Position {
		return Position._createAt( itemOrPosition, offset );
	}

	/**
	 * Creates a new position after given view item.
	 *
	 * @param item View item after which the position should be located.
	 */
	public createPositionAfter( item: Item ): Position {
		return Position._createAfter( item );
	}

	/**
	 * Creates a new position before given view item.
	 *
	 * @param item View item before which the position should be located.
	 */
	public createPositionBefore( item: Item ): Position {
		return Position._createBefore( item );
	}

	/**
	 * Creates a range spanning from `start` position to `end` position.
	 *
	 * **Note:** This factory method creates it's own {@link module:engine/view/position~Position} instances basing on passed values.
	 *
	 * @param start Start position.
	 * @param end End position. If not set, range will be collapsed at `start` position.
	 */
	public createRange( start: Position, end?: Position | null ): Range {
		return new Range( start, end );
	}

	/**
	 * Creates a range that starts before given {@link module:engine/view/item~Item view item} and ends after it.
	 */
	public createRangeOn( item: Item ): Range {
		return Range._createOn( item );
	}

	/**
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * @param element Element which is a parent for the range.
	 */
	public createRangeIn( element: Element ): Range {
		return Range._createIn( element );
	}

	/**
	 * Creates new {@link module:engine/view/selection~Selection} instance.
	 *
	 * ```ts
	 * // Creates collapsed selection at the position of given item and offset.
	 * const paragraph = view.createContainerElement( 'paragraph' );
	 * const selection = view.createSelection( paragraph, offset );
	 *
	 * // Creates a range inside an {@link module:engine/view/element~Element element} which starts before the
	 * // first child of that element and ends after the last child of that element.
	 * const selection = view.createSelection( paragraph, 'in' );
	 *
	 * // Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends
	 * // just after the item.
	 * const selection = view.createSelection( paragraph, 'on' );
	 * ```
	 *
	 * `Selection`'s factory method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 * ```ts
	 * // Creates backward selection.
	 * const selection = view.createSelection( paragraph, 'in', { backward: true } );
	 * ```
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 * ```ts
	 * // Creates fake selection with label.
	 * const selection = view.createSelection( element, 'in', { fake: true, label: 'foo' } );
	 * ```
	 *
	 * See also: {@link #createSelection:SELECTABLE `createSelection( selectable, options )`}.
	 *
	 * @label NODE_OFFSET
	 */
	public createSelection( selectable: Node, placeOrOffset: PlaceOrOffset, options?: SelectionOptions ): Selection;

	/**
	 * Creates new {@link module:engine/view/selection~Selection} instance.
	 *
	 * ```ts
	 * // Creates empty selection without ranges.
	 * const selection = view.createSelection();
	 *
	 * // Creates selection at the given range.
	 * const range = view.createRange( start, end );
	 * const selection = view.createSelection( range );
	 *
	 * // Creates selection at the given ranges
	 * const ranges = [ view.createRange( start1, end2 ), view.createRange( star2, end2 ) ];
	 * const selection = view.createSelection( ranges );
	 *
	 * // Creates selection from the other selection.
	 * const otherSelection = view.createSelection();
	 * const selection = view.createSelection( otherSelection );
	 *
	 * // Creates selection from the document selection.
	 * const selection = view.createSelection( editor.editing.view.document.selection );
	 *
	 * // Creates selection at the given position.
	 * const position = view.createPositionFromPath( root, path );
	 * const selection = view.createSelection( position );
	 * ```
	 *
	 * `Selection`'s factory method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 * ```ts
	 * // Creates backward selection.
	 * const selection = view.createSelection( range, { backward: true } );
	 * ```
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 * ```ts
	 * // Creates fake selection with label.
	 * const selection = view.createSelection( range, { fake: true, label: 'foo' } );
	 * ```
	 *
	 * See also: {@link #createSelection:NODE_OFFSET `createSelection( node, placeOrOffset, options )`}.
	 *
	 * @label SELECTABLE
	 */
	public createSelection( selectable?: Exclude<Selectable, Node>, options?: SelectionOptions ): Selection;

	public createSelection( ...args: ConstructorParameters<typeof Selection> ): Selection {
		return new Selection( ...args );
	}

	/**
	 * Disables or enables rendering. If the flag is set to `true` then the rendering will be disabled.
	 * If the flag is set to `false` and if there was some change in the meantime, then the rendering action will be performed.
	 *
	 * @internal
	 * @param flag A flag indicates whether the rendering should be disabled.
	 */
	public _disableRendering( flag: boolean ): void {
		this._renderingDisabled = flag;

		if ( flag == false ) {
			// Render when you stop blocking rendering.
			this.change( () => {} );
		}
	}

	/**
	 * Renders all changes. In order to avoid triggering the observers (e.g. selection) all observers are disabled
	 * before rendering and re-enabled after that.
	 */
	private _render(): void {
		this.isRenderingInProgress = true;
		this.disableObservers();
		this._renderer.render();
		this.enableObservers();
		this.isRenderingInProgress = false;
	}
}

/**
 * Fired after a topmost {@link module:engine/view/view~View#change change block} and all
 * {@link module:engine/view/document~Document#registerPostFixer post-fixers} are executed.
 *
 * Actual rendering is performed as a first listener on 'normal' priority.
 *
 * ```ts
 * view.on( 'render', () => {
 * 	// Rendering to the DOM is complete.
 * } );
 * ```
 *
 * This event is useful when you want to update interface elements after the rendering, e.g. position of the
 * balloon panel. If you wants to change view structure use
 * {@link module:engine/view/document~Document#registerPostFixer post-fixers}.
 *
 * @eventName ~View#render
 */
export type ViewRenderEvent = {
	name: 'render';
	args: [];
};

/**
 * An event fired at the moment of {@link module:engine/view/view~View#scrollToTheSelection} being called. It
 * carries two objects in its payload (`args`):
 *
 * * The first argument is the {@link module:engine/view/view~ViewScrollToTheSelectionEventData object containing data} that gets
 *   passed down to the {@link module:utils/dom/scroll~scrollViewportToShowTarget} helper. If some event listener modifies it, it can
 *   adjust the behavior of the scrolling (e.g. include additional `viewportOffset`).
 * * The second argument corresponds to the original arguments passed to {@link module:utils/dom/scroll~scrollViewportToShowTarget}.
 *   It allows listeners to re-execute the `scrollViewportToShowTarget()` method with its original arguments if there is such a need,
 *   for instance, if the integration requires re–scrolling after certain interaction.
 *
 * @eventName ~View#scrollToTheSelection
 */
export type ViewScrollToTheSelectionEvent = {
	name: 'scrollToTheSelection';
	args: [
		ViewScrollToTheSelectionEventData,
		Parameters<View[ 'scrollToTheSelection' ]>[ 0 ]
	];
};

/**
 * An object passed down to the {@link module:utils/dom/scroll~scrollViewportToShowTarget} helper while calling
 * {@link module:engine/view/view~View#scrollToTheSelection}.
 */
export type ViewScrollToTheSelectionEventData = {
	target: DomRange;
	viewportOffset: { top: number; bottom: number; left: number; right: number };
	ancestorOffset: number;
	alignToTop?: boolean;
	forceScroll?: boolean;
};

/**
 * Observers that are always registered.
 */
export type AlwaysRegisteredObservers =
	| typeof MutationObserver
	| typeof FocusObserver
	| typeof SelectionObserver
	| typeof KeyObserver
	| typeof FakeSelectionObserver
	| typeof CompositionObserver
	| typeof ArrowKeysObserver
	| typeof InputObserver
	| typeof TabObserver;
