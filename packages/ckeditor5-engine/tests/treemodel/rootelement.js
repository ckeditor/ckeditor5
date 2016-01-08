/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */
/* bender-include: ../_tools/tools.js */

'use strict';

const getIteratorCount = bender.tools.core.getIteratorCount;

const modules = bender.amd.require(
	'core/treemodel/document',
	'core/treemodel/element',
	'core/treemodel/rootelement'
);

describe( 'Element', () => {
	let Document, Element, RootElement;

	before( () => {
		Document = modules[ 'core/treemodel/document' ];
		Element = modules[ 'core/treemodel/element' ];
		RootElement = modules[ 'core/treemodel/rootelement' ];
	} );

	describe( 'constructor', () => {
		it( 'should create root element without attributes', () => {
			let doc = new Document();
			let root = new RootElement( doc );

			expect( root ).to.be.an.instanceof( Element );
			expect( root ).to.have.property( 'document' ).that.equals( doc );
			expect( getIteratorCount( root.getAttrs() ) ).to.equal( 0 );
			expect( root.getChildCount() ).to.equal( 0 );
		} );
	} );
} );
