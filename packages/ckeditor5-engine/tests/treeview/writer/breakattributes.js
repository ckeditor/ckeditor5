/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import AttributeElement from '/ckeditor5/engine/treeview/attributeelement.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import utils from '/tests/engine/treeview/writer/_utils/utils.js';

describe( 'Writer', () => {
	const create = utils.create;
	const test = utils.test;
	let writer;

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'breakAttributes', () => {
		// <p>{|foobar}</p> -> <p>|{foobar}</p>
		it( '<p>{|foobar}</p>', () => {
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 0 }
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 0,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );
		} );

		it( '<p>foo|bar</p>', () => {
			// <p>{foo|bar}</p> -> <p>{foo}|{bar}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 3 }
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 1,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{ instanceOf: Text, data: 'bar' }
				]
			} );
		} );

		it( '<p>{foobar|}</p>', () => {
			// <p>{foobar|}</p> -> <p>{foobar}|</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 6 }
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 1,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );
		} );

		it( '<p><b>{foo|bar}</b></p>', () => {
			// <p><b>{foo|bar}</b></p> -> <p><b>{foo}</b>|<b>{bar}</b></p>
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

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 1,
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
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					}
				]
			} );
		} );

		it( '<p><b><u>{|foobar}</u></b></p>', () => {
			// <p><b><u>{|foobar}</u></b></p> -> <p>|<b><u>{foobar}</u></b></p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: AttributeElement,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'foobar', position: 0 }
								]
							}
						]
					}
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 0,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: AttributeElement,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'foobar' }
								]
							}
						]
					}
				]
			} );
		} );

		// <p><b><u>{foo|ba}r</u></b></p> -> <p><b><u>{foo}</u></b>|<b></u>{bar}</u></b></p>
		it( '<p><b><u>{foo|bar}</u></b></p>', () => {
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: AttributeElement,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'foobar', position: 3 }
								]
							}
						]
					}
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: AttributeElement,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'foo' }
								]
							}
						]
					},
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: AttributeElement,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'bar' }
								]
							}
						]
					}
				]
			} );
		} );

		it( '<p><b><u>{foobar|}</u></b></p>', () => {
			// <p><b><u>{foobar|}</u></b></p> -> <p><b><u>{foobar}</u></b>|</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: AttributeElement,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'foobar', position: 6 }
								]
							}
						]
					}
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				position: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: AttributeElement,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'foobar' }
								]
							}
						]
					}
				]
			} );
		} );
	} );
} );
