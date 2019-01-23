/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/view
 */

import Document from './document';
import DowncastWriter from './downcastwriter';
import Renderer from './renderer';
import DomConverter from './domconverter';
import Position from './position';
import Range from './range';
import Selection from './selection';

import MutationObserver from './observer/mutationobserver';
import KeyObserver from './observer/keyobserver';
import FakeSelectionObserver from './observer/fakeselectionobserver';
import SelectionObserver from './observer/selectionobserver';
import FocusObserver from './observer/focusobserver';
import CompositionObserver from './observer/compositionobserver';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import log from '@ckeditor/ckeditor5-utils/src/log';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { scrollViewportToShowTarget } from '@ckeditor/ckeditor5-utils/src/dom/scroll';
import { injectUiElementHandling } from './uielement';
import { injectQuirksHandling } from './filler';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Editor's view controller class. Its main responsibility is DOM - View management for editing purposes, to provide
 * abstraction over the DOM structure and events and hide all browsers quirks.
 *
 * View controller renders view document to DOM whenever view structure changes. To determine when view can be rendered,
 * all changes need to be done using the {@link module:engine/view/view~View#change} method, using
 * {@link module:engine/view/downcastwriter~DowncastWriter}:
 *
 *		view.change( writer => {
 *			writer.insert( position, writer.createText( 'foo' ) );
 *		} );
 *
 * View controller also register {@link module:engine/view/observer/observer~Observer observers} which observes changes
 * on DOM and fire events on the {@link module:engine/view/document~Document Document}.
 * Note that the following observers are added by the class constructor and are always available:
 *
 * * {@link module:engine/view/observer/mutationobserver~MutationObserver},
 * * {@link module:engine/view/observer/selectionobserver~SelectionObserver},
 * * {@link module:engine/view/observer/focusobserver~FocusObserver},
 * * {@link module:engine/view/observer/keyobserver~KeyObserver},
 * * {@link module:engine/view/observer/fakeselectionobserver~FakeSelectionObserver}.
 * * {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 *
 * This class also {@link module:engine/view/view~View#attachDomRoot binds the DOM and the view elements}.
 *
 * If you do not need full a DOM - view management, and only want to transform a tree of view elements to a tree of DOM
 * elements you do not need this controller. You can use the {@link module:engine/view/domconverter~DomConverter DomConverter} instead.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class View {
	constructor() {
		/**
		 * Instance of the {@link module:engine/view/document~Document} associated with this view controller.
		 *
		 * @readonly
		 * @member {module:engine/view/document~Document} module:engine/view/view~View#document
		 */
		this.document = new Document();

		/**
		 * Instance of the {@link module:engine/view/domconverter~DomConverter domConverter} use by
		 * {@link module:engine/view/view~View#renderer renderer}
		 * and {@link module:engine/view/observer/observer~Observer observers}.
		 *
		 * @readonly
		 * @member {module:engine/view/domconverter~DomConverter} module:engine/view/view~View#domConverter
		 */
		this.domConverter = new DomConverter();

		/**
		 * Instance of the {@link module:engine/view/renderer~Renderer renderer}.
		 *
		 * @protected
		 * @member {module:engine/view/renderer~Renderer} module:engine/view/view~View#renderer
		 */
		this._renderer = new Renderer( this.domConverter, this.document.selection );
		this._renderer.bind( 'isFocused' ).to( this.document );

		/**
		 * Roots of the DOM tree. Map on the `HTMLElement`s with roots names as keys.
		 *
		 * @readonly
		 * @member {Map} module:engine/view/view~View#domRoots
		 */
		this.domRoots = new Map();

		/**
		 * Map of registered {@link module:engine/view/observer/observer~Observer observers}.
		 *
		 * @private
		 * @member {Map.<Function, module:engine/view/observer/observer~Observer>} module:engine/view/view~View#_observers
		 */
		this._observers = new Map();

		/**
		 * Is set to `true` when {@link #change view changes} are currently in progress.
		 *
		 * @private
		 * @member {Boolean} module:engine/view/view~View#_ongoingChange
		 */
		this._ongoingChange = false;

		/**
		 * Used to prevent calling {@link #render} and {@link #change} during rendering view to the DOM.
		 *
		 * @private
		 * @member {Boolean} module:engine/view/view~View#_renderingInProgress
		 */
		this._renderingInProgress = false;

		/**
		 * Used to prevent calling {@link #render} and {@link #change} during rendering view to the DOM.
		 *
		 * @private
		 * @member {Boolean} module:engine/view/view~View#_renderingInProgress
		 */
		this._postFixersInProgress = false;

		/**
		 * Internal flag to temporary disable rendering. See usage in the editing controller.
		 *
		 * @protected
		 * @member {Boolean} module:engine/view/view~View#_renderingDisabled
		 */
		this._renderingDisabled = false;

		/**
		 * DowncastWriter instance used in {@link #change change method) callbacks.
		 *
		 * @private
		 * @member {module:engine/view/downcastwriter~DowncastWriter} module:engine/view/view~View#_writer
		 */
		this._writer = new DowncastWriter( this.document );

		// Add default observers.
		this.addObserver( MutationObserver );
		this.addObserver( SelectionObserver );
		this.addObserver( FocusObserver );
		this.addObserver( KeyObserver );
		this.addObserver( FakeSelectionObserver );
		this.addObserver( CompositionObserver );

		// Inject quirks handlers.
		injectQuirksHandling( this );
		injectUiElementHandling( this );

		// Use 'normal' priority so that rendering is performed as first when using that priority.
		this.on( 'render', () => {
			this._render();

			// Informs that layout has changed after render.
			this.document.fire( 'layoutChanged' );
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
	 * @param {Element} domRoot DOM root element.
	 * @param {String} [name='main'] Name of the root.
	 */
	attachDomRoot( domRoot, name = 'main' ) {
		const viewRoot = this.document.getRoot( name );

		// Set view root name the same as DOM root tag name.
		viewRoot._name = domRoot.tagName.toLowerCase();

		// 1. Copy and cache the attributes to remember the state of the element before attaching.
		//    The cached attributes will be restored in detachDomRoot() so the element goes to the
		//    clean state as if the editing view never used it.
		// 2. Apply the attributes using the view writer, so they all go under the control of the engine.
		//    The editing view takes over the attribute management completely because various
		//    features (e.g. addPlaceholder()) require dynamic changes of those attributes and they
		//    cannot be managed by the engine and the UI library at the same time.
		for ( const { name, value } of domRoot.attributes ) {
			this._writer.setAttribute( name, viewRoot._initialDomAttributes[ name ] = value, viewRoot );
		}

		const onIsReadOnlyChange = () => {
			this._writer.setAttribute( 'contenteditable', !viewRoot.isReadOnly, viewRoot );
		};

		// Set initial values.
		onIsReadOnlyChange();

		this.domRoots.set( name, domRoot );
		this.domConverter.bindElements( domRoot, viewRoot );
		this._renderer.markToSync( 'children', viewRoot );
		this._renderer.markToSync( 'attributes', viewRoot );
		this._renderer.domDocuments.add( domRoot.ownerDocument );

		viewRoot.on( 'change:children', ( evt, node ) => this._renderer.markToSync( 'children', node ) );
		viewRoot.on( 'change:attributes', ( evt, node ) => this._renderer.markToSync( 'attributes', node ) );
		viewRoot.on( 'change:text', ( evt, node ) => this._renderer.markToSync( 'text', node ) );
		viewRoot.on( 'change:isReadOnly', () => this.change( onIsReadOnlyChange ) );

		for ( const observer of this._observers.values() ) {
			observer.observe( domRoot, name );
		}
	}

	/**
	 * Detaches a DOM root element from the view element and restores its attributes to the state before
	 * {@link #attachDomRoot `attachDomRoot()`}.
	 *
	 * @param {String} name Name of the root to detach.
	 */
	detachDomRoot( name ) {
		const domRoot = this.domRoots.get( name );
		const viewRoot = this.document.getRoot( name );

		this.change( writer => {
			// Clean-up the changes made by the change:isReadOnly listener.
			writer.removeAttribute( 'contenteditable', viewRoot );

			// Revert all view root attributes back to the state before attachDomRoot was called.
			for ( const attribute in viewRoot._initialDomAttributes ) {
				writer.setAttribute( attribute, viewRoot._initialDomAttributes[ attribute ], viewRoot );
			}
		} );

		this.domRoots.delete( name );
		this.domConverter.unbindDomElement( domRoot );
	}

	/**
	 * Gets DOM root element.
	 *
	 * @param {String} [name='main']  Name of the root.
	 * @returns {Element} DOM root element instance.
	 */
	getDomRoot( name = 'main' ) {
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
	 * @param {Function} Observer The constructor of an observer to add.
	 * Should create an instance inheriting from {@link module:engine/view/observer/observer~Observer}.
	 * @returns {module:engine/view/observer/observer~Observer} Added observer instance.
	 */
	addObserver( Observer ) {
		let observer = this._observers.get( Observer );

		if ( observer ) {
			return observer;
		}

		observer = new Observer( this );

		this._observers.set( Observer, observer );

		for ( const [ name, domElement ] of this.domRoots ) {
			observer.observe( domElement, name );
		}

		observer.enable();

		return observer;
	}

	/**
	 * Returns observer of the given type or `undefined` if such observer has not been added yet.
	 *
	 * @param {Function} Observer The constructor of an observer to get.
	 * @returns {module:engine/view/observer/observer~Observer|undefined} Observer instance or undefined.
	 */
	getObserver( Observer ) {
		return this._observers.get( Observer );
	}

	/**
	 * Disables all added observers.
	 */
	disableObservers() {
		for ( const observer of this._observers.values() ) {
			observer.disable();
		}
	}

	/**
	 * Enables all added observers.
	 */
	enableObservers() {
		for ( const observer of this._observers.values() ) {
			observer.enable();
		}
	}

	/**
	 * Scrolls the page viewport and {@link #domRoots} with their ancestors to reveal the
	 * caret, if not already visible to the user.
	 */
	scrollToTheSelection() {
		const range = this.document.selection.getFirstRange();

		if ( range ) {
			scrollViewportToShowTarget( {
				target: this.domConverter.viewRangeToDom( range ),
				viewportOffset: 20
			} );
		}
	}

	/**
	 * It will focus DOM element representing {@link module:engine/view/editableelement~EditableElement EditableElement}
	 * that is currently having selection inside.
	 */
	focus() {
		if ( !this.document.isFocused ) {
			const editable = this.document.selection.editableElement;

			if ( editable ) {
				this.domConverter.focus( editable );
				this.render();
			} else {
				/**
				 * Before focusing view document, selection should be placed inside one of the view's editables.
				 * Normally its selection will be converted from model document (which have default selection), but
				 * when using view document on its own, we need to manually place selection before focusing it.
				 *
				 * @error view-focus-no-selection
				 */
				log.warn( 'view-focus-no-selection: There is no selection in any editable to focus.' );
			}
		}
	}

	/**
	 * The `change()` method is the primary way of changing the view. You should use it to modify any node in the view tree.
	 * It makes sure that after all changes are made the view is rendered to the DOM. It prevents situations when the DOM is updated
	 * when the view state is not yet correct. It allows to nest calls one inside another and still performs a single rendering
	 * after all those changes are made. It also returns the return value of its callback.
	 *
	 *		const text = view.change( writer => {
	 *			const newText = writer.createText( 'foo' );
	 *			writer.insert( position1, newText );
	 *
	 *			view.change( writer => {
	 *				writer.insert( position2, writer.createText( 'bar' ) );
	 *			} );
	 *
	 * 			writer.remove( range );
	 *
	 * 			return newText;
	 *		} );
	 *
	 * When the outermost change block is done and rendering to the DOM is over the
	 * {@link module:engine/view/view~View#event:render `View#render`} event is fired.
	 *
	 * This method throws a `applying-view-changes-on-rendering` error when
	 * the change block is used after rendering to the DOM has started.
	 *
	 * @param {Function} callback Callback function which may modify the view.
	 * @returns {*} Value returned by the callback.
	 */
	change( callback ) {
		if ( this._renderingInProgress || this._postFixersInProgress ) {
			/**
			 * Thrown when there is an attempt to make changes to the view tree when it is in incorrect state. This may
			 * cause some unexpected behaviour and inconsistency between the DOM and the view.
			 * This may be caused by:
			 *
			 * * calling {@link #change} or {@link #render} during rendering process,
			 * * calling {@link #change} or {@link #render} inside of
			 *   {@link module:engine/view/document~Document#registerPostFixer post-fixer function}.
			 *
			 * @error cannot-change-view-tree
			 */
			throw new CKEditorError(
				'cannot-change-view-tree: ' +
				'Attempting to make changes to the view when it is in an incorrect state: rendering or post-fixers are in progress. ' +
				'This may cause some unexpected behavior and inconsistency between the DOM and the view.'
			);
		}

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
		// view.change() inside model.change() block - this will ensures that postfixers and rendering are called once after all changes.
		if ( !this._renderingDisabled ) {
			this._postFixersInProgress = true;
			this.document._callPostFixers( this._writer );
			this._postFixersInProgress = false;

			this.fire( 'render' );
		}

		return callbackResult;
	}

	/**
	 * Renders {@link module:engine/view/document~Document view document} to DOM. If any view changes are
	 * currently in progress, rendering will start after all {@link #change change blocks} are processed.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `applying-view-changes-on-rendering` when
	 * trying to re-render when rendering to DOM has already started.
	 */
	render() {
		this.change( () => {} );
	}

	/**
	 * Destroys this instance. Makes sure that all observers are destroyed and listeners removed.
	 */
	destroy() {
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
	 * @param {module:engine/view/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	createPositionAt( itemOrPosition, offset ) {
		return Position._createAt( itemOrPosition, offset );
	}

	/**
	 * Creates a new position after given view item.
	 *
	 * @param {module:engine/view/item~Item} item View item after which the position should be located.
	 * @returns {module:engine/view/position~Position}
	 */
	createPositionAfter( item ) {
		return Position._createAfter( item );
	}

	/**
	 * Creates a new position before given view item.
	 *
	 * @param {module:engine/view/item~Item} item View item before which the position should be located.
	 * @returns {module:engine/view/position~Position}
	 */
	createPositionBefore( item ) {
		return Position._createBefore( item );
	}

	/**
	 * Creates a range spanning from `start` position to `end` position.
	 *
	 * **Note:** This factory method creates it's own {@link module:engine/view/position~Position} instances basing on passed values.
	 *
	 * @param {module:engine/view/position~Position} start Start position.
	 * @param {module:engine/view/position~Position} [end] End position. If not set, range will be collapsed at `start` position.
	 * @returns {module:engine/view/range~Range}
	 */
	createRange( start, end ) {
		return new Range( start, end );
	}

	/**
	 * Creates a range that starts before given {@link module:engine/view/item~Item view item} and ends after it.
	 *
	 * @param {module:engine/view/item~Item} item
	 * @returns {module:engine/view/range~Range}
	 */
	createRangeOn( item ) {
		return Range._createOn( item );
	}

	/**
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * @param {module:engine/view/element~Element} element Element which is a parent for the range.
	 * @returns {module:engine/view/range~Range}
	 */
	createRangeIn( element ) {
		return Range._createIn( element );
	}

	/**
	 Creates new {@link module:engine/view/selection~Selection} instance.
	 *
	 * 		// Creates empty selection without ranges.
	 *		const selection = view.createSelection();
	 *
	 *		// Creates selection at the given range.
	 *		const range = view.createRange( start, end );
	 *		const selection = view.createSelection( range );
	 *
	 *		// Creates selection at the given ranges
	 * 		const ranges = [ view.createRange( start1, end2 ), view.createRange( star2, end2 ) ];
	 *		const selection = view.createSelection( ranges );
	 *
	 *		// Creates selection from the other selection.
	 *		const otherSelection = view.createSelection();
	 *		const selection = view.createSelection( otherSelection );
	 *
	 *		// Creates selection from the document selection.
	 *		const selection = view.createSelection( editor.editing.view.document.selection );
	 *
	 * 		// Creates selection at the given position.
	 *		const position = view.createPositionFromPath( root, path );
	 *		const selection = view.createSelection( position );
	 *
	 *		// Creates collapsed selection at the position of given item and offset.
	 *		const paragraph = view.createContainerElement( 'paragraph' );
	 *		const selection = view.createSelection( paragraph, offset );
	 *
	 *		// Creates a range inside an {@link module:engine/view/element~Element element} which starts before the
	 *		// first child of that element and ends after the last child of that element.
	 *		const selection = view.createSelection( paragraph, 'in' );
	 *
	 *		// Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends
	 *		// just after the item.
	 *		const selection = view.createSelection( paragraph, 'on' );
	 *
	 * `Selection`'s factory method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 *		// Creates backward selection.
	 *		const selection = view.createSelection( range, { backward: true } );
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 *		// Creates fake selection with label.
	 *		const selection = view.createSelection( range, { fake: true, label: 'foo' } );
	 *
	 * @param {module:engine/view/selection~Selectable} [selectable=null]
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Offset or place when selectable is an `Item`.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 * @param {Boolean} [options.fake] Sets this selection instance to be marked as `fake`.
	 * @param {String} [options.label] Label for the fake selection.
	 * @returns {module:engine/view/selection~Selection}
	 */
	createSelection( selectable, placeOrOffset, options ) {
		return new Selection( selectable, placeOrOffset, options );
	}

	/**
	 * Renders all changes. In order to avoid triggering the observers (e.g. mutations) all observers are disabled
	 * before rendering and re-enabled after that.
	 *
	 * @private
	 */
	_render() {
		this._renderingInProgress = true;
		this.disableObservers();
		this._renderer.render();
		this.enableObservers();
		this._renderingInProgress = false;
	}

	/**
	 * Fired after a topmost {@link module:engine/view/view~View#change change block} and all
	 * {@link module:engine/view/document~Document#registerPostFixer post-fixers} are executed.
	 *
	 * Actual rendering is performed as a first listener on 'normal' priority.
	 *
	 *		view.on( 'render', () => {
	 *			// Rendering to the DOM is complete.
	 *		} );
	 *
	 * This event is useful when you want to update interface elements after the rendering, e.g. position of the
	 * balloon panel. If you wants to change view structure use
	 * {@link module:engine/view/document~Document#registerPostFixer post-fixers}.
	 *
	 * @event module:engine/view/view~View#event:render
	 */
}

mix( View, ObservableMixin );
