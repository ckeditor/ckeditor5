/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/bindings/submithandler
 */

/**
 * Handles native DOM `submit` event by preventing it and firing
 * the {@link module:ui/view~View view's} `submit` event, which can be then handled by the
 * parent controller.
 *
 * @param {Object} [options] Configuration options.
 * @param {module:ui/view~View} options.view The view to which this behavior should be added.
 */
export default function submitHandler( { view } ) {
	view.listenTo( view.element, 'submit', ( evt, domEvt ) => {
		domEvt.preventDefault();
		view.fire( 'submit' );
	}, { useCapture: true } );
}
