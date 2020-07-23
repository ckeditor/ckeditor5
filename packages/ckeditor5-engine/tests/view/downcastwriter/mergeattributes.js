/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DowncastWriter from '../../../src/view/downcastwriter';
import ContainerElement from '../../../src/view/containerelement';
import Text from '../../../src/view/text';
import Position from '../../../src/view/position';
import { stringify, parse } from '../../../src/dev-utils/view';
import Document from '../../../src/view/document';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'DowncastWriter', () => {
	describe( 'mergeAttributes', () => {
		let writer, document;

		// Executes test using `parse` and `stringify` utils functions. Uses range delimiters `[]{}` to create and
		// test merge position.
		//
		// @param {String} input
		// @param {String} expected
		function testMerge( input, expected ) {
			const { view, selection } = parse( input );
			const newPosition = writer.mergeAttributes( selection.getFirstPosition() );
			expect( stringify( view, newPosition, { showType: true, showPriority: true } ) ).to.equal( expected );
		}

		before( () => {
			document = new Document( new StylesProcessor() );
			writer = new DowncastWriter( document );
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
			const t1 = new Text( document, 'foo' );
			const t2 = new Text( document, 'bar' );
			const p = new ContainerElement( document, 'p', null, [ t1, t2 ] );
			const position = new Position( p, 1 );

			const newPosition = writer.mergeAttributes( position );
			expect( stringify( p, newPosition ) ).to.equal( '<p>foo{}bar</p>' );
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

		it( 'should not merge when placed between EmptyElements', () => {
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
