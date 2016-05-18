/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview, browser-only */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import Position from '/ckeditor5/engine/treeview/position.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'Writer', () => {
	let writer;

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
		const newRange = writer.insert( selection.getFirstPosition(), nodesToInsert );
		expect( stringify( view, newRange, { showType: true, showPriority: true } ) ).to.equal( expected );
	}

	beforeEach( () => {
		writer = new Writer();
	} );

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
				[ '<attribute:b:1>baz</attribute:b:1>' ],
				'<container:p>foo[<attribute:b:1>baz</attribute:b:1>]bar</container:p>'
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
				'<container:p><attribute:b:1>foo{}bar</attribute:b:1></container:p>',
				[ '<attribute:b:1>baz</attribute:b:1>' ],
				'<container:p><attribute:b:1>foo{baz}bar</attribute:b:1></container:p>'
			);
		} );

		it( 'should not merge different attributes', () => {
			test(
				'<container:p><attribute:b:1>foo{}bar</attribute:b:1></container:p>',
				[ '<attribute:b:2>baz</attribute:b:2>' ],
				'<container:p>' +
					'<attribute:b:1>' +
						'foo' +
					'</attribute:b:1>' +
					'[' +
					'<attribute:b:2>' +
						'baz' +
					'</attribute:b:2>' +
					']' +
					'<attribute:b:1>' +
						'bar' +
					'</attribute:b:1>' +
				'</container:p>'
			);
		} );

		it( 'should allow to insert multiple nodes', () => {
			test(
				'<container:p>[]</container:p>',
				[ '<attribute:b:1>foo</attribute:b:1>', 'bar' ],
				'<container:p>[<attribute:b:1>foo</attribute:b:1>bar]</container:p>'
			);
		} );

		it( 'should merge after inserting multiple nodes', () => {
			test(
				'<container:p><attribute:b:1>qux</attribute:b:1>[]baz</container:p>',
				[ '<attribute:b:1>foo</attribute:b:1>', 'bar' ],
				'<container:p><attribute:b:1>qux{foo</attribute:b:1>bar}baz</container:p>'
			);
		} );

		it( 'should throw when inserting Element', () => {
			const element = new Element( 'b' );
			const container = new ContainerElement( 'p' );
			const position = new Position( container, 0 );
			expect( () => {
				writer.insert( position, element );
			} ).to.throw( CKEditorError, 'treeview-writer-insert-invalid-node' );
		} );

		it( 'should throw when Element is inserted as child node', () => {
			const element = new Element( 'b' );
			const root = new ContainerElement( 'p', null, element );
			const container = new ContainerElement( 'p' );
			const position = new Position( container, 0 );

			expect( () => {
				writer.insert( position, root );
			} ).to.throw( CKEditorError, 'treeview-writer-insert-invalid-node' );
		} );
	} );
} );
