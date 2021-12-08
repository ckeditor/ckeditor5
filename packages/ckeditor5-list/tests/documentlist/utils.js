/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListEditing from '../../src/documentlist/documentlistediting';
import { getIndent, getSiblingListItem, isListItemView, isListView } from '../../src/documentlist/utils';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'DocumentList - utils', () => {
	let editor, model, document, viewWriter;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [
			Paragraph, HeadingEditing, BlockQuoteEditing, TableEditing, DocumentListEditing
		] } );

		model = editor.model;
		document = model.document;
		viewWriter = new UpcastWriter( editor.editing.view.document );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'isListView()', () => {
		it( 'should return true for UL element', () => {
			expect( isListView( viewWriter.createElement( 'ul' ) ) ).to.be.true;
		} );

		it( 'should return true for OL element', () => {
			expect( isListView( viewWriter.createElement( 'ol' ) ) ).to.be.true;
		} );

		it( 'should return false for LI element', () => {
			expect( isListView( viewWriter.createElement( 'li' ) ) ).to.be.false;
		} );

		it( 'should return false for other elements', () => {
			expect( isListView( viewWriter.createElement( 'a' ) ) ).to.be.false;
			expect( isListView( viewWriter.createElement( 'p' ) ) ).to.be.false;
			expect( isListView( viewWriter.createElement( 'div' ) ) ).to.be.false;
		} );
	} );

	describe( 'isListItemView()', () => {
		it( 'should return true for LI element', () => {
			expect( isListItemView( viewWriter.createElement( 'li' ) ) ).to.be.true;
		} );

		it( 'should return false for UL element', () => {
			expect( isListItemView( viewWriter.createElement( 'ul' ) ) ).to.be.false;
		} );

		it( 'should return false for OL element', () => {
			expect( isListItemView( viewWriter.createElement( 'ol' ) ) ).to.be.false;
		} );

		it( 'should return false for other elements', () => {
			expect( isListItemView( viewWriter.createElement( 'a' ) ) ).to.be.false;
			expect( isListItemView( viewWriter.createElement( 'p' ) ) ).to.be.false;
			expect( isListItemView( viewWriter.createElement( 'div' ) ) ).to.be.false;
		} );
	} );

	describe( 'getIndent()', () => {
		it( 'should return 0 for flat list', () => {
			const viewElement = parseView(
				'<ul>' +
					'<li>a</li>' +
					'<li>b</li>' +
				'</ul>'
			);

			expect( getIndent( viewElement.getChild( 0 ) ) ).to.equal( 0 );
			expect( getIndent( viewElement.getChild( 1 ) ) ).to.equal( 0 );
		} );

		it( 'should return 1 for first level nested items', () => {
			const viewElement = parseView(
				'<ul>' +
					'<li>' +
						'<ul>' +
							'<li>a</li>' +
							'<li>b</li>' +
						'</ul>' +
					'</li>' +
					'<li>' +
						'<ol>' +
							'<li>c</li>' +
							'<li>d</li>' +
						'</ol>' +
					'</li>' +
				'</ul>'
			);

			expect( getIndent( viewElement.getChild( 0 ).getChild( 0 ).getChild( 0 ) ) ).to.equal( 1 );
			expect( getIndent( viewElement.getChild( 0 ).getChild( 0 ).getChild( 1 ) ) ).to.equal( 1 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ).getChild( 0 ) ) ).to.equal( 1 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ).getChild( 1 ) ) ).to.equal( 1 );
		} );

		it( 'should ignore container elements', () => {
			const viewElement = parseView(
				'<ul>' +
					'<li>' +
						'<div>' +
							'<ul>' +
								'<li>a</li>' +
								'<li>b</li>' +
							'</ul>' +
						'</div>' +
					'</li>' +
					'<li>' +
						'<ul>' +
							'<li>c</li>' +
							'<li>d</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( getIndent( viewElement.getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 ) ) ).to.equal( 1 );
			expect( getIndent( viewElement.getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 1 ) ) ).to.equal( 1 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ).getChild( 0 ) ) ).to.equal( 1 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ).getChild( 1 ) ) ).to.equal( 1 );
		} );

		it( 'should handle deep nesting', () => {
			const viewElement = parseView(
				'<ul>' +
					'<li>' +
						'<ol>' +
							'<li>' +
								'<ul>' +
									'<li>a</li>' +
									'<li>b</li>' +
								'</ul>' +
							'</li>' +
						'</ol>' +
					'</li>' +
				'</ul>'
			);

			const innerList = viewElement.getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 );

			expect( getIndent( innerList.getChild( 0 ) ) ).to.equal( 2 );
			expect( getIndent( innerList.getChild( 1 ) ) ).to.equal( 2 );
		} );

		it( 'should ignore superfluous OLs', () => {
			const viewElement = parseView(
				'<ul>' +
					'<li>' +
						'<ol>' +
							'<ol>' +
								'<ol>' +
									'<ol>' +
										'<li>a</li>' +
									'</ol>' +
								'</ol>' +
							'</ol>' +
							'<li>b</li>' +
						'</ol>' +
					'</li>' +
				'</ul>'
			);

			const innerList = viewElement.getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 );

			expect( getIndent( innerList.getChild( 0 ) ) ).to.equal( 1 );
			expect( getIndent( viewElement.getChild( 0 ).getChild( 0 ).getChild( 1 ) ) ).to.equal( 1 );
		} );

		it( 'should handle broken structure', () => {
			const viewElement = parseView(
				'<ul>' +
					'<li>a</li>' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>' +
				'</ul>'
			);

			expect( getIndent( viewElement.getChild( 0 ) ) ).to.equal( 0 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ) ) ).to.equal( 1 );
		} );

		it( 'should handle broken deeper structure', () => {
			const viewElement = parseView(
				'<ul>' +
					'<li>a</li>' +
					'<ol>' +
						'<li>b</li>' +
						'<ul>' +
							'<li>c</li>' +
						'</ul>' +
						'</ol>' +
				'</ul>'
			);

			expect( getIndent( viewElement.getChild( 0 ) ) ).to.equal( 0 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ) ) ).to.equal( 1 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 1 ).getChild( 0 ) ) ).to.equal( 2 );
		} );
	} );

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
