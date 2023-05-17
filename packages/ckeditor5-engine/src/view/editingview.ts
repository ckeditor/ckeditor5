/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/editingview
 */

import { type ViewDocumentLayoutChangedEvent } from './document';
import Renderer from './renderer';
import DomConverter from './domconverter';

import type { default as Observer, ObserverConstructor } from './observer/observer';
import type { ViewDocumentSelectionChangeEvent } from './documentselection';
import type { StylesProcessor } from './stylesmap';

import KeyObserver from './observer/keyobserver';
import FakeSelectionObserver from './observer/fakeselectionobserver';
import MutationObserver from './observer/mutationobserver';
import SelectionObserver from './observer/selectionobserver';
import FocusObserver from './observer/focusobserver';
import CompositionObserver from './observer/compositionobserver';
import InputObserver from './observer/inputobserver';
import ArrowKeysObserver from './observer/arrowkeysobserver';
import TabObserver from './observer/tabobserver';

import {
	scrollViewportToShowTarget,
	type ObservableChangeEvent, CKEditorError
} from '@ckeditor/ckeditor5-utils';
import { injectUiElementHandling } from './uielement';
import { injectQuirksHandling } from './filler';
import View, { type ViewRenderEvent } from './view';
import type DowncastWriter from './downcastwriter';

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
export default class EditingView extends View {
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
	 *
	 * @internal
	 */
	public readonly _renderer: Renderer;

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
		super( stylesProcessor );

		this.domConverter = new DomConverter( this.document );

		this.set( 'isRenderingInProgress', false );
		this.set( 'hasDomSelection', false );

		this._renderer = new Renderer( this.domConverter, this.document.selection );
		this._renderer.bind( 'isFocused', 'isSelecting', 'isComposing' )
			.to( this.document, 'isFocused', 'isSelecting', 'isComposing' );

		// Add default observers.
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
				this._writer.setAttribute( name, value, viewRoot );
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

		viewRoot.on( 'change:children', ( evt, node ) => this._renderer.markToSync( 'children', node ) );
		viewRoot.on( 'change:attributes', ( evt, node ) => this._renderer.markToSync( 'attributes', node ) );
		viewRoot.on( 'change:text', ( evt, node ) => this._renderer.markToSync( 'text', node ) );
		viewRoot.on( 'change:isReadOnly', () => this.change( updateContenteditableAttribute ) );

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
		readonly viewportOffset?: number;
		readonly ancestorOffset?: number;
		readonly alignToTop?: T;
		readonly forceScroll?: U;
	} = {} ): void {
		const range = this.document.selection.getFirstRange();

		if ( range ) {
			scrollViewportToShowTarget( {
				target: this.domConverter.viewRangeToDom( range ),
				viewportOffset,
				ancestorOffset,
				alignToTop,
				forceScroll
			} );
		}
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
		this.getObserver( FocusObserver )!.flush();
		this.change( () => {} );
	}

	/**
	 * Destroys this instance. Makes sure that all observers are destroyed and listeners removed.
	 */
	public override destroy(): void {
		for ( const observer of this._observers.values() ) {
			observer.destroy();
		}

		super.destroy();
	}

	/**
	 * TODO
	 *
	 * @internal
	 */
	public override _handleChangeBlock(): boolean {
		// This lock is used by editing controller to render changes from outer most model.change() once. As plugins might call
		// view.change() inside model.change() block - this will ensures that postfixers and rendering are called once after all
		// changes. Also, we don't need to render anything if there're no changes since last rendering.
		if ( !this._renderingDisabled && this._hasChangedSinceTheLastRendering ) {
			return super._handleChangeBlock();
		}

		return false;
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

	public override change<TReturn>( callback: ( writer: DowncastWriter ) => TReturn ): TReturn {
		if ( this.isRenderingInProgress ) {
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

		return super.change( callback );
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

type IfTrue<T> = T extends true ? true : never;
