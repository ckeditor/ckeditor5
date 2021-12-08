/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListEditing from '../../src/documentlist/documentlistediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import { getSiblingListItem } from '../../src/documentlist/utils';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DocumentList - utils', () => {
	let editor, model, document;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [
			Paragraph, HeadingEditing, BlockQuoteEditing, TableEditing, DocumentListEditing
		] } );

		model = editor.model;
		document = model.document;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'isListView()', () => {} );

	describe( 'isListItemView()', () => {} );

	describe( 'getIndent()', () => {} );

	describe( 'createListElement()', () => {} );

	describe( 'createListItemElement()', () => {} );

	describe( 'getViewElementNameForListType()', () => {} );

	describe( 'getSiblingListItem()', () => {
		it( 'should return the passed element if it matches the criteria (sameIndent, listIndent=0)', () => {
			setData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1.</paragraph>' + // Starting item, wanted item.
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2.</paragraph>'
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
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1.</paragraph>' + // Starting item, wanted item.
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2.</paragraph>'
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
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">1.1</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="1">1.2</paragraph>' + // Wanted item.
				'<paragraph listType="bulleted" listItemId="e" listIndent="0">2.</paragraph>' + // Starting item.
				'<paragraph listType="bulleted" listItemId="f" listIndent="1">2.1.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="g" listIndent="1">2.2.</paragraph>'
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
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1.</paragraph>' + // Starting item.
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="1">2.1.</paragraph>' + // Wanted item.
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">2.2.</paragraph>'
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
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="0">1.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="c" listIndent="0">2.</paragraph>' + // Wanted item.
				'<paragraph listType="bulleted" listItemId="d" listIndent="1">2.1.</paragraph>' + // Starting item.
				'<paragraph listType="bulleted" listItemId="e" listIndent="1">2.2.</paragraph>'
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
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">0.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="b" listIndent="1">0.1.</paragraph>' + // Starting item.
				'<paragraph listType="bulleted" listItemId="c" listIndent="1">0.2.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="d" listIndent="1">0.3.</paragraph>' +
				'<paragraph listType="bulleted" listItemId="e" listIndent="0">1.</paragraph>' // Wanted item.
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

	describe( 'getAllListItemElements()', () => {} );

	describe( 'getListItemElements()', () => {} );

	describe( 'findAddListHeadToMap()', () => {} );

	describe( 'fixListIndents()', () => {} );

	describe( 'fixListItemIds()', () => {} );
} );
