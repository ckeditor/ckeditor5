/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import View from '../../src/view';

/**
 * Test utils for CKEditor UI.
 */
const utils = {
	/**
	 * Returns a view for a given region/DOM selector pairs, which {@link module:ui/view~View#element}
	 * is `document.body`. It is useful for manual tests which engage various UI components and/or
	 * UI {@link module:ui/view~View} instances, where initialization and the process of insertion into
	 * DOM could be problematic i.e. because of the number of instances.
	 *
	 * Usage:
	 *
	 *		// Get the view.
	 *		const view = testUtils.createTestUIView( {
	 *			'some-collection': '#collection'
	 *		} );
	 *
	 *		// Then use it to organize and initialize children.
	 *		view.add( 'some-collection', childControllerInstance );
	 *
	 * @param {Object} regions An object literal with `regionName: [DOM Selector|callback]` pairs.
	 *
	 * See {@link module:ui/view~View#createCollection}.
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

		view.render();

		return view;
	}
};

export default utils;
