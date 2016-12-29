/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewElement from 'ckeditor5-engine/src/view/element';
import { toImageWidget, isImageWidget } from 'ckeditor5-image/src/utils';
import { isWidget } from 'ckeditor5-image/src/widget/utils';

describe( 'image widget utils', () => {
	let element;

	beforeEach( () => {
		element = new ViewElement( 'div' );
		toImageWidget( element );
	} );

	describe( 'toImageWidget()', () => {
		it( 'should be widgetized', () => {
			expect( isWidget( element ) ).to.be.true;
		} );
	} );

	describe( 'isImageWidget()', () => {
		it( 'should return true for elements marked with toImageWidget()', () => {
			expect( isImageWidget( element ) ).to.be.true;
		} );

		it( 'should return false for non-widgetized elements', () => {
			expect( isImageWidget( new ViewElement( 'p' ) ) ).to.be.false;
		} );
	} );
} );
