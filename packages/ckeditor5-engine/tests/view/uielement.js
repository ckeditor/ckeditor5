/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import UIElement from '../../src/view/uielement';
import Element from '../../src/view/element';

describe( 'UIElement', () => {
	let childElement, uiElement;

	beforeEach( () => {
		childElement = new Element( 'b' );
		uiElement = new UIElement( 'span', {
			foo: 'bar',
			style: 'border: 1px solid red;color: white;',
			class: 'foo bar'
		}, [ childElement ] );
	} );

	describe( 'constructor()', () => {
		it( 'should create instance', () => {
			expect( uiElement.name ).to.equal( 'span' );
			expect( uiElement.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( uiElement.getStyle( 'border' ) ).to.equal( '1px solid red' );
			expect( uiElement.getStyle( 'color' ) ).to.equal( 'white' );
			expect( uiElement.hasClass( 'foo' ) ).to.true;
			expect( uiElement.hasClass( 'bar' ) ).to.true;
			expect( uiElement.childCount ).to.equal( 1 );
			expect( uiElement.getChild( 0 ) ).to.equal( childElement )
		} );
	} );

	describe( 'getFillerOffset()', () => {
		it( 'should return null', () => {
			expect( uiElement.getFillerOffset() ).to.null;
		} );
	} );
} );
