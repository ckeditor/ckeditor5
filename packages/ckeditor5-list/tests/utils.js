/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';
import { createViewListItemElement } from '../src/utils';

describe( 'utils', () => {
	describe( 'createViewListItemElement()', () => {
		it( 'should create ViewContainerElement', () => {
			const item = createViewListItemElement();

			expect( item ).to.be.instanceof( ViewContainerElement );
		} );

		it( 'should have li name', () => {
			const item = createViewListItemElement();

			expect( item.name ).to.equal( 'li' );
		} );

		describe( 'getFillerOffset', () => {
			it( 'should return 0 if item is empty', () => {
				const item = createViewListItemElement();

				expect( item.getFillerOffset() ).to.equal( 0 );
			} );

			it( 'should return 0 if item has only lists as children', () => {
				const innerListItem1 = createViewListItemElement();
				innerListItem1._appendChildren( new ViewText( 'foo' ) );
				const innerListItem2 = createViewListItemElement();
				innerListItem2._appendChildren( new ViewText( 'bar' ) );
				const innerList = new ViewContainerElement( 'ul', null, [ innerListItem1, innerListItem2 ] );
				const outerListItem = createViewListItemElement();
				outerListItem._appendChildren( innerList );

				expect( outerListItem.getFillerOffset() ).to.equal( 0 );
			} );

			it( 'should return null if item has non-list contents', () => {
				const item = createViewListItemElement();
				item._appendChildren( new ViewText( 'foo' ) );

				expect( item.getFillerOffset() ).to.be.null;
			} );
		} );
	} );
} );
