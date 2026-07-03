/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
	createListElement,
	createListItemElement,
	getIndent,
	getViewElementIdForListType,
	getViewElementNameForListType,
	isListItemView,
	isListView
} from '../../../src/list/utils/view.js';

import { ViewUpcastWriter, ViewDowncastWriter, StylesProcessor, ViewDocument, _parseView } from '@ckeditor/ckeditor5-engine';

describe( 'List - utils - view', () => {
	let viewUpcastWriter, viewDowncastWriter;

	beforeEach( () => {
		const viewDocument = new ViewDocument( new StylesProcessor() );

		viewUpcastWriter = new ViewUpcastWriter( viewDocument );
		viewDowncastWriter = new ViewDowncastWriter( viewDocument );
	} );

	describe( 'isListView()', () => {
		it( 'should return true for UL element', () => {
			expect( isListView( viewUpcastWriter.createElement( 'ul' ) ) ).toBe( true );
		} );

		it( 'should return true for OL element', () => {
			expect( isListView( viewUpcastWriter.createElement( 'ol' ) ) ).toBe( true );
		} );

		it( 'should return false for LI element', () => {
			expect( isListView( viewUpcastWriter.createElement( 'li' ) ) ).toBe( false );
		} );

		it( 'should return false for other elements', () => {
			expect( isListView( viewUpcastWriter.createElement( 'a' ) ) ).toBe( false );
			expect( isListView( viewUpcastWriter.createElement( 'p' ) ) ).toBe( false );
			expect( isListView( viewUpcastWriter.createElement( 'div' ) ) ).toBe( false );
		} );
	} );

	describe( 'isListItemView()', () => {
		it( 'should return true for LI element', () => {
			expect( isListItemView( viewUpcastWriter.createElement( 'li' ) ) ).toBe( true );
		} );

		it( 'should return false for UL element', () => {
			expect( isListItemView( viewUpcastWriter.createElement( 'ul' ) ) ).toBe( false );
		} );

		it( 'should return false for OL element', () => {
			expect( isListItemView( viewUpcastWriter.createElement( 'ol' ) ) ).toBe( false );
		} );

		it( 'should return false for other elements', () => {
			expect( isListItemView( viewUpcastWriter.createElement( 'a' ) ) ).toBe( false );
			expect( isListItemView( viewUpcastWriter.createElement( 'p' ) ) ).toBe( false );
			expect( isListItemView( viewUpcastWriter.createElement( 'div' ) ) ).toBe( false );
		} );
	} );

	describe( 'getIndent()', () => {
		it( 'should return 0 for flat list', () => {
			const viewElement = _parseView(
				'<ul>' +
					'<li>a</li>' +
					'<li>b</li>' +
				'</ul>'
			);

			expect( getIndent( viewElement.getChild( 0 ) ) ).toBe( 0 );
			expect( getIndent( viewElement.getChild( 1 ) ) ).toBe( 0 );
		} );

		it( 'should return 1 for first level nested items', () => {
			const viewElement = _parseView(
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

			expect( getIndent( viewElement.getChild( 0 ).getChild( 0 ).getChild( 0 ) ) ).toBe( 1 );
			expect( getIndent( viewElement.getChild( 0 ).getChild( 0 ).getChild( 1 ) ) ).toBe( 1 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ).getChild( 0 ) ) ).toBe( 1 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ).getChild( 1 ) ) ).toBe( 1 );
		} );

		it( 'should ignore container elements', () => {
			const viewElement = _parseView(
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

			expect( getIndent( viewElement.getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 0 ) ) ).toBe( 1 );
			expect( getIndent( viewElement.getChild( 0 ).getChild( 0 ).getChild( 0 ).getChild( 1 ) ) ).toBe( 1 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ).getChild( 0 ) ) ).toBe( 1 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ).getChild( 1 ) ) ).toBe( 1 );
		} );

		it( 'should handle deep nesting', () => {
			const viewElement = _parseView(
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

			expect( getIndent( innerList.getChild( 0 ) ) ).toBe( 2 );
			expect( getIndent( innerList.getChild( 1 ) ) ).toBe( 2 );
		} );

		it( 'should ignore superfluous OLs', () => {
			const viewElement = _parseView(
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

			expect( getIndent( innerList.getChild( 0 ) ) ).toBe( 1 );
			expect( getIndent( viewElement.getChild( 0 ).getChild( 0 ).getChild( 1 ) ) ).toBe( 1 );
		} );

		it( 'should handle broken structure', () => {
			const viewElement = _parseView(
				'<ul>' +
					'<li>a</li>' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>' +
				'</ul>'
			);

			expect( getIndent( viewElement.getChild( 0 ) ) ).toBe( 0 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ) ) ).toBe( 1 );
		} );

		it( 'should handle broken deeper structure', () => {
			const viewElement = _parseView(
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

			expect( getIndent( viewElement.getChild( 0 ) ) ).toBe( 0 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 0 ) ) ).toBe( 1 );
			expect( getIndent( viewElement.getChild( 1 ).getChild( 1 ).getChild( 0 ) ) ).toBe( 2 );
		} );
	} );

	describe( 'createListElement()', () => {
		it( 'should create an attribute element for numbered list', () => {
			const element = createListElement( viewDowncastWriter, 0, 'numbered' );

			expect( element.is( 'attributeElement', 'ol' ) ).toBe( true );
		} );

		it( 'should create an attribute element for bulleted list', () => {
			const element = createListElement( viewDowncastWriter, 0, 'bulleted' );

			expect( element.is( 'attributeElement', 'ul' ) ).toBe( true );
		} );

		it( 'should create an attribute element OL for other list types', () => {
			const element = createListElement( viewDowncastWriter, 0, 'something' );

			expect( element.is( 'attributeElement', 'ul' ) ).toBe( true );
		} );

		it( 'should use priority related to indent', () => {
			let previousPriority = Number.NEGATIVE_INFINITY;

			for ( let i = 0; i < 20; i++ ) {
				const element = createListElement( viewDowncastWriter, i, 'abc' );

				expect( element.priority ).toBeGreaterThan( previousPriority );
				expect( element.priority ).toBeLessThan( 80 );

				previousPriority = element.priority;
			}
		} );
	} );

	describe( 'createListItemElement()', () => {
		it( 'should create an attribute element with given ID', () => {
			const element = createListItemElement( viewDowncastWriter, 0, 'abc' );

			expect( element.is( 'attributeElement', 'li' ) ).toBe( true );
			expect( element.id ).toBe( 'abc' );
		} );

		it( 'should use priority related to indent', () => {
			let previousPriority = Number.NEGATIVE_INFINITY;

			for ( let i = 0; i < 20; i++ ) {
				const element = createListItemElement( viewDowncastWriter, i, 'abc' );

				expect( element.priority ).toBeGreaterThan( previousPriority );
				expect( element.priority ).toBeLessThan( 80 );

				previousPriority = element.priority;
			}
		} );

		it( 'priorities of LI and UL should interleave between nesting levels', () => {
			let previousPriority = Number.NEGATIVE_INFINITY;

			for ( let i = 0; i < 20; i++ ) {
				const listElement = createListElement( viewDowncastWriter, i, 'abc', '123' );
				const listItemElement = createListItemElement( viewDowncastWriter, i, 'aaaa' );

				expect( listElement.priority ).toBeGreaterThan( previousPriority );
				expect( listElement.priority ).toBeLessThan( 80 );

				previousPriority = listElement.priority;

				expect( listItemElement.priority ).toBeGreaterThan( previousPriority );
				expect( listItemElement.priority ).toBeLessThan( 80 );

				previousPriority = listItemElement.priority;
			}
		} );
	} );

	describe( 'getViewElementNameForListType()', () => {
		it( 'should return "ol" for numbered type', () => {
			expect( getViewElementNameForListType( 'numbered' ) ).toBe( 'ol' );
		} );

		it( 'should return "ul" for bulleted type', () => {
			expect( getViewElementNameForListType( 'bulleted' ) ).toBe( 'ul' );
		} );

		it( 'should return "ol" for customNumbered type', () => {
			expect( getViewElementNameForListType( 'customNumbered' ) ).toBe( 'ol' );
		} );

		it( 'should return "ul" for customBulleted type', () => {
			expect( getViewElementNameForListType( 'customBulleted' ) ).toBe( 'ul' );
		} );

		it( 'should return "ul" for other types', () => {
			expect( getViewElementNameForListType( 'foo' ) ).toBe( 'ul' );
			expect( getViewElementNameForListType( 'bar' ) ).toBe( 'ul' );
			expect( getViewElementNameForListType( 'sth' ) ).toBe( 'ul' );
		} );
	} );

	describe( 'getViewElementIdForListType()', () => {
		it( 'should generate view element ID for the given list type and indent', () => {
			expect( getViewElementIdForListType( 'bulleted', 0 ) ).toBe( 'list-bulleted-0' );
			expect( getViewElementIdForListType( 'bulleted', 1 ) ).toBe( 'list-bulleted-1' );
			expect( getViewElementIdForListType( 'bulleted', 2 ) ).toBe( 'list-bulleted-2' );
			expect( getViewElementIdForListType( 'numbered', 0 ) ).toBe( 'list-numbered-0' );
			expect( getViewElementIdForListType( 'numbered', 1 ) ).toBe( 'list-numbered-1' );
			expect( getViewElementIdForListType( 'numbered', 2 ) ).toBe( 'list-numbered-2' );
		} );
	} );
} );
