/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/core/treeview/writer.js';
import Element from '/ckeditor5/core/treeview/element.js';
import Text from '/ckeditor5/core/treeview/text.js';
import Position from '/ckeditor5/core/treeview/position.js';
import Range from '/ckeditor5/core/treeview/range.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

describe( 'Writer', () => {
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
			expect( description.priority ).to.equal( writer.getPriority( node )  );
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
			const writer = new Writer();

			writer._priorities.set( attributeElement, 1 );

			expect( writer.isContainer( containerElement ) ).to.be.true;
			expect( writer.isContainer( attributeElement ) ).to.be.false;
		} );
	} );

	describe( 'isAttribute', () => {
		it( 'should return true for container elements', () => {
			const containerElement = new Element( 'p' );
			const attributeElement = new Element( 'b' );
			const writer = new Writer();

			writer._priorities.set( attributeElement, 1 );

			expect( writer.isAttribute( containerElement ) ).to.be.false;
			expect( writer.isAttribute( attributeElement ) ).to.be.true;
		} );
	} );

	describe( 'setPriority', () => {
		it( 'sets node priority', () => {
			const writer = new Writer();
			const nodeMock = {};
			writer.setPriority( nodeMock, 10 );

			expect( writer._priorities.get( nodeMock ) ).to.equal( 10 );
		} );
	} );

	describe( 'getPriority', () => {
		it( 'gets node priority', () => {
			const writer = new Writer();
			const nodeMock = {};
			writer._priorities.set( nodeMock, 12 );

			expect( writer.getPriority( nodeMock ) ).to.equal( 12 );
		} );
	} );

	describe( 'getParentContainer', () => {
		it( 'should return parent container of the node', () => {
			const writer = new Writer();
			const text = new Text( 'foobar' );
			const b = new Element( 'b', null, [ text ] );
			const parent = new Element( 'p', null, [ b ] );

			writer.setPriority( b, 1 );
			const container = writer.getParentContainer( new Position( text, 0 ) );

			expect( container ).to.equal( parent );
		} );

		it( 'should return null if no parent container', () => {
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();

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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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

	describe( 'mergeAttributes', () => {
		it( 'should not merge if inside text node', () => {
			// <p>{fo|obar}</p>
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
			const description = { instanceOf: Element, name: 'p', position: 0 };
			const created = create( writer, description );
			const newPosition = writer.mergeAttributes( created.position );
			test( writer, newPosition, created.node, description );
		} );

		it( 'should not merge when position is placed at the beginning of the container', () => {
			// <p>|<b></b></p>
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
		//it( 'should insert text', () => {
		//	// <p>{foo|bar}</p> insert {baz}
		//	// <p>{foo[baz]bar}</p>
		//	const writer = new Writer();
		//	const created = create( writer, {
		//		instanceOf: Element,
		//		name: 'p',
		//		children: [
		//			{ instanceOf: Text, data: 'foobar', position: 3 }
		//		]
		//	} );
		//
		//	const newRange = writer.insert( created.position, new Text( 'baz' ) );
		//	test( writer, newRange, created.node, {
		//		instanceOf: Element,
		//		name: 'p',
		//		children: [
		//			{ instanceOf: Text, data: 'foobazbar' }
		//		]
		//	} );
		//} );
		//
		//it( 'should merge attributes', () => {
		//	// <p><b>{foo|bar}</b></p> insert <b>{baz}</b>
		//	// <p><b>{foobazbar}</b></p>
		//	const writer = new Writer();
		//	const text = new Text( 'foobar' );
		//	const b1 = new Element( 'b', null, text );
		//	const p = new Element( 'p', null, b1 );
		//	const position = new Position( text, 3 );
		//	const insertText = new Text( 'baz' );
		//	const b2 = new Element( 'b', null, insertText );
		//
		//	writer.setPriority( b1, 1 );
		//	writer.setPriority( b2, 1 );
		//
		//	writer.insert( position, b2 );
		//
		//	expect( p.getChildCount() ).to.equal( 1 );
		//	const b3 = p.getChild( 0 );
		//	expect( b3 ).to.be.instanceof( Element );
		//	expect( b3.name ).to.equal( 'b' );
		//	expect( b3.getChildCount() ).to.equal( 1 );
		//	const newText = b3.getChild( 0 );
		//	expect( newText ).to.be.instanceof( Text );
		//	expect( newText.data ).to.equal( 'foobazbar' );
		//} );
	} );

	describe( 'wrap', () => {
		// TODO: tests - different priorities
		// TODO: tests - empty containers left
		// TODO: merge with elements outside range at the ends

		it( 'should do nothing on collapsed ranges', () => {
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
			const container1 = new Element( 'p' );
			const container2 = new Element( 'p' );
			const range = new Range(
				new Position( container1, 0 ),
				new Position( container2, 1 )
			);
			const b = new Element( 'b' );

			expect( () => {
				writer.wrap( range, b, 1 );
			} ).to.throw( CKEditorError, 'treeview-writer-unwrap-invalid-range' );
		} );

		it( 'wraps part of single text node', () => {
			// <p>[{foo]bar}</p>
			// wrap with <b>
			// <p>[<b>{foo}</b>]{bar}</p>
			const writer = new Writer();
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

		it( 'should not wrap inside nested containers', () => {
			// <div>[{foobar}<p>{baz}</p>]</div>
			// wrap with <b>
			// <div>[<b>{foobar}</b><p>{baz}</p>]</div>
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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

			const writer = new Writer();
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

			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
					},
				]
			} );
		} );
	} );

	describe( 'unwrap', () => {
		it( 'should do nothing on collapsed ranges', () => {
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
			const container1 = new Element( 'p' );
			const container2 = new Element( 'p' );
			const range = new Range(
				new Position( container1, 0 ),
				new Position( container2, 1 )
			);
			const b = new Element( 'b' );

			expect( () => {
				writer.unwrap( range, b, 1 );
			} ).to.throw( CKEditorError, 'treeview-writer-unwrap-invalid-range' );
		} );

		it( 'should unwrap single node', () => {
			// <p>[<b>{foobar}</b>]<p> -> <p>[{foobar}]</p>
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
			// <p>[<u><b>{foo}</b></u><u><b>{bar}</b></u><u><b>{baz}</b></u>]</p> -> <p>[<u>{foobarbaz}</u>]</p>
			const writer = new Writer();
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
			const writer = new Writer();
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
			const writer = new Writer();
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
