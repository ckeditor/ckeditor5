/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewElement from 'ckeditor5/engine/view/element.js';
import { widgetize, isWidget, WIDGET_CLASS_NAME } from 'ckeditor5/image/widget/utils.js';

describe( 'widget utils', () => {
	let element;

	beforeEach( () => {
		element = new ViewElement( 'div' );
		widgetize( element );
	} );

	describe( 'widgetize()', () => {
		it( 'should set contenteditable to false', () => {
			expect( element.getAttribute( 'contenteditable' ) ).to.be.false;
		} );

		it( 'should define getFillerOffset method', () => {
			expect( element.getFillerOffset ).to.be.function;
			expect( element.getFillerOffset() ).to.be.null;
		} );

		it( 'should add proper CSS class', () => {
			expect( element.hasClass( WIDGET_CLASS_NAME ) ).to.be.true;
		} );
	} );

	describe( 'isWidget()', () => {
		it( 'should return true for widgetized elements', () => {
			expect( isWidget( element ) ).to.be.true;
		} );

		it( 'should return false for non-widgetized elements', () => {
			expect( isWidget( new ViewElement( 'p' ) ) ).to.be.false;
		} );
	} );
} );
