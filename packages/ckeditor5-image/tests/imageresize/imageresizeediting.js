/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Image from '../../src/image';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting';
import ResizeImageCommand from '../../src/imageresize/resizeimagecommand';
import ImageStyle from '../../src/imagestyle';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageInlineEditing from '../../src/image/imageinlineediting';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { focusEditor } from '@ckeditor/ckeditor5-widget/tests/widgetresize/_utils/utils';
import { IMAGE_SRC_FIXTURE } from './_utils/utils';

describe( 'ImageResizeEditing', () => {
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
				name: 'resizeImage:original',
				value: null,
				icon: 'original'
			},
			{
				name: 'resizeImage:25',
				value: '25',
				icon: 'small'
			},
			{
				name: 'resizeImage:50',
				value: '50',
				icon: 'medium'
			},
			{
				name: 'resizeImage:75',
				value: '75',
				icon: 'large'
			} ] );
		} );
	} );

	describe( 'conversion (block images)', () => {
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
			setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" width="100px"></imageBlock>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image image_resized" style="width:100px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );

		it( 'downcasts 50% width correctly', () => {
			setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" width="50%"></imageBlock>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image image_resized" style="width:50%;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );

		it( 'removes style and extra class when no longer resized', () => {
			setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" width="50%"></imageBlock>` );

			const imageModel = editor.model.document.getRoot().getChild( 0 );

			editor.model.change( writer => {
				writer.removeAttribute( 'width', imageModel );
			} );

			expect( editor.getData() )
				.to.equal( `<figure class="image"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );

		it( 'doesn\'t downcast consumed tokens', () => {
			editor.conversion.for( 'downcast' ).add( dispatcher =>
				dispatcher.on( 'attribute:width:imageBlock', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:width:imageBlock' );
				}, { priority: 'high' } )
			);
			setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" width="50%"></imageBlock>` );

			expect( editor.getData() )
				.to.equal( `<figure class="image"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
		} );
	} );

	describe( 'conversion (inline images)', () => {
		beforeEach( async () => {
			editor = await createEditor();
		} );

		it( 'upcasts 100px width correctly', () => {
			editor.setData(
				`<p>Lorem <span class="image-inline"><img src="${ IMAGE_SRC_FIXTURE }" style="width:100px;"></span> ipsum</p>`
			);

			expect( editor.model.document.getRoot().getChild( 0 ).getChild( 1 ).getAttribute( 'width' ) ).to.equal( '100px' );
		} );

		it( 'upcasts 50% width correctly', () => {
			editor.setData( `<p>Lorem <span class="image-inline"><img src="${ IMAGE_SRC_FIXTURE }" style="width:50%;"></span> ipsum</p>` );

			expect( editor.model.document.getRoot().getChild( 0 ).getChild( 1 ).getAttribute( 'width' ) ).to.equal( '50%' );
		} );

		it( 'downcasts 100px width correctly', () => {
			setData( editor.model, `<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" width="100px"></imageInline></paragraph>` );

			expect( editor.getData() )
				.to.equal(
					`<p><img class="image_resized" style="width:100px;" src="${ IMAGE_SRC_FIXTURE }"></p>`
				);
		} );

		it( 'downcasts 50% width correctly', () => {
			setData( editor.model, `<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" width="50%"></imageInline></paragraph>` );

			expect( editor.getData() )
				.to.equal( `<p><img class="image_resized" style="width:50%;" src="${ IMAGE_SRC_FIXTURE }"></p>` );
		} );

		it( 'removes style and extra class when no longer resized', () => {
			setData( editor.model, `<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" width="50%"></imageInline></paragraph>` );

			const imageModel = editor.model.document.getRoot().getChild( 0 ).getChild( 0 );

			editor.model.change( writer => {
				writer.removeAttribute( 'width', imageModel );
			} );

			expect( editor.getData() )
				.to.equal( `<p><img src="${ IMAGE_SRC_FIXTURE }"></p>` );
		} );

		it( 'doesn\'t downcast consumed tokens', () => {
			editor.conversion.for( 'downcast' ).add( dispatcher =>
				dispatcher.on( 'attribute:width:imageInline', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:width:imageInline' );
				}, { priority: 'high' } )
			);
			setData( editor.model, `<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" width="50%"></imageInline></paragraph>` );

			expect( editor.getData() )
				.to.equal( `<p><img src="${ IMAGE_SRC_FIXTURE }"></p>` );
		} );
	} );

	describe( 'schema', () => {
		beforeEach( async () => {
			editor = await createEditor();
		} );

		it( 'allows the width attribute when ImageBlock plugin is enabled', async () => {
			const newEditor = await ClassicEditor.create( editorElement, { plugins: [ ImageBlockEditing, ImageResizeEditing ] } );
			expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'width' ) ).to.be.true;
			await newEditor.destroy();
		} );

		it( 'allows the width attribute when ImageInline plugin is enabled', async () => {
			const newEditor = await ClassicEditor.create( editorElement, { plugins: [ ImageInlineEditing, ImageResizeEditing ] } );
			expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'width' ) ).to.be.true;
			await newEditor.destroy();
		} );
	} );

	describe( 'command', () => {
		beforeEach( async () => {
			editor = await createEditor();
		} );

		it( 'defines the resizeImage command', () => {
			expect( editor.commands.get( 'resizeImage' ) ).to.be.instanceOf( ResizeImageCommand );
		} );

		it( 'defines the imageResize command as an alias for resizeImage command', () => {
			expect( editor.commands.get( 'imageResize' ) ).to.equal( editor.commands.get( 'resizeImage' ) );
		} );
	} );

	async function createEditor( config ) {
		const newEditor = await ClassicEditor.create( editorElement, config || {
			plugins: [ Paragraph, Image, ImageStyle, ImageResizeEditing ],
			image: {
				resizeUnit: 'px'
			}
		} );

		await focusEditor( newEditor );

		return newEditor;
	}
} );
