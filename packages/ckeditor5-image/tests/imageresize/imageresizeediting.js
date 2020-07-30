/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Image from '../../src/image';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting';
import ImageResizeCommand from '../../src/imageresize/imageresizecommand';
import ImageStyle from '../../src/imagestyle';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { focusEditor } from '@ckeditor/ckeditor5-widget/tests/widgetresize/_utils/utils';

describe( 'ImageResizeEditing', () => {
	// 100x50 black png image
	const IMAGE_SRC_FIXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAQAAAAAPLY1AAAAQklEQVR42u3PQREAAAgDoK1/' +
		'aM3g14MGNJMXKiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiJysRFNMgH0RpujAAAAAElFTkSuQmCC';

	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( async () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( ImageResizeEditing.pluginName ).to.equal( 'ImageResizeEditing' );
	} );

	describe( 'constructor()', () => {
		beforeEach( async () => {
			editor = await createEditor( {
				plugins: [ Paragraph, Image, ImageStyle, ImageResizeEditing ]
			} );
		} );

		it( 'should define the default value for config.image.resizeUnit', () => {
			expect( editor.config.get( 'image.resizeUnit' ) ).to.equal( '%' );
		} );

		it( 'should define the default value for config.image.resizeOptions', () => {
			expect( editor.config.get( 'image.resizeOptions' ) ).to.deep.equal( [ {
				name: 'imageResize:original',
				value: null,
				icon: 'original'
			},
			{
				name: 'imageResize:25',
				value: '25',
				icon: 'small'
			},
			{
				name: 'imageResize:50',
				value: '50',
				icon: 'medium'
			},
			{
				name: 'imageResize:75',
				value: '75',
				icon: 'large'
			} ] );
		} );
	} );

	describe( 'conversion', () => {
		beforeEach( async () => {
			editor = await createEditor();
		} );

		it( 'upcasts 100px width correctly', () => {
			editor.setData( `<figure class="image" style="width:100px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );

			expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'width' ) ).to.equal( '100px' );
		} );

		it( 'upcasts 50% width correctly', () => {
			editor.setData( `<figure class="image" style="width:50%;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );

			expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'width' ) ).to.equal( '50%' );
		} );

		it( 'downcasts 100px width correctly', () => {
			setData( editor.model, `<image src="${ IMAGE_SRC_FIXTURE }" width="100px"></image>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image image_resized" style="width:100px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );

		it( 'downcasts 50% width correctly', () => {
			setData( editor.model, `<image src="${ IMAGE_SRC_FIXTURE }" width="50%"></image>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image image_resized" style="width:50%;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );

		it( 'removes style and extra class when no longer resized', () => {
			setData( editor.model, `<image src="${ IMAGE_SRC_FIXTURE }" width="50%"></image>` );

			const imageModel = editor.model.document.getRoot().getChild( 0 );

			editor.model.change( writer => {
				writer.removeAttribute( 'width', imageModel );
			} );

			expect( editor.getData() )
				.to.equal( `<figure class="image"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );

		it( 'doesn\'t downcast consumed tokens', () => {
			editor.conversion.for( 'downcast' ).add( dispatcher =>
				dispatcher.on( 'attribute:width:image', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:width:image' );
				}, { priority: 'high' } )
			);
			setData( editor.model, `<image src="${ IMAGE_SRC_FIXTURE }" width="50%"></image>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );
	} );

	describe( 'schema', () => {
		beforeEach( async () => {
			editor = await createEditor();
		} );

		it( 'allows the width attribute', () => {
			expect( editor.model.schema.checkAttribute( 'image', 'width' ) ).to.be.true;
		} );

		it( 'defines width as a formatting attribute', () => {
			expect( editor.model.schema.getAttributeProperties( 'width' ) ).to.have.property( 'isFormatting', true );
		} );
	} );

	describe( 'command', () => {
		beforeEach( async () => {
			editor = await createEditor();
		} );

		it( 'defines the imageResize command', () => {
			expect( editor.commands.get( 'imageResize' ) ).to.be.instanceOf( ImageResizeCommand );
		} );
	} );

	function createEditor( config ) {
		return ClassicEditor
			.create( editorElement, config || {
				plugins: [ Paragraph, Image, ImageStyle, ImageResizeEditing ],
				image: {
					resizeUnit: 'px'
				}
			} )
			.then( newEditor => {
				focusEditor( newEditor );

				return newEditor;
			} );
	}
} );
