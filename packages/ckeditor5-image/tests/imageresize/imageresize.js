/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '../../src/image';
import ImageStyle from '../../src/imagestyle';
import ImageResize from '../../src/imageresize';
import ImageResizeButtons from '../../src/imageresize/imageresizebuttons';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting';
import ImageResizeHandles from '../../src/imageresize/imageresizehandles';

describe( 'ImageResize', () => {
	it( 'should require "ImageResizeEditing" and "ImageResizeButtons"', () => {
		expect( ImageResize.requires ).to.deep.equal( [ ImageResizeEditing, ImageResizeHandles, ImageResizeButtons ] );
	} );

	it( 'should be named', () => {
		expect( ImageResize.pluginName ).to.equal( 'ImageResize' );
	} );

	describe( 'init()', () => {
		describe( 'ImageResizeHandles', () => {
			it( 'should force disable the "ImageResizeHandles" plugin if "image.disableResizeHandles: true"', async () => {
				const element = document.createElement( 'div' );
				document.body.appendChild( element );

				const editor = await ClassicTestEditor.create( element, {
					plugins: [ Image, ImageStyle, ImageResize ],
					image: {
						disableResizeHandles: true
					}
				} );

				const imageResizeHandlesPlugin = editor.plugins.get( 'ImageResizeHandles' );

				expect( imageResizeHandlesPlugin.isEnabled ).to.be.false;
				expect( imageResizeHandlesPlugin._disableStack.size ).to.equal( 1 );
				expect( imageResizeHandlesPlugin._disableStack.has( 'ImageResize' ) ).to.be.true;

				editor.destroy();
				element.remove();
			} );

			it( 'should not force disable the "ImageResizeHandles" plugin if no "image.disableResizeHandles" is provided', async () => {
				const element = document.createElement( 'div' );
				document.body.appendChild( element );

				const editor = await ClassicTestEditor.create( element, {
					plugins: [ Image, ImageStyle, ImageResize ]
				} );

				const imageResizeHandlesPlugin = editor.plugins.get( 'ImageResizeHandles' );

				expect( imageResizeHandlesPlugin.isEnabled ).to.be.false;
				expect( imageResizeHandlesPlugin._disableStack.size ).to.equal( 0 );
				expect( imageResizeHandlesPlugin._disableStack.has( 'ImageResize' ) ).to.be.false;

				editor.destroy();
				element.remove();
			} );
		} );
	} );
} );
