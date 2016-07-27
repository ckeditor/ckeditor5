/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '/ckeditor5/ui/view.js';
import Controller from '/ckeditor5/ui/controller.js';

/**
 * Test utils for CKEditor UI.
 */
const utils = {
	/**
	 * Returns UI controller for given region/DOM selector pairs, which {@link ui.Controller#view}
	 * is `document.body`. It is useful for manual tests which engage various UI components and/or
	 * UI {@link ui.Controller} instances, where initialization and the process of insertion into
	 * DOM could be problematic i.e. because of the number of instances.
	 *
	 * Usage:
	 *
	 *		// Get the controller.
	 *		const controller = testUtils.createTestUIController();
	 *
	 *		// Then use it to organize and initialize children.
	 *		controller.add( 'some-collection', childControllerInstance );
	 *
	 * @param {Object} regions An object literal with `regionName: DOM Selector pairs`.
	 * See {@link ui.View#register}.
	 */
	createTestUIController( regions ) {
		const TestUIView = class extends View {
			constructor() {
				super();

				this.element = document.body;

				for ( let r in regions ) {
					this.register( r, regions[ r ] );
				}
			}
		};

		const controller = new Controller( null, new TestUIView() );

		for ( let r in regions ) {
			controller.addCollection( r );
		}

		return controller.init().then( () => {
			return controller;
		} );
	}
};

export default utils;
