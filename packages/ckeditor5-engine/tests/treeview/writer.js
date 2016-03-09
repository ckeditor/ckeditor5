/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals beforeEach, describe, it */
/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/core/treeview/writer.js';
import Element from '/ckeditor5/core/treeview/element.js';
import Text from '/ckeditor5/core/treeview/text.js';
import Position from '/ckeditor5/core/treeview/position.js';
import Range from '/ckeditor5/core/treeview/range.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

describe( 'Writer', () => {
	let writer;

	beforeEach( () => {
		writer = new Writer();
	} );

	/**
	 * Helper function that is used to test output of writer methods by providing declarative description of the
	 * expected output.
	 * Examples:
	 * 		test element: `<p>fo[o<b>ba]r</b></p>`
	 * 		description: {
	 * 			name: 'p',
	 * 	    	instanceOf: Element,
	 * 	    	children:[
	 * 	    		{
	 * 	    			instanceOf: Text,
	 * 	    			data: 'foo',
	 * 	    			rangeStart: 2
 	 * 	    		},
	 *				{
	 *					name: 'b'
	 *					instanceOf: Element
	 *					priority: 1,
	 *					children: [
	 *						{ instanceOf: Text, data: 'bar', rangeEnd: 2 }
	 *					]
	 *				}
	 * 	    	]
	 * 		}
	 *
	 *
	 * @param {core.treeView.Writer} writer Writer instance. Used to test priority.
	 * @param {core.treeView.Range|core.treeView.Position } location Range instance or Position instance.
	 * Treated as Range when when `rangeStart`, `rangeEnd` is used, treated as Position when `position` is used.
	 * @param {core.treeView.Node} node Element to check.
	 * @param {Object} description Object describing expected element and its children.
	 */
	function test( writer, location, node, description ) {
		// If no root node provided - iterate over node array.
		if ( description instanceof Array && node instanceof Array ) {
			node.forEach( ( n, i ) => {
				test( writer, location, n, description[ i ] );
			} );
		}

		if ( description.instanceOf ) {
			expect( node ).to.be.instanceof( description.instanceOf );
		}

		if ( description.name ) {
			expect( description.name ).to.equal( node.name  );
		}

		if ( description.data ) {
			expect( description.data ).to.equal( node.data );
		}

		if ( description.priority !== undefined ) {
			expect( description.priority ).to.equal( writer.getPriority( node ) );
		}

		if ( description.rangeStart !== undefined ) {
			expect( node ).to.equal( location.start.parent );
			expect( description.rangeStart ).to.equal( location.start.offset );
		}

		if ( description.rangeEnd !== undefined ) {
			expect( node ).to.equal( location.end.parent );
			expect( description.rangeEnd ).to.equal( location.end.offset );
		}

		if ( description.attributes ) {
			Object.keys( description.attributes ).forEach( ( key ) => {
				expect( description.attributes[ key ] ).to.equal( node.getAttribute( key ) );
			} );
		}

		if ( description.position !== undefined ) {
			expect( node ).to.equal( location.parent );
			expect( description.position ).to.equal( location.offset );
		}

		if ( description.children ) {
			expect( description.children.length ).to.equal( node.getChildCount() );
			description.children.forEach( ( desc, index ) => {
				test( writer, location, node.getChild( index ), desc );
			} );
		}
	}

	/**
	 * Helper function that is used to create treeView elements from description object.
	 *
	 * @param {core.treeView.Writer} writer Writer instance. Used to set priorities.
	 * @param {Object} description Description object.
	 * @param {core.treeView.Range} [range] Optional parameter, used in recurrent calls.
	 * @param {core.treeView.Position} [position] Optional parameter, used in recurrent calls.
	 * @returns {Object} Returns object with `node`, `range`, `position` fields, containing created node and, optionally
	 * range and position if description object contain information about them.
	 */
	function create( writer, description, range, position ) {
		const node = new description.instanceOf();

		if ( !range ) {
			range = Range.createFromParentsAndOffsets( node, 0, node, 0 );
		}

		if ( !position ) {
			position = new Position( node, 0 );
		}

		if ( description.name ) {
			node.name = description.name;
		}

		if ( description.data ) {
			node.data = description.data;
		}

		if ( description.attributes ) {
			Object.keys( description.attributes ).forEach( ( key ) => {
				node.setAttribute( key, description.attributes[ key ] );
			} );
		}

		if ( description.priority !== undefined ) {
			writer.setPriority( node, description.priority );
		}

		if ( description.rangeStart !== undefined ) {
			range.start.parent = node;
			range.start.offset = description.rangeStart;
		}

		if ( description.rangeEnd !== undefined ) {
			range.end.parent = node;
			range.end.offset = description.rangeEnd;
		}

		if ( description.position !== undefined ) {
			position.parent = node;
			position.offset = description.position;
		}

		if ( description.children ) {
			description.children.forEach( ( desc, index ) => {
				const created = create( writer, desc, range, position );
				node.insertChildren( index, created.node );
			} );
		}

		return { node, range, position };
	}

	describe( 'isContainer', () => {
		it( 'should return true for container elements', () => {
			const containerElement = new Element( 'p' );
			const attributeElement = new Element( 'b' );

			writer._priorities.set( attributeElement, 1 );

			expect( writer.isContainer( containerElement ) ).to.be.true;
			expect( writer.isContainer( attributeElement ) ).to.be.false;
		} );
	} );

	describe( 'isAttribute', () => {
		it( 'should return true for attribute elements', () => {
			const containerElement = new Element( 'p' );
			const attributeElement = new Element( 'b' );

			writer._priorities.set( attributeElement, 1 );

			expect( writer.isAttribute( containerElement ) ).to.be.false;
			expect( writer.isAttribute( attributeElement ) ).to.be.true;
		} );
	} );

	describe( 'setPriority', () => {
		it( 'sets node priority', () => {
			const nodeMock = {};
			writer.setPriority( nodeMock, 10 );

			expect( writer._priorities.get( nodeMock ) ).to.equal( 10 );
		} );
	} );

	describe( 'getPriority', () => {
		it( 'gets node priority', () => {
			const nodeMock = {};
			writer._priorities.set( nodeMock, 12 );

			expect( writer.getPriority( nodeMock ) ).to.equal( 12 );
		} );
	} );

	describe( 'getParentContainer', () => {
		it( 'should return parent container of the node', () => {
			const text = new Text( 'foobar' );
			const b = new Element( 'b', null, [ text ] );
			const parent = new Element( 'p', null, [ b ] );

			writer.setPriority( b, 1 );
			const container = writer.getParentContainer( new Position( text, 0 ) );

			expect( container ).to.equal( parent );
		} );

		it( 'should return null if no parent container', () => {
			const text = new Text( 'foobar' );
			const b = new Element( 'b', null, [ text ] );

			writer.setPriority( b, 1 );
			const container = writer.getParentContainer( new Position( text, 0 ) );

			expect( container ).to.equal( null );
		} );
	} );

	describe( 'breakAttributes', () => {
		// <p>{|foobar}</p> -> <p>|{foobar}</p>
		it( '<p>{|foobar}</p>', () => {
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 0 }
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 3 }
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 6 }
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				position: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
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

		it( '<p><b><u>{|foobar}</u></b></p>', () => {
			// <p><b><u>{|foobar}</u></b></p> -> <p>|<b><u>{foobar}</u></b></p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
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
									{ instanceOf: Text, data: 'foobar', position: 0 }
								]
							}
						]
					}
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: Element,
				name: 'p',
				position: 0,
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
				instanceOf: Element,
				name: 'p',
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
									{ instanceOf: Text, data: 'foobar', position: 3 }
								]
							}
						]
					}
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: Element,
				name: 'p',
				position: 1,
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
					}
				]
			} );
		} );

		it( '<p><b><u>{foobar|}</u></b></p>', () => {
			// <p><b><u>{foobar|}</u></b></p> -> <p><b><u>{foobar}</u></b>|</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
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
									{ instanceOf: Text, data: 'foobar', position: 6 }
								]
							}
						]
					}
				]
			} );

			const newPosition = writer.breakAttributes( created.position );

			test( writer, newPosition, created.node, {
				instanceOf: Element,
				name: 'p',
				position: 1,
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
									{ instanceOf: Text, data: 'foobar' }
								]
							}
						]
					}
				]
			} );
		} );
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

	describe( 'insert', () => {
		it( 'should return collapsed range in insertion position when using empty array', () => {
			// <p>{foo|bar}</p> -> <p>{foo[]bar}</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 3 }
				]
			} );

			const newRange = writer.insert( created.position, [] );
			test( writer, newRange, created.node, {
				instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 3 }
				]
			} );

			const newRange = writer.insert( created.position, new Text( 'baz' ) );
			test( writer, newRange, created.node, {
				instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 6 }
				]
			} );

			const newRange = writer.insert( created.position, new Text( 'baz' ) );
			test( writer, newRange, created.node, {
				instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 0 }
				]
			} );

			const newRange = writer.insert( created.position, new Text( 'baz' ) );
			test( writer, newRange, created.node, {
				instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', position: 3 }
				]
			} );
			const toInsert = create( writer, {
				instanceOf: Element,
				name: 'b',
				priority: 1,
				children: [
					{ instanceOf: Text, data: 'baz' }
				]
			} );

			const newRange = writer.insert( created.position, toInsert.node );
			test( writer, newRange, created.node, {
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
				instanceOf: Element,
				name: 'p',
				position: 0,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );

			const newRange = writer.insert( created.position, new Text( 'baz' ) );
			test( writer, newRange, created.node, {
				instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobar', position: 3 }
						]
					}
				]
			} );
			const toInsert = create( writer, {
				instanceOf: Element,
				name: 'b',
				priority: 1,
				children: [
					{ instanceOf: Text, data: 'baz' }
				]
			} );

			const newRange = writer.insert( created.position, toInsert.node );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobar', position: 3 }
						]
					}
				]
			} );
			const toInsert = create( writer, {
				instanceOf: Element,
				name: 'b',
				priority: 2,
				children: [
					{ instanceOf: Text, data: 'baz' }
				]
			} );

			const newRange = writer.insert( created.position, toInsert.node );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 2,
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					},
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

		it( 'should allow to insert multiple nodes', () => {
			// <p>|</p> insert <b>{foo}</b>{bar}
			// <p>[<b>{foo}</b>{bar}]</p>
			const root = new Element( 'p' );
			const toInsert = create( writer, {
				instanceOf: Element,
				name: 'fake',
				children: [
					{
						instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 2,
				children: [
					{
						instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				position: 1,
				children: [
					{
						instanceOf: Element,
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
				instanceOf: Element,
				name: 'fake',
				children: [
					{
						instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Element,
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

	describe( 'remove', () => {
		it( 'should throw when range placed in two containers', () => {
			const p1 = new Element( 'p' );
			const p2 = new Element( 'p' );

			expect( () => {
				writer.remove( Range.createFromParentsAndOffsets( p1, 0, p2, 0 ) );
			} ).to.throw( 'treeview-writer-invalid-range-container' );
		} );

		it( 'should return empty array when range is collapsed', () => {
			const p = new Element( 'p' );
			const range = Range.createFromParentsAndOffsets( p, 0, p, 0 );
			const nodes = writer.remove( range );

			expect( nodes ).to.be.array;
			expect( nodes.length ).to.equal( 0 );
			expect( range.isCollapsed ).to.be.true;
		} );

		it( 'should remove single text node', () => {
			// <p>[{foobar}]</p> -> <p>|</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );

			const removed = writer.remove( created.range );
			test( writer, created.range.start, created.node, {
				instanceOf: Element,
				name: 'p',
				position: 0,
				children: []
			} );

			// Test removed nodes.
			test( writer, null, removed, [
				{ instanceOf: Text, data: 'foobar' }
			] );
		} );

		it( 'should not leave empty text nodes', () => {
			// <p>{[foobar]}</p> -> <p>|</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 0, rangeEnd: 6 }
				]
			} );

			const removed = writer.remove( created.range );
			test( writer, created.range.start, created.node, {
				instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 1, rangeEnd: 4 }
				]
			} );

			const removed = writer.remove( created.range );
			test( writer, created.range.start, created.node, {
				instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foo', rangeStart: 1 },
					{
						instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				position: 1,
				children: [
					{ instanceOf: Text, data: 'f' },
					{
						instanceOf: Element,
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
					instanceOf: Element,
					priority: 1,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'ba' }
					]
				}
			] );
		} );

		it( 'should merge after removing #1', () => {
			// <p><b>foo</b>[{bar}]<b>bazqux</b></p> -> <p><b>foo|bazqux</b></p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{ instanceOf: Text, data: 'bar' },
					{
						instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo', rangeStart: 2 }
						]
					},
					{ instanceOf: Text, data: 'bar' },
					{
						instanceOf: Element,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{
						instanceOf: Element,
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
					instanceOf: Element,
					priority: 1,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'o' }
					]
				},
				{ instanceOf: Text, data: 'bar' },
				{
					instanceOf: Element,
					priority: 1,
					name: 'b',
					children: [
						{ instanceOf: Text, data: 'ba' }
					]
				}
			] );
		} );
	} );

	describe( 'move', () => {
		it( 'should move nodes using remove and insert methods', () => {
			// <p>[{foobar}]</p>
			// Move to <div>|</div>
			// <div>[{foobar}]</div>
			const source = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );
			const target = create( writer, {
				instanceOf: Element,
				name: 'div',
				position: 0
			} );

			const removeSpy = sinon.spy( writer, 'remove' );
			const insertSpy = sinon.spy( writer, 'insert' );

			const newRange = writer.move( source.range, target.position );

			sinon.assert.calledOnce( removeSpy );
			sinon.assert.calledWithExactly( removeSpy, source.range );
			sinon.assert.calledOnce( insertSpy );
			sinon.assert.calledWithExactly( insertSpy, target.position, removeSpy.firstCall.returnValue );
			expect( newRange ).to.equal( insertSpy.firstCall.returnValue );
		} );
	} );

	describe( 'wrap', () => {
		it( 'should do nothing on collapsed ranges', () => {
			const description = {
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foo', rangeStart: 1, rangeEnd: 1 }
				]
			};
			const created = create( writer, description );
			const newRange = writer.wrap( created.range, new Element( 'b' ), 1 );
			test( writer, newRange, created.node, description );
		} );

		it( 'wraps single text node', () => {
			// <p>[{foobar}]</p>
			// wrap <b>
			// <p>[<b>{foobar}<b>]</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );

			const b = new Element( 'b' );
			const newRange = writer.wrap( created.range, b, 1 );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
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
			} );
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
				writer.wrap( range, b, 1 );
			} ).to.throw( CKEditorError, 'treeview-writer-invalid-range-container' );
		} );

		it( 'wraps part of a single text node #1', () => {
			// <p>[{foo]bar}</p>
			// wrap with <b>
			// <p>[<b>{foo}</b>]{bar}</p>
			const created = create( writer, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				children: [
					{ instanceOf: Text, data: 'foobar', rangeEnd: 3 }
				]
			} );

			const b = new Element( 'b' );
			const newRange = writer.wrap( created.range, b, 2 );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 2,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 0, rangeEnd: 3 }
				]
			} );

			const b = new Element( 'b' );
			const newRange = writer.wrap( created.range, b, 2 );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 2,
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
				instanceOf: Element,
				name: 'p',
				children: [
					{ instanceOf: Text, data: 'foobar', rangeStart: 3, rangeEnd: 6 }
				]
			} );

			const b = new Element( 'b' );
			const newRange = writer.wrap( created.range, b, 2 );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: Element,
						name: 'b',
						priority: 2,
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
				instanceOf: Element,
				name: 'div',
				rangeStart: 0,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foobar' },
					{
						instanceOf: Element,
						name: 'p',
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					}
				]
			} );

			const newRange = writer.wrap( created.range, new Element( 'b' ), 1 );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'div',
				rangeStart: 0,
				rangeEnd: 2,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobar' }
						]
					},
					{
						instanceOf: Element,
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

			const b = new Element( 'b' );
			const newRange = writer.wrap( created.range, b, 2 );

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
							{
								instanceOf: Element,
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
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{ instanceOf: Text, data: 'bar' },
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					}
				]
			} );

			const b = new Element( 'b' );
			const newRange = writer.wrap( created.range, b, 1 );

			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
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
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{ instanceOf: Text, data: 'barbaz', rangeEnd: 3 }
				]
			} );

			const newRange = writer.wrap( created.range, new Element( 'b' ), 1 );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
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
				instanceOf: Element,
				name: 'p',
				rangeStart: 1,
				rangeEnd: 2,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foobar' }
						]
					},
					{ instanceOf: Text, data: 'baz', rangeEnd: 3 }
				]
			} );

			const newRange = writer.wrap( created.range, new Element( 'b' ), 1 );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
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
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 2,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: Element,
						name: 'i',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					},
					{ instanceOf: Text, data: 'baz' }
				]
			} );

			const newRange = writer.wrap( created.range, new Element( 'b' ), 1 );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'foo' },
							{
								instanceOf: Element,
								name: 'i',
								priority: 1,
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
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 3,
				children: [
					{ instanceOf: Text, data: 'foo' },
					{
						instanceOf: Element,
						name: 'i',
						priority: 1,
						children: [
							{ instanceOf: Text, data: 'bar' }
						]
					},
					{ instanceOf: Text, data: 'baz' }
				]
			} );

			const newRange = writer.wrap( created.range, new Element( 'b' ), 2 );
			test( writer, newRange, created.node, {
				instanceOf: Element,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 3,
				children: [
					{
						instanceOf: Element,
						name: 'b',
						priority: 2,
						children: [
							{ instanceOf: Text, data: 'foo' }
						]
					},
					{
						instanceOf: Element,
						name: 'i',
						priority: 1,
						children: [
							{
								instanceOf: Element,
								name: 'b',
								priority: 2,
								children: [
									{ instanceOf: Text, data: 'bar' }
								]
							}
						]
					},
					{
						instanceOf: Element,
						name: 'b',
						priority: 2,
						children: [
							{ instanceOf: Text, data: 'baz' }
						]
					}
				]
			} );
		} );
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
