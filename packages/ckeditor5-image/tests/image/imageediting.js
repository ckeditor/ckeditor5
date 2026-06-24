/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { normalizeHtml } from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';
import { _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

import { ImageEditing } from '../../src/image/imageediting.js';
import { ImageLoadObserver } from '../../src/image/imageloadobserver.js';
import { InsertImageCommand } from '../../src/image/insertimagecommand.js';
import { ImageTypeCommand } from '../../src/image/imagetypecommand.js';
import { ImageBlockEditing } from '../../src/image/imageblockediting.js';
import { ImageInlineEditing } from '../../src/image/imageinlineediting.js';

describe( 'ImageEditing', () => {
	let editor, model, doc, view, viewDocument;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				view = editor.editing.view;
				viewDocument = view.document;
			} );
	} );

	it( 'should have pluginName', () => {
		expect( ImageEditing.pluginName ).toBe( 'ImageEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageEditing ) ).toBeInstanceOf( ImageEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.isRegistered( 'imageBlock' ) ).toBe( true );
		expect( model.schema.isBlock( 'imageBlock' ) ).toBe( true );
		expect( model.schema.isObject( 'imageBlock' ) ).toBe( true );

		expect( model.schema.checkChild( [ '$root' ], 'imageBlock' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'src' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'alt' ) ).toBe( true );

		expect( model.schema.checkChild( [ '$root', 'imageBlock' ], 'imageBlock' ) ).toBe( false );
		expect( model.schema.checkChild( [ '$root', 'imageBlock' ], '$text' ) ).toBe( false );
		expect( model.schema.checkChild( [ '$root', '$block' ], 'imageBlock' ) ).toBe( false );

		expect( model.schema.isRegistered( 'imageInline' ) ).toBe( true );
		expect( model.schema.isInline( 'imageInline' ) ).toBe( true );
		expect( model.schema.isObject( 'imageInline' ) ).toBe( true );

		expect( model.schema.checkChild( [ '$root', '$block' ], 'imageInline' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'src' ) ).toBe( true );
		expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'alt' ) ).toBe( true );

		expect( model.schema.checkChild( [ '$root' ], 'imageInline' ) ).toBe( false );
		expect( model.schema.checkChild( [ '$root', '$block', 'imageInline' ], 'imageBlock' ) ).toBe( false );
		expect( model.schema.checkChild( [ '$root', '$block', 'imageInline' ], '$text' ) ).toBe( false );
	} );

	it( 'should register ImageLoadObserver', () => {
		expect( view.getObserver( ImageLoadObserver ) ).toBeInstanceOf( ImageLoadObserver );
	} );

	it( 'should register the insertImage command', () => {
		expect( editor.commands.get( 'insertImage' ) ).toBeInstanceOf( InsertImageCommand );
	} );

	it( 'should register the imageInsert command as an alias for the insertImage command', () => {
		expect( editor.commands.get( 'imageInsert' ) ).toBe( editor.commands.get( 'insertImage' ) );
	} );

	it( 'should register the imageTypeBlock and imageTypeInline commands', () => {
		expect( editor.commands.get( 'imageTypeBlock' ) ).toBeInstanceOf( ImageTypeCommand );
		expect( editor.commands.get( 'imageTypeInline' ) ).toBeInstanceOf( ImageTypeCommand );
	} );

	// See https://github.com/ckeditor/ckeditor5-image/issues/142.
	it( 'should update the ui after image has been loaded in the DOM', async () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		const editor = await ClassicTestEditor.create( element, {
			plugins: [ ImageBlockEditing ]
		} );

		editor.data.set( '<figure class="image"><img src="/sample.png" alt="bar" /></figure>' );

		const spy = vi.fn();

		editor.ui.on( 'update', spy );

		const htmlImageElement = editor.ui.getEditableElement().querySelector( 'img' );
		htmlImageElement.dispatchEvent( new Event( 'load' ) );

		expect( spy ).toHaveBeenCalledOnce();

		await editor.destroy();
		await element.remove();
	} );

	it( 'should update the ui after inline image has been loaded in the DOM', async () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		const editor = await ClassicTestEditor.create( element, {
			plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ]
		} );

		editor.data.set( '<p><img src="/sample.png" alt="bar" /></p>' );

		const spy = vi.fn();

		editor.ui.on( 'update', spy );

		const htmlImageElement = editor.ui.getEditableElement().querySelector( 'img' );
		htmlImageElement.dispatchEvent( new Event( 'load' ) );

		expect( spy ).toHaveBeenCalledOnce();

		await editor.destroy();
		await element.remove();
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				_setModelData( model, '<imageBlock src="/sample.png" alt="alt text"></imageBlock>' );

				expect( editor.getData() ).toBe( '<figure class="image"><img src="/sample.png" alt="alt text"></figure>' );

				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );

				expect( editor.getData() ).toBe( '<p><img src="/sample.png" alt="alt text"></p>' );
			} );

			it( 'should convert without alt attribute', () => {
				_setModelData( model, '<imageBlock src="/sample.png"></imageBlock>' );

				expect( editor.getData() ).toBe( '<figure class="image"><img src="/sample.png"></figure>' );

				_setModelData( model, '<paragraph><imageInline src="/sample.png"></imageInline></paragraph>' );

				expect( editor.getData() ).toBe( '<p><img src="/sample.png"></p>' );
			} );

			it( 'should convert srcset attribute to srcset and sizes attribute', () => {
				_setModelData( model,
					'<imageBlock src="/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w">' +
					'</imageBlock>'
				);

				expect( normalizeHtml( editor.getData() ) ).toBe(
					'<figure class="image">' +
						'<img alt="alt text" sizes="100vw" src="/sample.png" srcset="small.png 148w, big.png 1024w"></img>' +
					'</figure>'
				);

				_setModelData( model,
					'<paragraph>' +
						'<imageInline src="/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w">' +
					'</imageInline></paragraph>'
				);

				expect( normalizeHtml( editor.getData() ) ).toBe(
					'<p><img alt="alt text" sizes="100vw" src="/sample.png" srcset="small.png 148w, big.png 1024w"></img></p>'
				);
			} );

			it( 'should not convert srcset attribute if is already consumed', () => {
				editor.data.downcastDispatcher.on( 'attribute:srcset:imageBlock', ( evt, data, conversionApi ) => {
					const modelImage = data.item;

					conversionApi.consumable.consume( modelImage, evt.name );
				}, { priority: 'high' } );

				_setModelData( model,
					'<imageBlock ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="small.png 148w, big.png 1024w">' +
					'</imageBlock>'
				);

				expect( editor.getData() ).toBe(
					'<figure class="image">' +
						'<img src="/sample.png" alt="alt text">' +
					'</figure>'
				);

				editor.data.downcastDispatcher.on( 'attribute:srcset:imageInline', ( evt, data, conversionApi ) => {
					const modelImage = data.item;

					conversionApi.consumable.consume( modelImage, evt.name );
				}, { priority: 'high' } );

				_setModelData( model,
					'<paragraph><imageInline ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="small.png 148w, big.png 1024w">' +
					'</imageInline></paragraph>'
				);

				expect( editor.getData() ).toBe( '<p><img src="/sample.png" alt="alt text"></p>' );
			} );

			it( 'should not convert srcset attribute if has no data', () => {
				_setModelData( model,
					'<imageBlock ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="">' +
					'</imageBlock>' );

				const image = doc.getRoot().getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( editor.getData() ).toBe(
					'<figure class="image">' +
						'<img src="/sample.png" alt="alt text">' +
					'</figure>'
				);

				_setModelData( model,
					'<paragraph><imageInline ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="">' +
					'</imageInline></paragraph>' );

				const imageInline = doc.getRoot().getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', imageInline );
				} );

				expect( editor.getData() ).toBe( '<p><img src="/sample.png" alt="alt text"></p>' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert image figure', () => {
				editor.setData( '<figure class="image"><img src="/sample.png" alt="alt text" /></figure>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<imageBlock alt="alt text" src="/sample.png"></imageBlock>' );
			} );

			it( 'should convert image inline', () => {
				editor.setData( '<p><img src="/sample.png" alt="alt text" /></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph><imageInline alt="alt text" src="/sample.png"></imageInline></paragraph>' );
			} );

			it( 'should convert image with `display:block` style', () => {
				editor.setData( '<p><img src="/asserts/sample.png" alt="alt text" style="display:block" /></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<imageBlock alt="alt text" src="/asserts/sample.png"></imageBlock>' );
			} );

			it( 'should not convert if there is no image class in figure', () => {
				editor.setData( '<figure class="quote">My quote</figure>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph>My quote</paragraph>' );
			} );

			it( 'should not convert if there is no img inside figure #1', () => {
				editor.setData( '<figure class="image"></figure>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph></paragraph>' );
			} );

			it( 'should not convert if there is no img inside figure #2', () => {
				editor.setData( '<figure class="image">test</figure>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph>test</paragraph>' );
			} );

			it( 'should convert without alt attribute', () => {
				editor.setData( '<figure class="image"><img src="/sample.png" /></figure>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<imageBlock src="/sample.png"></imageBlock>' );

				editor.setData( '<p><img src="/sample.png" /></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph><imageInline src="/sample.png"></imageInline></paragraph>' );
			} );

			it( 'should convert without src attribute', () => {
				editor.setData( '<figure class="image"><img alt="alt text" /></figure>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<imageBlock alt="alt text"></imageBlock>' );

				editor.setData( '<p><img alt="alt text" /></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph><imageInline alt="alt text"></imageInline></paragraph>' );
			} );

			it( 'should not convert in wrong context', () => {
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( ctx.endsWith( '$root' ) && childDef.name == 'imageBlock' ) {
						return false;
					}
				} );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );

				// A block image cannot land here (`imageBlock` is disallowed in `$root` and `<div>` only accepts inline
				// content), so it degrades to an inline image instead of being dropped.
				editor.setData( '<div><figure class="image"><img src="/sample.png" alt="alt text" /></figure></div>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<div><imageInline alt="alt text" src="/sample.png"></imageInline></div>' );

				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( childDef.name == 'imageInline' ) {
						return false;
					}
				} );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );

				editor.setData( '<div><img src="/sample.png" alt="alt text" /></div>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<div></div>' );
			} );

			it( 'should upcast a bare <img> as a block image when inline images are disallowed', () => {
				// The reverse of the inline-root case: an `<img>` resolves to an inline image from its view structure,
				// but when `imageInline` is disallowed (and `imageBlock` can land via autohoisting) it degrades to a
				// block image instead of being dropped.
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( childDef.name == 'imageInline' ) {
						return false;
					}
				} );

				editor.setData( '<p>foo<img src="/sample.png" alt="alt text" />bar</p>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
					'<paragraph>foo</paragraph>' +
					'<imageBlock alt="alt text" src="/sample.png"></imageBlock>' +
					'<paragraph>bar</paragraph>'
				);
			} );

			it( 'should not convert if img is already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
					const img = data.viewItem.getChild( 0 );
					conversionApi.consumable.consume( img, { name: true } );
				}, { priority: 'high' } );

				editor.setData( '<figure class="image"><img src="/sample.png" alt="alt text" /></figure>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph></paragraph>' );

				editor.data.upcastDispatcher.on( 'element:p', ( evt, data, conversionApi ) => {
					const img = data.viewItem.getChild( 0 );
					conversionApi.consumable.consume( img, { name: true } );
				}, { priority: 'high' } );

				editor.setData( '<p><img src="/sample.png" alt="alt text" /></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph></paragraph>' );
			} );

			it( 'should not convert if figure is already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { name: true, class: 'image' } );
				}, { priority: 'high' } );

				editor.setData( '<figure class="image"><img src="/sample.png" alt="alt text" /></figure>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph></paragraph>' );
			} );

			it( 'should dispatch conversion for nested elements', () => {
				const conversionSpy = vi.fn();
				editor.data.upcastDispatcher.on( 'element:figcaption', conversionSpy );

				editor.setData( '<figure class="image"><img src="/sample.png" alt="alt text" /><figcaption></figcaption></figure>' );

				editor.data.upcastDispatcher.on( 'element:img', conversionSpy );

				editor.setData( '<span class="image"><img src="/sample.png" alt="alt text" /></span>' );

				expect( conversionSpy ).toHaveBeenCalledTimes( 2 );
			} );

			it( 'should convert bare img element', () => {
				editor.setData( '<img src="/sample.png" alt="alt text" />' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph><imageInline alt="alt text" src="/sample.png"></imageInline></paragraph>' );
			} );

			it( 'should not convert alt attribute on non-img element', () => {
				model.schema.register( 'div', {
					inheritAllFrom: '$block',
					allowAttributes: 'alt'
				} );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );

				editor.setData( '<div alt="foo"></div>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toBe( '<div></div>' );
			} );

			it( 'should convert image with srcset attribute', () => {
				editor.setData(
					'<figure class="image">' +
						'<img src="/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" />' +
					'</figure>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe(
						'<imageBlock alt="alt text" src="/sample.png" srcset="small.png 148w, big.png 1024w">' +
						'</imageBlock>'
					);

				editor.setData(
					'<p><img src="/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" /></p>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe(
						'<paragraph>' +
							'<imageInline alt="alt text" src="/sample.png" srcset="small.png 148w, big.png 1024w">' +
							'</imageInline>' +
						'</paragraph>'
					);
			} );

			it( 'should ignore sizes attribute', () => {
				editor.setData(
					'<figure class="image">' +
						'<img src="/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" sizes="50vw" />' +
					'</figure>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe(
						'<imageBlock alt="alt text" src="/sample.png" srcset="small.png 148w, big.png 1024w">' +
						'</imageBlock>'
					);

				editor.setData(
					'<p><img src="/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" sizes="50vw" /></p>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe(
						'<paragraph>' +
							'<imageInline alt="alt text" src="/sample.png" srcset="small.png 148w, big.png 1024w">' +
							'</imageInline>' +
						'</paragraph>'
					);
			} );

			it( 'should not convert a link on an inline image', () => {
				editor.setData(
					'<a href="http://ckeditor.com"><img src="/sample.png" alt="alt text" /></a>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe(
						'<paragraph>' +
							'<imageInline alt="alt text" src="/sample.png"></imageInline>' +
						'</paragraph>'
					);
			} );

			describe( 'should autohoist images', () => {
				beforeEach( () => {
					model.schema.register( 'div', { inheritAllFrom: '$block' } );

					editor.conversion.elementToElement( { model: 'div', view: 'div' } );
				} );

				it( 'image between non-hoisted elements', () => {
					editor.setData( '<div>foo<figure class="image"><img src="foo.jpg" alt="foo" /></figure>bar</div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>foo</div>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<div>bar</div>'
					);

					editor.setData( '<div>foo<img src="foo.jpg" alt="foo" />bar</div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>foo<imageInline alt="foo" src="foo.jpg"></imageInline>bar</div>'
					);
				} );

				it( 'multiple images', () => {
					editor.setData(
						'<div>foo' +
							'<figure class="image"><img src="foo.jpg" alt="foo" /></figure>ba' +
							'<figure class="image"><img src="foo.jpg" alt="foo" /></figure>r' +
						'</div>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>foo</div>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<div>ba</div>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<div>r</div>'
					);

					editor.setData( '<div>foo<img src="foo.jpg" alt="foo" />ba<img src="foo.jpg" alt="foo" />r</div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>foo' +
						'<imageInline alt="foo" src="foo.jpg"></imageInline>' +
						'ba' +
						'<imageInline alt="foo" src="foo.jpg"></imageInline>' +
						'r</div>'
					);
				} );

				it( 'images on borders of parent', () => {
					editor.setData( '<div><figure class="image"><img src="foo.jpg" alt="foo" /></figure>foobar' +
						'<figure class="image"><img src="foo.jpg" alt="foo" /></figure></div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<div>foobar</div>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>'
					);

					editor.setData( '<div><img src="foo.jpg" alt="foo" />foobar<img src="foo.jpg" alt="foo" /></div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>' +
						'<imageInline alt="foo" src="foo.jpg"></imageInline>' +
						'foobar' +
						'<imageInline alt="foo" src="foo.jpg"></imageInline>' +
						'</div>'
					);
				} );

				it( 'images are only content of parent', () => {
					editor.setData( '<div><figure class="image"><img src="foo.jpg" alt="foo" /></figure>' +
						'<figure class="image"><img src="foo.jpg" alt="foo" /></figure></div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>'
					);

					editor.setData( '<div><img src="foo.jpg" alt="foo" /><img src="foo.jpg" alt="foo" /></div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div><imageInline alt="foo" src="foo.jpg"></imageInline><imageInline alt="foo" src="foo.jpg"></imageInline></div>'
					);
				} );

				it( 'deep autohoisting #1', () => {
					model.schema.extend( 'div', { allowIn: 'div' } );

					editor.setData( '<div>foo<div>xx<figure class="image"><img src="foo.jpg" alt="foo" /></figure></div>bar</div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>' +
							'foo' +
							'<div>' +
								'xx' +
							'</div>' +
						'</div>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<div>bar</div>'
					);

					editor.setData( '<div>foo<div>xx<img src="foo.jpg" alt="foo" /></div>bar</div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>foo<div>xx<imageInline alt="foo" src="foo.jpg"></imageInline></div>bar</div>'
					);
				} );

				it( 'deep autohoisting #2', () => {
					model.schema.extend( 'div', { allowIn: 'div' } );

					editor.setData(
						'<div>x</div>' +
						'<div><div><div><figure class="image"><img src="foo.jpg" alt="foo" /></figure></div></div></div>' +
						'<div>y</div>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>x</div><imageBlock alt="foo" src="foo.jpg"></imageBlock><div>y</div>'
					);

					editor.setData(
						'<div>x</div>' +
						'<div><div><div><img src="foo.jpg" alt="foo" /></div></div></div>' +
						'<div>y</div>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>x</div><div><div><div>' +
							'<imageInline alt="foo" src="foo.jpg"></imageInline>' +
						'</div></div></div><div>y</div>'
					);
				} );

				it( 'should not break a limiting element', () => {
					model.schema.register( 'limit', {
						inheritAllFrom: '$block',
						isLimit: true
					} );
					model.schema.extend( 'div', { allowIn: 'limit' } );

					editor.conversion.elementToElement( { model: 'limit', view: 'limit' } );

					editor.setData( '<limit><div>foo<figure class="image"><img src="foo.jpg" alt="foo" /></figure>bar</div></limit>' );

					// The `<limit>` element has no converters so it is not converted. The block image cannot land inside the
					// `<div>` (and cannot break out of the limit), so it degrades to an inline image instead of being dropped.
					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<limit><div>foo<imageInline alt="foo" src="foo.jpg"></imageInline>bar</div></limit>'
					);

					editor.setData( '<limit><div>foo<img src="foo.jpg" alt="foo" />bar</div></limit>' );

					// <limit> element does not have converters so it is not converted.
					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<limit><div>foo<imageInline alt="foo" src="foo.jpg"></imageInline>bar</div></limit>'
					);
				} );

				it( 'should convert and autohoist image element without src attribute', () => {
					editor.setData( '<div>foo<img alt="foo" />bar</div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>foo<imageInline alt="foo"></imageInline>bar</div>'
					);
				} );
			} );
		} );
	} );

	describe( 'conversion in editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				_setModelData( model, '<imageBlock src="/sample.png" alt="alt text"></imageBlock>' );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<figure class="ck-widget image" contenteditable="false"><img alt="alt text" src="/sample.png"></img></figure>'
				);

				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="alt text" src="/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'converted element should be widgetized', () => {
				_setModelData( model, '<imageBlock src="/sample.png" alt="alt text"></imageBlock>' );
				const figure = viewDocument.getRoot().getChild( 0 );

				expect( figure.name ).toBe( 'figure' );
				expect( editor.plugins.get( 'ImageUtils' ).isImageWidget( figure ) ).toBe( true );

				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );
				const element = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

				expect( element.name ).toBe( 'span' );
				expect( editor.plugins.get( 'ImageUtils' ).isImageWidget( element ) ).toBe( true );
			} );

			it( 'should convert attribute change', () => {
				_setModelData( model, '<imageBlock src="/sample.png" alt="alt text"></imageBlock>' );
				let image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'alt', 'new text', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<figure class="ck-widget image" contenteditable="false"><img alt="new text" src="/sample.png"></img></figure>'
				);

				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );
				image = doc.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'alt', 'new text', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="new text" src="/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'should convert attribute removal (but keeps an empty "alt" to the data)', () => {
				_setModelData( model, '<imageBlock src="/sample.png" alt="alt text"></imageBlock>' );
				let image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<figure class="ck-widget image" contenteditable="false"><img alt="" src="/sample.png"></img></figure>'
				);

				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );
				image = doc.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<p><span class="ck-widget image-inline" contenteditable="false"><img alt="" src="/sample.png"></img></span></p>'
				);
			} );

			it( 'should not convert change if is already consumed', () => {
				_setModelData( model, '<imageBlock src="/sample.png" alt="alt text"></imageBlock>' );
				let image = doc.getRoot().getChild( 0 );

				editor.editing.downcastDispatcher.on( 'attribute:alt:imageBlock', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:alt' );
				}, { priority: 'high' } );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<figure class="ck-widget image" contenteditable="false"><img alt="alt text" src="/sample.png"></img></figure>'
				);

				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );
				image = doc.getRoot().getChild( 0 ).getChild( 0 );

				editor.editing.downcastDispatcher.on( 'attribute:alt:imageInline', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:alt' );
				}, { priority: 'high' } );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="alt text" src="/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'should convert srcset attribute to srcset and sizes', () => {
				_setModelData( model,
					'<imageBlock ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="small.png 148w, big.png 1024w">' +
					'</imageBlock>' );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" sizes="100vw" src="/sample.png" srcset="small.png 148w, big.png 1024w"></img>' +
					'</figure>'
				);

				_setModelData( model,
					'<paragraph><imageInline ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="small.png 148w, big.png 1024w">' +
					'</imageInline></paragraph>' );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
					'<img alt="alt text" sizes="100vw" src="/sample.png" srcset="small.png 148w, big.png 1024w"></img>' +
					'</span></p>'
				);
			} );

			it( 'should not convert srcset attribute if has no data', () => {
				_setModelData( model,
					'<imageBlock ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="">' +
					'</imageBlock>' );

				let image = doc.getRoot().getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" src="/sample.png"></img>' +
					'</figure>'
				);

				_setModelData( model,
					'<paragraph><imageInline ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "foo":"bar" }\'>' +
					'</imageInline></paragraph>' );

				image = doc.getRoot().getChild( 0 ).getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
					'<img alt="alt text" src="/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'should remove sizes and srcsset attribute when srcset attribute is removed from model', () => {
				_setModelData( model,
					'<imageBlock src="/sample.png" srcset="small.png 148w, big.png 1024w">' +
					'</imageBlock>'
				);
				let image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src="/sample.png"></img>' +
					'</figure>'
				);

				_setModelData( model,
					'<paragraph>' +
						'<imageInline src="/sample.png" srcset="small.png 148w, big.png 1024w" ></imageInline>' +
					'</paragraph>'
				);
				image = doc.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
					'<img src="/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'should not convert srcset attribute if is already consumed', () => {
				editor.editing.downcastDispatcher.on( 'attribute:srcset:imageBlock', ( evt, data, conversionApi ) => {
					const modelImage = data.item;

					conversionApi.consumable.consume( modelImage, evt.name );
				}, { priority: 'high' } );

				_setModelData( model,
					'<imageBlock ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="small.png 148w, big.png 1024w">' +
					'</imageBlock>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" src="/sample.png"></img>' +
					'</figure>'
				);

				editor.editing.downcastDispatcher.on( 'attribute:srcset:imageInline', ( evt, data, conversionApi ) => {
					const modelImage = data.item;

					conversionApi.consumable.consume( modelImage, evt.name );
				}, { priority: 'high' } );

				_setModelData( model,
					'<paragraph><imageInline ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="small.png 148w, big.png 1024w">' +
					'</imageInline></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
					'<img alt="alt text" src="/sample.png"></img>' +
					'</span></p>'
				);
			} );
		} );
	} );
} );
