/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

const modules = bender.amd.require(
	'core/treeview/node',
	'core/treeview/element',
	'core/treeview/text'
);

describe( 'Element', () => {
	let ViewText, ViewElement, ViewNode;

	before( () => {
		ViewText = modules[ 'core/treeview/text' ];
		ViewElement = modules[ 'core/treeview/element' ];
		ViewNode = modules[ 'core/treeview/node' ];
	} );

	describe( 'constructor', () => {
		it( 'should create element without attributes', () => {
			const text = new ViewText( 'foo' );

			expect( text ).to.be.an.instanceof( ViewNode );
			expect( text.getText() ).to.equal( 'foo' );
			expect( text ).to.have.property( 'parent' ).that.is.null;
		} );
	} );

	describe( 'setText', () => {
		it( 'should change the text', () => {
			const text = new ViewText( 'foo' );
			text.setText( 'bar' );

			expect( text.getText() ).to.equal( 'bar' );
		} );
	} );
} );
