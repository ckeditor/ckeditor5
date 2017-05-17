/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import EnterObserver from '../src/enterobserver';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'EnterObserver', () => {
	let viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		viewDocument.addObserver( EnterObserver );
	} );

	// See #10.
	it( 'can be initialized', () => {
		expect( () => {
			viewDocument.createRoot( document.createElement( 'div' ) );
		} ).to.not.throw();
	} );

	describe( 'enter event', () => {
		it( 'is fired on keydown', () => {
			const spy = sinon.spy();

			viewDocument.on( 'enter', spy );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'enter' )
			} ) );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'is not fired on keydown when keyCode does not match enter', () => {
			const spy = sinon.spy();

			viewDocument.on( 'enter', spy );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: 1
			} ) );

			expect( spy.calledOnce ).to.be.false;
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
