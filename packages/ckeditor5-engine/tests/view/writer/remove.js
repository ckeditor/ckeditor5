/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import { remove } from '/ckeditor5/engine/view/writer.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';
import Range from '/ckeditor5/engine/view/range.js';
import DocumentFragment from '/ckeditor5/engine/view/documentfragment.js';
import { stringify, parse } from '/tests/engine/_utils/view.js';
import AttributeElement from '/ckeditor5/engine/view/attributeelement.js';
import Text from '/ckeditor5/engine/view/text.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'writer', () => {
	/**
	 * Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
	 * test ranges.
	 *
	 * @param {String} input
	 * @param {String} expectedResult
	 * @param {String} expectedRemoved
	 */
	function test( input, expectedResult, expectedRemoved ) {
		let { view, selection } = parse( input );

		if ( view instanceof AttributeElement || view instanceof Text ) {
			view = new DocumentFragment( view );
		}

		const range = selection.getFirstRange();
		const removed = remove( range );
		expect( stringify( view, range, { showType: true, showPriority: true } ) ).to.equal( expectedResult );
		expect( stringify( removed, null, { showType: true, showPriority: true } ) ).to.equal( expectedRemoved );
	}

	describe( 'remove', () => {
		it( 'should throw when range placed in two containers', () => {
			const p1 = new ContainerElement( 'p' );
			const p2 = new ContainerElement( 'p' );

			expect( () => {
				remove( Range.createFromParentsAndOffsets( p1, 0, p2, 0 ) );
			} ).to.throw( CKEditorError, 'view-writer-invalid-range-container' );
		} );

		it( 'should throw when range has no parent container', () => {
			const el = new AttributeElement( 'b' );

			expect( () => {
				remove( Range.createFromParentsAndOffsets( el, 0, el, 0 ) );
			} ).to.throw( CKEditorError, 'view-writer-invalid-range-container' );
		} );

		it( 'should return empty DocumentFragment when range is collapsed', () => {
			const p = new ContainerElement( 'p' );
			const range = Range.createFromParentsAndOffsets( p, 0, p, 0 );
			const fragment = remove( range );

			expect( fragment ).to.be.instanceof( DocumentFragment );
			expect( fragment.getChildCount() ).to.equal( 0 );
			expect( range.isCollapsed ).to.be.true;
		} );

		it( 'should remove single text node', () => {
			test( '<container:p>[foobar]</container:p>', '<container:p>[]</container:p>', 'foobar' );
		} );

		it( 'should not leave empty text nodes', () => {
			test( '<container:p>{foobar}</container:p>', '<container:p>[]</container:p>', 'foobar' );
		} );

		it( 'should remove part of the text node', () => {
			test( '<container:p>f{oob}ar</container:p>', '<container:p>f{}ar</container:p>', 'oob' );
		} );

		it( 'should remove parts of nodes', () => {
			test(
				'<container:p>f{oo<attribute:b:10>ba}r</attribute:b:10></container:p>',
				'<container:p>f[]<attribute:b:10>r</attribute:b:10></container:p>',
				'oo<attribute:b:10>ba</attribute:b:10>'
			);
		} );

		it( 'should merge after removing #1', () => {
			test(
				'<container:p><attribute:b:1>foo</attribute:b:1>[bar]<attribute:b:1>bazqux</attribute:b:1></container:p>',
				'<container:p><attribute:b:1>foo{}bazqux</attribute:b:1></container:p>',
				'bar'
			);
		} );

		it( 'should merge after removing #2', () => {
			test(
				'<container:p><attribute:b:1>fo{o</attribute:b:1>bar<attribute:b:1>ba}zqux</attribute:b:1></container:p>',
				'<container:p><attribute:b:1>fo{}zqux</attribute:b:1></container:p>',
				'<attribute:b:1>o</attribute:b:1>bar<attribute:b:1>ba</attribute:b:1>'
			);
		} );

		it( 'should remove part of the text node in document fragment', () => {
			test( 'fo{ob}ar', 'fo{}ar', 'ob' );
		} );
	} );
} );
