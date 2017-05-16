/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { insert } from '../../../src/view/writer';
import ContainerElement from '../../../src/view/containerelement';
import Element from '../../../src/view/element';
import EmptyElement from '../../../src/view/emptyelement';
import UIElement from '../../../src/view/uielement';
import Position from '../../../src/view/position';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { stringify, parse } from '../../../src/dev-utils/view';
import AttributeElement from '../../../src/view/attributeelement';

describe( 'writer', () => {
	/**
	 * Executes test using `parse` and `stringify` utils functions.
	 *
	 * @param {String} input
	 * @param {Array.<String>} nodesToInsert
	 * @param {String} expected
	 */
	function test( input, nodesToInsert, expected ) {
		nodesToInsert = nodesToInsert.map( node => parse( node ) );
		const { view, selection } = parse( input );

		const newRange = insert( selection.getFirstPosition(), nodesToInsert );
		expect( stringify( view.root, newRange, { showType: true, showPriority: true } ) ).to.equal( expected );
	}

	describe( 'insert', () => {
		it( 'should return collapsed range in insertion position when using empty array', () => {
			test(
				'<container:p>foo{}bar</container:p>',
				[],
				'<container:p>foo{}bar</container:p>'
			);
		} );

		it( 'should insert text into another text node #1', () => {
			test(
				'<container:p>foo{}bar</container:p>',
				[ 'baz' ],
				'<container:p>foo{baz}bar</container:p>'
			);
		} );

		it( 'should insert text into another text node #2', () => {
			test(
				'<container:p>foobar{}</container:p>',
				[ 'baz' ],
				'<container:p>foobar{baz]</container:p>'
			);
		} );

		it( 'should insert text into another text node #3', () => {
			test(
				'<container:p>{}foobar</container:p>',
				[ 'baz' ],
				'<container:p>[baz}foobar</container:p>'
			);
		} );

		it( 'should break attributes when inserting into text node', () => {
			test(
				'<container:p>foo{}bar</container:p>',
				[ '<attribute:b view-priority="1">baz</attribute:b>' ],
				'<container:p>foo[<attribute:b view-priority="1">baz</attribute:b>]bar</container:p>'
			);
		} );

		it( 'should merge text nodes', () => {
			test(
				'<container:p>[]foobar</container:p>',
				[ 'baz' ],
				'<container:p>[baz}foobar</container:p>'
			);
		} );

		it( 'should merge same attribute nodes', () => {
			test(
				'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>',
				[ '<attribute:b view-priority="1">baz</attribute:b>' ],
				'<container:p><attribute:b view-priority="1">foo{baz}bar</attribute:b></container:p>'
			);
		} );

		it( 'should not merge different attributes', () => {
			test(
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
			test(
				'<container:p>[]</container:p>',
				[ '<attribute:b view-priority="1">foo</attribute:b>', 'bar' ],
				'<container:p>[<attribute:b view-priority="1">foo</attribute:b>bar]</container:p>'
			);
		} );

		it( 'should merge after inserting multiple nodes', () => {
			test(
				'<container:p><attribute:b view-priority="1">qux</attribute:b>[]baz</container:p>',
				[ '<attribute:b view-priority="1">foo</attribute:b>', 'bar' ],
				'<container:p><attribute:b view-priority="1">qux{foo</attribute:b>bar}baz</container:p>'
			);
		} );

		it( 'should insert text into in document fragment', () => {
			test(
				'foo{}bar',
				[ 'baz' ],
				'foo{baz}bar'
			);
		} );

		it( 'should merge same attribute nodes in document fragment', () => {
			test(
				'<attribute:b view-priority="2">foo</attribute:b>[]',
				[ '<attribute:b view-priority="1">bar</attribute:b>' ],
				'<attribute:b view-priority="2">foo</attribute:b>[<attribute:b view-priority="1">bar</attribute:b>]'
			);
		} );

		it( 'should insert unicode text into unicode text', () => {
			test(
				'நி{}க்கு',
				[ 'லை' ],
				'நி{லை}க்கு'
			);
		} );

		it( 'should throw when inserting Element', () => {
			const element = new Element( 'b' );
			const container = new ContainerElement( 'p' );
			const position = new Position( container, 0 );
			expect( () => {
				insert( position, element );
			} ).to.throw( CKEditorError, 'view-writer-insert-invalid-node' );
		} );

		it( 'should throw when Element is inserted as child node', () => {
			const element = new Element( 'b' );
			const root = new ContainerElement( 'p', null, element );
			const container = new ContainerElement( 'p' );
			const position = new Position( container, 0 );

			expect( () => {
				insert( position, root );
			} ).to.throw( CKEditorError, 'view-writer-insert-invalid-node' );
		} );

		it( 'should throw when position is not placed inside container', () => {
			const element = new Element( 'b' );
			const position = new Position( element, 0 );
			const attributeElement = new AttributeElement( 'i' );

			expect( () => {
				insert( position, attributeElement );
			} ).to.throw( CKEditorError, 'view-writer-invalid-position-container' );
		} );

		it( 'should allow to insert EmptyElement into container', () => {
			test(
				'<container:p>[]</container:p>',
				[ '<empty:img></empty:img>' ],
				'<container:p>[<empty:img></empty:img>]</container:p>'
			);
		} );

		it( 'should throw if trying to insert inside EmptyElement', () => {
			const emptyElement = new EmptyElement( 'img' );
			new ContainerElement( 'p', null, emptyElement ); // eslint-disable-line no-new
			const position = new Position( emptyElement, 0 );
			const attributeElement = new AttributeElement( 'i' );

			expect( () => {
				insert( position, attributeElement );
			} ).to.throw( CKEditorError, 'view-writer-cannot-break-empty-element' );
		} );

		it( 'should throw if trying to insert inside UIElement', () => {
			const uiElement = new UIElement( 'span' );
			new ContainerElement( 'p', null, uiElement ); // eslint-disable-line no-new
			const position = new Position( uiElement, 0 );
			const attributeElement = new AttributeElement( 'i' );

			expect( () => {
				insert( position, attributeElement );
			} ).to.throw( CKEditorError, 'view-writer-cannot-break-ui-element' );
		} );
	} );
} );
