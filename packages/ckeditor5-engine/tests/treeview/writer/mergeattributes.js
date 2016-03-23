/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import utils from '/tests/engine/treeview/writer/_utils/utils.js';

describe( 'Writer', () => {
	const create = utils.create;
	const test = utils.test;
	let writer;

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'mergeAttributes', () => {
		it( 'should not merge if inside text node', () => {
			// <p>{fo|obar}</p>
			const description = {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 2 }
				]
			};
			const created = create( writer, description );
			const newPosition = writer.mergeAttributes( created.position );
			test( writer, newPosition, created.node, description );
		} );

		it( 'should not merge if between containers', () => {
			// <div><p>{foo}</p>|<p>{bar}</p></div>
			const description = {
				instanceOf: Element,
				name: 'div',
				position: 1,
				children: [
					{
						instanceOf: Element,
						name: 'p',
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{
						instanceOf: Element,
						name: 'p',
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					}
				]
			};
			const created = create( writer, description );
			const newPosition = writer.mergeAttributes( created.position );
			test( writer, newPosition, created.node, description );
		} );

		it( 'should return same position when inside empty container', () => {
			// <p>|</p>
			const description = { instanceOf: Element, name: 'p', position: 0 };
			const created = create( writer, description );
			const newPosition = writer.mergeAttributes( created.position );
			test( writer, newPosition, created.node, description );
		} );

		it( 'should not merge when position is placed at the beginning of the container', () => {
			// <p>|<b></b></p>
			const description = {
				instanceOf: Element,
				name: 'p',
				position: 0,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1
					}
				]
			};
			const created = create( writer, description );
			const newPosition = writer.mergeAttributes( created.position );
			test( writer, newPosition, created.node, description );
		} );

		it( 'should not merge when position is placed at the end of the container', () => {
			// <p><b></b>|</p>
			const description = {
				instanceOf: Element,
				name: 'p',
				position: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1
					}
				]
			};
			const created = create( writer, description );
			const newPosition = writer.mergeAttributes( created.position );
			test( writer, newPosition, created.node, description );
		} );

		it( 'should merge when placed between two text nodes', () => {
			// <p>{foo}|{bar}</p> -> <p>{foo|bar}</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				position: 1,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{ instanceOf: Text, data: 'bar' }
				]
			} );

			const newPosition = writer.mergeAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 3 }
				]
			} );
		} );

		it( 'should merge when placed between similar attribute nodes', () => {
			// <p><b foo="bar"></b>|<b foo="bar"></b></p> -> <p><b foo="bar">|</b></p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				position: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						attributes: { foo: 'bar' }
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						attributes: { foo: 'bar' }
					}
				]
			} );

			const newPosition = writer.mergeAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						position: 0,
						attributes: { foo: 'bar' }
					}
				]
			} );
		} );

		it( 'should not merge when placed between non-similar attribute nodes', () => {
			// <p><b foo="bar"></b>|<b foo="baz"></b></p> ->
			// <p><b foo="bar"></b>|<b foo="baz"></b></p>
			const description = {
				instanceOf: Element,
				name: 'p',
				position: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						attributes: { foo: 'bar' }
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						attributes: { foo: 'baz' }
					}
				]
			};
			const created = create( writer, description );
			const newPosition = writer.mergeAttributes( created.position );
			test( writer, newPosition, created.node, description );
		} );

		it( 'should not merge when placed between similar attribute nodes with different priority', () => {
			// <p><b foo="bar"></b>|<b foo="bar"></b></p> -> <p><b foo="bar"></b>|<b foo="bar"></b></p>
			const description =  {
				instanceOf: Element,
				name: 'p',
				position: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						attributes: { foo: 'bar' }
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 2,
						attributes: { foo: 'bar' }
					}
				]
			};
			const created = create( writer,description );
			const newPosition = writer.mergeAttributes( created.position );
			test( writer, newPosition, created.node, description );
		} );

		it( 'should merge attribute nodes and their contents if possible', () => {
			// <p><b foo="bar">{foo}</b>|<b foo="bar">{bar}</b></p>
			// <p><b foo="bar">{foo}|{bar}</b></p>
			// <p><b foo="bar">{foo|bar}</b></p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				position: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						attributes: { foo: 'bar' },
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						attributes: { foo: 'bar' },
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					}
				]
			} );

			const newPosition = writer.mergeAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						attributes: { foo: 'bar' },
						children: [
							{ instanceOf: Text, data: 'foobar', position: 3 }
						]
					}
				]
			} );
		} );
	} );
} );
