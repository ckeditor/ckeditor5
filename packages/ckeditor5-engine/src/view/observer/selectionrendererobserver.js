/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/selectionrendererobserver
 */

import Observer from './observer';

/**
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class SelectionRendererObserver extends Observer {
	constructor( view ) {
		super( view );

		const document = this.document;

		// TODO: althought this works it lacks the RENDERER API (or view API as renderer is _private).
		document.on( 'blur', () => {
			view._renderer.renderSelection = false;
		} );

		document.on( 'mousemove', ( evt, domEvt ) => {
			view._renderer.renderSelection = domEvt.domEvent.buttons != 1;
		} );

		document.on( 'mouseup', () => {
			view._renderer.renderSelection = true;
		} );

		document.on( 'mouseleave', () => {
			view._renderer.renderSelection = false;
		} );
	}

	observe() {
		// TODO: dummy method - might need better solution.
	}
}
