/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/document
 */

import Selection from './selection';
import Renderer from './renderer';
import DomConverter from './domconverter';
import { injectQuirksHandling } from './filler';
import { injectUiElementHandling } from './uielement';
import log from '@ckeditor/ckeditor5-utils/src/log';
import MutationObserver from './observer/mutationobserver';
import SelectionObserver from './observer/selectionobserver';
import FocusObserver from './observer/focusobserver';
import KeyObserver from './observer/keyobserver';
import FakeSelectionObserver from './observer/fakeselectionobserver';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import { scrollViewportToShowTarget } from '@ckeditor/ckeditor5-utils/src/dom/scroll';

/**
 * Document class creates an abstract layer over the content editable area.
 * It combines the actual tree of view elements, tree of DOM elements,
 * {@link module:engine/view/domconverter~DomConverter DOM Converter}, {@link module:engine/view/renderer~Renderer renderer} and all
 * {@link module:engine/view/observer/observer~Observer observers}.
 *
 * If you want to only transform the tree of view elements to the DOM elements you can use the
 * {@link module:engine/view/domconverter~DomConverter DomConverter}.
 *
 * Note that the following observers are added by the class constructor and are always available:
 *
 * * {@link module:engine/view/observer/mutationobserver~MutationObserver},
 * * {@link module:engine/view/observer/selectionobserver~SelectionObserver},
 * * {@link module:engine/view/observer/focusobserver~FocusObserver},
 * * {@link module:engine/view/observer/keyobserver~KeyObserver},
 * * {@link module:engine/view/observer/fakeselectionobserver~FakeSelectionObserver}.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Document {
	/**
	 * Creates a Document instance.
	 */
	constructor() {
		/**
		 * Roots of the DOM tree. Map on the `HTMLElement`s with roots names as keys.
		 *
		 * @readonly
		 * @member {Map} module:engine/view/document~Document#domRoots
		 */
		this.domRoots = new Map();

		/**
		 * Selection done on this document.
		 *
		 * @readonly
		 * @member {module:engine/view/selection~Selection} module:engine/view/document~Document#selection
		 */
		this.selection = new Selection();

		/**
		 * Instance of the {@link module:engine/view/domconverter~DomConverter domConverter} use by
		 * {@link module:engine/view/document~Document#renderer renderer}
		 * and {@link module:engine/view/observer/observer~Observer observers}.
		 *
		 * @readonly
		 * @member {module:engine/view/domconverter~DomConverter} module:engine/view/document~Document#domConverter
		 */
		this.domConverter = new DomConverter();

		/**
		 * Roots of the view tree. Collection of the {module:engine/view/element~Element view elements}.
		 *
		 * View roots are created as a result of binding between {@link module:engine/view/document~Document#roots} and
		 * {@link module:engine/model/document~Document#roots} and this is handled by
		 * {@link module:engine/controller/editingcontroller~EditingController}, so to create view root we need to create
		 * model root using {@link module:engine/model/document~Document#createRoot}.
		 *
		 * @readonly
		 * @member {Collection} module:engine/view/document~Document#roots
		 */
		this.roots = new Collection( { idProperty: 'rootName' } );

		/**
		 * Defines whether document is in read-only mode.
		 *
		 * When document is read-ony then all roots are read-only as well and caret placed inside this root is hidden.
		 *
		 * @observable
		 * @member {Boolean} #isReadOnly
		 */
		this.set( 'isReadOnly', false );

		/**
		 * True if document is focused.
		 *
		 * This property is updated by the {@link module:engine/view/observer/focusobserver~FocusObserver}.
		 * If the {@link module:engine/view/observer/focusobserver~FocusObserver} is disabled this property will not change.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} module:engine/view/document~Document#isFocused
		 */
		this.set( 'isFocused', false );

		/**
		 * Instance of the {@link module:engine/view/document~Document#renderer renderer}.
		 *
		 * @readonly
		 * @member {module:engine/view/renderer~Renderer} module:engine/view/document~Document#renderer
		 */
		this.renderer = new Renderer( this.domConverter, this.selection );
		this.renderer.bind( 'isFocused' ).to( this );

		/**
		 * Map of registered {@link module:engine/view/observer/observer~Observer observers}.
		 *
		 * @private
		 * @member {Map.<Function, module:engine/view/observer/observer~Observer>} module:engine/view/document~Document#_observers
		 */
		this._observers = new Map();

		// Add default observers.
		this.addObserver( MutationObserver );
		this.addObserver( SelectionObserver );
		this.addObserver( FocusObserver );
		this.addObserver( KeyObserver );
		this.addObserver( FakeSelectionObserver );

		injectQuirksHandling( this );
		injectUiElementHandling( this );

		this.decorate( 'render' );
	}

	/**
	 * Creates observer of the given type if not yet created, {@link module:engine/view/observer/observer~Observer#enable enables} it
	 * and {@link module:engine/view/observer/observer~Observer#observe attaches} to all existing and future
	 * {@link module:engine/view/document~Document#domRoots DOM roots}.
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
		const viewRoot = this.getRoot( name );

		// Set view root name the same as DOM root tag name.
		viewRoot._name = domRoot.tagName.toLowerCase();

		this.domRoots.set( name, domRoot );
		this.domConverter.bindElements( domRoot, viewRoot );
		this.renderer.markToSync( 'children', viewRoot );
		this.renderer.domDocuments.add( domRoot.ownerDocument );

		viewRoot.on( 'change:children', ( evt, node ) => this.renderer.markToSync( 'children', node ) );
		viewRoot.on( 'change:attributes', ( evt, node ) => this.renderer.markToSync( 'attributes', node ) );
		viewRoot.on( 'change:text', ( evt, node ) => this.renderer.markToSync( 'text', node ) );

		for ( const observer of this._observers.values() ) {
			observer.observe( domRoot, name );
		}
	}

	/**
	 * Gets a {@link module:engine/view/document~Document#roots view root element} with the specified name. If the name is not
	 * specific "main" root is returned.
	 *
	 * @param {String} [name='main'] Name of the root.
	 * @returns {module:engine/view/rooteditableelement~RootEditableElement|null} The view root element with the specified name
	 * or null when there is no root of given name.
	 */
	getRoot( name = 'main' ) {
		return this.roots.get( name );
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
	 * Renders all changes. In order to avoid triggering the observers (e.g. mutations) all observers are disabled
	 * before rendering and re-enabled after that.
	 *
	 * @fires render
	 */
	render() {
		this.disableObservers();
		this.renderer.render();
		this.enableObservers();
	}

	/**
	 * Focuses document. It will focus {@link module:engine/view/editableelement~EditableElement EditableElement} that is currently having
	 * selection inside.
	 */
	focus() {
		if ( !this.isFocused ) {
			const editable = this.selection.editableElement;

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
	 * Scrolls the page viewport and {@link #domRoots} with their ancestors to reveal the
	 * caret, if not already visible to the user.
	 */
	scrollToTheSelection() {
		const range = this.selection.getFirstRange();

		if ( range ) {
			scrollViewportToShowTarget( {
				target: this.domConverter.viewRangeToDom( range ),
				viewportOffset: 20
			} );
		}
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
	 * Destroys all observers created by view `Document`.
	 */
	destroy() {
		for ( const observer of this._observers.values() ) {
			observer.destroy();
		}
	}
}

mix( Document, ObservableMixin );

/**
 * Enum representing type of the change.
 *
 * Possible values:
 *
 * * `children` - for child list changes,
 * * `attributes` - for element attributes changes,
 * * `text` - for text nodes changes.
 *
 * @typedef {String} module:engine/view/document~ChangeType
 */

/**
 * Fired when {@link #render render} method is called. Actual rendering is executed as a listener to
 * this event with default priority. This way other listeners can be used to run code before or after rendering.
 *
 * @event render
 */
