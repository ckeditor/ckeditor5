/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Abstract base observer class. Observers are classes which observe changes on DOM elements, do the preliminary
 * processing and fire events on the {@link engine.treeView.TreeView} objects.
 *
 * @abstract
 * @memberOf engine.treeView.observer
 */
export default class Observer {
	/**
	 * Creates an instance of the observer.
	 *
	 * @param {engine.treeView.TreeView} treeView
	 */
	constructor( treeView ) {
		/**
		 * Reference to the {@link engine.treeView.TreeView} object.
		 *
		 * @readonly
		 * @member {engine.treeView.TreeView} engine.treeView.observer.Observer#treeView
		 */
		this.treeView = treeView;

		/**
		 * State of the observer. If it is disabled events will not be fired.
		 *
		 * @readonly
		 * @member {Boolean} engine.treeView.observer.Observer#isEnabled
		 */
		this.isEnabled = false;
	}

	/**
	 * Enables the observer. This method is called when then observer is registered to the
	 * {@link engine.treeView.TreeView} and after {@link engine.treeView.TreeView#render rendering}
	 * (all observers are {@link engine.treeView.observer.Observer#disable disabled} before rendering).
	 *
	 * A typical use case for disabling observers is that mutation observers need to be disabled for the rendering.
	 * However, a child class may not need to be disabled, so it can implement an empty method.
	 *
	 * @see engine.treeView.observer.Observer#disable
	 */
	enable() {
		this.isEnabled = true;
	}

	/**
	 * Disables the observer. This method is called before
	 * {@link engine.treeView.TreeView#render rendering} to prevent firing events during rendering.
	 *
	 * @see engine.treeView.observer.Observer#enable
	 */
	disable() {
		this.isEnabled = false;
	}

	/**
	 * Starts observing the given root element.
	 *
	 * @method engine.treeView.observer.Observer#observe
	 * @param {HTMLElement} domElement
	 * @param {String} name The name of the root element.
	 */
}
