/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/bindings/submithandler
 */

import type View from '../view';

/**
 * A handler useful for {@link module:ui/view~View views} working as HTML forms. It intercepts a native DOM
 * `submit` event, prevents the default web browser behavior (navigation and page reload) and
 * fires the `submit` event on a view instead. Such a custom event can be then used by any
 * {@link module:utils/dom/emittermixin~DomEmitter emitter}, e.g. to serialize the form data.
 *
 * ```ts
 * import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
 *
 * // ...
 *
 * class AnyFormView extends View {
 * 	constructor() {
 * 		super();
 *
 * 		// ...
 *
 * 		submitHandler( {
 * 			view: this
 * 		} );
 * 	}
 * }
 *
 * // ...
 *
 * const view = new AnyFormView();
 *
 * // A sample listener attached by an emitter working with the view.
 * this.listenTo( view, 'submit', () => {
 * 	saveTheFormData();
 * 	hideTheForm();
 * } );
 * ```
 *
 * @param options Configuration options.
 * @param options.view The view which DOM `submit` events should be handled.
 */
export default function submitHandler( { view }: { view: View } ): void {
	view.listenTo( view.element!, 'submit', ( evt, domEvt ) => {
		domEvt.preventDefault();
		view.fire<SubmitHandlerEvent>( 'submit' );
	}, { useCapture: true } );
}

/**
 * Fired by {@link module:ui/bindings/submithandler~submitHandler} helper.
 *
 * @eventName module:ui/view~View#submit
 */
export type SubmitHandlerEvent = {
	name: 'submit';
	args: [];
};
