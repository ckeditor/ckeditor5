/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDowncastWriter } from '../../../src/view/downcastwriter.js';
import { _stringifyView, _parseView } from '../../../src/dev-utils/view.js';
import { ViewContainerElement } from '../../../src/view/containerelement.js';
import { ViewAttributeElement } from '../../../src/view/attributeelement.js';
import { ViewRootEditableElement } from '../../../src/view/rooteditableelement.js';
import { ViewEmptyElement } from '../../../src/view/emptyelement.js';
import { ViewUIElement } from '../../../src/view/uielement.js';
import { ViewRawElement } from '../../../src/view/rawelement.js';
import { ViewRange } from '../../../src/view/range.js';
import { ViewPosition } from '../../../src/view/position.js';

import { ViewDocument } from '../../../src/view/document.js';
import { Mapper } from '../../../src/conversion/mapper.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'move()', () => {
		let writer, document;

		// Executes test using `_parseView` and `_stringifyView` utils functions. Uses range delimiters `[]{}` to create and
		// test ranges.
		//
		// @param {String} input
		// @param {String} expectedResult
		// @param {String} expectedRemoved
		function testMove( source, destination, sourceAfterMove, destinationAfterMove ) {
			const { view: srcView, selection: srcSelection } = _parseView( source );
			const { view: dstView, selection: dstSelection } = _parseView( destination );

			const newRange = writer.move( srcSelection.getFirstRange(), dstSelection.getFirstPosition() );

			expect( _stringifyView( dstView, newRange, { showType: true, showPriority: true } ) ).to.equal( destinationAfterMove );
			expect( _stringifyView( srcView, null, { showType: true, showPriority: true } ) ).to.equal( sourceAfterMove );
		}

		before( () => {
			document = new ViewDocument( new StylesProcessor() );
			writer = new ViewDowncastWriter( document );
		} );

		it( 'should move single text node', () => {
			testMove(
				'<container:p>[foobar]</container:p>',
				'<container:p>[]</container:p>',
				'<container:p></container:p>',
				'<container:p>[foobar]</container:p>'
			);
		} );

		it( 'should not leave empty text nodes', () => {
			testMove(
				'<container:p>{foobar}</container:p>',
				'<container:p>[]</container:p>',
				'<container:p></container:p>',
				'<container:p>[foobar]</container:p>'
			);
		} );

		it( 'should move part of the text node', () => {
			testMove(
				'<container:p>f{oob}ar</container:p>',
				'<container:p>[]</container:p>',
				'<container:p>far</container:p>',
				'<container:p>[oob]</container:p>'
			);
		} );

		it( 'should support unicode', () => {
			testMove(
				'<container:p>நி{லை}க்கு</container:p>',
				'<container:p>நி{}கு</container:p>',
				'<container:p>நிக்கு</container:p>',
				'<container:p>நி{லை}கு</container:p>'
			);
		} );

		it( 'should move parts of nodes', () => {
			testMove(
				'<container:p>f{oo<attribute:b view-priority="10">ba}r</attribute:b></container:p>',
				'<container:p>[]<attribute:b view-priority="10">qux</attribute:b></container:p>',
				'<container:p>f<attribute:b view-priority="10">r</attribute:b></container:p>',
				'<container:p>[oo<attribute:b view-priority="10">ba}qux</attribute:b></container:p>'
			);
		} );

		it( 'should merge after moving #1', () => {
			testMove(
				'<container:p>' +
					'<attribute:b view-priority="1">foo</attribute:b>[bar]<attribute:b view-priority="1">bazqux</attribute:b>' +
				'</container:p>',
				'<container:p><attribute:b view-priority="1">foo{}bazqux</attribute:b></container:p>',
				'<container:p><attribute:b view-priority="1">foobazqux</attribute:b></container:p>',
				'<container:p>' +
					'<attribute:b view-priority="1">foo</attribute:b>[bar]<attribute:b view-priority="1">bazqux</attribute:b>' +
				'</container:p>'
			);
		} );

		it( 'should merge after moving #2', () => {
			testMove(
				'<container:p>' +
					'<attribute:b view-priority="1">fo{o</attribute:b>bar<attribute:b view-priority="1">ba}zqux</attribute:b>' +
				'</container:p>',
				'<container:p><attribute:b view-priority="1">fo{}zqux</attribute:b></container:p>',
				'<container:p><attribute:b view-priority="1">fozqux</attribute:b></container:p>',
				'<container:p>' +
					'<attribute:b view-priority="1">fo{o</attribute:b>bar<attribute:b view-priority="1">ba}zqux</attribute:b>' +
				'</container:p>'
			);
		} );

		it( 'should move part of the text node in document fragment', () => {
			testMove( 'fo{ob}ar', 'fo{}ar', 'foar', 'fo{ob}ar' );
		} );

		it( 'should correctly move text nodes inside same parent', () => {
			const { view, selection } = _parseView(
				'<container:p>[<attribute:b>a</attribute:b>]b<attribute:b>c</attribute:b></container:p>'
			);

			const newRange = writer.move( selection.getFirstRange(), ViewPosition._createAt( view, 2 ) );

			const expectedView = '<container:p>b[<attribute:b>a}c</attribute:b></container:p>';
			expect( _stringifyView( view, newRange, { showType: true } ) ).to.equal( expectedView );
		} );

		it( 'should correctly move text nodes inside same container', () => {
			const { view, selection } = _parseView(
				'<container:p><attribute:b>a{b</attribute:b>xx<attribute:b>c}d</attribute:b>yy</container:p>'
			);

			const viewText = view.getChild( 3 );
			const newRange = writer.move( selection.getFirstRange(), ViewPosition._createAt( viewText, 1 ) );

			expect( _stringifyView( view, newRange, { showType: true } ) ).to.equal(
				'<container:p><attribute:b>ad</attribute:b>y[<attribute:b>b</attribute:b>xx<attribute:b>c</attribute:b>]y</container:p>'
			);
		} );

		it( 'should move ViewEmptyElement', () => {
			testMove(
				'<container:p>foo[<empty:img></empty:img>]bar</container:p>',
				'<container:div>baz{}quix</container:div>',
				'<container:p>foobar</container:p>',
				'<container:div>baz[<empty:img></empty:img>]quix</container:div>'
			);
		} );

		it( 'should throw if trying to move to ViewEmptyElement', () => {
			const srcAttribute = new ViewAttributeElement( document, 'b' );
			const srcContainer = new ViewContainerElement( document, 'p', null, srcAttribute );
			const srcRange = ViewRange._createFromParentsAndOffsets( srcContainer, 0, srcContainer, 1 );

			const dstEmpty = new ViewEmptyElement( document, 'img' );
			new ViewContainerElement( document, 'p', null, dstEmpty ); // eslint-disable-line no-new
			const dstPosition = new ViewPosition( dstEmpty, 0 );

			expectToThrowCKEditorError( () => {
				writer.move( srcRange, dstPosition );
			}, 'view-writer-cannot-break-empty-element', writer );
		} );

		it( 'should move UIElement', () => {
			testMove(
				'<container:p>foo[<ui:span></ui:span>]bar</container:p>',
				'<container:div>baz{}quix</container:div>',
				'<container:p>foobar</container:p>',
				'<container:div>baz[<ui:span></ui:span>]quix</container:div>'
			);
		} );

		it( 'should throw if trying to move to UIElement', () => {
			const srcAttribute = new ViewAttributeElement( document, 'b' );
			const srcContainer = new ViewContainerElement( document, 'p', null, srcAttribute );
			const srcRange = ViewRange._createFromParentsAndOffsets( srcContainer, 0, srcContainer, 1 );

			const dstUI = new ViewUIElement( document, 'span' );
			new ViewContainerElement( document, 'p', null, dstUI ); // eslint-disable-line no-new
			const dstPosition = new ViewPosition( dstUI, 0 );

			expectToThrowCKEditorError( () => {
				writer.move( srcRange, dstPosition );
			}, 'view-writer-cannot-break-ui-element', writer );
		} );

		it( 'should move a RawElement', () => {
			testMove(
				'<container:p>foo[<raw:span></raw:span>]bar</container:p>',
				'<container:div>baz{}quix</container:div>',
				'<container:p>foobar</container:p>',
				'<container:div>baz[<raw:span></raw:span>]quix</container:div>'
			);
		} );

		it( 'should throw if trying to move to a RawElement', () => {
			const srcAttribute = new ViewAttributeElement( document, 'b' );
			const srcContainer = new ViewContainerElement( document, 'p', null, srcAttribute );
			const srcRange = ViewRange._createFromParentsAndOffsets( srcContainer, 0, srcContainer, 1 );

			const dstRawElement = new ViewRawElement( document, 'span' );
			new ViewContainerElement( document, 'p', null, dstRawElement ); // eslint-disable-line no-new
			const dstPosition = new ViewPosition( dstRawElement, 0 );

			expectToThrowCKEditorError( () => {
				writer.move( srcRange, dstPosition );
			}, 'view-writer-cannot-break-raw-element', writer );
		} );

		it( 'should not break marker mappings if marker element was split and the original element was removed', () => {
			const mapper = new Mapper();

			const srcContainer = new ViewContainerElement( document, 'p' );
			const dstContainer = new ViewContainerElement( document, 'p' );

			const root = new ViewRootEditableElement( document, 'div' );
			root._appendChild( [ srcContainer, dstContainer ] );

			const attrElemA = new ViewAttributeElement( document, 'span' );
			attrElemA._id = 'foo';

			const attrElemB = new ViewAttributeElement( document, 'span' );
			attrElemB._id = 'foo';

			writer.insert( new ViewPosition( srcContainer, 0 ), [ attrElemA, attrElemB ] );

			mapper.bindElementToMarker( attrElemA, 'foo' );

			expect( mapper.markerNameToElements( 'foo' ).size ).to.equal( 2 );

			writer.remove( writer.createRangeOn( attrElemA ) );

			expect( mapper.markerNameToElements( 'foo' ).size ).to.equal( 1 );

			writer.move( writer.createRangeOn( attrElemB ), new ViewPosition( dstContainer, 0 ) );

			expect( mapper.markerNameToElements( 'foo' ).size ).to.equal( 1 );
		} );
	} );
} );
