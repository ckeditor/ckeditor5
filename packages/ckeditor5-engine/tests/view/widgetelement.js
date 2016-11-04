/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

import WidgetElement from 'ckeditor5/engine/view/widgetelement.js';

describe( 'EmptyElement', () => {
	let widgetElement;

	beforeEach( () => {
		widgetElement = new WidgetElement( 'figure' );
	} );

	describe( 'constructor', () => {
		it( 'should set contenteditable attribute to false', () => {
			expect( widgetElement.hasAttribute( 'contenteditable' ) ).to.be.true;
			expect( widgetElement.getAttribute( 'contenteditable' ) ).to.be.false;
		} );
	} );

	describe( 'getFillerOffset', () => {
		it( 'should return null', () => {
			expect( widgetElement.getFillerOffset() ).to.be.null;
		} );
	} );
} );
