/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDowncastWriter } from '../../../src/view/downcastwriter.js';
import { ViewContainerElement } from '../../../src/view/containerelement.js';
import { Element } from '../../../src/view/element.js';
import { EmptyElement } from '../../../src/view/emptyelement.js';
import { UIElement } from '../../../src/view/uielement.js';
import { RawElement } from '../../../src/view/rawelement.js';
import { Position } from '../../../src/view/position.js';

import { _stringifyView, _parseView } from '../../../src/dev-utils/view.js';
import { ViewAttributeElement } from '../../../src/view/attributeelement.js';
import { ViewDocument } from '../../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'insert()', () => {
		let writer, document;

		// Executes test using `_parseView` and `_stringifyView` utils functions.
		//
		// @param {String} input
		// @param {Array.<String>} nodesToInsert
		// @param {String} expected
		function testInsert( input, nodesToInsert, expected ) {
			nodesToInsert = nodesToInsert.map( node => _parseView( node ) );
			const { view, selection } = _parseView( input );

			const newRange = writer.insert( selection.getFirstPosition(), nodesToInsert );

			expect( _stringifyView( view.root, newRange, { showType: true, showPriority: true } ) ).to.equal( expected );
		}

		beforeEach( () => {
			document = new ViewDocument( new StylesProcessor() );
			writer = new ViewDowncastWriter( document );
		} );

		it( 'should return collapsed range in insertion position when using empty array', () => {
			testInsert(
				'<container:p>foo{}bar</container:p>',
				[],
				'<container:p>foo{}bar</container:p>'
			);
		} );

		it( 'should insert text into another text node #1', () => {
			testInsert(
				'<container:p>foo{}bar</container:p>',
				[ 'baz' ],
				'<container:p>foo{baz}bar</container:p>'
			);
		} );

		it( 'should insert text into another text node #2', () => {
			testInsert(
				'<container:p>foobar{}</container:p>',
				[ 'baz' ],
				'<container:p>foobar{baz]</container:p>'
			);
		} );

		it( 'should insert text into another text node #3', () => {
			testInsert(
				'<container:p>{}foobar</container:p>',
				[ 'baz' ],
				'<container:p>[baz}foobar</container:p>'
			);
		} );

		it( 'should break attributes when inserting into text node', () => {
			testInsert(
				'<container:p>foo{}bar</container:p>',
				[ '<attribute:b view-priority="1">baz</attribute:b>' ],
				'<container:p>foo[<attribute:b view-priority="1">baz</attribute:b>]bar</container:p>'
			);
		} );

		it( 'should merge text nodes', () => {
			testInsert(
				'<container:p>[]foobar</container:p>',
				[ 'baz' ],
				'<container:p>[baz}foobar</container:p>'
			);
		} );

		it( 'should merge same attribute nodes', () => {
			testInsert(
				'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>',
				[ '<attribute:b view-priority="1">baz</attribute:b>' ],
				'<container:p><attribute:b view-priority="1">foo{baz}bar</attribute:b></container:p>'
			);
		} );

		it( 'should not merge different attributes', () => {
			testInsert(
				'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>',
				[ '<attribute:b view-priority="2">baz</attribute:b>' ],
				'<container:p>' +
					'<attribute:b view-priority="1">' +
						'foo' +
					'</attribute:b>' +
					'[' +
					'<attribute:b view-priority="2">' +
						'baz' +
					'</attribute:b>' +
					']' +
					'<attribute:b view-priority="1">' +
						'bar' +
					'</attribute:b>' +
				'</container:p>'
			);
		} );

		it( 'should allow to insert multiple nodes', () => {
			testInsert(
				'<container:p>[]</container:p>',
				[ '<attribute:b view-priority="1">foo</attribute:b>', 'bar' ],
				'<container:p>[<attribute:b view-priority="1">foo</attribute:b>bar]</container:p>'
			);
		} );

		it( 'should merge after inserting multiple nodes', () => {
			testInsert(
				'<container:p><attribute:b view-priority="1">qux</attribute:b>[]baz</container:p>',
				[ '<attribute:b view-priority="1">foo</attribute:b>', 'bar' ],
				'<container:p><attribute:b view-priority="1">qux{foo</attribute:b>bar}baz</container:p>'
			);
		} );

		it( 'should insert text into in document fragment', () => {
			testInsert(
				'foo{}bar',
				[ 'baz' ],
				'foo{baz}bar'
			);
		} );

		it( 'should merge same attribute nodes in document fragment', () => {
			testInsert(
				'<attribute:b view-priority="2">foo</attribute:b>[]',
				[ '<attribute:b view-priority="1">bar</attribute:b>' ],
				'<attribute:b view-priority="2">foo</attribute:b>[<attribute:b view-priority="1">bar</attribute:b>]'
			);
		} );

		it( 'should insert unicode text into unicode text', () => {
			testInsert(
				'நி{}க்கு',
				[ 'லை' ],
				'நி{லை}க்கு'
			);
		} );

		it( 'should not break attribute on UIElement insertion', () => {
			testInsert(
				'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>',
				[ '<ui:span></ui:span>' ],
				'<container:p><attribute:b view-priority="1">foo[<ui:span></ui:span>]bar</attribute:b></container:p>'
			);
		} );

		it( 'should break attribute on multiple different nodes insertion', () => {
			testInsert(
				'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>',
				[ '<ui:span></ui:span>', 'baz' ],
				'<container:p>' +
					'<attribute:b view-priority="1">foo[<ui:span></ui:span></attribute:b>baz]' +
					'<attribute:b view-priority="1">bar</attribute:b>' +
				'</container:p>'
			);
		} );

		it( 'should not break attribute on inline ViewContainerElement insertion and wrapped with an attribute', () => {
			const { view, selection } = _parseView(
				'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>'
			);

			const element = new ViewContainerElement( document, 'span', {}, 'baz' );
			const newRange = writer.insert( selection.getFirstPosition(), element );

			expect( _stringifyView( view.root, newRange, { showType: true, showPriority: true } ) ).to.equal(
				'<container:p>' +
					'<attribute:b view-priority="1">foo</attribute:b>' +
					'[<container:span>baz</container:span>]' +
					'<attribute:b view-priority="1">bar</attribute:b>' +
				'</container:p>'
			);

			const attribute = new ViewAttributeElement( document, 'b' );
			attribute._priority = 1;

			const finalRange = writer.wrap( newRange, attribute );

			expect( _stringifyView( view.root, finalRange, { showType: true, showPriority: true } ) ).to.equal(
				'<container:p><attribute:b view-priority="1">foo[<container:span>baz</container:span>]bar</attribute:b></container:p>'
			);
		} );

		it( 'should throw when inserting Element', () => {
			const element = new Element( document, 'b' );
			const container = new ViewContainerElement( document, 'p' );
			const position = new Position( container, 0 );

			expectToThrowCKEditorError( () => {
				writer.insert( position, element );
			}, 'view-writer-insert-invalid-node', document );
		} );

		it( 'should throw when Element is inserted as child node', () => {
			const element = new Element( document, 'b' );
			const root = new ViewContainerElement( document, 'p', null, element );
			const container = new ViewContainerElement( document, 'p' );
			const position = new Position( container, 0 );

			expectToThrowCKEditorError( () => {
				writer.insert( position, root );
			}, 'view-writer-insert-invalid-node', document );
		} );

		it( 'should throw when position is not placed inside container', () => {
			const element = new Element( document, 'b' );
			const position = new Position( element, 0 );
			const attributeElement = new ViewAttributeElement( document, 'i' );

			expectToThrowCKEditorError( () => {
				writer.insert( position, attributeElement );
			}, 'view-writer-invalid-position-container', document );
		} );

		it( 'should allow to insert EmptyElement into container', () => {
			testInsert(
				'<container:p>[]</container:p>',
				[ '<empty:img></empty:img>' ],
				'<container:p>[<empty:img></empty:img>]</container:p>'
			);
		} );

		it( 'should throw if trying to insert inside EmptyElement', () => {
			const emptyElement = new EmptyElement( document, 'img' );
			new ViewContainerElement( document, 'p', null, emptyElement ); // eslint-disable-line no-new
			const position = new Position( emptyElement, 0 );
			const attributeElement = new ViewAttributeElement( document, 'i' );

			expectToThrowCKEditorError( () => {
				writer.insert( position, attributeElement );
			}, 'view-writer-cannot-break-empty-element', document );
		} );

		it( 'should throw if trying to insert inside UIElement', () => {
			const uiElement = new UIElement( document, 'span' );
			new ViewContainerElement( document, 'p', null, uiElement ); // eslint-disable-line no-new
			const position = new Position( uiElement, 0 );
			const attributeElement = new ViewAttributeElement( document, 'i' );

			expectToThrowCKEditorError( () => {
				writer.insert( position, attributeElement );
			}, 'view-writer-cannot-break-ui-element', document );
		} );

		it( 'should throw if trying to insert inside a RawElement', () => {
			const rawElement = new RawElement( document, 'span' );
			new ViewContainerElement( document, 'p', null, rawElement ); // eslint-disable-line no-new
			const position = new Position( rawElement, 0 );
			const attributeElement = new ViewAttributeElement( document, 'i' );

			expectToThrowCKEditorError( () => {
				writer.insert( position, attributeElement );
			}, 'view-writer-cannot-break-raw-element', document );
		} );
	} );
} );
