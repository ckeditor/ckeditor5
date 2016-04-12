/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import AttributeElement from '/ckeditor5/engine/treeview/attributeelement.js';
import Range from '/ckeditor5/engine/treeview/range.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import DocumentFragment from '/ckeditor5/engine/treeview/documentfragment.js';
import utils from '/tests/engine/treeview/writer/_utils/utils.js';

describe( 'Writer', () => {
	const create = utils.create;
	const test = utils.test;
	let writer;

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'remove', () => {
		it( 'should throw when range placed in two containers', () => {
			const p1 = new ContainerElement( 'p' );
			const p2 = new ContainerElement( 'p' );

			expect( () => {
				writer.remove( Range.createFromParentsAndOffsets( p1, 0, p2, 0 ) );
			} ).to.throw( 'treeview-writer-invalid-range-container' );
		} );

		it( 'should return empty DocumentFragment when range is collapsed', () => {
			const p = new ContainerElement( 'p' );
			const range = Range.createFromParentsAndOffsets( p, 0, p, 0 );
			const fragment = writer.remove( range );

			expect( fragment ).to.be.instanceof( DocumentFragment );
			expect( fragment.getChildCount() ).to.equal( 0 );
			expect( range.isCollapsed ).to.be.true;
		} );

		it( 'should remove single text node', () => {
			// <p>[{foobar}]</p> -> <p>|</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );

			const removed = writer.remove( created.range );
			test( writer, created.range.start, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 0,
				children: []
			} );

			// Test removed nodes.
			test( writer, null, Array.from( removed.getChildren() ), [
				{ instanceOf: Text, data: 'foobar' }
			] );
		} );

		it( 'should not leave empty text nodes', () => {
			// <p>{[foobar]}</p> -> <p>|</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 0, rangeEnd: 6 }
				]
			} );

			const removed = writer.remove( created.range );
			test( writer, created.range.start, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 0,
				children: []
			} );

			// Test removed nodes.
			test( writer, null, removed, [
				{ instanceOf: Text, data: 'foobar' }
			] );
		} );

		it( 'should remove part of the text node', () => {
			// <p>{f[oob]ar}</p> -> <p>{f|ar}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 1, rangeEnd: 4 }
				]
			} );

			const removed = writer.remove( created.range );
			test( writer, created.range.start, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'far', position: 1 }
				]
			} );

			// Test removed nodes.
			test( writer, null, removed, [
				{ instanceOf: Text, data: 'oob' }
			] );
		} );

		it( 'should remove parts of nodes', () => {
			// <p>{f[oo}<b>{ba]r}</b></p> -> <p>{f}|<b>r</b></p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foo', rangeStart: 1 },
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar', rangeEnd: 2 }
						]
					}
				]
			} );

			const removed = writer.remove( created.range );
			test( writer, created.range.start, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 1,
				children: [
					{ instanceOf: Text, data: 'f' },
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'r' }
						]
					}
				]
			} );

			// Test removed nodes.
			test( writer, null, removed, [
				{ instanceOf: Text, data: 'oo' },
				{
					instanceOf: AttributeElement,
					name: 'b',
					priority: 1,
					children: [
						{ instanceOf: Text, data: 'ba' }
					]
				}
			] );
		} );

		it( 'should merge after removing #1', () => {
			// <p><b>foo</b>[{bar}]<b>bazqux</b></p> -> <p><b>foo|bazqux</b></p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{ instanceOf: Text, data: 'bar' },
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bazqux' }
						]
					}
				]
			} );

			const removed = writer.remove( created.range );
			test( writer, created.range.start, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobazqux', position: 3 }
						]
					}
				]
			} );

			// Test removed nodes.
			test( writer, null, removed, [
				{ instanceOf: Text, data: 'bar' }
			] );
		} );

		it( 'should merge after removing #2', () => {
			// <p><b>fo[o</b>{bar}<b>ba]zqux</b></p> -> <p><b>fo|zqux</b></p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo', rangeStart: 2 }
						]
					},
					{ instanceOf: Text, data: 'bar' },
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bazqux', rangeEnd: 2 }
						]
					}
				]
			} );

			const removed = writer.remove( created.range );
			test( writer, created.range.start, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'fozqux', position: 2 }
						]
					}
				]
			} );

			// Test removed nodes.
			test( writer, null, removed, [
				{
					instanceOf: AttributeElement,
					name: 'b',
					priority: 1,
					children: [
						{ instanceOf: Text, data: 'o' }
					]
				},
				{ instanceOf: Text, data: 'bar' },
				{
					instanceOf: AttributeElement,
					name: 'b',
					priority: 1,
					children: [
						{ instanceOf: Text, data: 'ba' }
					]
				}
			] );
		} );
	} );
} );
