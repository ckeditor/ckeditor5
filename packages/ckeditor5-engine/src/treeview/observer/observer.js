/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * @abstract
 * @class core.treeView.observer.Observer
 * @classdesc
 * Abstract base observer class. Observers are classes which observe changes on DOM elements, do the preliminary
 * processing and fire events on the {@link core.treeView.TreeView} objects.
 */
export default class Observer {
	/**
	 * Inits the observer class, caches all needed {@link core.treeView.TreeView} properties, create objects.
	 * This method do not {@link core.treeView.observer.Observer#attach attach} listeners to the DOM.
	 *
	 * @method core.treeView.observer.Observer#init
	 * @param {core.treeView.TreeView}
	 */

	/**
	 * Attaches observers and listeners to DOM elements. This method is called when then observer is added to the
	 * {@link core.treeView.TreeView} and after {@link core.treeView.TreeView#render rendering} to reattach observers and listeners.
	 *
	 * @see core.treeView.observer.Observer#detach
	 *
	 * @method core.treeView.observer.Observer#attach
	 */

	/**
	 * Detaches observers and listeners from the DOM elements. This method is called before
	 * {@link core.treeView.TreeView#render rendering} to prevent firing events during rendering and when the editor is
	 * destroyed.
	 *
	 * @see core.treeView.observer.Observer#attach
	 *
	 * @method core.treeView.observer.Observer#detach
	 */
}
