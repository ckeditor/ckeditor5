/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import AttributeElement from '/ckeditor5/engine/treeview/attributeelement.js';
import Position from '/ckeditor5/engine/treeview/position.js';
import utils from '/tests/engine/treeview/writer/_utils/utils.js';
import { DEFAULT_PRIORITY } from '/ckeditor5/engine/treeview/attributeelement.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'wrapPosition', () => {
	const create = utils.create;
	const test = utils.test;
	let writer;

	beforeEach( () => {
		writer = new Writer();
	} );

	it( 'should throw error when element is not instance of AttributeElement', () => {
		const container = new ContainerElement( 'p', null, new Text( 'foo' ) );
		const position = new Position( container, 0 );
		const b = new Element( 'b' );

		expect( () => {
			writer.wrapPosition( position, b );
		} ).to.throw( CKEditorError, 'treeview-writer-wrap-invalid-attribute' );
	} );

	it( 'should wrap position at the beginning of text node', () => {
		// <p>{|foobar}</p>
		// wrap with <b>
		// <p><b>|<b>{foobar}</p>
		const description = {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{ instanceOf: Text, data: 'foobar', position: 0 }
			]
		};
		const created = create( writer, description );
		const newPosition = writer.wrapPosition( created.position, new AttributeElement( 'b' ) );
		test( writer, newPosition, created.node, {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{ instanceOf: AttributeElement, name: 'b', position: 0 },
				{ instanceOf: Text, data: 'foobar' }
			]
		} );
	} );

	it( 'should wrap position inside text node', () => {
		// <p>{foo|bar}</p>
		// wrap with <b>
		// <p>{foo}<b>|</b>{bar}</p>
		const description = {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{ instanceOf: Text, data: 'foobar', position: 3 }
			]
		};
		const created = create( writer, description );
		const newPosition = writer.wrapPosition( created.position, new AttributeElement( 'b' ) );
		test( writer, newPosition, created.node, {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{ instanceOf: Text, data: 'foo' },
				{ instanceOf: AttributeElement, name: 'b', position: 0 },
				{ instanceOf: Text, data: 'bar' }
			]
		} );
	} );

	it( 'should wrap position at the end of text node', () => {
		// <p>{foobar|}</p>
		// wrap with <b>
		// <p>{foobar}<b>|</b></p>
		const description = {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{ instanceOf: Text, data: 'foobar', position: 6 }
			]
		};
		const created = create( writer, description );
		const newPosition = writer.wrapPosition( created.position, new AttributeElement( 'b' ) );
		test( writer, newPosition, created.node, {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{ instanceOf: Text, data: 'foobar' },
				{ instanceOf: AttributeElement, name: 'b', position: 0 }
			]
		} );
	} );

	it( 'should merge with existing attributes #1', () => {
		// <p><b>{foo}</b>|</p>
		// wrap with <b>
		// <p><b>{foo|}</b></p>
		const description = {
			instanceOf: ContainerElement,
			name: 'p',
			position: 1,
			children: [
				{
					instanceOf: AttributeElement,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'foobar' }
					]
				}
			]
		};

		const created = create( writer, description );
		const newPosition = writer.wrapPosition( created.position, new AttributeElement( 'b' ) );

		test( writer, newPosition, created.node, {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{
					instanceOf: AttributeElement,
					name: 'b',
					priority: DEFAULT_PRIORITY,
					children: [
						{ instanceOf: Text, data: 'foobar', position: 6 }
					]
				}
			]
		} );
	} );

	it( 'should merge with existing attributes #2', () => {
		// <p>|<b>{foo}</b></p>
		// wrap with <b>
		// <p><b>{|foo}</b></p>
		const description = {
			instanceOf: ContainerElement,
			name: 'p',
			position: 0,
			children: [
				{
					instanceOf: AttributeElement,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'foobar' }
					]
				}
			]
		};

		const created = create( writer, description );
		const newPosition = writer.wrapPosition( created.position, new AttributeElement( 'b' ) );

		test( writer, newPosition, created.node, {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{
					instanceOf: AttributeElement,
					name: 'b',
					priority: DEFAULT_PRIORITY,
					children: [
						{ instanceOf: Text, data: 'foobar', position: 0 }
					]
				}
			]
		} );
	} );

	it( 'should wrap when inside nested attributes', () => {
		// <p><b>{foo|bar}</b></p>
		// wrap with <u>
		// <p><b>{foo}</b><u><b>|</b></u><b>{bar}</b></p>
		const description = {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{
					instanceOf: AttributeElement,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'foobar', position: 3 }
					]
				}
			]
		};

		const created = create( writer, description );
		const newPosition = writer.wrapPosition( created.position, new AttributeElement( 'u' ) );
		test( writer, newPosition, created.node, {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{
					instanceOf: AttributeElement,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'foo' }
					]
				},
				{
					instanceOf: AttributeElement,
					name: 'u',
					children: [
						{ instanceOf: AttributeElement, name: 'b', children: [] }
					]
				},
				{
					instanceOf: AttributeElement,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'bar' }
					]
				}
			]
		}  );
	} );

	it( 'should merge when wrapping between same attribute', () => {
		// <p><b>{foo}</b>|<b>{bar}</b></p>
		// wrap with <b>
		// <p><b>{foo|bar}</b></p>
		const description = {
			instanceOf: ContainerElement,
			name: 'p',
			position: 1,
			children: [
				{
					instanceOf: AttributeElement,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'foo' }
					]
				},
				{
					instanceOf: AttributeElement,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'bar' }
					]
				}
			]
		};

		const created = create( writer, description );
		const newPosition = writer.wrapPosition( created.position, new AttributeElement( 'b' ) );

		test( writer, newPosition, created.node, {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{
					instanceOf: AttributeElement,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'foobar', position: 3 }
					]
				}
			]
		}  );
	} );

	it( 'should return same position when inside same attribute', () => {
		// <p><b>{foobar}|</b></p>
		// wrap with <b>
		// <p><b>{foobar|}</b></p>
		const description = {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{
					instanceOf: AttributeElement,
					name: 'b',
					position: 1,
					children: [
						{ instanceOf: Text, data: 'foobar' }
					]
				}
			]
		};

		const created = create( writer, description );
		const newPosition = writer.wrapPosition( created.position, new AttributeElement( 'b' ) );

		test( writer, newPosition, created.node, {
			instanceOf: ContainerElement,
			name: 'p',
			children: [
				{
					instanceOf: AttributeElement,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'foobar', position: 6 }
					]
				}
			]
		} );
	} );
} );