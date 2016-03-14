/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Abstract base observer class. Observers are classes which observe changes on DOM elements, do the preliminary
 * processing and fire events on the {@link core.treeView.TreeView} objects.
 *
 * @abstract
 * @memberOf core.treeView.observer
 */
export default class Observer {
	/**
	 * Inits the observer class, caches all needed {@link core.treeView.TreeView} properties.
	 * After being inited, the observer will be {@link core.treeView.observer.Observer#enabled enabled}.
	 *
	 * @method core.treeView.observer.Observer#init
	 * @param {core.treeView.TreeView}
	 */

	/**
	 * Enables the observer. This method is called when then observer is registered to the
	 * {@link core.treeView.TreeView} and after {@link core.treeView.TreeView#render rendering}
	 * (all observers are {@link core.treeView.observer.Observer#disable disabled} before rendering).
	 *
	 * A typical use case for disabling observers is that mutation observers need to be disabled for the rendering.
	 * However, a child class may not need to be disabled, so it can implement an empty method.
	 *
	 * @see core.treeView.observer.Observer#disable
	 *
	 * @method core.treeView.observer.Observer#enable
	 */

	/**
	 * Disables the observer. This method is called before
	 * {@link core.treeView.TreeView#render rendering} to prevent firing events during rendering.
	 *
	 * @see core.treeView.observer.Observer#enable
	 *
	 * @method core.treeView.observer.Observer#disable
	 */

	/**
	 * Starts observing the given root element.
	 *
	 * @method core.treeView.observer.Observer#observe
	 * @param {HTMLElement} domElement
	 * @param {String} name The name of the root element.
	 */
}
