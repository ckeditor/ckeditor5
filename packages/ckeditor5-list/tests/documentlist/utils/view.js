/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	createListElement,
	createListItemElement,
	getIndent,
	getViewElementNameForListType,
	isListItemView,
	isListView
} from '../../../src/documentlist/utils/view';

import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import DowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';
import StylesProcessor from '@ckeditor/ckeditor5-engine/src/view/stylesmap';
import Document from '@ckeditor/ckeditor5-engine/src/view/document';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'DocumentList - utils - view', () => {
	let viewUpcastWriter, viewDowncastWriter;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		const viewDocument = new Document( new StylesProcessor() );

		viewUpcastWriter = new UpcastWriter( viewDocument );
		viewDowncastWriter = new DowncastWriter( viewDocument );
	} );

	describe( 'isListView()', () => {
		it( 'should return true for UL element', () => {
			expect( isListView( viewUpcastWriter.createElement( 'ul' ) ) ).to.be.true;
		} );

		it( 'should return true for OL element', () => {
			expect( isListView( viewUpcastWriter.createElement( 'ol' ) ) ).to.be.true;
		} );

		it( 'should return false for LI element', () => {
			expect( isListView( viewUpcastWriter.createElement( 'li' ) ) ).to.be.false;
		} );

		it( 'should return false for other elements', () => {
			expect( isListView( viewUpcastWriter.createElement( 'a' ) ) ).to.be.false;
			expect( isListView( viewUpcastWriter.createElement( 'p' ) ) ).to.be.false;
			expect( isListView( viewUpcastWriter.createElement( 'div' ) ) ).to.be.false;
		} );
	} );

	describe( 'isListItemView()', () => {
		it( 'should return true for LI element', () => {
			expect( isListItemView( viewUpcastWriter.createElement( 'li' ) ) ).to.be.true;
		} );

		it( 'should return false for UL element', () => {
			expect( isListItemView( viewUpcastWriter.createElement( 'ul' ) ) ).to.be.false;
		} );

		it( 'should return false for OL element', () => {
			expect( isListItemView( viewUpcastWriter.createElement( 'ol' ) ) ).to.be.false;
		} );

		it( 'should return false for other elements', () => {
			expect( isListItemView( viewUpcastWriter.createElement( 'a' ) ) ).to.be.false;
			expect( isListItemView( viewUpcastWriter.createElement( 'p' ) ) ).to.be.false;
			expect( isListItemView( viewUpcastWriter.createElement( 'div' ) ) ).to.be.false;
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

	describe( 'createListElement()', () => {
		it( 'should create an attribute element for numbered list with given ID', () => {
			const element = createListElement( viewDowncastWriter, 0, 'numbered', 'abc' );

			expect( element.is( 'attributeElement', 'ol' ) ).to.be.true;
			expect( element.id ).to.equal( 'abc' );
		} );

		it( 'should create an attribute element for bulleted list with given ID', () => {
			const element = createListElement( viewDowncastWriter, 0, 'bulleted', '123' );

			expect( element.is( 'attributeElement', 'ul' ) ).to.be.true;
			expect( element.id ).to.equal( '123' );
		} );

		it( 'should create an attribute element OL for other list types', () => {
			const element = createListElement( viewDowncastWriter, 0, 'something', 'foobar' );

			expect( element.is( 'attributeElement', 'ul' ) ).to.be.true;
			expect( element.id ).to.equal( 'foobar' );
		} );

		it( 'should use priority related to indent', () => {
			let previousPriority = Number.NEGATIVE_INFINITY;

			for ( let i = 0; i < 20; i++ ) {
				const element = createListElement( viewDowncastWriter, i, 'abc', '123' );

				expect( element.priority ).to.be.greaterThan( previousPriority );
				expect( element.priority ).to.be.lessThan( 80 );

				previousPriority = element.priority;
			}
		} );
	} );

	describe( 'createListItemElement()', () => {
		it( 'should create an attribute element with given ID', () => {
			const element = createListItemElement( viewDowncastWriter, 0, 'abc' );

			expect( element.is( 'attributeElement', 'li' ) ).to.be.true;
			expect( element.id ).to.equal( 'abc' );
		} );

		it( 'should use priority related to indent', () => {
			let previousPriority = Number.NEGATIVE_INFINITY;

			for ( let i = 0; i < 20; i++ ) {
				const element = createListItemElement( viewDowncastWriter, i, 'abc' );

				expect( element.priority ).to.be.greaterThan( previousPriority );
				expect( element.priority ).to.be.lessThan( 80 );

				previousPriority = element.priority;
			}
		} );

		it( 'priorities of LI and UL should interleave between nesting levels', () => {
			let previousPriority = Number.NEGATIVE_INFINITY;

			for ( let i = 0; i < 20; i++ ) {
				const listElement = createListElement( viewDowncastWriter, i, 'abc', '123' );
				const listItemElement = createListItemElement( viewDowncastWriter, i, 'aaaa' );

				expect( listElement.priority ).to.be.greaterThan( previousPriority );
				expect( listElement.priority ).to.be.lessThan( 80 );

				previousPriority = listElement.priority;

				expect( listItemElement.priority ).to.be.greaterThan( previousPriority );
				expect( listItemElement.priority ).to.be.lessThan( 80 );

				previousPriority = listItemElement.priority;
			}
		} );
	} );

	describe( 'getViewElementNameForListType()', () => {
		it( 'should return "ol" for numbered type', () => {
			expect( getViewElementNameForListType( 'numbered' ) ).to.equal( 'ol' );
		} );

		it( 'should return "ul" for bulleted type', () => {
			expect( getViewElementNameForListType( 'bulleted' ) ).to.equal( 'ul' );
		} );

		it( 'should return "ul" for other types', () => {
			expect( getViewElementNameForListType( 'foo' ) ).to.equal( 'ul' );
			expect( getViewElementNameForListType( 'bar' ) ).to.equal( 'ul' );
			expect( getViewElementNameForListType( 'sth' ) ).to.equal( 'ul' );
		} );
	} );
} );
