/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view */

'use strict';

import TextProxy from '/ckeditor5/engine/view/textproxy.js';
import Text from '/ckeditor5/engine/view/text.js';
import ContainerElement from '/ckeditor5/engine/view/containerelement.js';

describe( 'TextProxy', () => {
	describe( 'constructor', () => {
		it( 'should create TextProxy instance with specified properties', () => {
			const text = new Text( 'abcdefgh' );
			const paragraph = new ContainerElement( 'p', [], [ text ] );
			const textFragment = 'cdef';
			const index = 2;

			const textProxy = new TextProxy( textFragment, paragraph, text, index );

			expect( textProxy ).to.have.property( 'parent' ).to.equal( paragraph );
			expect( textProxy ).to.have.property( '_data' ).to.equal( textFragment );
			expect( textProxy ).to.have.property( '_textNodeParent' ).to.equal( text );
			expect( textProxy ).to.have.property( '_index' ).to.equal( index );
		} );
	} );
} );
