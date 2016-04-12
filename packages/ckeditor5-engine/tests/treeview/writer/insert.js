/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import AttributeElement from '/ckeditor5/engine/treeview/attributeelement.js';
import Position from '/ckeditor5/engine/treeview/position.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import utils from '/tests/engine/treeview/writer/_utils/utils.js';

describe( 'Writer', () => {
	const create = utils.create;
	const test = utils.test;
	let writer;

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'insert', () => {
		it( 'should return collapsed range in insertion position when using empty array', () => {
			// <p>{foo|bar}</p> -> <p>{foo[]bar}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 3 }
				]
			} );

			const newRange = writer.insert( created.position, [] );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 3, rangeEnd: 3 }
				]
			} );
		} );

		it( 'should insert text into another text node #1', () => {
			// <p>{foo|bar}</p> insert {baz}
			// <p>{foo[baz]bar}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 3 }
				]
			} );

			const newRange = writer.insert( created.position, new Text( 'baz' ) );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobazbar', rangeStart: 3, rangeEnd: 6 }
				]
			} );
		} );

		it( 'should insert text into another text node #2', () => {
			// <p>{foobar|}</p> insert {baz}
			// <p>{foobar[baz}]</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 6 }
				]
			} );

			const newRange = writer.insert( created.position, new Text( 'baz' ) );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foobarbaz', rangeStart: 6 }
				]
			} );
		} );

		it( 'should insert text into another text node #3', () => {
			// <p>{|foobar}</p> insert {baz}
			// <p>[{baz]foobar}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 0 }
				]
			} );

			const newRange = writer.insert( created.position, new Text( 'baz' ) );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				children: [
					{ instanceOf: Text, data: 'bazfoobar', rangeEnd: 3 }
				]
			} );
		} );

		it( 'should break attributes when inserting into text node', () => {
			// <p>{foo|bar}</p> insert <b>{baz}</b>
			// <p>{foo}[<b>baz</b>]{bar}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 3 }
				]
			} );
			const toInsert = create( writer, {
				instanceOf: ContainerElement,
				name: 'b',
				priority: 1,
				children: [
					{ instanceOf: Text, data: 'baz' }
				]
			} );

			const newRange = writer.insert( created.position, toInsert.node );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: ContainerElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					},
					{ instanceOf: Text, data: 'bar' }
				]
			} );
		} );

		it( 'should merge text ndoes', () => {
			// <p>|{foobar}</p> insert {baz}
			// <p>[{baz]foobar}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 0,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );

			const newRange = writer.insert( created.position, new Text( 'baz' ) );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				children: [
					{ instanceOf: Text, data: 'bazfoobar', rangeEnd: 3 }
				]
			} );
		} );

		it( 'should merge same attribute nodes', () => {
			// <p><b>{foo|bar}</b></p> insert <b>{baz}</b>
			// <p><b>{foo[baz]bar}</b></p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobar', position: 3 }
						]
					}
				]
			} );
			const toInsert = create( writer, {
				instanceOf: AttributeElement,
				name: 'b',
				priority: 1,
				children: [
					{ instanceOf: Text, data: 'baz' }
				]
			} );

			const newRange = writer.insert( created.position, toInsert.node );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobazbar', rangeStart: 3, rangeEnd: 6 }
						]
					}
				]
			} );
		} );

		it( 'should not merge different attributes', () => {
			// <p><b>{foo|bar}</b></p> insert <b>{baz}</b> ( different priority )
			// <p><b>{foo}</b>[<b>{baz}</b>]<b>{bar}</b></p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobar', position: 3 }
						]
					}
				]
			} );
			const toInsert = create( writer, {
				instanceOf: AttributeElement,
				name: 'b',
				priority: 2,
				children: [
					{ instanceOf: Text, data: 'baz' }
				]
			} );

			const newRange = writer.insert( created.position, toInsert.node );
			test( writer, newRange, created.node, {
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
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 2,
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					},
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					}
				]
			} );
		} );

		it( 'should allow to insert multiple nodes', () => {
			// <p>|</p> insert <b>{foo}</b>{bar}
			// <p>[<b>{foo}</b>{bar}]</p>
			const root = new ContainerElement( 'p' );
			const toInsert = create( writer, {
				instanceOf: ContainerElement,
				name: 'fake',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{ instanceOf: Text, data: 'bar' }
				]
			} ).node.getChildren();
			const position = new Position( root, 0 );

			const newRange = writer.insert( position, toInsert );
			test( writer, newRange, root, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
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
					{ instanceOf: Text, data: 'bar' }
				]
			} );
		} );

		it( 'should merge after inserting multiple nodes', () => {
			// <p><b>{qux}</b>|{baz}</p> insert <b>{foo}</b>{bar}
			// <p><b>{qux[foo}</b>{bar]baz}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'qux' }
						]
					},
					{ instanceOf: Text, data: 'baz' }
				]
			} );
			const toInsert = create( writer, {
				instanceOf: ContainerElement,
				name: 'fake',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{ instanceOf: Text, data: 'bar' }
				]
			} ).node.getChildren();

			const newRange = writer.insert( created.position, toInsert );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'quxfoo', rangeStart: 3 }
						]
					},
					{ instanceOf: Text, data: 'barbaz', rangeEnd: 3 }
				]
			} );
		} );
	} );
} );
