/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EmitterMixin from '../../utils/emittermixin.js';
import Renderer from './renderer.js';
import DomConverter from './domconverter.js';
import Writer from './writer.js';

import utils from '../../utils/utils.js';

/**
 * TreeView class creates an abstract layer over the content editable area.
 * It combines the actual tree of view elements, tree of DOM elements,
 * {@link core.treeView.DomConverter DOM Converter}, {@link core.treeView.Renderer renderer} and all
 * {@link core.treeView.Observer observers}.
 *
 * If you want to only transform the tree of view elements to the DOM elements you can use the
 * {@link core.treeView.DomConverter DomConverter}.
 *
 * @memberOf core.treeView
 * @mixes utils.EmitterMixin
 */
export default class TreeView {
	/**
	 * Creates a TreeView instance.
	 */
	constructor() {
		/**
		 * Roots of the DOM tree. Map on the `HTMLElement`s with roots names as keys.
		 *
		 * @readonly
		 * @member {Map} core.treeView.TreeView#domRoots
		 */
		this.domRoots = new Map();

		/**
		 * Tree View writer.
		 *
		 * @readonly
		 * @member {core.treeView.Writer} core.treeView.TreeView#writer
		 */
		this.writer = new Writer();

		/**
		 * Instance of the {@link core.treeView.DomConverter domConverter} use by
		 * {@link core.treeView.TreeView#renderer renderer} and {@link core.treeView.observer.Observer observers}.
		 *
		 * @readonly
		 * @member {core.treeView.DomConverter} core.treeView.TreeView#domConverter
		 */
		this.domConverter = new DomConverter();

		/**
		 * Roots of the view tree. Map of the {core.treeView.Element view elements} with roots names as keys.
		 *
		 * @readonly
		 * @member {Map} core.treeView.TreeView#viewRoots
		 */
		this.viewRoots = new Map();

		/**
		 * Instance of the {@link core.treeView.TreeView#renderer renderer}.
		 *
		 * @readonly
		 * @member {core.treeView.Renderer} core.treeView.TreeView#renderer
		 */
		this.renderer = new Renderer( this.domConverter );

		/**
		 * Set of registered {@link core.treeView.Observer observers}.
		 *
		 * @protected
		 * @member {Set.<core.treeView.Observer>} core.treeView.TreeView_#observers
		 */
		this._observers = new Set();
	}

	/**
	 * Creates observer of the given type if not yet created, {@link core.treeView.Observer#enable enables} it
	 * and {@link core.treeView.observer.Observer#observe attaches} to all existing and future
	 * {@link core.treeView.TreeView#domRoots DOM roots}.
	 *
	 * Note: Observers are recognized by their constructor (classes). A single observer will be instantiated and used only
	 * when registered for the first time. This means that features and other components can register a single observer
	 * multiple times without caring whether it has been already added or not.
	 *
	 * @param {Function} Observer The constructor of an observer to add.
	 * Should create an instance inheriting from {@link core.treeView.observer.Observer}.
	 */
	addObserver( Observer ) {
		if ( this._hasObserver( Observer ) ) {
			return;
		}

		const observer = new Observer( this );

		this._observers.add( observer );

		for ( let [ name, domElement ] of this.domRoots ) {
			observer.observe( domElement, name );
		}

		observer.enable();
	}

	/**
	 * Creates a root for the HTMLElement. It adds elements to {@link core.treeView.TreeView#domRoots} and
	 * {@link core.treeView.TreeView#viewRoots}.
	 *
	 * The constructor copies the element name and attributes to create the
	 * root of the view, but does not copy its children. This means that while
	 * {@link core.treeView.TreeView#render rendering}, the whole content of this
	 * root element will be removed but the root name and attributes will be preserved.
	 *
	 * @param {HTMLElement} domRoot DOM element in which the tree view should do change.
	 * @param {String} name Name of the root.
	 */
	createRoot( domRoot, name ) {
		const viewRoot = this.domConverter.domToView( domRoot, { bind: true, withChildren: false } );
		viewRoot.setTreeView( this );

		// Mark changed nodes in the renderer.
		viewRoot.on( 'change', ( evt, type, node ) => {
			this.renderer.markToSync( type, node );
		} );
		this.renderer.markToSync( 'CHILDREN', viewRoot );

		this.domRoots.set( name, domRoot );
		this.viewRoots.set( name, viewRoot );

		for ( let observer of this._observers ) {
			observer.observe( domRoot, name );
		}
	}

	/**
	 * Renders all changes. In order to avoid triggering the observers (e.g. mutations) all observers all detached
	 * before rendering and reattached after that.
	 */
	render() {
		for ( let observer of this._observers ) {
			observer.disable();
		}

		this.renderer.render();

		for ( let observer of this._observers ) {
			observer.enable();
		}
	}

	/**
	 * Checks whether the given observer was already added.
	 *
	 * @private
	 * @param {Function} Observer The observer constructor to check.
	 */
	_hasObserver( Observer ) {
		return Array.from( this._observers ).some( ( observer ) => observer.constructor === Observer );
	}
}

utils.mix( TreeView, EmitterMixin );

/**
 * Enum representing type of the change.
 *
 * Possible values:
 *
 * * `CHILDREN` - for child list changes,
 * * `ATTRIBUTES` - for element attributes changes,
 * * `TEXT` - for text nodes changes.
 *
 * @typedef {String} core.treeView.ChangeType
 */
