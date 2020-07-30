/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ImageResize from '../../src/imageresize';
import ImageResizeButtons from '../../src/imageresize/imageresizebuttons';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting';
import ImageResizeHandles from '../../src/imageresize/imageresizehandles';

describe( 'ImageResize', () => {
	it( 'should require "ImageResizeEditing", "ImageResizeHandles", and "ImageResizeButtons"', () => {
		expect( ImageResize.requires ).to.deep.equal( [ ImageResizeEditing, ImageResizeHandles, ImageResizeButtons ] );
	} );

	it( 'should be named', () => {
		expect( ImageResize.pluginName ).to.equal( 'ImageResize' );
	} );
} );
