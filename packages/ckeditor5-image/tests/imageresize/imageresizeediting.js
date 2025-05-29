/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import Image from '../../src/image.js';
import ImageResizeEditing from '../../src/imageresize/imageresizeediting.js';
import ResizeImageCommand from '../../src/imageresize/resizeimagecommand.js';
import ImageStyle from '../../src/imagestyle.js';
import ImageBlockEditing from '../../src/image/imageblockediting.js';
import ImageInlineEditing from '../../src/image/imageinlineediting.js';

import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import { focusEditor } from '@ckeditor/ckeditor5-widget/tests/widgetresize/_utils/utils.js';
import { IMAGE_SRC_FIXTURE } from './_utils/utils.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageResizeEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageResizeEditing.isPremiumPlugin ).to.be.false;
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
				name: 'resizeImage:custom',
				value: 'custom',
				icon: 'custom'
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

		it( 'consumes image_resized class during upcast', () => {
			const consumeSpy = sinon.spy( ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem, { classes: [ 'image_resized' ] } ) ).to.be.false;
			} );

			editor.data.upcastDispatcher.on( 'element:figure', consumeSpy, { priority: 'lowest' } );
			editor.setData(
				`<figure class="image image_resized" style="width:100px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>`
			);

			expect( consumeSpy.calledOnce ).to.be.true;
		} );

		describe( 'width', () => {
			it( 'upcasts 100px width correctly', () => {
				editor.setData( `<figure class="image" style="width:100px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );

				expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'resizedWidth' ) ).to.equal( '100px' );
			} );

			it( 'upcasts 50% width correctly', () => {
				editor.setData( `<figure class="image" style="width:50%;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );

				expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'resizedWidth' ) ).to.equal( '50%' );
			} );

			it( 'does not upcast width if height is set too', () => {
				editor.setData( `<figure class="image" style="height:100px;width:200px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );

				expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'resizedWidth' ) ).to.be.undefined;
			} );

			it( 'downcasts 100px width correctly', () => {
				setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedWidth="100px"></imageBlock>` );

				expect( editor.getData() )
					.to.equal( `<figure class="image image_resized" style="width:100px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
			} );

			it( 'downcasts 50% width correctly', () => {
				setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedWidth="50%"></imageBlock>` );

				expect( editor.getData() )
					.to.equal( `<figure class="image image_resized" style="width:50%;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
			} );

			it( 'removes style and extra class when no longer resized', () => {
				setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedWidth="50%"></imageBlock>` );

				const imageModel = editor.model.document.getRoot().getChild( 0 );

				editor.model.change( writer => {
					writer.removeAttribute( 'resizedWidth', imageModel );
				} );

				expect( editor.getData() )
					.to.equal( `<figure class="image"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
			} );

			it( 'doesn\'t downcast consumed tokens', () => {
				editor.conversion.for( 'downcast' ).add( dispatcher =>
					dispatcher.on( 'attribute:resizedWidth:imageBlock', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'attribute:resizedWidth:imageBlock' );
					}, { priority: 'high' } )
				);
				setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedWidth="50%"></imageBlock>` );

				expect( editor.getData() )
					.to.equal( `<figure class="image"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
			} );
		} );

		describe( 'height', () => {
			describe( 'upcast', () => {
				it( 'upcasts 100px height correctly', () => {
					editor.setData( `<figure class="image" style="height:100px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );

					expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'resizedHeight' ) ).to.equal( '100px' );
				} );

				it( 'upcasts 50% height correctly', () => {
					editor.setData( `<figure class="image" style="height:50%;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );

					expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'resizedHeight' ) ).to.equal( '50%' );
				} );

				it( 'does not upcast height if width is set too', () => {
					editor.setData( `<figure class="image" style="height:100px;width:200px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );

					expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'resizedHeight' ) ).to.be.undefined;
				} );
			} );

			describe( 'data downcast', () => {
				it( 'downcasts 100px height correctly', () => {
					setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedHeight="100px"></imageBlock>` );

					expect( editor.getData() )
						.to.equal( `<figure class="image" style="height:100px;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
				} );

				it( 'downcasts 50% height correctly', () => {
					setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedHeight="50%"></imageBlock>` );

					expect( editor.getData() )
						.to.equal( `<figure class="image" style="height:50%;"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
				} );

				it( 'doesn\'t downcast consumed tokens', () => {
					editor.conversion.for( 'dataDowncast' ).add( dispatcher =>
						dispatcher.on( 'attribute:resizedHeight:imageBlock', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:resizedHeight:imageBlock' );
						}, { priority: 'high' } )
					);
					setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedHeight="50%"></imageBlock>` );

					expect( editor.getData() )
						.to.equal( `<figure class="image"><img src="${ IMAGE_SRC_FIXTURE }"></figure>` );
				} );
			} );

			describe( 'editing downcast', () => {
				it( 'downcasts 100px height correctly', () => {
					setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedHeight="100px"></imageBlock>` );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget ck-widget_selected image" contenteditable="false" style="height:100px">' +
							`<img src="${ IMAGE_SRC_FIXTURE }"></img>` +
							'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
						'</figure>'
					);
				} );

				it( 'downcasts 50% height correctly', () => {
					setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedHeight="50%"></imageBlock>` );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget ck-widget_selected image" contenteditable="false" style="height:50%">' +
							`<img src="${ IMAGE_SRC_FIXTURE }"></img>` +
							'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
						'</figure>'
					);
				} );

				it( 'removes `height` style in view if `resizedHeight` is removed from model', () => {
					setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedHeight="50%"></imageBlock>` );

					const imageModel = editor.model.document.getRoot().getChild( 0 );

					editor.model.change( writer => {
						writer.removeAttribute( 'resizedHeight', imageModel );
					} );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
							`<img src="${ IMAGE_SRC_FIXTURE }"></img>` +
							'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
						'</figure>'
					);
				} );

				it( 'doesn\'t downcast consumed tokens', () => {
					editor.conversion.for( 'editingDowncast' ).add( dispatcher =>
						dispatcher.on( 'attribute:resizedHeight:imageBlock', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:resizedHeight:imageBlock' );
						}, { priority: 'high' } )
					);
					setData( editor.model, `<imageBlock src="${ IMAGE_SRC_FIXTURE }" resizedHeight="50%"></imageBlock>` );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget ck-widget_selected image" contenteditable="false">' +
							`<img src="${ IMAGE_SRC_FIXTURE }"></img>` +
							'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
						'</figure>'
					);
				} );
			} );
		} );
	} );

	describe( 'conversion (inline images)', () => {
		beforeEach( async () => {
			editor = await createEditor();
		} );

		it( 'consumes image_resized class during upcast', () => {
			const consumeSpy = sinon.spy( ( evt, data, conversionApi ) => {
				expect( conversionApi.consumable.test( data.viewItem, { classes: [ 'image_resized' ] } ) ).to.be.false;
			} );

			editor.data.upcastDispatcher.on( 'element:img', consumeSpy, { priority: 'lowest' } );
			editor.setData(
				'<p>Lore' +
					'<span class="image-inline">' +
						`<img src="${ IMAGE_SRC_FIXTURE }" style="width:100px;" class="image_resized">` +
					'</span>' +
					'ipsum' +
				'</p>'
			);

			expect( consumeSpy.calledOnce ).to.be.true;
		} );

		describe( 'width', () => {
			it( 'upcasts 100px width correctly', () => {
				editor.setData(
					`<p>Lorem <span class="image-inline"><img src="${ IMAGE_SRC_FIXTURE }" style="width:100px;"></span> ipsum</p>`
				);

				expect( editor.model.document.getRoot().getChild( 0 ).getChild( 1 ).getAttribute( 'resizedWidth' ) ).to.equal( '100px' );
			} );

			it( 'upcasts 50% width correctly', () => {
				editor.setData(
					`<p>Lorem <span class="image-inline"><img src="${ IMAGE_SRC_FIXTURE }" style="width:50%;"></span> ipsum</p>`
				);

				expect( editor.model.document.getRoot().getChild( 0 ).getChild( 1 ).getAttribute( 'resizedWidth' ) ).to.equal( '50%' );
			} );

			it( 'does not upcast width if height is set too', () => {
				editor.setData(
					'<p>Lorem <span class="image-inline">' +
						`<img src="${ IMAGE_SRC_FIXTURE }" style="width:100px;height:200px;">` +
					'</span> ipsum</p>'
				);

				expect( editor.model.document.getRoot().getChild( 0 ).getChild( 1 ).getAttribute( 'resizedWidth' ) ).to.be.undefined;
			} );

			it( 'downcasts 100px resizedWidth correctly', () => {
				setData( editor.model,
					`<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedWidth="100px"></imageInline></paragraph>`
				);

				expect( editor.getData() )
					.to.equal(
						`<p><img class="image_resized" style="width:100px;" src="${ IMAGE_SRC_FIXTURE }"></p>`
					);
			} );

			it( 'downcasts 50% resizedWidth correctly', () => {
				setData( editor.model,
					`<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedWidth="50%"></imageInline></paragraph>`
				);

				expect( editor.getData() )
					.to.equal( `<p><img class="image_resized" style="width:50%;" src="${ IMAGE_SRC_FIXTURE }"></p>` );
			} );

			it( 'removes style and extra class when no longer resized', () => {
				setData( editor.model,
					`<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedWidth="50%"></imageInline></paragraph>`
				);

				const imageModel = editor.model.document.getRoot().getChild( 0 ).getChild( 0 );

				editor.model.change( writer => {
					writer.removeAttribute( 'resizedWidth', imageModel );
				} );

				expect( editor.getData() )
					.to.equal( `<p><img src="${ IMAGE_SRC_FIXTURE }"></p>` );
			} );

			it( 'doesn\'t downcast consumed tokens', () => {
				editor.conversion.for( 'downcast' ).add( dispatcher =>
					dispatcher.on( 'attribute:resizedWidth:imageInline', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'attribute:resizedWidth:imageInline' );
					}, { priority: 'high' } )
				);
				setData( editor.model,
					`<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedWidth="50%"></imageInline></paragraph>`
				);

				expect( editor.getData() )
					.to.equal( `<p><img src="${ IMAGE_SRC_FIXTURE }"></p>` );
			} );
		} );

		describe( 'height', () => {
			describe( 'upcast', () => {
				it( 'upcasts 100px height correctly', () => {
					editor.setData(
						`<p>Lorem <span class="image-inline"><img src="${ IMAGE_SRC_FIXTURE }" style="height:100px;"></span> ipsum</p>`
					);

					expect( editor.model.document.getRoot().getChild( 0 ).getChild( 1 ).getAttribute( 'resizedHeight' ) )
						.to.equal( '100px' );
				} );

				it( 'upcasts 50% height correctly', () => {
					editor.setData(
						`<p>Lorem <span class="image-inline"><img src="${ IMAGE_SRC_FIXTURE }" style="height:50%;"></span> ipsum</p>`
					);

					expect( editor.model.document.getRoot().getChild( 0 ).getChild( 1 ).getAttribute( 'resizedHeight' ) ).to.equal( '50%' );
				} );

				it( 'does not upcast height if width is set too', () => {
					editor.setData(
						'<p>Lorem <span class="image-inline">' +
							`<img src="${ IMAGE_SRC_FIXTURE }" style="height:100px;width:200px;">` +
						'</span> ipsum</p>'
					);

					expect( editor.model.document.getRoot().getChild( 0 ).getChild( 1 ).getAttribute( 'resizedHeight' ) ).to.be.undefined;
				} );
			} );

			describe( 'data downcast', () => {
				it( 'downcasts 100px resizedHeight correctly', () => {
					setData( editor.model,
						`<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedHeight="100px"></imageInline></paragraph>`
					);

					expect( editor.getData() )
						.to.equal(
							`<p><img style="height:100px;" src="${ IMAGE_SRC_FIXTURE }"></p>`
						);
				} );

				it( 'downcasts 50% resizedHeight correctly', () => {
					setData( editor.model,
						`<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedHeight="50%"></imageInline></paragraph>`
					);

					expect( editor.getData() )
						.to.equal( `<p><img style="height:50%;" src="${ IMAGE_SRC_FIXTURE }"></p>` );
				} );

				it( 'doesn\'t downcast consumed tokens', () => {
					editor.conversion.for( 'dataDowncast' ).add( dispatcher =>
						dispatcher.on( 'attribute:resizedHeight:imageInline', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:resizedHeight:imageInline' );
						}, { priority: 'high' } )
					);
					setData(
						editor.model, `<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedHeight="50%"></imageInline></paragraph>`
					);

					expect( editor.getData() )
						.to.equal( `<p><img src="${ IMAGE_SRC_FIXTURE }"></p>` );
				} );
			} );

			describe( 'editing downcast', () => {
				it( 'downcasts 100px resizedHeight correctly', () => {
					setData( editor.model,
						`<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedHeight="100px"></imageInline></paragraph>`
					);

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false">' +
							`<img src="${ IMAGE_SRC_FIXTURE }" style="height:100px"></img>` +
						'</span></p>'
					);
				} );

				it( 'downcasts 50% resizedHeight correctly', () => {
					setData( editor.model,
						`<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedHeight="50%"></imageInline></paragraph>`
					);

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false">' +
							`<img src="${ IMAGE_SRC_FIXTURE }" style="height:50%"></img>` +
						'</span></p>'
					);
				} );

				it( 'removes `height` style in view if `resizedHeight` is removed from model', () => {
					setData( editor.model,
						`<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedHeight="100px"></imageInline></paragraph>`
					);

					const imageModel = editor.model.document.getRoot().getChild( 0 ).getChild( 0 );

					editor.model.change( writer => {
						writer.removeAttribute( 'resizedHeight', imageModel );
					} );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false">' +
							`<img src="${ IMAGE_SRC_FIXTURE }"></img>` +
						'</span></p>'
					);
				} );

				it( 'doesn\'t downcast consumed tokens', () => {
					editor.conversion.for( 'editingDowncast' ).add( dispatcher =>
						dispatcher.on( 'attribute:resizedHeight:imageInline', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:resizedHeight:imageInline' );
						}, { priority: 'high' } )
					);
					setData( editor.model,
						`<paragraph><imageInline src="${ IMAGE_SRC_FIXTURE }" resizedHeight="50%"></imageInline></paragraph>`
					);

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<p><span class="ck-widget image-inline" contenteditable="false">' +
							`<img src="${ IMAGE_SRC_FIXTURE }"></img>` +
						'</span></p>'
					);
				} );
			} );
		} );
	} );

	describe( 'schema', () => {
		beforeEach( async () => {
			editor = await createEditor();
		} );

		it( 'allows the resizedWidth attribute when ImageBlock plugin is enabled', async () => {
			const newEditor = await ClassicEditor.create( editorElement, { plugins: [ ImageBlockEditing, ImageResizeEditing ] } );
			expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'resizedWidth' ) ).to.be.true;
			await newEditor.destroy();
		} );

		it( 'allows the resizedHeight attribute when ImageBlock plugin is enabled', async () => {
			const newEditor = await ClassicEditor.create( editorElement, { plugins: [ ImageBlockEditing, ImageResizeEditing ] } );
			expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'resizedHeight' ) ).to.be.true;
			await newEditor.destroy();
		} );

		it( 'allows the resizedWidth attribute when ImageInline plugin is enabled', async () => {
			const newEditor = await ClassicEditor.create( editorElement, { plugins: [ ImageInlineEditing, ImageResizeEditing ] } );
			expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'resizedWidth' ) ).to.be.true;
			await newEditor.destroy();
		} );

		it( 'allows the resizedHeight attribute when ImageInline plugin is enabled', async () => {
			const newEditor = await ClassicEditor.create( editorElement, { plugins: [ ImageInlineEditing, ImageResizeEditing ] } );
			expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'resizedHeight' ) ).to.be.true;
			await newEditor.destroy();
		} );

		it( 'allows the resizedWidth attribute when ImageBlock plugin is enabled (reverse order in plugins array)', async () => {
			const newEditor = await ClassicEditor.create( editorElement, { plugins: [ ImageResizeEditing, ImageBlockEditing ] } );
			expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'resizedWidth' ) ).to.be.true;
			await newEditor.destroy();
		} );

		it( 'allows the resizedHeight attribute when ImageBlock plugin is enabled (reverse order in plugins array)', async () => {
			const newEditor = await ClassicEditor.create( editorElement, { plugins: [ ImageResizeEditing, ImageBlockEditing ] } );
			expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'resizedHeight' ) ).to.be.true;
			await newEditor.destroy();
		} );

		it( 'allows the resizedWidth attribute when ImageInline plugin is enabled (reverse order in plugins array)', async () => {
			const newEditor = await ClassicEditor.create( editorElement, { plugins: [ ImageResizeEditing, ImageInlineEditing ] } );
			expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'resizedWidth' ) ).to.be.true;
			await newEditor.destroy();
		} );

		it( 'allows the resizedHeight attribute when ImageInline plugin is enabled (reverse order in plugins array)', async () => {
			const newEditor = await ClassicEditor.create( editorElement, { plugins: [ ImageResizeEditing, ImageInlineEditing ] } );
			expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'resizedHeight' ) ).to.be.true;
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
