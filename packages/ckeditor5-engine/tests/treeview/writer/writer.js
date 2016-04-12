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
import Position from '/ckeditor5/engine/treeview/position.js';
import utils from '/tests/engine/treeview/writer/_utils/utils.js';

describe( 'Writer', () => {
	const create = utils.create;
	let writer;

	beforeEach( () => {
		writer = new Writer();
	} );

	describe( 'getParentContainer', () => {
		it( 'should return parent container of the node', () => {
			const text = new Text( 'foobar' );
			const b = new AttributeElement( 'b', null, [ text ] );
			const parent = new ContainerElement( 'p', null, [ b ] );

			b.priority = 1;
			const container = writer.getParentContainer( new Position( text, 0 ) );

			expect( container ).to.equal( parent );
		} );

		it( 'should return undefined if no parent container', () => {
			const text = new Text( 'foobar' );
			const b = new AttributeElement( 'b', null, [ text ] );

			b.priority = 1;
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
				instanceOf: ContainerElement,
				name: 'p',
				rangeStart: 0,
				rangeEnd: 1,
				children: [
					{ instanceOf: Text, data: 'foobar' }
				]
			} );
			const target = create( writer, {
				instanceOf: ContainerElement,
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
