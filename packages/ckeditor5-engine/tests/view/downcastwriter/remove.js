/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DowncastWriter from '../../../src/view/downcastwriter.js';
import ContainerElement from '../../../src/view/containerelement.js';
import Range from '../../../src/view/range.js';
import DocumentFragment from '../../../src/view/documentfragment.js';
import { stringify, parse } from '../../../src/dev-utils/view.js';
import AttributeElement from '../../../src/view/attributeelement.js';
import EmptyElement from '../../../src/view/emptyelement.js';
import UIElement from '../../../src/view/uielement.js';
import RawElement from '../../../src/view/rawelement.js';

import Document from '../../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'remove()', () => {
		let writer, document;

		// Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
		// test ranges.
		//
		// @param {String} input
		// @param {String} expectedResult
		// @param {String} expectedRemoved
		// @param {Boolean} asItem
		function testRemove( input, expectedResult, expectedRemoved, asItem = false ) {
			const { view, selection } = parse( input );

			const range = selection.getFirstRange();
			const rangeOrItem = asItem ? Array.from( range.getItems() )[ 0 ] : range;
			const removed = writer.remove( rangeOrItem );

			expect( stringify( view, asItem ? null : range, { showType: true, showPriority: true } ) ).to.equal( expectedResult );
			expect( stringify( removed, null, { showType: true, showPriority: true } ) ).to.equal( expectedRemoved );
		}

		beforeEach( () => {
			document = new Document( new StylesProcessor() );
			writer = new DowncastWriter( document );
		} );

		it( 'should throw when range placed in two containers', () => {
			const p1 = new ContainerElement( document, 'p' );
			const p2 = new ContainerElement( document, 'p' );

			expectToThrowCKEditorError( () => {
				writer.remove( Range._createFromParentsAndOffsets( p1, 0, p2, 0 ) );
			}, 'view-writer-invalid-range-container', document );
		} );

		it( 'should throw when range has no parent container', () => {
			const el = new AttributeElement( document, 'b' );

			expectToThrowCKEditorError( () => {
				writer.remove( Range._createFromParentsAndOffsets( el, 0, el, 0 ) );
			}, 'view-writer-invalid-range-container', document );
		} );

		it( 'should return empty DocumentFragment when range is collapsed', () => {
			const p = new ContainerElement( document, 'p' );
			const range = Range._createFromParentsAndOffsets( p, 0, p, 0 );
			const fragment = writer.remove( range );

			expect( fragment ).to.be.instanceof( DocumentFragment );
			expect( fragment.childCount ).to.equal( 0 );
			expect( range.isCollapsed ).to.be.true;
		} );

		it( 'should remove single text node', () => {
			testRemove( '<container:p>[foobar]</container:p>', '<container:p>[]</container:p>', 'foobar' );
		} );

		it( 'should not leave empty text nodes', () => {
			testRemove( '<container:p>{foobar}</container:p>', '<container:p>[]</container:p>', 'foobar' );
		} );

		it( 'should remove part of the text node', () => {
			testRemove( '<container:p>f{oob}ar</container:p>', '<container:p>f{}ar</container:p>', 'oob' );
		} );

		it( 'should remove parts of nodes #1', () => {
			testRemove(
				'<container:p>f{oo<attribute:b view-priority="10">ba}r</attribute:b></container:p>',
				'<container:p>f[]<attribute:b view-priority="10">r</attribute:b></container:p>',
				'oo<attribute:b view-priority="10">ba</attribute:b>'
			);
		} );

		it( 'should support unicode', () => {
			testRemove(
				'<container:p>நி{லை<attribute:b view-priority="10">க்}கு</attribute:b></container:p>',
				'<container:p>நி[]<attribute:b view-priority="10">கு</attribute:b></container:p>',
				'லை<attribute:b view-priority="10">க்</attribute:b>'
			);
		} );

		it( 'should merge after removing #1', () => {
			testRemove(
				'<container:p>' +
					'<attribute:b view-priority="1">foo</attribute:b>[bar]<attribute:b view-priority="1">bazqux</attribute:b>' +
				'</container:p>',
				'<container:p><attribute:b view-priority="1">foo{}bazqux</attribute:b></container:p>',
				'bar'
			);
		} );

		it( 'should merge after removing #2', () => {
			testRemove(
				'<container:p>' +
					'<attribute:b view-priority="1">fo{o</attribute:b>bar<attribute:b view-priority="1">ba}zqux</attribute:b>' +
				'</container:p>',
				'<container:p><attribute:b view-priority="1">fo{}zqux</attribute:b></container:p>',
				'<attribute:b view-priority="1">o</attribute:b>bar<attribute:b view-priority="1">ba</attribute:b>'
			);
		} );

		it( 'should remove part of the text node in document fragment', () => {
			testRemove( 'fo{ob}ar', 'fo{}ar', 'ob' );
		} );

		it( 'should remove EmptyElement', () => {
			testRemove(
				'<container:p>foo[<empty:img></empty:img>]bar</container:p>',
				'<container:p>foo{}bar</container:p>',
				'<empty:img></empty:img>'
			);
		} );

		it( 'should throw if range is placed inside EmptyElement', () => {
			const emptyElement = new EmptyElement( document, 'img' );
			const attributeElement = new AttributeElement( document, 'b' );
			new ContainerElement( document, 'p', null, [ emptyElement, attributeElement ] ); // eslint-disable-line no-new
			const range = Range._createFromParentsAndOffsets( emptyElement, 0, attributeElement, 0 );

			expectToThrowCKEditorError( () => {
				writer.remove( range );
			}, 'view-writer-cannot-break-empty-element', document );
		} );

		it( 'should remove UIElement', () => {
			testRemove(
				'<container:p>foo[<ui:span></ui:span>]bar</container:p>',
				'<container:p>foo{}bar</container:p>',
				'<ui:span></ui:span>'
			);
		} );

		it( 'should throw if range is placed inside UIElement', () => {
			const uiElement = new UIElement( document, 'span' );
			const attributeElement = new AttributeElement( document, 'b' );
			new ContainerElement( document, 'p', null, [ uiElement, attributeElement ] ); // eslint-disable-line no-new
			const range = Range._createFromParentsAndOffsets( uiElement, 0, attributeElement, 0 );

			expectToThrowCKEditorError( () => {
				writer.remove( range );
			}, 'view-writer-cannot-break-ui-element', document );
		} );

		it( 'should remove a RawElement', () => {
			testRemove(
				'<container:p>foo[<raw:span></raw:span>]bar</container:p>',
				'<container:p>foo{}bar</container:p>',
				'<raw:span></raw:span>'
			);
		} );

		it( 'should throw if a range is placed inside a RawElement', () => {
			const rawElement = new RawElement( document, 'span' );
			const attributeElement = new AttributeElement( document, 'b' );
			new ContainerElement( document, 'p', null, [ rawElement, attributeElement ] ); // eslint-disable-line no-new
			const range = Range._createFromParentsAndOffsets( rawElement, 0, attributeElement, 0 );

			expectToThrowCKEditorError( () => {
				writer.remove( range );
			}, 'view-writer-cannot-break-raw-element', document );
		} );

		it( 'should remove single text node (as item)', () => {
			testRemove( '<container:p>[foobar]</container:p>', '<container:p></container:p>', 'foobar', true );
		} );

		it( 'should not leave empty text nodes (as item)', () => {
			testRemove( '<container:p>{foobar}</container:p>', '<container:p></container:p>', 'foobar', true );
		} );

		it( 'should remove part of the text node (as item)', () => {
			testRemove( '<container:p>f{oob}ar</container:p>', '<container:p>far</container:p>', 'oob', true );
		} );

		it( 'should merge after removing (as item)', () => {
			testRemove(
				'<container:p>' +
					'<attribute:b view-priority="1">foo</attribute:b>[bar]<attribute:b view-priority="1">bazqux</attribute:b>' +
				'</container:p>',
				'<container:p><attribute:b view-priority="1">foobazqux</attribute:b></container:p>',
				'bar',
				true
			);
		} );

		it( 'should remove EmptyElement (as item)', () => {
			testRemove(
				'<container:p>foo[<empty:img></empty:img>]bar</container:p>',
				'<container:p>foobar</container:p>',
				'<empty:img></empty:img>',
				true
			);
		} );

		it( 'should remove UIElement (as item)', () => {
			testRemove(
				'<container:p>foo[<ui:span></ui:span>]bar</container:p>',
				'<container:p>foobar</container:p>',
				'<ui:span></ui:span>',
				true
			);
		} );

		it( 'should remove a RawElement (as an item)', () => {
			testRemove(
				'<container:p>foo[<raw:span></raw:span>]bar</container:p>',
				'<container:p>foobar</container:p>',
				'<raw:span></raw:span>',
				true
			);
		} );

		it( 'should throw when item has no parent container', () => {
			const el = new AttributeElement( document, 'b' );

			expectToThrowCKEditorError( () => {
				writer.remove( el );
			}, 'view-position-before-root' );
		} );
	} );
} );
