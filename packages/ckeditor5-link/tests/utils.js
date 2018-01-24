/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AttributeElement from '@ckeditor/ckeditor5-engine/src/view/attributeelement';
import ContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import Text from '@ckeditor/ckeditor5-engine/src/view/text';

import { createLinkElement, isLinkElement } from '../src/utils';

describe( 'utils', () => {
	describe( 'isLinkElement', () => {
		it( 'should return true for elements created by createLinkElement', () => {
			const element = createLinkElement( 'http://ckeditor.com' );

			expect( isLinkElement( element ) ).to.be.true;
		} );

		it( 'should return false for other AttributeElements', () => {
			expect( isLinkElement( new AttributeElement( 'a' ) ) ).to.be.false;
		} );

		it( 'should return false for ContainerElements', () => {
			expect( isLinkElement( new ContainerElement( 'p' ) ) ).to.be.false;
		} );

		it( 'should return false for text nodes', () => {
			expect( isLinkElement( new Text( 'foo' ) ) ).to.be.false;
		} );
	} );

	describe( 'createLinkElement', () => {
		it( 'should create link AttributeElement', () => {
			const element = createLinkElement( 'http://cksource.com' );

			expect( isLinkElement( element ) ).to.be.true;
			expect( element.priority ).to.equal( 5 );
			expect( element.getAttribute( 'href' ) ).to.equal( 'http://cksource.com' );
			expect( element.name ).to.equal( 'a' );
		} );
	} );
} );
