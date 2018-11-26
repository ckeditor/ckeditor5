/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DowncastWriter from '../../../src/view/downcastwriter';
import { stringify, parse } from '../../../src/dev-utils/view';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ContainerElement from '../../../src/view/containerelement';
import Position from '../../../src/view/position';
import Document from '../../../src/view/document';

describe( 'DowncastWriter', () => {
	describe( 'breakContainer()', () => {
		let writer;

		// Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
		// test break position.
		//
		// @param {String} input
		// @param {String} expected
		function test( input, expected ) {
			const { view, selection } = parse( input );

			const newPosition = writer.breakContainer( selection.getFirstPosition() );
			expect( stringify( view.root, newPosition, { showType: true, showPriority: false } ) ).to.equal( expected );
		}

		before( () => {
			writer = new DowncastWriter( new Document() );
		} );

		it( 'break inside element - should break container element at given position', () => {
			test(
				'<container:div>' +
					'<container:p>' +
						'<attribute:b>foo</attribute:b>[]<attribute:u>bar</attribute:u>' +
					'</container:p>' +
				'</container:div>',

				'<container:div>' +
					'<container:p>' +
						'<attribute:b>foo</attribute:b>' +
					'</container:p>' +
					'[]<container:p>' +
						'<attribute:u>bar</attribute:u>' +
					'</container:p>' +
				'</container:div>'
			);
		} );

		it( 'break at start of element - should not break container and place returned position before element', () => {
			test(
				'<container:div><container:p>[]foobar</container:p></container:div>',
				'<container:div>[]<container:p>foobar</container:p></container:div>'
			);
		} );

		it( 'break at the end of element - should not break container and place returned position after element', () => {
			test(
				'<container:div><container:p>foobar[]</container:p></container:div>',
				'<container:div><container:p>foobar</container:p>[]</container:div>'
			);
		} );

		it( 'should throw if position parent is not container', () => {
			const { selection } = parse( '<container:div>foo{}bar</container:div>' );

			expect( () => {
				writer.breakContainer( selection.getFirstPosition() );
			} ).to.throw( CKEditorError, /view-writer-break-non-container-element/ );
		} );

		it( 'should throw if position parent is root', () => {
			const element = new ContainerElement( 'div' );
			const position = Position._createAt( element, 0 );

			expect( () => {
				writer.breakContainer( position );
			} ).to.throw( CKEditorError, /view-writer-break-root/ );
		} );
	} );
} );
