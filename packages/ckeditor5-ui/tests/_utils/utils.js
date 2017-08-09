/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import View from '../../src/view';

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
	 *		const controller = testUtils.createTestUIView();
	 *
	 *		// Then use it to organize and initialize children.
	 *		controller.add( 'some-collection', childControllerInstance );
	 *
	 * @param {Object} regions An object literal with `regionName: [DOM Selector|callback]` pairs.
	 * See {@link ui.View#register}.
	 */
	createTestUIView( regions ) {
		const TestUIView = class extends View {
			constructor() {
				super();

				this.element = document.body;

				for ( const name in regions ) {
					const regionCollection = this[ name ] = this.createCollection();
					const callbackOrSelector = regions[ name ];

					regionCollection.setParent(
						typeof callbackOrSelector == 'string' ?
							document.querySelector( callbackOrSelector ) :
							callbackOrSelector( this.element )
					);
				}
			}
		};

		const view = new TestUIView();

		view.init();

		return view;
	}
};

export default utils;
