/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import Position from '/ckeditor5/engine/treeview/position.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';

describe( 'wrapPosition', () => {
	let writer;

	/**
	 * Executes test using `parse` and `stringify` utils functions.
	 *
	 * @param {String} input
	 * @param {String} unwrapAttribute
	 * @param {String} expected
	 */
	function test( input, unwrapAttribute, expected ) {
		const { view, selection } = parse( input );
		const newPosition = writer.wrapPosition( selection.getFirstPosition(), parse( unwrapAttribute ) );
		expect( stringify( view, newPosition, { showType: true, showPriority: true } ) ).to.equal( expected );
	}

	beforeEach( () => {
		writer = new Writer();
	} );

	it( 'should throw error when element is not instance of AttributeElement', () => {
		const container = new ContainerElement( 'p', null, new Text( 'foo' ) );
		const position = new Position( container, 0 );
		const b = new Element( 'b' );

		expect( () => {
			writer.wrapPosition( position, b );
		} ).to.throw( CKEditorError, 'treeview-writer-wrap-invalid-attribute' );
	} );

	it( 'should wrap position at the beginning of text node', () => {
		test(
			'<container:p>{}foobar</container:p>',
			'<attribute:b:1></attribute:b:1>',
			'<container:p><attribute:b:1>[]</attribute:b:1>foobar</container:p>'
		);
	} );

	it( 'should wrap position inside text node', () => {
		test(
			'<container:p>foo{}bar</container:p>',
			'<attribute:b:1></attribute:b:1>',
			'<container:p>foo<attribute:b:1>[]</attribute:b:1>bar</container:p>'
		);
	} );

	it( 'should wrap position at the end of text node', () => {
		test(
			'<container:p>foobar{}</container:p>',
			'<attribute:b:1></attribute:b:1>',
			'<container:p>foobar<attribute:b:1>[]</attribute:b:1></container:p>'
		);
	} );

	it( 'should merge with existing attributes #1', () => {
		test(
			'<container:p><attribute:b:1>foo</attribute:b:1>[]</container:p>',
			'<attribute:b:1></attribute:b:1>',
			'<container:p><attribute:b:1>foo{}</attribute:b:1></container:p>'
		);
	} );

	it( 'should merge with existing attributes #2', () => {
		test(
			'<container:p>[]<attribute:b:1>foo</attribute:b:1></container:p>',
			'<attribute:b:1></attribute:b:1>',
			'<container:p><attribute:b:1>{}foo</attribute:b:1></container:p>'
		);
	} );

	it( 'should wrap when inside nested attributes', () => {
		test(
			'<container:p><attribute:b:1>foo{}bar</attribute:b:1></container:p>',
			'<attribute:u:1></attribute:u:1>',
			'<container:p>' +
				'<attribute:b:1>foo</attribute:b:1>' +
				'<attribute:u:1><attribute:b:1>[]</attribute:b:1></attribute:u:1>' +
				'<attribute:b:1>bar</attribute:b:1>' +
			'</container:p>'
		);
	} );

	it( 'should merge when wrapping between same attribute', () => {
		test(
			'<container:p><attribute:b:1>foo</attribute:b:1>[]<attribute:b:1>bar</attribute:b:1></container:p>',
			'<attribute:b:1></attribute:b:1>',
			'<container:p><attribute:b:1>foo{}bar</attribute:b:1></container:p>'
		);
	} );

	it( 'should move position to text node if in same attribute', () => {
		test(
			'<container:p><attribute:b:1>foobar[]</attribute:b:1></container:p>',
			'<attribute:b:1></attribute:b:1>',
			'<container:p><attribute:b:1>foobar{}</attribute:b:1></container:p>'
		);
	} );
} );