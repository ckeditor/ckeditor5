/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DowncastWriter from '../../../src/view/downcastwriter.js';
import { stringify, parse } from '../../../src/dev-utils/view.js';

import ContainerElement from '../../../src/view/containerelement.js';
import Position from '../../../src/view/position.js';
import Document from '../../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'breakContainer()', () => {
		let writer, document;

		// Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
		// test break position.
		//
		// @param {String} input
		// @param {String} expected
		function testBreakContainer( input, expected ) {
			const { view, selection } = parse( input );

			const newPosition = writer.breakContainer( selection.getFirstPosition() );
			expect( stringify( view.root, newPosition, { showType: true, showPriority: false } ) ).to.equal( expected );
		}

		before( () => {
			document = new Document( new StylesProcessor() );
			writer = new DowncastWriter( document );
		} );

		it( 'break inside element - should break container element at given position', () => {
			testBreakContainer(
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
			testBreakContainer(
				'<container:div><container:p>[]foobar</container:p></container:div>',
				'<container:div>[]<container:p>foobar</container:p></container:div>'
			);
		} );

		it( 'break at the end of element - should not break container and place returned position after element', () => {
			testBreakContainer(
				'<container:div><container:p>foobar[]</container:p></container:div>',
				'<container:div><container:p>foobar</container:p>[]</container:div>'
			);
		} );

		it( 'break inside element with attributes, styles, and classes - should break container element at given position', () => {
			testBreakContainer(
				'<container:div>' +
					'<container:p class="abc" foo="bar" style="color:red">' +
						'<attribute:b>foo</attribute:b>[]<attribute:u>bar</attribute:u>' +
					'</container:p>' +
				'</container:div>',

				'<container:div>' +
					'<container:p class="abc" foo="bar" style="color:red">' +
						'<attribute:b>foo</attribute:b>' +
					'</container:p>' +
					'[]<container:p class="abc" foo="bar" style="color:red">' +
						'<attribute:u>bar</attribute:u>' +
					'</container:p>' +
				'</container:div>'
			);
		} );

		it( 'should throw if position parent is not container', () => {
			const { selection } = parse( '<container:div>foo{}bar</container:div>' );

			expectToThrowCKEditorError( () => {
				writer.breakContainer( selection.getFirstPosition() );
			}, /view-writer-break-non-container-element/, writer );
		} );

		it( 'should throw if position parent is root', () => {
			const element = new ContainerElement( document, 'div' );
			const position = Position._createAt( element, 0 );

			expectToThrowCKEditorError( () => {
				writer.breakContainer( position );
			}, /view-writer-break-root/, writer );
		} );
	} );
} );
