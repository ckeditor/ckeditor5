/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Writer from '/ckeditor5/core/treeview/writer.js';

describe( 'Writer', () => {
	describe( 'isContainer', () => {
		it( 'should return true for container nodes', () => {
			const mockContainerNode = {};
			const mockAttributeNode = {};
			const writer = new Writer();

			writer._priorities.set( mockAttributeNode, 1 );

			expect( writer.isContainer( mockContainerNode ) ).to.be.true;
			expect( writer.isContainer( mockAttributeNode ) ).to.be.false;
		} );
	} );

	describe( 'isAttribute', () => {
		it( 'should return true for container nodes', () => {
			const mockContainerNode = {};
			const mockAttributeNode = {};
			const writer = new Writer();

			writer._priorities.set( mockAttributeNode, 1 );

			expect( writer.isAttribute( mockContainerNode ) ).to.be.false;
			expect( writer.isAttribute( mockAttributeNode ) ).to.be.true;
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
} );
