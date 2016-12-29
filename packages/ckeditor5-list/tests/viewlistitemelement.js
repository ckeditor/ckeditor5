/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewListItemElement from 'ckeditor5-list/src/viewlistitemelement';
import ViewContainerElement from 'ckeditor5-engine/src/view/containerelement';
import ViewText from 'ckeditor5-engine/src/view/text';

describe( 'ViewListItemElement', () => {
	it( 'should extend ViewContainerElement', () => {
		let item = new ViewListItemElement();

		expect( item ).to.be.instanceof( ViewContainerElement );
	} );

	it( 'should have li name', () => {
		let item = new ViewListItemElement();

		expect( item.name ).to.equal( 'li' );
	} );

	describe( 'getFillerOffset', () => {
		it( 'should return 0 if item is empty', () => {
			let item = new ViewListItemElement();

			expect( item.getFillerOffset() ).to.equal( 0 );
		} );

		it( 'should return 0 if item has only lists as children', () => {
			let item = new ViewListItemElement( null, [
				new ViewContainerElement( 'ul', null, [
					new ViewListItemElement( null, new ViewText( 'foo' ) ),
					new ViewListItemElement( null, new ViewText( 'bar' ) )
				] )
			] );

			expect( item.getFillerOffset() ).to.equal( 0 );
		} );

		it( 'should return null if item has non-list contents', () => {
			let item = new ViewListItemElement( null, new ViewText( 'foo' ) );

			expect( item.getFillerOffset() ).to.be.null;
		} );
	} );
} );
