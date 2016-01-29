/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Abstract base observer class. Observers are classes which observe changes on DOM elements, do the preliminary
 * processing and fire events on the {@link treeView.TreeView} objects.
 *
 * @abstract
 * @class treeView.observer.Observer
 */
export default class Observer {
	/**
	 * Inits the observer class, caches all needed {@link treeView.TreeView} properties, create objects.
	 * This method do not {@link treeView.observer.Observer#attach attach} listeners to the DOM.
	 *
	 * @method init
	 * @param {treeView.TreeView}
	 */

	/**
	 * Attaches observers and listeners to DOM elements. This method is called when then observer is added to the
	 * {@link treeView.TreeView} and after {@link treeView.TreeView#render rendering} to reattach observers and listeners.
	 *
	 * @see treeView.observer.Observer#detach
	 *
	 * @method attach
	 */

	/**
	 * Detaches observers and listeners from the DOM elements. This method is called before
	 * {@link treeView.TreeView#render rendering} to prevent firing events during rendering and when the editor is
	 * destroyed.
	 *
	 * @see treeView.observer.Observer#attach
	 *
	 * @method detach
	 */
}
