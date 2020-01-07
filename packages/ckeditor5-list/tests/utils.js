/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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

			// Block filler is required after the `<br>` element if the element is the last child in the container.
			// See: https://github.com/ckeditor/ckeditor5/issues/1312#issuecomment-436669045.
			describe( 'for <br> elements in container', () => {
				it( 'returns offset of the last child which is the <br> element (1)', () => {
					const item = createViewListItemElement( writer );

					writer.insert( writer.createPositionAt( item, 0 ), writer.createEmptyElement( 'br' ) );

					expect( item.getFillerOffset() ).to.equal( 1 );
				} );

				it( 'returns offset of the last child which is the <br> element (2)', () => {
					const item = createViewListItemElement( writer );

					writer.insert( writer.createPositionAt( item, 0 ), writer.createEmptyElement( 'br' ) );
					writer.insert( writer.createPositionAt( item, 1 ), writer.createEmptyElement( 'br' ) );

					expect( item.getFillerOffset() ).to.equal( 2 );
				} );

				it( 'always returns the last <br> element in the container', () => {
					const item = createViewListItemElement( writer );

					writer.insert( writer.createPositionAt( item, 0 ), writer.createText( 'foo' ) );
					writer.insert( writer.createPositionAt( item, 1 ), writer.createEmptyElement( 'br' ) );
					writer.insert( writer.createPositionAt( item, 2 ), writer.createEmptyElement( 'br' ) );

					expect( item.getFillerOffset() ).to.equal( 3 );
				} );

				it( 'works fine with non-empty container with multi <br> elements', () => {
					const item = createViewListItemElement( writer );

					writer.insert( writer.createPositionAt( item, 0 ), writer.createText( 'foo' ) );
					writer.insert( writer.createPositionAt( item, 1 ), writer.createEmptyElement( 'br' ) );
					writer.insert( writer.createPositionAt( item, 2 ), writer.createText( 'bar' ) );
					writer.insert( writer.createPositionAt( item, 3 ), writer.createEmptyElement( 'br' ) );

					expect( item.getFillerOffset() ).to.equal( 4 );
				} );

				it( 'ignores the ui elements', () => {
					const item = createViewListItemElement( writer );

					writer.insert( writer.createPositionAt( item, 0 ), writer.createUIElement( 'span' ) );
					writer.insert( writer.createPositionAt( item, 1 ), writer.createEmptyElement( 'br' ) );

					expect( item.getFillerOffset() ).to.equal( 2 );
				} );

				it( 'empty element must be the <br> element', () => {
					const item = createViewListItemElement( writer );

					writer.insert(
						writer.createPositionAt( item, 0 ),
						writer.createEmptyElement( 'img' )
					);

					expect( item.getFillerOffset() ).to.be.null;
				} );
			} );
		} );
	} );
} );
