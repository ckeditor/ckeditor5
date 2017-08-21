/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { wrapPosition } from '../../../src/view/writer';
import Text from '../../../src/view/text';
import Element from '../../../src/view/element';
import ContainerElement from '../../../src/view/containerelement';
import AttributeElement from '../../../src/view/attributeelement';
import EmptyElement from '../../../src/view/emptyelement';
import UIElement from '../../../src/view/uielement';
import Position from '../../../src/view/position';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { stringify, parse } from '../../../src/dev-utils/view';

describe( 'wrapPosition', () => {
	/**
	 * Executes test using `parse` and `stringify` utils functions.
	 *
	 * @param {String} input
	 * @param {String} unwrapAttribute
	 * @param {String} expected
	 */
	function test( input, unwrapAttribute, expected ) {
		const { view, selection } = parse( input );

		const newPosition = wrapPosition( selection.getFirstPosition(), parse( unwrapAttribute ) );
		expect( stringify( view, newPosition, { showType: true, showPriority: true } ) ).to.equal( expected );
	}

	it( 'should throw error when element is not instance of AttributeElement', () => {
		const container = new ContainerElement( 'p', null, new Text( 'foo' ) );
		const position = new Position( container, 0 );
		const b = new Element( 'b' );

		expect( () => {
			wrapPosition( position, b );
		} ).to.throw( CKEditorError, 'view-writer-wrap-invalid-attribute' );
	} );

	it( 'should wrap position at the beginning of text node', () => {
		test(
			'<container:p>{}foobar</container:p>',
			'<attribute:b view-priority="1"></attribute:b>',
			'<container:p><attribute:b view-priority="1">[]</attribute:b>foobar</container:p>'
		);
	} );

	it( 'should wrap position inside text node', () => {
		test(
			'<container:p>foo{}bar</container:p>',
			'<attribute:b view-priority="1"></attribute:b>',
			'<container:p>foo<attribute:b view-priority="1">[]</attribute:b>bar</container:p>'
		);
	} );

	it( 'should support unicode', () => {
		test(
			'<container:p>நிலை{}க்கு</container:p>',
			'<attribute:b view-priority="1"></attribute:b>',
			'<container:p>நிலை<attribute:b view-priority="1">[]</attribute:b>க்கு</container:p>'
		);
	} );

	it( 'should wrap position inside document fragment', () => {
		test(
			'<attribute:b view-priority="1">foo</attribute:b>[]<attribute:b view-priority="3">bar</attribute:b>',
			'<attribute:b view-priority="2"></attribute:b>',
			'<attribute:b view-priority="1">foo</attribute:b><attribute:b view-priority="2">[]</attribute:b>' +
			'<attribute:b view-priority="3">bar</attribute:b>'
		);
	} );

	it( 'should wrap position at the end of text node', () => {
		test(
			'<container:p>foobar{}</container:p>',
			'<attribute:b view-priority="1"></attribute:b>',
			'<container:p>foobar<attribute:b view-priority="1">[]</attribute:b></container:p>'
		);
	} );

	it( 'should merge with existing attributes #1', () => {
		test(
			'<container:p><attribute:b view-priority="1">foo</attribute:b>[]</container:p>',
			'<attribute:b view-priority="1"></attribute:b>',
			'<container:p><attribute:b view-priority="1">foo{}</attribute:b></container:p>'
		);
	} );

	it( 'should merge with existing attributes #2', () => {
		test(
			'<container:p>[]<attribute:b view-priority="1">foo</attribute:b></container:p>',
			'<attribute:b view-priority="1"></attribute:b>',
			'<container:p><attribute:b view-priority="1">{}foo</attribute:b></container:p>'
		);
	} );

	it( 'should wrap when inside nested attributes', () => {
		test(
			'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>',
			'<attribute:u view-priority="1"></attribute:u>',
			'<container:p>' +
				'<attribute:b view-priority="1">' +
					'foo' +
					'<attribute:u view-priority="1">[]</attribute:u>' +
					'bar' +
				'</attribute:b>' +
			'</container:p>'
		);
	} );

	it( 'should merge when wrapping between same attribute', () => {
		test(
			'<container:p><attribute:b view-priority="1">foo</attribute:b>[]<attribute:b view-priority="1">bar</attribute:b></container:p>',
			'<attribute:b view-priority="1"></attribute:b>',
			'<container:p><attribute:b view-priority="1">foo{}bar</attribute:b></container:p>'
		);
	} );

	it( 'should move position to text node if in same attribute', () => {
		test(
			'<container:p><attribute:b view-priority="1">foobar[]</attribute:b></container:p>',
			'<attribute:b view-priority="1"></attribute:b>',
			'<container:p><attribute:b view-priority="1">foobar{}</attribute:b></container:p>'
		);
	} );

	it( 'should throw if position is set inside EmptyElement', () => {
		const emptyElement = new EmptyElement( 'img' );
		new ContainerElement( 'p', null, emptyElement ); // eslint-disable-line no-new
		const attributeElement = new AttributeElement( 'b' );
		const position = new Position( emptyElement, 0 );

		expect( () => {
			wrapPosition( position, attributeElement );
		} ).to.throw( CKEditorError, 'view-emptyelement-cannot-add' );
	} );

	it( 'should throw if position is set inside UIElement', () => {
		const uiElement = new UIElement( 'span' );
		new ContainerElement( 'p', null, uiElement ); // eslint-disable-line no-new
		const attributeElement = new AttributeElement( 'b' );
		const position = new Position( uiElement, 0 );

		expect( () => {
			wrapPosition( position, attributeElement );
		} ).to.throw( CKEditorError, 'view-uielement-cannot-add' );
	} );
} );
