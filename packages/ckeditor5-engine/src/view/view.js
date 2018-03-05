/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/view
 */

import Document from './document';
import Writer from './writer';
import Renderer from './renderer';
import DomConverter from './domconverter';

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
 * {@link module:engine/view/writer~Writer}:
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
 * This class also {@link module:engine/view/view~View#attachDomRoot bind DOM and View elements}.
 *
 * If you do not need full DOM - View management, and want to only transform the tree of view elements to the DOM
 * elements you do not need this controller, you can use the {@link module:engine/view/domconverter~DomConverter DomConverter}.
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
		 * Writer instance used in {@link #change change method) callbacks.
		 *
		 * @private
		 * @member {module:engine/view/writer~Writer} module:engine/view/view~View#_writer
		 */
		this._writer = new Writer( this.document );

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
		} );
	}

	/**
	 * Attaches DOM root element to the view element and enable all observers on that element.
	 * Also {@link module:engine/view/renderer~Renderer#markToSync mark element} to be synchronized with the view
	 * what means that all child nodes will be removed and replaced with content of the view root.
	 *
	 * This method also will change view element name as the same as tag name of given dom root.
	 * Name is always transformed to lower case.
	 *
	 * @param {Element} domRoot DOM root element.
	 * @param {String} [name='main'] Name of the root.
	 */
	attachDomRoot( domRoot, name = 'main' ) {
		const viewRoot = this.document.getRoot( name );

		// Set view root name the same as DOM root tag name.
		viewRoot._name = domRoot.tagName.toLowerCase();

		this.domRoots.set( name, domRoot );
		this.domConverter.bindElements( domRoot, viewRoot );
		this._renderer.markToSync( 'children', viewRoot );
		this._renderer.domDocuments.add( domRoot.ownerDocument );

		viewRoot.on( 'change:children', ( evt, node ) => this._renderer.markToSync( 'children', node ) );
		viewRoot.on( 'change:attributes', ( evt, node ) => this._renderer.markToSync( 'attributes', node ) );
		viewRoot.on( 'change:text', ( evt, node ) => this._renderer.markToSync( 'text', node ) );

		for ( const observer of this._observers.values() ) {
			observer.observe( domRoot, name );
		}
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
	 * Change method is the primary way of changing the view. You should use it to modify any node in the view tree.
	 * It makes sure that after all changes are made view is rendered to DOM. It prevents situations when DOM is updated
	 * when view state is not yet correct. It allows to nest calls one inside another and still perform single rendering
	 * after all changes are applied.
	 *
	 *		view.change( writer => {
	 *			writer.insert( position1, writer.createText( 'foo' ) );
	 *
	 *			view.change( writer => {
	 *				writer.insert( position2, writer.createText( 'bar' ) );
	 *			} );
	 *
	 * 			writer.remove( range );
	 *		} );
	 *
	 * Change block is executed immediately.
	 *
	 * When the outermost change block is done and rendering to DOM is over it fires
	 * {@link module:engine/view/view~View#event:render} event.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `applying-view-changes-on-rendering` when
	 * change block is used after rendering to DOM has started.
	 *
	 * @param {Function} callback Callback function which may modify the view.
	 */
	change( callback ) {
		if ( this._renderingInProgress || this._postFixersInProgress ) {
			/**
			 * Thrown when there is an attempt to make changes to the view tree when it is in incorrect state. This may
			 * cause some unexpected behaviour and inconsistency between the DOM and the view.
			 * This may be caused by:
			 *   * calling {@link #change} or {@link #render} during rendering process,
			 *   * calling {@link #change} or {@link #render} inside of
			 *   {@link module:engine/view/document~Document#registerPostFixer post fixer function}.
			 */
			throw new CKEditorError(
				'cannot-change-view-tree: ' +
				'Attempting to make changes to the view when it is in incorrect state: rendering or post fixers are in progress. ' +
				'This may cause some unexpected behaviour and inconsistency between the DOM and the view.'
			);
		}

		// Recursive call to view.change() method - execute listener immediately.
		if ( this._ongoingChange ) {
			callback( this._writer );

			return;
		}

		// This lock will assure that all recursive calls to view.change() will end up in same block - one "render"
		// event for all nested calls.
		this._ongoingChange = true;
		callback( this._writer );
		this._ongoingChange = false;

		// Execute all document post fixers after the change.
		this._postFixersInProgress = true;
		this.document._callPostFixers( this._writer );
		this._postFixersInProgress = false;

		this.fire( 'render' );
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

		this.stopListening();
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
	 * {@link module:engine/view/document~Document#registerPostFixer post fixers} are executed.
	 *
	 * Actual rendering is performed as a first listener on 'normal' priority.
	 *
	 *		view.on( 'render', () => {
	 *			// Rendering to the DOM is complete.
	 *		} );
	 *
	 * This event is useful when you want to update interface elements after the rendering, e.g. position of the
	 * balloon panel. If you wants to change view structure use
	 * {@link module:engine/view/document~Document#registerPostFixer post fixers}.
	 *
	 * @event module:engine/view/view~View#event:render
	 */
}

mix( View, ObservableMixin );
