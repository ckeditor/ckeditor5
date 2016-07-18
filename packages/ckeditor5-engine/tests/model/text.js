/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model */

'use strict';

import Text from '/ckeditor5/engine/model/text.js';

describe( 'Text', () => {
	describe( 'constructor', () => {
		it( 'should create text node without attributes', () => {
			let text = new Text( 'bar', { bold: true } );

			expect( text ).to.have.property( 'data' ).that.equals( 'bar' );
			expect( text ).to.have.property( '_attrs' ).that.is.instanceof( Map );
			expect( Array.from( text.getAttributes() ) ).to.deep.equal( [ [ 'bold', true ] ] );
		} );

		it( 'should create empty text object', () => {
			let empty1 = new Text();
			let empty2 = new Text( '' );

			expect( empty1.data ).to.equal( '' );
			expect( empty2.data ).to.equal( '' );
		} );
	} );
} );
