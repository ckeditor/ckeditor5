/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement.js';
import ViewDowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

import LegacyListEditing from '../../src/legacylist/legacylistediting.js';
import LegacyListPropertiesEditing from '../../src/legacylistproperties/legacylistpropertiesediting.js';

import {
	createViewListItemElement,
	getListTypeFromListStyleType,
	getSiblingListItem,
	getSiblingNodes
} from '../../src/legacylist/legacyutils.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';

describe( 'legacy utils', () => {
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

	describe( 'getSiblingListItem()', () => {
		let editor, model, document;

		beforeEach( () => {
			return VirtualTestEditor.create( { plugins: [ LegacyListEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					document = model.document;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should return the passed element if it matches the criteria (sameIndent, listIndent=0)', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' + // Starting item, wanted item.
				'<listItem listType="bulleted" listIndent="0">2.</listItem>'
			);

			const listItem = document.getRoot().getChild( 1 );
			const foundElement = getSiblingListItem( listItem, {
				sameIndent: true,
				listIndent: 0
			} );

			expect( foundElement ).to.equal( document.getRoot().getChild( 1 ) );
		} );

		it( 'should return the passed element if it matches the criteria (sameIndent, listIndent=0, direction="forward")', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' + // Starting item, wanted item.
				'<listItem listType="bulleted" listIndent="0">2.</listItem>'
			);

			const listItem = document.getRoot().getChild( 1 );
			const foundElement = getSiblingListItem( listItem, {
				sameIndent: true,
				listIndent: 0,
				direction: 'forward'
			} );

			expect( foundElement ).to.equal( document.getRoot().getChild( 1 ) );
		} );

		it( 'should return the first listItem that matches criteria (sameIndent, listIndent=1)', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">1.1</listItem>' +
				'<listItem listType="bulleted" listIndent="1">1.2</listItem>' + // Wanted item.
				'<listItem listType="bulleted" listIndent="0">2.</listItem>' + // Starting item.
				'<listItem listType="bulleted" listIndent="1">2.1.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">2.2.</listItem>'
			);

			const listItem = document.getRoot().getChild( 5 );
			const foundElement = getSiblingListItem( listItem.previousSibling, {
				sameIndent: true,
				listIndent: 1
			} );

			expect( foundElement ).to.equal( document.getRoot().getChild( 3 ) );
		} );

		it( 'should return the first listItem that matches criteria (sameIndent, listIndent=1, direction="forward")', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' + // Starting item.
				'<listItem listType="bulleted" listIndent="0">2.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">2.1.</listItem>' + // Wanted item.
				'<listItem listType="bulleted" listIndent="1">2.2.</listItem>'
			);

			const listItem = document.getRoot().getChild( 1 );
			const foundElement = getSiblingListItem( listItem.nextSibling, {
				sameIndent: true,
				listIndent: 1,
				direction: 'forward'
			} );

			expect( foundElement ).to.equal( document.getRoot().getChild( 3 ) );
		} );

		it( 'should return the first listItem that matches criteria (smallerIndent, listIndent=1)', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">2.</listItem>' + // Wanted item.
				'<listItem listType="bulleted" listIndent="1">2.1.</listItem>' + // Starting item.
				'<listItem listType="bulleted" listIndent="1">2.2.</listItem>'
			);

			const listItem = document.getRoot().getChild( 4 );
			const foundElement = getSiblingListItem( listItem, {
				smallerIndent: true,
				listIndent: 1
			} );

			expect( foundElement ).to.equal( document.getRoot().getChild( 2 ) );
		} );

		it( 'should return the first listItem that matches criteria (smallerIndent, listIndent=1, direction="forward")', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">0.1.</listItem>' + // Starting item.
				'<listItem listType="bulleted" listIndent="1">0.2.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">0.3.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' // Wanted item.
			);

			const listItem = document.getRoot().getChild( 1 );
			const foundElement = getSiblingListItem( listItem, {
				smallerIndent: true,
				listIndent: 1,
				direction: 'forward'
			} );

			expect( foundElement ).to.equal( document.getRoot().getChild( 4 ) );
		} );
	} );

	describe( 'getSiblingNodes()', () => {
		let editor, model, document;

		beforeEach( () => {
			return VirtualTestEditor.create( { plugins: [ Paragraph, BlockQuoteEditing, LegacyListPropertiesEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					document = model.document;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should return all listItems above the current selection position (direction="backward")', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">[]2.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">3.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">4.</listItem>'
			);

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'backward' ) ).to.deep.equal( [
				document.getRoot().getChild( 0 ),
				document.getRoot().getChild( 1 ),
				document.getRoot().getChild( 2 )
			] );
		} );

		it( 'should return all listItems below the current selection position (direction="forward")', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">[]2.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">3.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">4.</listItem>'
			);

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'forward' ) ).to.deep.equal( [
				document.getRoot().getChild( 2 ),
				document.getRoot().getChild( 3 ),
				document.getRoot().getChild( 4 )
			] );
		} );

		it( 'should break searching when spotted a non-listItem element (direction="backward")', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' +
				'<paragraph>Foo</paragraph>' +
				'<listItem listType="bulleted" listIndent="0">2.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">3.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">4.[].</listItem>'
			);

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'backward' ) ).to.deep.equal( [
				document.getRoot().getChild( 3 ),
				document.getRoot().getChild( 4 ),
				document.getRoot().getChild( 5 )
			] );
		} );

		it( 'should break searching when spotted a non-listItem element (direction="forward")', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">[]0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">2.</listItem>' +
				'<paragraph>Foo</paragraph>' +
				'<listItem listType="bulleted" listIndent="0">3.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">4.</listItem>'
			);

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'forward' ) ).to.deep.equal( [
				document.getRoot().getChild( 0 ),
				document.getRoot().getChild( 1 ),
				document.getRoot().getChild( 2 )
			] );
		} );

		it( 'should break searching when spotted a different value for the `listType` attribute (direction="backward")', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">2.</listItem>' +
				'<listItem listType="numbered" listIndent="0">Numbered item.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">3.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">[]4.</listItem>'
			);

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'backward' ) ).to.deep.equal( [
				document.getRoot().getChild( 4 ),
				document.getRoot().getChild( 5 )
			] );
		} );

		it( 'should break searching when spotted a different value for the `listType` attribute (direction="forward")', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">[]0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">2.</listItem>' +
				'<listItem listType="numbered" listIndent="0">Numbered item.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">3.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">4.</listItem>'
			);

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'forward' ) ).to.deep.equal( [
				document.getRoot().getChild( 0 ),
				document.getRoot().getChild( 1 ),
				document.getRoot().getChild( 2 )
			] );
		} );

		it( 'should break searching when spotted a different value for the `listStyle` attribute (direction="backward")', () => {
			setData( model,
				'<listItem listType="bulleted" listStyle="disc" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listStyle="disc" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listStyle="disc" listIndent="0">2.</listItem>' +
				'<listItem listType="bulleted" listStyle="square" listIndent="0">Broken item.</listItem>' +
				'<listItem listType="bulleted" listStyle="disc" listIndent="0">3.</listItem>' +
				'<listItem listType="bulleted" listStyle="disc" listIndent="0">[]4.</listItem>'
			);

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'backward' ) ).to.deep.equal( [
				document.getRoot().getChild( 4 ),
				document.getRoot().getChild( 5 )
			] );
		} );

		it( 'should break searching when spotted a different value for the `listStyle` attribute (direction="forward")', () => {
			setData( model,
				'<listItem listType="bulleted" listStyle="disc" listIndent="0">[]0.</listItem>' +
				'<listItem listType="bulleted" listStyle="disc" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listStyle="disc" listIndent="0">2.</listItem>' +
				'<listItem listType="bulleted" listStyle="square" listIndent="0">Broken item.</listItem>' +
				'<listItem listType="bulleted" listStyle="disc" listIndent="0">3.</listItem>' +
				'<listItem listType="bulleted" listStyle="disc" listIndent="0">4.</listItem>'
			);

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'forward' ) ).to.deep.equal( [
				document.getRoot().getChild( 0 ),
				document.getRoot().getChild( 1 ),
				document.getRoot().getChild( 2 )
			] );
		} );

		it( 'should ignore nested items (looking for listIndent=0)', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">[]0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">2.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">2.1.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">2.2.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">3.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">3.1.</listItem>' +
				'<listItem listType="bulleted" listIndent="2">3.1.1.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">4.</listItem>'
			);

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'forward' ) ).to.deep.equal( [
				document.getRoot().getChild( 0 ),
				document.getRoot().getChild( 1 ),
				document.getRoot().getChild( 2 ),
				document.getRoot().getChild( 5 ),
				document.getRoot().getChild( 8 )
			] );
		} );

		it( 'should break when spotted an outer list (looking for listIndent=1)', () => {
			setData( model,
				'<listItem listType="bulleted" listIndent="0">0.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">1.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">[]1.1.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">1.2.</listItem>' +
				'<listItem listType="bulleted" listIndent="1">1.3.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">2.</listItem>' +
				'<listItem listType="bulleted" listIndent="0">3.</listItem>'
			);

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'forward' ) ).to.deep.equal( [
				document.getRoot().getChild( 2 ),
				document.getRoot().getChild( 3 ),
				document.getRoot().getChild( 4 )
			] );
		} );

		it( 'should return only list items that are inside the same parent element (direction="backward")', () => {
			setData( model,
				'<listItem listStart="0" listType="numbered" listIndent="0">0.</listItem>' +
				'<listItem listStart="0" listType="numbered" listIndent="0">1.</listItem>' +
				'<blockQuote>' +
				'<listItem listStart="0" listType="numbered" listIndent="0">[]2.</listItem>' +
				'<listItem listStart="0" listType="numbered" listIndent="0">3.</listItem>' +
				'</blockQuote>' +
				'<listItem listStart="0" listType="numbered" listIndent="0">4.</listItem>' +
				'<listItem listStart="0" listType="numbered" listIndent="0">5.</listItem>'
			);

			const blockQuoteElement = document.getRoot().getChild( 2 );

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'backward' ) ).to.deep.equal( [
				blockQuoteElement.getChild( 0 )
			] );
		} );

		it( 'should return only list items that are inside the same parent element (direction="forward")', () => {
			setData( model,
				'<listItem listStart="0" listType="numbered" listIndent="0">0.</listItem>' +
				'<listItem listStart="0" listType="numbered" listIndent="0">1.</listItem>' +
				'<blockQuote>' +
				'<listItem listStart="0" listType="numbered" listIndent="0">[]2.</listItem>' +
				'<listItem listStart="0" listType="numbered" listIndent="0">3.</listItem>' +
				'</blockQuote>' +
				'<listItem listStart="0" listType="numbered" listIndent="0">4.</listItem>' +
				'<listItem listStart="0" listType="numbered" listIndent="0">5.</listItem>'
			);

			const blockQuoteElement = document.getRoot().getChild( 2 );

			expect( getSiblingNodes( document.selection.getFirstPosition(), 'forward' ) ).to.deep.equal( [
				blockQuoteElement.getChild( 0 ),
				blockQuoteElement.getChild( 1 )
			] );
		} );
	} );

	describe( 'getListTypeFromListStyleType()', () => {
		const testData = [
			[ 'decimal', 'numbered' ],
			[ 'decimal-leading-zero', 'numbered' ],
			[ 'lower-roman', 'numbered' ],
			[ 'upper-roman', 'numbered' ],
			[ 'lower-latin', 'numbered' ],
			[ 'upper-latin', 'numbered' ],
			[ 'disc', 'bulleted' ],
			[ 'circle', 'bulleted' ],
			[ 'square', 'bulleted' ],
			[ 'default', null ],
			[ 'style-type-that-is-not-possibly-supported-by-css', null ]
		];

		for ( const [ style, type ] of testData ) {
			it( `shoud return "${ type }" for "${ style }" style`, () => {
				expect( getListTypeFromListStyleType( style ) ).to.equal( type );
			} );
		}
	} );
} );
