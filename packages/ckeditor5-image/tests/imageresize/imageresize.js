/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ImageResize from '../../src/imageresize';
import ImageResizeUI from '../../src/imageresize/imageresizeui';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting';

describe( 'ImageResize', () => {
	it( 'should require "ImageResizeEditing" and "ImageResizeUI"', () => {
		expect( ImageResize.requires ).to.deep.equal( [ ImageResizeEditing, ImageResizeUI ] );
	} );

	it( 'should be named', () => {
		expect( ImageResize.pluginName ).to.equal( 'ImageResize' );
	} );
} );
