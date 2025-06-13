/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDowncastWriter } from '../../../src/view/downcastwriter.js';
import { ViewContainerElement } from '../../../src/view/containerelement.js';
import { ViewRange } from '../../../src/view/range.js';
import { ViewDocumentFragment } from '../../../src/view/documentfragment.js';
import { _stringifyView, _parseView } from '../../../src/dev-utils/view.js';
import { ViewAttributeElement } from '../../../src/view/attributeelement.js';
import { ViewEmptyElement } from '../../../src/view/emptyelement.js';
import { UIElement } from '../../../src/view/uielement.js';
import { ViewRawElement } from '../../../src/view/rawelement.js';

import { ViewDocument } from '../../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'remove()', () => {
		let writer, document;

		// Executes test using `_parseView` and `_stringifyView` utils functions. Uses range delimiters `[]{}` to create and
		// test ranges.
		//
		// @param {String} input
		// @param {String} expectedResult
		// @param {String} expectedRemoved
		// @param {Boolean} asItem
		function testRemove( input, expectedResult, expectedRemoved, asItem = false ) {
			const { view, selection } = _parseView( input );

			const range = selection.getFirstRange();
			const rangeOrItem = asItem ? Array.from( range.getItems() )[ 0 ] : range;
			const removed = writer.remove( rangeOrItem );

			expect( _stringifyView( view, asItem ? null : range, { showType: true, showPriority: true } ) ).to.equal( expectedResult );
			expect( _stringifyView( removed, null, { showType: true, showPriority: true } ) ).to.equal( expectedRemoved );
		}

		beforeEach( () => {
			document = new ViewDocument( new StylesProcessor() );
			writer = new ViewDowncastWriter( document );
		} );

		it( 'should throw when range placed in two containers', () => {
			const p1 = new ViewContainerElement( document, 'p' );
			const p2 = new ViewContainerElement( document, 'p' );

			expectToThrowCKEditorError( () => {
				writer.remove( ViewRange._createFromParentsAndOffsets( p1, 0, p2, 0 ) );
			}, 'view-writer-invalid-range-container', document );
		} );

		it( 'should throw when range has no parent container', () => {
			const el = new ViewAttributeElement( document, 'b' );

			expectToThrowCKEditorError( () => {
				writer.remove( ViewRange._createFromParentsAndOffsets( el, 0, el, 0 ) );
			}, 'view-writer-invalid-range-container', document );
		} );

		it( 'should return empty DocumentFragment when range is collapsed', () => {
			const p = new ViewContainerElement( document, 'p' );
			const range = ViewRange._createFromParentsAndOffsets( p, 0, p, 0 );
			const fragment = writer.remove( range );

			expect( fragment ).to.be.instanceof( ViewDocumentFragment );
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

		it( 'should remove ViewEmptyElement', () => {
			testRemove(
				'<container:p>foo[<empty:img></empty:img>]bar</container:p>',
				'<container:p>foo{}bar</container:p>',
				'<empty:img></empty:img>'
			);
		} );

		it( 'should throw if range is placed inside ViewEmptyElement', () => {
			const emptyElement = new ViewEmptyElement( document, 'img' );
			const attributeElement = new ViewAttributeElement( document, 'b' );
			new ViewContainerElement( document, 'p', null, [ emptyElement, attributeElement ] ); // eslint-disable-line no-new
			const range = ViewRange._createFromParentsAndOffsets( emptyElement, 0, attributeElement, 0 );

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
			const attributeElement = new ViewAttributeElement( document, 'b' );
			new ViewContainerElement( document, 'p', null, [ uiElement, attributeElement ] ); // eslint-disable-line no-new
			const range = ViewRange._createFromParentsAndOffsets( uiElement, 0, attributeElement, 0 );

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
			const rawElement = new ViewRawElement( document, 'span' );
			const attributeElement = new ViewAttributeElement( document, 'b' );
			new ViewContainerElement( document, 'p', null, [ rawElement, attributeElement ] ); // eslint-disable-line no-new
			const range = ViewRange._createFromParentsAndOffsets( rawElement, 0, attributeElement, 0 );

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

		it( 'should remove ViewEmptyElement (as item)', () => {
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
			const el = new ViewAttributeElement( document, 'b' );

			expectToThrowCKEditorError( () => {
				writer.remove( el );
			}, 'view-position-before-root' );
		} );
	} );
} );
