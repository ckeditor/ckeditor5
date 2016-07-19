/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Abstract base observer class. Observers are classes which observe changes on DOM elements, do the preliminary
 * processing and fire events on the {@link engine.view.Document} objects. Observers can also add features to the view,
 * for instance by updating its status or marking elements which need refresh on DOM events.
 *
 * @abstract
 * @memberOf engine.view.observer
 */
export default class Observer {
	/**
	 * Creates an instance of the observer.
	 *
	 * @param {engine.view.Document} document
	 */
	constructor( document ) {
		/**
		 * Reference to the {@link engine.view.Document} object.
		 *
		 * @readonly
		 * @member {engine.view.Document} engine.view.observer.Observer#document
		 */
		this.document = document;

		/**
		 * State of the observer. If it is disabled events will not be fired.
		 *
		 * @readonly
		 * @member {Boolean} engine.view.observer.Observer#isEnabled
		 */
		this.isEnabled = false;
	}

	/**
	 * Enables the observer. This method is called when then observer is registered to the
	 * {@link engine.view.Document} and after {@link engine.view.Document#render rendering}
	 * (all observers are {@link engine.view.observer.Observer#disable disabled} before rendering).
	 *
	 * A typical use case for disabling observers is that mutation observers need to be disabled for the rendering.
	 * However, a child class may not need to be disabled, so it can implement an empty method.
	 *
	 * @see engine.view.observer.Observer#disable
	 */
	enable() {
		this.isEnabled = true;
	}

	/**
	 * Disables the observer. This method is called before
	 * {@link engine.view.Document#render rendering} to prevent firing events during rendering.
	 *
	 * @see engine.view.observer.Observer#enable
	 */
	disable() {
		this.isEnabled = false;
	}

	/**
	 * Starts observing the given root element.
	 *
	 * @method engine.view.observer.Observer#observe
	 * @param {HTMLElement} domElement
	 * @param {String} name The name of the root element.
	 */
}
