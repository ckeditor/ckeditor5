/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';
import Range from '/ckeditor5/engine/treeview/range.js';
import Position from '/ckeditor5/engine/treeview/position.js';

const utils = {
	/**
	 * Helper function that is used to create treeView elements from description object.
	 *
	 * @param {engine.treeView.Writer} writer Writer instance. Used to set priorities.
	 * @param {Object} description Description object.
	 * @param {engine.treeView.Range} [range] Optional parameter, used in recurrent calls.
	 * @param {engine.treeView.Position} [position] Optional parameter, used in recurrent calls.
	 * @returns {Object} Returns object with `node`, `range`, `position` fields, containing created node and, optionally
	 * range and position if description object contain information about them.
	 */
	create( writer, description, range, position ) {
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
				const created = utils.create( writer, desc, range, position );
				node.insertChildren( index, created.node );
			} );
		}

		return { node, range, position };
	},

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
	 * @param {engine.treeView.Writer} writer Writer instance. Used to test priority.
	 * @param {engine.treeView.Range|engine.treeView.Position } location Range instance or Position instance.
	 * Treated as Range when when `rangeStart`, `rangeEnd` is used, treated as Position when `position` is used.
	 * @param {engine.treeView.Node} node Element to check.
	 * @param {Object} description Object describing expected element and its children.
	 */
	test( writer, location, node, description ) {
		// If no root node provided - iterate over node array.
		if ( description instanceof Array && node instanceof Array ) {
			node.forEach( ( n, i ) => {
				utils.test( writer, location, n, description[ i ] );
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
				utils.test( writer, location, node.getChild( index ), desc );
			} );
		}
	}
};

export default utils;
