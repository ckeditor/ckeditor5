/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/document
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

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import log from '@ckeditor/ckeditor5-utils/src/log';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { scrollViewportToShowTarget } from '@ckeditor/ckeditor5-utils/src/dom/scroll';
import { injectUiElementHandling } from './uielement';
import { injectQuirksHandling } from './filler';

export default class View {
	constructor() {
		this.document = new Document();
		this._writer = new Writer();

		// TODO: check docs
		// TODO: move render event description to this file.

		/**
		 * Instance of the {@link module:engine/view/domconverter~DomConverter domConverter} use by
		 * {@link module:engine/view/document~Document#renderer renderer}
		 * and {@link module:engine/view/observer/observer~Observer observers}.
		 *
		 * @readonly
		 * @member {module:engine/view/domconverter~DomConverter} module:engine/view/view~View#domConverter
		 */
		this.domConverter = new DomConverter();

		/**
		 * Instance of the {@link module:engine/view/document~Document#renderer renderer}.
		 *
		 * @readonly
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
		 * True if view is focused.
		 *
		 * This property is updated by the {@link module:engine/view/observer/focusobserver~FocusObserver}.
		 * If the {@link module:engine/view/observer/focusobserver~FocusObserver} is disabled this property will not change.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} module:engine/view/document~Document#isFocused
		 */
		this.set( 'isFocused', false );

		// Add default observers.
		this.addObserver( MutationObserver );
		this.addObserver( SelectionObserver );
		this.addObserver( FocusObserver );
		this.addObserver( KeyObserver );
		this.addObserver( FakeSelectionObserver );

		injectQuirksHandling( this );
		injectUiElementHandling( this );

		this._ongoingChange = false;
		this._renderingInProgress = false;
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
	 * Focuses document. It will focus {@link module:engine/view/editableelement~EditableElement EditableElement} that is currently having
	 * selection inside.
	 */
	focus() {
		if ( !this.document.isFocused ) {
			const editable = this.doocument.selection.editableElement;

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

	change( callback ) {
		if ( this._renderingInProgress ) {
			/**
			 * TODO: description - there might be a view change triggered during rendering process.
			 *
			 * @error applying-view-changes-on-rendering
			 */
			log.warn(
				'applying-view-changes-on-rendering: ' +
				'Attempting to make changes in the view during rendering process.' +
				'This may cause some unexpected behaviour and inconsistency between the DOM and the view.'
			);
		}

		// If other changes are in progress wait with rendering until every ongoing change is over.
		if ( this._ongoingChange ) {
			callback( this._writer );
		} else {
			this._ongoingChange = true;

			callback( this._writer );
			this._render();

			this._ongoingChange = false;

			// TODO: docs for the event.
			this.fire( 'change' );
		}
	}

	render() {
		// Render only if no ongoing changes in progress. If there are some, view document will be rendered after all
		// changes are done. This way view document will not be rendered in the middle of some changes.
		if ( !this._ongoingChange ) {
			this._render();
		}
	}

	destroy() {
		for ( const observer of this._observers.values() ) {
			observer.destroy();
		}

		this.document.destroy();
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

		this.document.disableObservers();
		this._renderer.render();
		this.document.enableObservers();

		this._renderingInProgress = false;
	}
}

mix( View, ObservableMixin );
