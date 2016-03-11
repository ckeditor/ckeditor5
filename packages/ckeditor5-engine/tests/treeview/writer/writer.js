/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/core/treeview/writer.js';
import Element from '/ckeditor5/core/treeview/element.js';
import Text from '/ckeditor5/core/treeview/text.js';
import Position from '/ckeditor5/core/treeview/position.js';
import utils from '/tests/core/treeview/writer/_utils/utils.js';

describe( 'Writer', () => {
	const create = utils.create;
	let writer;

	beforeEach( () => {
		writer = new Writer();
	} );

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

		it( 'should return undefined if no parent container', () => {
			const text = new Text( 'foobar' );
			const b = new Element( 'b', null, [ text ] );

			writer.setPriority( b, 1 );
			const container = writer.getParentContainer( new Position( text, 0 ) );

			expect( container ).to.be.undefined;
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
} );
