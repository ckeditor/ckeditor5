/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import ContainerElement from '/ckeditor5/engine/treeview/containerelement.js';
import AttributeElement from '/ckeditor5/engine/treeview/attributeelement.js';
import { DEFAULT_PRIORITY } from '/ckeditor5/engine/treeview/attributeelement.js';
import Position from '/ckeditor5/engine/treeview/position.js';
import Range from '/ckeditor5/engine/treeview/range.js';
import Text from '/ckeditor5/engine/treeview/text.js';
import utils from '/tests/engine/treeview/writer/_utils/utils.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'Writer', () => {
	const create = utils.create;
	const test = utils.test;
	let writer;

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'wrap', () => {
		it( 'should do nothing on collapsed ranges', () => {
			const description = {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foo', rangeStart: 1, rangeEnd: 1 }
				]
			};
			const created = create( writer, description );
			const newRange = writer.wrap( created.range, new AttributeElement( 'b' ) );
			test( writer, newRange, created.node, description );
		} );

		it( 'wraps single text node', () => {
			// <p>[{foobar}]</p>
			// wrap <b>
			// <p>[<b>{foobar}<b>]</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );

			const b = new AttributeElement( 'b' );
			const newRange = writer.wrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foobar' }
						]
					}
				]
			} );
		} );

		it( 'should throw error when element is not instance of AttributeElement', () => {
			const container = new ContainerElement( 'p', null, new Text( 'foo' ) );
			const range = new Range(
				new Position( container, 0 ),
				new Position( container, 1 )
			);
			const b = new Element( 'b' );

			expect( () => {
				writer.wrap( range, b );
			} ).to.throw( CKEditorError, 'treeview-writer-wrap-invalid-attribute' );
		} );

		it( 'should throw error when range placed in two containers', () => {
			const container1 = new ContainerElement( 'p' );
			const container2 = new ContainerElement( 'p' );
			const range = new Range(
				new Position( container1, 0 ),
				new Position( container2, 1 )
			);
			const b = new AttributeElement( 'b' );

			expect( () => {
				writer.wrap( range, b, 1 );
			} ).to.throw( CKEditorError, 'treeview-writer-invalid-range-container' );
		} );

		it( 'wraps part of a single text node #1', () => {
			// <p>[{foo]bar}</p>
			// wrap with <b>
			// <p>[<b>{foo}</b>]{bar}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				children: [
					{ instanceOf: Text, data: 'foobar', rangeEnd: 3 }
				]
			} );

			const b = new AttributeElement( 'b' );
			const newRange = writer.wrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{ instanceOf: Text, data: 'bar' }
				]
			} );
		} );

		it( 'wraps part of a single text node #2', () => {
			// <p>{[foo]bar}</p>
			// wrap with <b>
			// <p>[<b>{foo}</b>]{bar}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 0, rangeEnd: 3 }
				]
			} );

			const b = new AttributeElement( 'b' );
			const newRange = writer.wrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{ instanceOf: Text, data: 'bar' }
				]
			} );
		} );

		it( 'wraps part of a single text node #3', () => {
			// <p>{foo[bar]}</p>
			// wrap with <b>
			// <p>{foo}[<b>{bar}</b>]</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 3, rangeEnd: 6 }
				]
			} );

			const b = new AttributeElement( 'b' );
			const newRange = writer.wrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					}
				]
			} );
		} );

		it( 'should not wrap inside nested containers', () => {
			// <div>[{foobar}<p>{baz}</p>]</div>
			// wrap with <b>
			// <div>[<b>{foobar}</b><p>{baz}</p>]</div>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'div',
				rangeStart: 0,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foobar' },
					{
						instanceOf: ContainerElement,
						name: 'p',
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					}
				]
			} );

			const newRange = writer.wrap( created.range, new AttributeElement( 'b' ) );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'div',
				rangeStart: 0,
				rangeEnd: 2,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foobar' }
						]
					},
					{
						instanceOf: ContainerElement,
						name: 'p',
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					}
				]
			} );
		} );

		it( 'wraps according to priorities', () => {
			// <p>[<u>{foobar}</u>]</p>
			// wrap with <b> that has higher priority than <u>
			// <p>[<u><b>{foobar}</b></u>]</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
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
			} );

			const b = new AttributeElement( 'b' );
			b.priority = 2;
			const newRange = writer.wrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'u',
						priority: 1,
						children: [
							{
								instanceOf: AttributeElement,
								name: 'b',
								priority: 2,
								children: [
									{ instanceOf: Text, data: 'foobar' }
								]
							}
						]
					}
				]
			} );
		} );

		it( 'merges wrapped nodes #1', () => {
			// <p>[<b>{foo}</b>{bar}<b>{baz}</b>]</p>
			// wrap with <b>
			// <p>[<b>{foobarbaz}</b>]</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 3,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{ instanceOf: Text, data: 'bar' },
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					}
				]
			} );

			const b = new AttributeElement( 'b' );
			const newRange = writer.wrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foobarbaz' }
						]
					}
				]
			} );
		} );

		it( 'merges wrapped nodes #2', () => {
			// <p><b>{foo}</b>[{bar]baz}</p>
			// wrap with <b>
			// <p><b>{foo[bar}</b>]{baz}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{ instanceOf: Text, data: 'barbaz', rangeEnd: 3 }
				]
			} );

			const newRange = writer.wrap( created.range, new AttributeElement( 'b' ) );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeEnd: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foobar', rangeStart: 3 }
						]
					},
					{ instanceOf: Text, data: 'baz' }
				]
			} );
		} );

		it( 'merges wrapped nodes #3', () => {
			// <p><b>{foobar}</b>[{baz}]</p>
			// wrap with <b>
			// <p><b>{foobar[baz}</b>]</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foobar' }
						]
					},
					{ instanceOf: Text, data: 'baz', rangeEnd: 3 }
				]
			} );

			const newRange = writer.wrap( created.range, new AttributeElement( 'b' ) );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeEnd: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foobarbaz', rangeStart: 6 }
						]
					}
				]
			} );
		} );

		it( 'merges wrapped nodes #4', () => {
			// <p>[{foo}<i>{bar}</i>]{baz}</p>
			// wrap with <b>
			// <p>[<b>{foo}<i>{bar}</i></b>]{baz}</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: AttributeElement,
						name: 'i',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					},
					{ instanceOf: Text, data: 'baz' }
				]
			} );

			const newRange = writer.wrap( created.range, new AttributeElement( 'b' ) );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: DEFAULT_PRIORITY,
						children: [
							{ instanceOf: Text, data: 'foo' },
							{
								instanceOf: AttributeElement,
								name: 'i',
								priority: DEFAULT_PRIORITY,
								children: [
									{ instanceOf: Text, data: 'bar' }
								]
							}
						]
					},
					{ instanceOf: Text, data: 'baz' }
				]
			} );
		} );

		it( 'merges wrapped nodes #5', () => {
			// <p>[{foo}<i>{bar}</i>{baz}]</p>
			// wrap with <b>, that has higher priority than <i>
			// <p>[<b>{foo}</b><i><b>{bar}</b></i><b>{baz}</b>]</p>
			const created = create( writer, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 3,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: AttributeElement,
						name: 'i',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					},
					{ instanceOf: Text, data: 'baz' }
				]
			} );

			const b = new AttributeElement( 'b' );
			b.priority = 2;
			const newRange = writer.wrap( created.range, b );
			test( writer, newRange, created.node, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 3,
				children: [
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 2,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{
						instanceOf: AttributeElement,
						name: 'i',
						priority: 1,
						children: [
							{
								instanceOf: AttributeElement,
								name: 'b',
								priority: 2,
								children: [
									{ instanceOf: Text, data: 'bar' }
								]
							}
						]
					},
					{
						instanceOf: AttributeElement,
						name: 'b',
						priority: 2,
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					}
				]
			} );
		} );

		it( 'should wrap single element by merging attributes', () => {
			// <p>[<b foo="bar" one="two"></b>]</p>
			// wrap with <b baz="qux" one="two"></b>
			// <p>[<b foo="bar" one="two" baz="qux"></b>]</p>
			const b = new AttributeElement( 'b', {
				foo: 'bar',
				one: 'two'
			} );
			const p = new ContainerElement( 'p', null, b );
			const range = Range.createFromParentsAndOffsets( p, 0, p, 1 );
			const wrapper = new AttributeElement( 'b', {
				baz: 'qux',
				one: 'two'
			} );

			const newRange = writer.wrap( range, wrapper );
			expect( b.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( b.getAttribute( 'baz' ) ).to.equal( 'qux' );
			expect( b.getAttribute( 'one' ) ).to.equal( 'two' );

			test( writer, newRange, p, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: AttributeElement, name: 'b', children: [] }
				]
			} );
		} );

		it( 'should not merge attributes when they differ', () => {
			// <p>[<b foo="bar" ></b>]</p>
			// wrap with <b foo="baz"></b>
			// <p>[<b foo="baz"><b foo="bar"></b></b>]</p>
			const b = new AttributeElement( 'b', {
				foo: 'bar'
			} );
			const p = new ContainerElement( 'p', null, b );
			const range = Range.createFromParentsAndOffsets( p, 0, p, 1 );
			const wrapper = new AttributeElement( 'b', {
				foo: 'baz'
			} );

			const newRange = writer.wrap( range, wrapper );
			expect( b.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( b.parent.isSimilar( wrapper ) ).to.be.true;
			expect( b.parent.getAttribute( 'foo' ) ).to.equal( 'baz' );

			test( writer, newRange, p, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: AttributeElement, name: 'b', children: [
						{ instanceOf: AttributeElement, name: 'b', children: [] }
					] }
				]
			} );
		} );

		it( 'should wrap single element by merging classes', () => {
			// <p>[<b class="foo bar baz" ></b>]</p>
			// wrap with <b class="foo bar qux jax"></b>
			// <p>[<b class="foo bar baz qux jax"></b>]</p>
			const b = new AttributeElement( 'b', {
				class: 'foo bar baz'
			} );
			const p = new ContainerElement( 'p', null, b );
			const range = Range.createFromParentsAndOffsets( p, 0, p, 1 );
			const wrapper = new AttributeElement( 'b', {
				class: 'foo bar qux jax'
			} );

			const newRange = writer.wrap( range, wrapper );
			expect( b.hasClass( 'foo', 'bar', 'baz', 'qux', 'jax' ) ).to.be.true;
			test( writer, newRange, p, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: AttributeElement, name: 'b', children: [] }
				]
			} );
		} );

		it( 'should wrap single element by merging styles', () => {
			// <p>[<b style="color:red; position: absolute;"></b>]</p>
			// wrap with <b style="color:red; top: 20px;"></b>
			// <p>[<b class="color:red; position: absolute; top:20px;"></b>]</p>
			const b = new AttributeElement( 'b', {
				style: 'color: red; position: absolute;'
			} );
			const p = new ContainerElement( 'p', null, b );
			const range = Range.createFromParentsAndOffsets( p, 0, p, 1 );
			const wrapper = new AttributeElement( 'b', {
				style: 'color:red; top: 20px;'
			} );

			const newRange = writer.wrap( range, wrapper );
			expect( b.getStyle( 'color' ) ).to.equal( 'red' );
			expect( b.getStyle( 'position' ) ).to.equal( 'absolute' );
			expect( b.getStyle( 'top' ) ).to.equal( '20px' );

			test( writer, newRange, p, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: AttributeElement, name: 'b', children: [] }
				]
			} );
		} );

		it( 'should not merge styles when they differ', () => {
			// <p>[<b style="color:red;"></b>]</p>
			// wrap with <b style="color:black;"></b>
			// <p>[<b style="color:black;"><b style="color:red;"></b></b>]</p>
			const b = new AttributeElement( 'b', {
				style: 'color:red'
			} );
			const p = new ContainerElement( 'p', null, b );
			const range = Range.createFromParentsAndOffsets( p, 0, p, 1 );
			const wrapper = new AttributeElement( 'b', {
				style: 'color:black'
			} );

			const newRange = writer.wrap( range, wrapper );
			expect( b.getStyle( 'color' ) ).to.equal( 'red' );
			expect( b.parent.isSimilar( wrapper ) ).to.be.true;
			expect( b.parent.getStyle( 'color' ) ).to.equal( 'black' );

			test( writer, newRange, p, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: AttributeElement, name: 'b', children: [
						{ instanceOf: AttributeElement, name: 'b', children: [] }
					] }
				]
			} );
		} );

		it( 'should not merge single elements when they have different priority', () => {
			// <p>[<b style="color:red;"></b>]</p>
			// wrap with <b style="color:red;"></b> with different priority
			// <p>[<b style="color:red;"><b style="color:red;"></b></b>]</p>
			const b = new AttributeElement( 'b', {
				style: 'color:red'
			} );
			const p = new ContainerElement( 'p', null, b );
			const range = Range.createFromParentsAndOffsets( p, 0, p, 1 );
			const wrapper = new AttributeElement( 'b', {
				style: 'color:red'
			} );
			wrapper.priority = b.priority - 1;

			const newRange = writer.wrap( range, wrapper );
			expect( b.getStyle( 'color' ) ).to.equal( 'red' );
			expect( b.parent.isSimilar( wrapper ) ).to.be.true;
			expect( b.parent.getStyle( 'color' ) ).to.equal( 'red' );

			test( writer, newRange, p, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: AttributeElement, name: 'b', children: [
						{ instanceOf: AttributeElement, name: 'b', children: [] }
					] }
				]
			} );
		} );

		it( 'should be merged with outside element when wrapping all children', () => {
			// <p><b foo="bar">[{foobar}<i>{baz}</i>]</b></p>
			// wrap with <b baz="qux"></b>
			// <p>[<b foo="bar" baz="qux">{foobar}</b>]</p>
			const text1 = new Text( 'foobar' );
			const text2 = new Text( 'baz' );
			const i = new AttributeElement( 'i', null, text2 );
			const b = new AttributeElement( 'b', { foo: 'bar' }, [ text1, i ] );
			const p = new ContainerElement( 'p', null, [ b ] );
			const wrapper = new AttributeElement( 'b', { baz: 'qux' } );
			const range = Range.createFromParentsAndOffsets( b, 0, b, 2 );

			const newRange = writer.wrap( range, wrapper );
			expect( b.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( b.getAttribute( 'baz' ) ).to.equal( 'qux' );
			test( writer, newRange, p, {
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceof: AttributeElement,
						name: 'b',
						children: [
							{ instanceOf: Text, data: 'foobar' },
							{
								instanceOf: AttributeElement,
								name: 'i',
								children: [
									{ instanceOf: Text, data: 'baz' }
								]
							}
						]
					}
				]
			} );
		} );
	} );
} );
