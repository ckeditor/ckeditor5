/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treemodel */

'use strict';

const modules = bender.amd.require(
	'core/treemodel/text',
	'core/treemodel/attribute'
);

describe( 'Text', () => {
	describe( 'constructor', () => {
		it( 'should create character without attributes', () => {
			const Text = modules[ 'core/treemodel/text' ];
			const Attribute = modules[ 'core/treemodel/attribute' ];

			let attrs = [ new Attribute( 'bold', true ) ];
			let text = new Text( 'bar', attrs );

			expect( text ).to.have.property( 'text' ).that.equals( 'bar' );
			expect( text ).to.have.property( 'attrs' ).that.is.an( 'array' );
			expect( text.attrs ).to.be.deep.equals( attrs );
		} );
	} );
} );
