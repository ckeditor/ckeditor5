/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/core/treeview/writer.js';
import Element from '/ckeditor5/core/treeview/element.js';
import Range from '/ckeditor5/core/treeview/range.js';
import Text from '/ckeditor5/core/treeview/text.js';
import utils from '/tests/core/treeview/writer/_utils/utils.js';

describe( 'Writer', () => {
	const create = utils.create;
	const test = utils.test;
	let writer;

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'breakRange', () => {
		it( 'should throw when range placed in two containers', () => {
			const p1 = new Element( 'p' );
			const p2 = new Element( 'p' );

			expect( () => {
				writer.breakRange( Range.createFromParentsAndOffsets( p1, 0, p2, 0 ) );
			} ).to.throw( 'treeview-writer-invalid-range-container' );
		} );

		it( 'should break at collapsed range and return collapsed one', () => {
			// <p>{foo[]bar}</p> -> <p>{foo}[]{bar}</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 3, rangeEnd: 3 }
				]
			} );

			const newRange = writer.breakRange( created.range );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{ instanceOf: Text, data: 'bar' }
				]
			} );
		} );

		it( 'should break inside text node #1', () => {
			// <p>{foo[bar]baz}</p> -> <p>{foo}[{bar}]{baz}</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobarbaz', rangeStart: 3, rangeEnd: 6 }
				]
			} );

			const newRange = writer.breakRange( created.range );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{ instanceOf: Text, data: 'bar' },
					{ instanceOf: Text, data: 'baz' }
				]
			} );
		} );

		it( 'should break inside text node #2', () => {
			// <p>{foo[barbaz]}</p> -> <p>{foo}[{barbaz}]</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobarbaz', rangeStart: 3, rangeEnd: 9 }
				]
			} );

			const newRange = writer.breakRange( created.range );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{ instanceOf: Text, data: 'barbaz' }
				]
			} );
		} );

		it( 'should break inside text node #3', () => {
			// <p>{foo[barbaz}]</p> -> <p>{foo}[{barbaz}]</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foobarbaz', rangeStart: 3 }
				]
			} );

			const newRange = writer.breakRange( created.range );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{ instanceOf: Text, data: 'barbaz' }
				]
			} );
		} );

		it( 'should break inside text node #4', () => {
			// <p>{[foo]barbaz}</p> -> <p>[{foo}]{barbaz]</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobarbaz', rangeStart: 0, rangeEnd: 3 }
				]
			} );

			const newRange = writer.breakRange( created.range );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{ instanceOf: Text, data: 'barbaz' }
				]
			} );
		} );

		it( 'should break inside text node #5', () => {
			// <p>[{foo]barbaz}</p> -> <p>[{foo}]{barbaz]</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				children: [
					{ instanceOf: Text, data: 'foobarbaz', rangeEnd: 3 }
				]
			} );

			const newRange = writer.breakRange( created.range );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{ instanceOf: Text, data: 'barbaz' }
				]
			} );
		} );

		it( 'should break placed inside different nodes', () => {
			// <p>{foo[bar}<b>{baz]qux}</b></p>
			// <p>{foo}[{bar}<b>{baz}</b>]<b>qux</b></p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 3 },
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bazqux', rangeEnd: 3 }
						]
					}
				]
			} );

			const newRange = writer.breakRange( created.range );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 3,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{ instanceOf: Text, data: 'bar' },
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'qux' }
						]
					}
				]
			} );
		} );
	} );
} );