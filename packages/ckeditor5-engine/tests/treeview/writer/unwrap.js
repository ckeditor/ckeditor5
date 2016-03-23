/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/engine/treeview/writer.js';
import Element from '/ckeditor5/engine/treeview/element.js';
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

	describe( 'unwrap', () => {
		it( 'should do nothing on collapsed ranges', () => {
			const description = {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foo', rangeStart: 1, rangeEnd: 1 }
				]
			};
			const created = create( writer, description );
			const newRange = writer.unwrap( created.range, new Element( 'b' ), 1 );
			test( writer, newRange, created.node, description );
		} );

		it( 'should do nothing on single text node', () => {
			// <p>[{foobar}]</p>
			const description = {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			};

			const created = create( writer, description );
			const b = new Element( 'b' );
			writer.setPriority( b, 1 );
			const newRange = writer.unwrap( created.range, b );

			test( writer, newRange, created.node, description );
		} );

		it( 'should throw error when range placed in two containers', () => {
			const container1 = new Element( 'p' );
			const container2 = new Element( 'p' );
			const range = new Range(
				new Position( container1, 0 ),
				new Position( container2, 1 )
			);
			const b = new Element( 'b' );

			expect( () => {
				writer.unwrap( range, b, 1 );
			} ).to.throw( CKEditorError, 'treeview-writer-invalid-range-container' );
		} );

		it( 'should unwrap single node', () => {
			// <p>[<b>{foobar}</b>]<p> -> <p>[{foobar}]</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						priority: 1,
						name: 'b',
						children: [
							{ instanceOf: Text, data: 'foobar' }
						]
					}
				]
			} );

			const b = new Element( 'b' );
			writer.setPriority( b, 1 );
			const newRange = writer.unwrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );
		} );

		it( 'should not unwrap attributes with different priorities #1', () => {
			// <p>[<b>{foobar}</b>]<p> -> <p>[<b>{foobar}</b>]</p>
			// Unwrapped with <b> but using different priority.
			const description =  {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						priority: 1,
						name: 'b',
						children: [
							{ instanceOf: Text, data: 'foobar' }
						]
					}
				]
			};
			const created = create( writer, description );

			const b = new Element( 'b' );
			writer.setPriority( b, 2 );
			const newRange = writer.unwrap( created.range, b );

			test( writer, newRange, created.node, description );
		} );

		it( 'should not unwrap attributes with different priorities #2', () => {
			// <p>[<b>{foo}</b><b>{bar}</b><b>{baz}</b>]<p> -> <p>[{foo}<b>bar</b>{baz}]</p>
			// <b> around `bar` has different priority than others.
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 3,
				children: [
					{
						instanceOf: Element,
						priority: 2,
						name: 'b',
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{
						instanceOf: Element,
						priority: 1,
						name: 'b',
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					},
					{
						instanceOf: Element,
						priority: 2,
						name: 'b',
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					}
				]
			} );

			const b = new Element( 'b' );
			writer.setPriority( b, 2 );
			const newRange = writer.unwrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 3,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: Element,
						priority: 1,
						name: 'b',
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					},
					{ instanceOf: Text, data: 'baz' }
				]
			} );
		} );

		it( 'should unwrap part of the node', () => {
			// <p>[{baz}<b>{foo]bar}</b><p> -> <p>[{bazfoo}]<b>{bar}</b></p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				children: [
					{ instanceOf: Text, data: 'baz' },
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobar', rangeEnd: 3 }
						]

					}
				]
			} );

			const b = new Element( 'b' );
			writer.setPriority( b, 1 );

			const newRange = writer.unwrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'bazfoo' },
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]

					}
				]
			} );
		} );

		it( 'should unwrap nested attributes', () => {
			// <p>[<u><b>{foobar}</b></u>]</p> -> <p>[<u>{foobar}</u>]</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'b',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'foobar' }
								]
							}
						]
					}
				]
			} );
			const b = new Element( 'b' );
			writer.setPriority( b, 1 );

			const newRange = writer.unwrap( created.range, b );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobar' }
						]
					}
				]
			} );
		} );

		it( 'should merge unwrapped nodes #1', () => {
			// <p>{foo}[<b>{bar}</b>]{bom}</p> -> <p>{foo[bar]bom}</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					},
					{ instanceOf: Text, data: 'bom' }
				]
			} );

			const b =  new Element( 'b' );
			writer.setPriority( b, 1 );
			const newRange = writer.unwrap( created.range, b );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Text,
						data: 'foobarbom',
						rangeStart: 3,
						rangeEnd: 6
					}
				]
			} );
		} );

		it( 'should merge unwrapped nodes #2', () => {
			// <p>{foo}<u>{bar}</u>[<b><u>{bazqux}</u></b>]</p> -> <p>{foo}<u>{bar[bazqux}</u>]</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 2,
				rangeEnd: 3,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'bazqux' }
								]
							}
						]
					}
				]
			} );

			const b = new Element( 'b' );
			writer.setPriority( b, 1 );
			const newRange = writer.unwrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeEnd: 2,
				children: [
					{
						instanceOf: Text,
						data: 'foo'
					},
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'barbazqux', rangeStart: 3 }
						]
					}
				]
			} );
		} );

		it( 'should merge unwrapped nodes #3', () => {
			// <p>{foo}<u>{bar}</u>[<b><u>{baz]qux}</u></b></p> -> <p>{foo}<u>{bar[baz}</u>]<b><u>{qux}</u></b></p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 2,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'bazqux', rangeEnd: 3 }
								]
							}
						]
					}
				]
			} );

			const b = new Element( 'b' );
			writer.setPriority( b, 1 );
			const newRange = writer.unwrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeEnd: 2,
				children: [
					{
						instanceOf: Text,
						data: 'foo'
					},
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'barbaz', rangeStart: 3 }
						]
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'qux' }
								]
							}
						]
					}
				]
			} );
		} );

		it( 'should merge unwrapped nodes #4', () => {
			// <p>{foo}<u>{bar}</u>[<b><u>{baz}</u></b>]<u>qux</u></p> -> <p>{foo}<u>{bar[baz]qux}</u></p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 2,
				rangeEnd: 3,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'baz' }
								]
							}
						]
					},
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'qux' }
						]
					}
				]
			} );

			const b = new Element( 'b' );
			writer.setPriority( b, 1 );
			const newRange = writer.unwrap( created.range, b );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Text,
						data: 'foo'
					},
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'barbazqux', rangeStart: 3, rangeEnd: 6 }
						]
					}
				]
			} );
		} );

		it( 'should merge unwrapped nodes #5', () => {
			// <p>[<b><u>{foo}</u></b><b><u>{bar}</u></b><b><u>{baz}</u></b>]</p> -> <p>[<u>{foobarbaz}</u>]</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 3,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'foo' }
								]
							}
						]
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'bar' }
								]
							}
						]
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'u',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'baz' }
								]
							}
						]
					}
				]
			} );

			const b = new Element( 'b' );
			writer.setPriority( b, 1 );
			const newRange = writer.unwrap( created.range, b );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobarbaz' }
						]
					}
				]
			} );
		} );

		it( 'should unwrap mixed ranges #1', () => {
			// <p>[<u><b>{foo}]</b></u></p> -> <p>[<u>{foo}</u>]</p
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				children: [
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'b',
								priority: 1,
								rangeEnd: 1,
								children: [
									{ instanceOf: Text, data: 'foo' }
								]
							}
						]
					}
				]
			} );
			const b = new Element( 'b' );
			writer.setPriority( b, 1 );
			const newRange = writer.unwrap( created.range, b );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					}
				]
			} );
		} );

		it( 'should unwrap mixed ranges #2', () => {
			// <p>[<u><b>{foo]}</b></u></p> -> <p>[<u>{foo}</u>]</p
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				children: [
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'b',
								priority: 1,
								children: [
									{ instanceOf: Text, data: 'foo', rangeEnd: 3 }
								]
							}
						]
					}
				]
			} );
			const b = new Element( 'b' );
			writer.setPriority( b, 1 );
			const newRange = writer.unwrap( created.range, b );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'u',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					}
				]
			} );
		} );
	} );
} );
