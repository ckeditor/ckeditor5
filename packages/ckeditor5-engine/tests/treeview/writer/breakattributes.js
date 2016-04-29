/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import Position from '/ckeditor5/engine/treeview/position.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'Writer', () => {
	let writer;

	/**
	 * Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
	 * test break position.
	 *
	 * @param {String} input
	 * @param {String} expected
	 */
	function test( input, expected ) {
		const { view, selection } = parse( input );
		const newPosition = writer.breakAttributes( selection.getFirstPosition() );
		expect( stringify( view, newPosition, { showType: true, showPriority: true } ) ).to.equal( expected );
	}

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'breakAttributes', () => {
		it( 'should move position from begin of text node to the element', () => {
			test( '<container:p>{}foobar</container:p>', '<container:p>[]foobar</container:p>' );
		} );

		it( 'should split text node', () => {
			const text = new Text( 'foobar' );
			const container = new ContainerElement( 'p', null, text );
			const position = new Position( text, 3 );

			const newPosition = writer.breakAttributes( position );

			expect( container.getChildCount() ).to.equal( 2 );
			expect( container.getChild( 0 ) ).to.be.instanceOf( Text ).and.have.property( 'data' ).that.equal( 'foo' );
			expect( container.getChild( 1 ) ).to.be.instanceOf( Text ).and.have.property( 'data' ).that.equal( 'bar' );
			expect( newPosition.isEqual( new Position( container, 1 ) ) ).to.be.true;
		} );

		it( 'should move position from end of text node to the element', () => {
			test( '<container:p>foobar{}</container:p>', '<container:p>foobar[]</container:p>' );
		} );

		it( 'should split attribute element', () => {
			test(
				'<container:p><attribute:b:1>foo{}bar</attribute:b:1></container:p>',
				'<container:p><attribute:b:1>foo</attribute:b:1>[]<attribute:b:1>bar</attribute:b:1></container:p>'
			);
		} );

		it( 'should move from beginning of the nested text node to the container', () => {
			test(
				'<container:p><attribute:b:1><attribute:u:1>{}foobar</attribute:u:1></attribute:b:1></container:p>',
				'<container:p>[]<attribute:b:1><attribute:u:1>foobar</attribute:u:1></attribute:b:1></container:p>'
			);
		} );

		it( 'should split nested attributes', () => {
			test(
				'<container:p><attribute:b:1><attribute:u:1>foo{}bar</attribute:u:1></attribute:b:1></container:p>',
				'<container:p>' +
					'<attribute:b:1>' +
						'<attribute:u:1>' +
							'foo' +
						'</attribute:u:1>' +
					'</attribute:b:1>' +
					'[]' +
					'<attribute:b:1>' +
						'<attribute:u:1>' +
							'bar' +
						'</attribute:u:1>' +
					'</attribute:b:1>' +
				'</container:p>'
			);
		} );

		it( 'should move from end of the nested text node to the container', () => {
			test(
				'<container:p><attribute:b:1><attribute:u:1>foobar{}</attribute:u:1></attribute:b:1></container:p>',
				'<container:p><attribute:b:1><attribute:u:1>foobar</attribute:u:1></attribute:b:1>[]</container:p>'
			);
		} );
	} );
} );
