/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint expr: true */

/* bender-tags: document */

'use strict';

const modules = bender.amd.require(
	'document/text',
	'document/attribute'
);

describe( 'Text', () => {
	describe( 'constructor', () => {
		it( 'should create character without attributes', () => {
			const Text = modules[ 'document/text' ];
			const Attribute = modules[ 'document/attribute' ];

			let attrs = [ new Attribute( 'bold', true ) ];
			let text = new Text( 'bar', attrs );

			expect( text ).to.have.property( 'text' ).that.equals( 'bar' );
			expect( text ).to.have.property( 'attrs' ).that.is.an( 'array' );
			expect( text.attrs ).to.be.deep.equals( attrs );
		} );
	} );
} );
