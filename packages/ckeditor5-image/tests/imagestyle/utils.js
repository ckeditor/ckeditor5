/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { isImage, getStyleByValue } from 'ckeditor5-image/src/imagestyle/utils';
import ModelElement from 'ckeditor5-engine/src/model/element';

describe( 'ImageStyle utils', () => {
	describe( 'isImage', () => {
		it( 'should return true for image element', () => {
			const image = new ModelElement( 'image' );

			expect( isImage( image ) ).to.be.true;
		} );

		it( 'should return true false for different elements', () => {
			const image = new ModelElement( 'foo' );

			expect( isImage( image ) ).to.be.false;
		} );

		it( 'should return true false for null and undefined', () => {
			expect( isImage( null ) ).to.be.false;
			expect( isImage( undefined ) ).to.be.false;
		} );
	} );

	describe( 'getStyleByValue', () => {
		const styles = [
			{ name: 'style 1', title: 'title 1', icon: 'style1-icon', value: 'style1', className: 'style1-class' },
			{ name: 'style 2', title: 'title 2', icon: 'style2-icon', value: 'style2', className: 'style2-class' }
		];

		it( 'should return proper styles for values', () => {
			expect( getStyleByValue( 'style1', styles ) ).to.equal( styles[ 0 ] );
			expect( getStyleByValue( 'style2', styles ) ).to.equal( styles[ 1 ] );
		} );

		it( 'should return undefined when style is not found', () => {
			expect( getStyleByValue( 'foo', styles ) ).to.be.undefined;
		} );

		it( 'should return undefined when empty styles array is provided', () => {
			expect( getStyleByValue( 'style1', [] ) ).to.be.undefined;
		} );
	} );
} );
