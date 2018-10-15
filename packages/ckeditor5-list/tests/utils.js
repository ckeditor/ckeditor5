/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewDowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import { createViewListItemElement } from '../src/utils';

describe( 'utils', () => {
	let writer;

	beforeEach( () => {
		writer = new ViewDowncastWriter( {} );
	} );

	describe( 'createViewListItemElement()', () => {
		it( 'should create ViewContainerElement', () => {
			const item = createViewListItemElement( writer );

			expect( item ).to.be.instanceof( ViewContainerElement );
		} );

		it( 'should have li name', () => {
			const item = createViewListItemElement( writer );

			expect( item.name ).to.equal( 'li' );
		} );

		describe( 'getFillerOffset', () => {
			it( 'should return 0 if item is empty', () => {
				const item = createViewListItemElement( writer );

				expect( item.getFillerOffset() ).to.equal( 0 );
			} );

			it( 'should return 0 if item has only lists as children', () => {
				const innerListItem1 = createViewListItemElement( writer );

				writer.insert(
					writer.createPositionAt( innerListItem1, 0 ),
					writer.createText( 'foo' )
				);

				const innerListItem2 = createViewListItemElement( writer );

				writer.insert(
					writer.createPositionAt( innerListItem2, 0 ),
					writer.createText( 'bar' )
				);

				const innerList = writer.createContainerElement( 'ul' );
				writer.insert( writer.createPositionAt( innerList, 0 ), innerListItem1 );
				writer.insert( writer.createPositionAt( innerList, 0 ), innerListItem2 );

				const outerListItem = createViewListItemElement( writer );
				writer.insert( writer.createPositionAt( outerListItem, 0 ), innerList );

				expect( outerListItem.getFillerOffset() ).to.equal( 0 );
			} );

			it( 'should return null if item has non-list contents', () => {
				const item = createViewListItemElement( writer );

				writer.insert(
					writer.createPositionAt( item, 0 ),
					writer.createText( 'foo' )
				);

				expect( item.getFillerOffset() ).to.be.null;
			} );
		} );
	} );
} );
