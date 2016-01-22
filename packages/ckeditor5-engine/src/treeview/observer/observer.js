/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Abstract base observer class. Observers are classes which observe changes on DOM elements, do the primary processing
 * and fire events on the {@link treeView.TreeView} objects.
 *
 * @abstract
 * @class treeView.Observer
 */
export default class Observer {
	/**
	 * Attach observers and linsters to DOM elements. This method is called when then observer is added to the
	 * {@link treeView.TreeView} and after {@link treeView.TreeView#render rendering} to reattach observers and linsters.
	 *
	 * @see treeView.Observer#detach
	 *
	 * @method attach
	 */

	/**
	 * Detach observers and linsters from the DOM elements. This method is called before
	 * {@link treeView.TreeView#render rendering} to prevent fireing events during rendering and when the editor is
	 * destroyed.
	 *
	 * @see treeView.Observer#attach
	 *
	 * @method detach
	 */

	/**
	 * Init the observer class, cache all needed {@link treeView.TreeView} properties, create objects.
	 * This method do not {@link treeView.Observer#attach attach} listeners to the DOM.
	 *
	 * @method init
	 * @param {treeView.TreeView}
	 */
}
