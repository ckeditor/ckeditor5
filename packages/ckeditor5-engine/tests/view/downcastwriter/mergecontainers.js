/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { DowncastWriter } from '../../../src/view/downcastwriter.js';
import { _stringifyView, _parseView } from '../../../src/dev-utils/view.js';

import { ViewDocument } from '../../../src/view/document.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'mergeContainers()', () => {
		let writer;

		// Executes test using `_parseView` and `_stringifyView` utils functions. Uses range delimiters `[]{}` to create and
		// test break position.
		//
		// @param {String} input
		// @param {String} expected
		function testMerge( input, expected ) {
			const { view, selection } = _parseView( input );

			const newPosition = writer.mergeContainers( selection.getFirstPosition() );
			expect( _stringifyView( view.root, newPosition, { showType: true, showPriority: false } ) ).to.equal( expected );
		}

		before( () => {
			writer = new DowncastWriter( new ViewDocument( new StylesProcessor() ) );
		} );

		it( 'should merge two container elements - position between elements', () => {
			testMerge(
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
			testMerge(
				'<container:div>foo</container:div>[]<container:div>bar</container:div>',
				'<container:div>foo{}bar</container:div>'
			);
		} );

		it( 'should merge two different container elements', () => {
			testMerge(
				'<container:div>foo</container:div>[]<container:p>bar</container:p>',
				'<container:div>foo{}bar</container:div>'
			);
		} );

		it( 'should throw if there is no element before position', () => {
			const { selection } = _parseView( '[]<container:div>foobar</container:div>' );

			expectToThrowCKEditorError( () => {
				writer.mergeContainers( selection.getFirstPosition() );
			}, /view-writer-merge-containers-invalid-position/, writer );
		} );

		it( 'should throw if there is no element after position', () => {
			const { selection } = _parseView( '<container:div>foobar</container:div>[]' );

			expectToThrowCKEditorError( () => {
				writer.mergeContainers( selection.getFirstPosition() );
			}, /view-writer-merge-containers-invalid-position/, writer );
		} );

		it( 'should throw if element before position is not a container element', () => {
			const { selection } = _parseView( '<attribute:u>foo</attribute:u>[]<container:div>bar</container:div>' );

			expectToThrowCKEditorError( () => {
				writer.mergeContainers( selection.getFirstPosition() );
			}, /view-writer-merge-containers-invalid-position/, writer );
		} );

		it( 'should throw if element after position is not a container element', () => {
			const { selection } = _parseView( '<container:div>foo</container:div>[]<attribute:u>bar</attribute:u>' );

			expectToThrowCKEditorError( () => {
				writer.mergeContainers( selection.getFirstPosition() );
			}, /view-writer-merge-containers-invalid-position/, writer );
		} );
	} );
} );
