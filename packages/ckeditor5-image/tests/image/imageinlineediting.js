/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { ViewDataTransfer, _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { ListEditing } from '@ckeditor/ckeditor5-list';

import { normalizeHtml } from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';
import { stubUid } from '@ckeditor/ckeditor5-list/tests/list/_utils/uid.js';

import { ImageBlockEditing } from '../../src/image/imageblockediting.js';
import { ImageTypeCommand } from '../../src/image/imagetypecommand.js';
import { InsertImageCommand } from '../../src/image/insertimagecommand.js';
import { ImageCaption } from '../../src/imagecaption.js';
import { ImageLoadObserver } from '../../src/image/imageloadobserver.js';
import { ImageInlineEditing } from '../../src/image/imageinlineediting.js';
import { ImageResizeEditing } from '../../src/imageresize/imageresizeediting.js';
import { ImageTextAlternativeEditing } from '../../src/imagetextalternative/imagetextalternativeediting.js';
import { ImageSizeAttributes } from '../../src/imagesizeattributes.js';

describe( 'ImageInlineEditing', () => {
	let editor, model, doc, view, viewDocument;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( async () => {
		stubUid();

		editor = await VirtualTestEditor.create( {
			plugins: [ ImageInlineEditing, Paragraph ]
		} );

		model = editor.model;
		doc = model.document;
		view = editor.editing.view;
		viewDocument = view.document;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ImageInlineEditing.pluginName ).toBe( 'ImageInlineEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageInlineEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageInlineEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageInlineEditing ) ).toBeInstanceOf( ImageInlineEditing );
	} );

	describe( 'schema rules', () => {
		it( 'should be set', () => {
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

		it( 'should disallow imageInline in the caption element', () => {
			model.schema.register( 'caption', {
				allowIn: '$root',
				allowContentOf: '$block',
				isLimit: true
			} );

			expect( model.schema.checkChild( [ '$root', 'caption' ], 'imageInline' ) ).toBe( false );
		} );

		it( 'should allow imageInline in $inlineRoot (inline-only root)', () => {
			expect( model.schema.checkChild( [ '$inlineRoot' ], 'imageInline' ) ).toBe( true );
		} );

		it( 'should allow imageInline in a custom inline-only root registered by a plugin', () => {
			model.schema.register( 'customInlineRoot', {
				isLimit: true,
				allowContentOf: '$inlineRoot'
			} );

			expect( model.schema.checkChild( [ 'customInlineRoot' ], 'imageInline' ) ).toBe( true );
		} );

		it( 'should allow imageInline in a custom block-accepting root registered by a plugin', () => {
			model.schema.register( 'customBlockRoot', {
				isLimit: true,
				allowContentOf: '$root'
			} );

			expect( model.schema.checkChild( [ 'customBlockRoot', '$block' ], 'imageInline' ) ).toBe( true );
		} );

		it( 'should allow imageInline inside non-limit block elements (e.g. paragraph)', () => {
			expect( model.schema.checkChild( [ '$root', '$block' ], 'imageInline' ) ).toBe( true );
		} );

		it( 'should allow imageInline inside a limit element that accepts $block (e.g. table cell)', () => {
			// Mimics a table-cell-like limit: it is a limit element but explicitly accepts block content.
			model.schema.register( 'cellLike', {
				isLimit: true,
				allowIn: '$root',
				allowChildren: '$block'
			} );

			expect( model.schema.checkChild( [ '$root', 'cellLike', '$block' ], 'imageInline' ) ).toBe( true );
		} );
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

	describe( 'imageTypeInline command', () => {
		it( 'should be registered if ImageBlockEditing is loaded', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [ ImageInlineEditing, ImageBlockEditing ]
			} );

			expect( editor.commands.get( 'imageTypeInline' ) ).toBeInstanceOf( ImageTypeCommand );

			await editor.destroy();
		} );

		it( 'should not be registered if ImageBlockEditing is not loaded', () => {
			expect( editor.commands.get( 'imageTypeInline' ) ).toBeUndefined();
		} );
	} );

	it( 'should update the ui after inline image has been loaded in the DOM', async () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		const editor = await ClassicTestEditor.create( element, {
			plugins: [ ImageInlineEditing, Paragraph ]
		} );

		editor.data.set( '<p><img src="/sample.png" alt="bar" /></p>' );

		const spy = vi.fn();

		editor.ui.on( 'update', spy );

		const htmlImageElement = editor.ui.getEditableElement().querySelector( 'img' );
		htmlImageElement.dispatchEvent( new Event( 'load' ) );

		expect( spy ).toHaveBeenCalledOnce();

		await editor.destroy();
		element.remove();
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );

				expect( editor.getData() ).toBe( '<p><img src="/sample.png" alt="alt text"></p>' );
			} );

			it( 'should convert without alt attribute', () => {
				_setModelData( model, '<paragraph><imageInline src="/sample.png"></imageInline></paragraph>' );

				expect( editor.getData() ).toBe( '<p><img src="/sample.png"></p>' );
			} );

			it( 'should convert srcset attribute to srcset and sizes attribute', () => {
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
					'<paragraph><imageInline ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="">' +
					'</imageInline></paragraph>' );

				const imageInline = doc.getRoot().getChild( 0 ).getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', imageInline );
				} );

				expect( editor.getData() ).toBe( '<p><img src="/sample.png" alt="alt text"></p>' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert image inline', () => {
				editor.setData( '<p><img src="/sample.png" alt="alt text" /></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph><imageInline alt="alt text" src="/sample.png"></imageInline></paragraph>' );
			} );

			it( 'should not convert if there is no img inside #1', () => {
				editor.setData( '<span class="image"></span>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph></paragraph>' );
			} );

			it( 'should not convert if there is no img inside #2', () => {
				editor.setData( '<span class="image">test</span>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph>test</paragraph>' );
			} );

			it( 'should convert without alt attribute', () => {
				editor.setData( '<p><img src="/sample.png" /></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph><imageInline src="/sample.png"></imageInline></paragraph>' );
			} );

			it( 'should convert without src attribute', () => {
				editor.setData( '<p><img alt="alt text" /></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph><imageInline alt="alt text"></imageInline></paragraph>' );
			} );

			it( 'should not convert in wrong context', () => {
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
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

			it( 'should not convert if img is already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:p', ( evt, data, conversionApi ) => {
					const img = data.viewItem.getChild( 0 );
					conversionApi.consumable.consume( img, { name: true } );
				}, { priority: 'high' } );

				editor.setData( '<p><img src="/sample.png" alt="alt text" /></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toBe( '<paragraph></paragraph>' );
			} );

			it( 'should consume the src attribute on <img>', () => {
				editor.data.upcastDispatcher.on( 'element:img', ( evt, data, conversionApi ) => {
					expect( conversionApi.consumable.test( data.viewItem, { attributes: 'src' } ) ).toBe( false );
				}, { priority: 'low' } );

				editor.setData( '<p><img src="/sample.png" alt="alt text" /></p>' );
			} );

			it( 'should dispatch conversion for nested elements', () => {
				const conversionSpy = vi.fn();
				editor.data.upcastDispatcher.on( 'element:img', conversionSpy );

				editor.setData( '<span class="image"><img src="/sample.png" alt="alt text" /></span>' );

				expect( conversionSpy ).toHaveBeenCalledOnce();
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

			it( 'should preserve the white space before the image', () => {
				editor.setData( '<p>foo <img alt="alt text" src="/sample.png"></p>' );

				expect( editor.getData() ).toBe(
					'<p>foo <img src="/sample.png" alt="alt text"></p>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
					'<paragraph>foo <imageInline alt="alt text" src="/sample.png"></imageInline></paragraph>'
				);
			} );

			it( 'should preserve the white space after the image', () => {
				editor.setData( '<p><img alt="alt text" src="/sample.png"> foo</p>' );

				expect( editor.getData() ).toBe(
					'<p><img src="/sample.png" alt="alt text"> foo</p>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
					'<paragraph><imageInline alt="alt text" src="/sample.png"></imageInline> foo</paragraph>'
				);
			} );

			it( 'should preserve white spaces surrounding the image', () => {
				editor.setData( '<p>foo <img alt="alt text" src="/sample.png"> bar</p>' );

				expect( editor.getData() ).toBe(
					'<p>foo <img src="/sample.png" alt="alt text"> bar</p>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
					'<paragraph>foo <imageInline alt="alt text" src="/sample.png"></imageInline> bar</paragraph>'
				);
			} );

			describe( 'should autohoist images', () => {
				beforeEach( () => {
					model.schema.register( 'div', { inheritAllFrom: '$block' } );

					editor.conversion.elementToElement( { model: 'div', view: 'div' } );
				} );

				it( 'image between non-hoisted elements', () => {
					editor.setData( '<div>foo<img src="foo.jpg" alt="foo" />bar</div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>foo<imageInline alt="foo" src="foo.jpg"></imageInline>bar</div>'
					);
				} );

				it( 'multiple images', () => {
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
					editor.setData( '<div><img src="foo.jpg" alt="foo" /><img src="foo.jpg" alt="foo" /></div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div><imageInline alt="foo" src="foo.jpg"></imageInline><imageInline alt="foo" src="foo.jpg"></imageInline></div>'
					);
				} );

				it( 'deep autohoisting #1', () => {
					model.schema.extend( 'div', { allowIn: 'div' } );

					editor.setData( '<div>foo<div>xx<img src="foo.jpg" alt="foo" /></div>bar</div>' );

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						'<div>foo<div>xx<imageInline alt="foo" src="foo.jpg"></imageInline></div>bar</div>'
					);
				} );

				it( 'deep autohoisting #2', () => {
					model.schema.extend( 'div', { allowIn: 'div' } );

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
				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="alt text" src="/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'converted element should be widgetized', () => {
				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );
				const element = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

				expect( element.name ).toBe( 'span' );
				expect( editor.plugins.get( 'ImageUtils' ).isImageWidget( element ) ).toBe( true );
			} );

			it( 'should convert attribute change', () => {
				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );
				const image = doc.getRoot().getChild( 0 ).getChild( 0 );

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
				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );
				const image = doc.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).toBe(
					'<p><span class="ck-widget image-inline" contenteditable="false"><img alt="" src="/sample.png"></img></span></p>'
				);
			} );

			it( 'should not convert change if is already consumed', () => {
				_setModelData( model, '<paragraph><imageInline src="/sample.png" alt="alt text"></imageInline></paragraph>' );
				const image = doc.getRoot().getChild( 0 ).getChild( 0 );

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
					'<paragraph><imageInline ' +
						'src="/sample.png" ' +
						'alt="alt text" ' +
						'srcset="">' +
					'</imageInline></paragraph>' );

				const image = doc.getRoot().getChild( 0 ).getChild( 0 );
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
					'<paragraph>' +
						'<imageInline src="/sample.png" srcset="small.png 148w, big.png 1024w" ></imageInline>' +
					'</paragraph>'
				);
				const image = doc.getRoot().getChild( 0 ).getChild( 0 );

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

	describe( 'integration with the clipboard pipeline', () => {
		let editorElement, editor, model, doc, view, viewDocument;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [
					ImageInlineEditing,
					ImageBlockEditing,
					ImageCaption,
					ImageResizeEditing,
					Clipboard,
					LinkImage,
					Paragraph,
					ListEditing
				]
			} );

			model = editor.model;
			doc = model.document;
			view = editor.editing.view;
			viewDocument = view.document;
		} );

		afterEach( async () => {
			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should paste or drop a block image as inline in the middle of a non-empty paragraph', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<figure class="image"><img src="/sample.png" /></figure>'
			} );

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>f<imageInline src="/sample.png"></imageInline>[]oo</paragraph>'
			);
		} );

		it( 'should replace an empty list item with a block image as a list item', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<figure class="image"><img src="/sample.png" /></figure>'
			} );

			_setModelData( model, '<paragraph listIndent="0" listItemId="000" listType="bulleted"></paragraph>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'[<imageBlock listIndent="0" listItemId="a00" listType="bulleted" src="/sample.png"></imageBlock>]'
			);
		} );

		it( 'should not work if there are elements other than block images in the pipeline data', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<figure class="image"><img src="/sample.png?id=A" /></figure><img src="/sample.png?id=B" />'
			} );

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>f</paragraph>' +
				'<imageBlock src="/sample.png?id=A"></imageBlock>' +
				'<paragraph><imageInline src="/sample.png?id=B"></imageInline>[]oo</paragraph>'
			);
		} );

		it( 'should use targetRanges from the data when present (when dropping)', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<figure class="image"><img src="/sample.png" /></figure>'
			} );

			_setModelData( model, '<paragraph>[]</paragraph><paragraph>foo</paragraph>' );

			const targetRange = model.createRange( model.createPositionAt( doc.getRoot().getChild( 1 ), 1 ) );
			const targetViewRange = editor.editing.mapper.toViewRange( targetRange );
			const viewElement = viewDocument.getRoot().getChild( 1 );
			const domNode = view.domConverter.mapViewToDom( viewElement );

			viewDocument.fire( 'clipboardInput', {
				method: 'drop',
				domTarget: domNode,
				target: viewElement,
				dataTransfer,
				targetRanges: [ targetViewRange ],
				domEvent: vi.fn(),
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'<paragraph></paragraph><paragraph>f<imageInline src="/sample.png"></imageInline>[]oo</paragraph>'
			);
		} );

		it( 'should not interfere if dropped or pasted in the middle of a non-empty paragraph when the image has caption', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<figure class="image"><img src="/sample.png" /><figcaption>abc</figcaption></figure>'
			} );

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>f</paragraph>' +
				'[<imageBlock src="/sample.png"><caption>abc</caption></imageBlock>]' +
				'<paragraph>oo</paragraph>'
			);
		} );

		it( 'should not interfere if pasted or dropped in an empty paragraph', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<figure class="image"><img src="/sample.png" /></figure>'
			} );

			_setModelData( model, '<paragraph>[]</paragraph>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'[<imageBlock src="/sample.png"></imageBlock>]'
			);
		} );

		it( 'should not interfere if pasted or dropped on another block widget', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<figure class="image"><img src="/sample.png?id=A" /></figure>'
			} );

			_setModelData( model, '[<imageBlock src="/sample.png?id=B"></imageBlock>]' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'[<imageBlock src="/sample.png?id=A"></imageBlock>]'
			);
		} );

		it( 'should preserve image attributes (such as alt) when converting to an inline image', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<figure class="image"><img src="/sample.png" alt="abc" /></figure>'
			} );

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>f<imageInline alt="abc" src="/sample.png"></imageInline>[]oo</paragraph>'
			);
		} );

		it( 'should preserve image link when converting to an inline image (LinkImage integration)', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<figure class="image"><a href="https://cksource.com"><img src="/sample.png" /></a></figure>'
			} );

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>f<imageInline linkHref="https://cksource.com" src="/sample.png"></imageInline>[]oo</paragraph>'
			);
		} );

		it( 'should pass custom attributes present only on the figure when converting to an inline image', () => {
			model.schema.extend( 'imageInline', { allowAttributes: [ 'foo' ] } );
			editor.conversion.for( 'upcast' ).attributeToAttribute( { model: 'foo', view: 'foo' } );

			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => (
					'<figure class="image" foo="bar">' +
						'<img src="/sample.png" />' +
					'</figure>'
				)
			} );

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );
			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>f<imageInline foo="bar" src="/sample.png"></imageInline>[]oo</paragraph>'
			);
		} );

		it( 'should pass the style#width from figure when converting to an inline image (ImageResize integration)', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => (
					'<figure class="image image_resized" style="width:25%">' +
						'<img src="/sample.png" />' +
					'</figure>'
				)
			} );

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );
			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'<paragraph>f<imageInline resizedWidth="25%" src="/sample.png"></imageInline>[]oo</paragraph>'
			);
		} );

		it( 'should add image width and height on image paste', () => new Promise( resolve => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<img src="/sample.png" />'
			} );

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				method: 'paste',
				content: dataTransfer.getData( 'text/html' )
			} );

			setTimeout( () => {
				expect( _getModelData( model ) ).toBe(
					'<paragraph>f<imageInline height="96" src="/sample.png" width="96"></imageInline>[]oo</paragraph>'
				);

				resolve();
			}, 100 );
		} ) );

		it( 'should not add image width and height on image method other than paste', () => new Promise( resolve => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<img src="/sample.png" />'
			} );

			_setModelData( model, '<paragraph>f[]oo</paragraph>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				method: 'foo',
				content: dataTransfer.getData( 'text/html' )
			} );

			setTimeout( () => {
				expect( _getModelData( model ) ).toBe(
					'<paragraph>f<imageInline src="/sample.png"></imageInline>[]oo</paragraph>'
				);

				resolve();
			}, 100 );
		} ) );
	} );

	describe( 'integration with the caption element', () => {
		let editorElement, editor, model, view;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [
					ImageInlineEditing,
					ImageBlockEditing,
					ImageCaption,
					ImageResizeEditing,
					Clipboard,
					LinkImage,
					Paragraph,
					ListEditing
				]
			} );

			model = editor.model;
			doc = model.document;
			view = editor.editing.view;
			viewDocument = view.document;
		} );

		afterEach( async () => {
			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should disallow (nested) inline images inside the caption', () => {
			editor.setData(
				'<figure class="image">' +
					'<img src="/sample.png" />' +
					'<figcaption>foo<img src="/sample.png" />bar</figcaption>' +
				'</figure>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toBe( '<imageBlock src="/sample.png"><caption>foobar</caption></imageBlock>' );
		} );

		it( 'should disallow (nested) linked inline images inside the caption', () => {
			editor.setData(
				'<figure class="image">' +
					'<img src="/sample.png" />' +
					'<figcaption>foo<a href="https://cksource.com"><img src="/sample.png" /></a>bar</figcaption>' +
				'</figure>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) )
				.toBe( '<imageBlock src="/sample.png"><caption>foobar</caption></imageBlock>' );
		} );

		it( 'should disallow pasting inline images into the caption', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<img src="/sample.png" />'
			} );

			_setModelData( model, '<imageBlock src="/sample.png"><caption>foo[]bar</caption></imageBlock>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'<imageBlock src="/sample.png"><caption>foo[]bar</caption></imageBlock>'
			);
		} );

		it( 'should disallow pasting linked inline images into the caption', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<a href="https://cksource.com"><img src="/sample.png" /></a>'
			} );

			_setModelData( model, '<imageBlock src="/sample.png"><caption>foo[]bar</caption></imageBlock>' );

			viewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( model ) ).toBe(
				'<imageBlock src="/sample.png"><caption>foo[]bar</caption></imageBlock>'
			);
		} );
	} );

	describe( 'inside $inlineRoot', () => {
		let inlineEditorElement, inlineEditor, inlineModel, inlineViewDocument;

		beforeEach( async () => {
			inlineEditorElement = document.createElement( 'div' );
			document.body.appendChild( inlineEditorElement );

			inlineEditor = await ClassicTestEditor.create( inlineEditorElement, {
				plugins: [ ImageInlineEditing, ImageBlockEditing, ImageSizeAttributes, ImageCaption, Clipboard, Paragraph ],
				root: { modelElement: '$inlineRoot' }
			} );

			inlineModel = inlineEditor.model;
			inlineViewDocument = inlineEditor.editing.view.document;
		} );

		afterEach( async () => {
			await inlineEditor.destroy();
			inlineEditorElement.remove();
		} );

		it( 'should unwrap a pasted block image as inline when imageBlock cannot land', () => {
			const dataTransfer = new ViewDataTransfer( {
				types: [ 'text/html' ],
				getData: () => '<figure class="image"><img src="/sample.png" /></figure>'
			} );

			_setModelData( inlineModel, 'foo[]bar' );

			inlineViewDocument.fire( 'clipboardInput', {
				dataTransfer,
				content: dataTransfer.getData( 'text/html' )
			} );

			expect( _getModelData( inlineModel ) ).toBe(
				'foo<imageInline src="/sample.png"></imageInline>[]bar'
			);
		} );

		it( 'should upcast a block image (figure) from data as an inline image', () => {
			inlineEditor.setData( 'foo<figure class="image"><img src="/sample.png" alt="bar"></figure>baz' );

			expect( _getModelData( inlineModel, { withoutSelection: true } ) ).toBe(
				'foo<imageInline alt="bar" src="/sample.png"></imageInline>baz'
			);
		} );

		it( 'should upcast an <img> with display:block from data as an inline image', () => {
			inlineEditor.setData( 'foo<img src="/sample.png" style="display:block">baz' );

			expect( _getModelData( inlineModel, { withoutSelection: true } ) ).toBe(
				'foo<imageInline src="/sample.png"></imageInline>baz'
			);
		} );

		it( 'should preserve the image attributes when a block image degrades to an inline image', () => {
			inlineEditor.setData(
				'foo<figure class="image">' +
					'<img src="/sample.png" alt="bar" srcset="small.png 148w, big.png 1024w" width="100" height="200">' +
				'</figure>baz'
			);

			expect( _getModelData( inlineModel, { withoutSelection: true } ) ).toBe(
				'foo<imageInline alt="bar" height="200" src="/sample.png" ' +
				'srcset="small.png 148w, big.png 1024w" width="100"></imageInline>baz'
			);
		} );

		it( 'should upcast a captioned block image as an inline image and keep the caption as text', () => {
			inlineEditor.setData(
				'foo<figure class="image">' +
					'<img src="/sample.png" alt="bar">' +
					'<figcaption>cap</figcaption>' +
				'</figure>baz'
			);

			expect( _getModelData( inlineModel, { withoutSelection: true } ) ).toBe(
				'foo<imageInline alt="bar" src="/sample.png"></imageInline>capbaz'
			);
		} );
	} );

	describe( 'attribute commands on an inline image inside $inlineRoot', () => {
		// The attribute commands (`replaceImageSource`, `imageTextAlternative`, `resizeImage`) operate on the
		// currently selected image and only touch attributes shared by both image types. They must remain
		// enabled and functional for an inline image living in an inline root, where `imageBlock` cannot land.
		let inlineEditorElement, inlineEditor, inlineModel;

		beforeEach( async () => {
			inlineEditorElement = document.createElement( 'div' );
			document.body.appendChild( inlineEditorElement );

			inlineEditor = await ClassicTestEditor.create( inlineEditorElement, {
				plugins: [
					ImageInlineEditing, ImageBlockEditing, ImageTextAlternativeEditing, ImageResizeEditing, Paragraph
				],
				root: { modelElement: '$inlineRoot' }
			} );

			inlineModel = inlineEditor.model;

			_setModelData( inlineModel, 'foo[<imageInline src="/sample.png" alt="old"></imageInline>]bar' );
		} );

		afterEach( async () => {
			await inlineEditor.destroy();
			inlineEditorElement.remove();
		} );

		it( 'should enable replaceImageSource and replace the src', () => {
			const command = inlineEditor.commands.get( 'replaceImageSource' );

			expect( command.isEnabled ).toBe( true );

			command.execute( { source: '/other.png' } );

			expect( _getModelData( inlineModel, { withoutSelection: true } ) ).toBe(
				'foo<imageInline src="/other.png"></imageInline>bar'
			);
		} );

		it( 'should enable imageTextAlternative and set the alt attribute', () => {
			const command = inlineEditor.commands.get( 'imageTextAlternative' );

			expect( command.isEnabled ).toBe( true );

			command.execute( { newValue: 'new alt' } );

			expect( _getModelData( inlineModel, { withoutSelection: true } ) ).toBe(
				'foo<imageInline alt="new alt" src="/sample.png"></imageInline>bar'
			);
		} );

		it( 'should enable resizeImage and set the resizedWidth attribute', () => {
			const command = inlineEditor.commands.get( 'resizeImage' );

			expect( command.isEnabled ).toBe( true );

			command.execute( { width: '50%' } );

			expect( _getModelData( inlineModel, { withoutSelection: true } ) ).toBe(
				'foo<imageInline alt="old" resizedWidth="50%" src="/sample.png"></imageInline>bar'
			);
		} );
	} );
} );
