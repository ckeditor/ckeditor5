/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

import { mergeContainers } from '/ckeditor5/engine/view/writer.js';
import { stringify, parse } from '/ckeditor5/engine/dev-utils/view.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'writer', () => {
	/**
	 * Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
	 * test break position.
	 *
	 * @param {String} input
	 * @param {String} expected
	 */
	function test( input, expected ) {
		let { view, selection } = parse( input );

		const newPosition = mergeContainers( selection.getFirstPosition() );
		expect( stringify( view.root, newPosition, { showType: true, showPriority: false } ) ).to.equal( expected );
	}

	describe( 'mergeContainers', () => {
		it( 'should merge two container elements - position between elements', () => {
			test(
				'<container:div>' +
					'<attribute:b>foo</attribute:b>' +
				'</container:div>' +
				'[]<container:div>' +
					'<attribute:u>bar</attribute:u>' +
				'</container:div>',

				'<container:div><attribute:b>foo</attribute:b>[]<attribute:u>bar</attribute:u></container:div>'
			);
		} );

		it( 'should merge two container elements - position in text', () => {
			test(
				'<container:div>foo</container:div>[]<container:div>bar</container:div>',
				'<container:div>foo{}bar</container:div>'
			);
		} );

		it( 'should merge two different container elements', () => {
			test(
				'<container:div>foo</container:div>[]<container:p>bar</container:p>',
				'<container:div>foo{}bar</container:div>'
			);
		} );

		it( 'should throw if there is no element before position', () => {
			let { selection } = parse( '[]<container:div>foobar</container:div>' );

			expect( () => {
				mergeContainers( selection.getFirstPosition() );
			} ).to.throw( CKEditorError, /view-writer-merge-containers-invalid-position/ );
		} );

		it( 'should throw if there is no element after position', () => {
			let { selection } = parse( '<container:div>foobar</container:div>[]' );

			expect( () => {
				mergeContainers( selection.getFirstPosition() );
			} ).to.throw( CKEditorError, /view-writer-merge-containers-invalid-position/ );
		} );

		it( 'should throw if element before position is not a container element', () => {
			let { selection } = parse( '<attribute:u>foo</attribute:u>[]<container:div>bar</container:div>' );

			expect( () => {
				mergeContainers( selection.getFirstPosition() );
			} ).to.throw( CKEditorError, /view-writer-merge-containers-invalid-position/ );
		} );

		it( 'should throw if element after position is not a container element', () => {
			let { selection } = parse( '<container:div>foo</container:div>[]<attribute:u>bar</attribute:u>' );

			expect( () => {
				mergeContainers( selection.getFirstPosition() );
			} ).to.throw( CKEditorError, /view-writer-merge-containers-invalid-position/ );
		} );
	} );
} );
