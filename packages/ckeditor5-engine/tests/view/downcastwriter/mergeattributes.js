/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ViewDowncastWriter } from '../../../src/view/downcastwriter.js';
import { ViewContainerElement } from '../../../src/view/containerelement.js';
import { ViewText } from '../../../src/view/text.js';
import { ViewPosition } from '../../../src/view/position.js';
import { _stringifyView, _parseView } from '../../../src/dev-utils/view.js';
import { ViewDocument } from '../../../src/view/document.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'DowncastWriter', () => {
	describe( 'mergeAttributes', () => {
		let writer, document;

		// Executes test using `_parseView` and `_stringifyView` utils functions. Uses range delimiters `[]{}` to create and
		// test merge position.
		//
		// @param {String} input
		// @param {String} expected
		function testMerge( input, expected ) {
			const { view, selection } = _parseView( input );
			const newPosition = writer.mergeAttributes( selection.getFirstPosition() );
			expect( _stringifyView( view, newPosition, { showType: true, showPriority: true } ) ).to.equal( expected );
		}

		before( () => {
			document = new ViewDocument( new StylesProcessor() );
			writer = new ViewDowncastWriter( document );
		} );

		it( 'should not merge if inside text node', () => {
			testMerge( '<container:p>fo{}bar</container:p>', '<container:p>fo{}bar</container:p>' );
		} );

		it( 'should not merge if between containers', () => {
			testMerge(
				'<container:div><container:p>foo</container:p>[]<container:p>bar</container:p></container:div>',
				'<container:div><container:p>foo</container:p>[]<container:p>bar</container:p></container:div>'
			);
		} );

		it( 'should return same position when inside empty container', () => {
			testMerge(
				'<container:p>[]</container:p>',
				'<container:p>[]</container:p>'
			);
		} );

		it( 'should not merge when position is placed at the beginning of the container', () => {
			testMerge(
				'<container:p>[]<attribute:b view-priority="1"></attribute:b></container:p>',
				'<container:p>[]<attribute:b view-priority="1"></attribute:b></container:p>'
			);
		} );

		it( 'should not merge when position is placed at the end of the container', () => {
			testMerge(
				'<container:p><attribute:b view-priority="1"></attribute:b>[]</container:p>',
				'<container:p><attribute:b view-priority="1"></attribute:b>[]</container:p>'
			);
		} );

		it( 'should merge when placed between two text nodes', () => {
			// <p>foobar</p> -> <p>foo|bar</p>
			const t1 = new ViewText( document, 'foo' );
			const t2 = new ViewText( document, 'bar' );
			const p = new ViewContainerElement( document, 'p', null, [ t1, t2 ] );
			const position = new ViewPosition( p, 1 );

			const newPosition = writer.mergeAttributes( position );
			expect( _stringifyView( p, newPosition ) ).to.equal( '<p>foo{}bar</p>' );
		} );

		it( 'should merge when placed between similar attribute nodes', () => {
			testMerge(
				'<container:p>' +
					'<attribute:b view-priority="1" foo="bar">baz</attribute:b>[]' +
					'<attribute:b view-priority="1" foo="bar">qux</attribute:b>' +
				'</container:p>',
				'<container:p><attribute:b view-priority="1" foo="bar">baz{}qux</attribute:b></container:p>'
			);
		} );

		it( 'should not merge when placed between non-similar attribute nodes', () => {
			testMerge(
				'<container:p>' +
					'<attribute:b view-priority="1" foo="bar"></attribute:b>[]<attribute:b view-priority="1" foo="baz"></attribute:b>' +
				'</container:p>',
				'<container:p>' +
					'<attribute:b view-priority="1" foo="bar"></attribute:b>[]<attribute:b view-priority="1" foo="baz"></attribute:b>' +
				'</container:p>'
			);
		} );

		it( 'should not merge when placed between similar attribute nodes with different priority', () => {
			testMerge(
				'<container:p>' +
					'<attribute:b view-priority="1" foo="bar"></attribute:b>[]<attribute:b view-priority="2" foo="bar"></attribute:b>' +
				'</container:p>',
				'<container:p>' +
					'<attribute:b view-priority="1" foo="bar"></attribute:b>[]<attribute:b view-priority="2" foo="bar"></attribute:b>' +
				'</container:p>'
			);
		} );

		it( 'should merge attribute nodes and their contents if possible', () => {
			testMerge(
				'<container:p>' +
					'<attribute:b view-priority="1" foo="bar">foo</attribute:b>[]' +
					'<attribute:b view-priority="1" foo="bar">bar</attribute:b>' +
				'</container:p>',
				'<container:p><attribute:b view-priority="1" foo="bar">foo{}bar</attribute:b></container:p>'
			);
		} );

		it( 'should remove empty attributes after merge #1', () => {
			testMerge(
				'<container:p><attribute:b>[]</attribute:b></container:p>',
				'<container:p>[]</container:p>'
			);
		} );

		it( 'should remove empty attributes after merge #2', () => {
			testMerge(
				'<container:p><attribute:b>foo</attribute:b><attribute:i>[]</attribute:i><attribute:b>bar</attribute:b></container:p>',
				'<container:p><attribute:b view-priority="10">foo{}bar</attribute:b></container:p>'
			);
		} );

		it( 'should remove empty attributes after merge #3', () => {
			testMerge(
				'<container:p><attribute:b></attribute:b><attribute:i>[]</attribute:i><attribute:b></attribute:b></container:p>',
				'<container:p>[]</container:p>'
			);
		} );

		it( 'should not merge when placed between ViewEmptyElements', () => {
			testMerge(
				'<container:p><empty:img></empty:img>[]<empty:img></empty:img></container:p>',
				'<container:p><empty:img></empty:img>[]<empty:img></empty:img></container:p>'
			);
		} );

		it( 'should not merge when placed between UIElements', () => {
			testMerge(
				'<container:p><ui:span></ui:span>[]<ui:span></ui:span></container:p>',
				'<container:p><ui:span></ui:span>[]<ui:span></ui:span></container:p>'
			);
		} );

		it( 'should not merge when placed between RawElements', () => {
			testMerge(
				'<container:p><raw:span></raw:span>[]<raw:span></raw:span></container:p>',
				'<container:p><raw:span></raw:span>[]<raw:span></raw:span></container:p>'
			);
		} );
	} );
} );
