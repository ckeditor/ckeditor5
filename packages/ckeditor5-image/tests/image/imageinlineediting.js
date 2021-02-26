/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import ImageLoadObserver from '../../src/image/imageloadobserver';
import ImageInlineEditing from '../../src/image/imageinlineediting';
import { isImageWidget } from '../../src/image/utils';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageTypeCommand from '../../src/image/imagetypecommand';
import InsertImageCommand from '../../src/image/insertimagecommand';

describe( 'ImageInlineEditing', () => {
	let editor, model, doc, view, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageInlineEditing, Paragraph ]
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
		expect( ImageInlineEditing.pluginName ).to.equal( 'ImageInlineEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageInlineEditing ) ).to.be.instanceOf( ImageInlineEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.isRegistered( 'imageInline' ) ).to.be.true;
		expect( model.schema.isInline( 'imageInline' ) ).to.be.true;
		expect( model.schema.isObject( 'imageInline' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root', '$block' ], 'imageInline' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'src' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'alt' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'imageInline' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', '$block', 'imageInline' ], 'image' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', '$block', 'imageInline' ], '$text' ) ).to.be.false;
	} );

	it( 'should register ImageLoadObserver', () => {
		expect( view.getObserver( ImageLoadObserver ) ).to.be.instanceOf( ImageLoadObserver );
	} );

	it( 'should register the insertImage command', () => {
		expect( editor.commands.get( 'insertImage' ) ).to.be.instanceOf( InsertImageCommand );
	} );

	it( 'should register the imageInsert command as an alias for the insertImage command', () => {
		expect( editor.commands.get( 'imageInsert' ) ).to.equal( editor.commands.get( 'insertImage' ) );
	} );

	describe( 'imageTypeInline command', () => {
		it( 'should be registered if ImageBlockEditing is loaded', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [ ImageInlineEditing, ImageBlockEditing ]
			} );

			expect( editor.commands.get( 'imageTypeInline' ) ).to.be.instanceOf( ImageTypeCommand );

			await editor.destroy();
		} );

		it( 'should not be registered if ImageBlockEditing is not loaded', () => {
			expect( editor.commands.get( 'imageTypeInline' ) ).to.be.undefined;
		} );
	} );

	it( 'should update the ui after inline image has been loaded in the DOM', async () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		const editor = await ClassicTestEditor.create( element, {
			plugins: [ ImageInlineEditing, Paragraph ]
		} );

		editor.data.set( '<p><img src="/assets/sample.png" alt="bar" /></p>' );

		const spy = sinon.spy();

		editor.ui.on( 'update', spy );

		const htmlImageElement = editor.ui.getEditableElement().querySelector( 'img' );
		htmlImageElement.dispatchEvent( new Event( 'load' ) );

		sinon.assert.calledOnce( spy );

		await editor.destroy();
		await element.remove();
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );

				expect( editor.getData() ).to.equal( '<p><img alt="alt text" src="/assets/sample.png"></p>' );
			} );

			it( 'should convert without alt attribute', () => {
				setModelData( model, '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>' );

				expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"></p>' );
			} );

			it( 'should convert srcset attribute to srcset and sizes attribute', () => {
				setModelData( model,
					'<paragraph>' +
						'<imageInline src="/assets/sample.png" alt="alt text" srcset=\'{ "data": "small.png 148w, big.png 1024w" }\'>' +
					'</imageInline></paragraph>'
				);

				expect( normalizeHtml( editor.getData() ) ).to.equal(
					'<p><img alt="alt text" sizes="100vw" src="/assets/sample.png" srcset="small.png 148w, big.png 1024w"></img></p>'
				);
			} );

			it( 'should convert srcset attribute to width, srcset and add sizes attribute', () => {
				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</imageInline></paragraph>'
				);

				expect( normalizeHtml( editor.getData() ) ).to.equal(
					'<p>' +
						'<img ' +
							'alt="alt text" ' +
							'sizes="100vw" ' +
							'src="/assets/sample.png" ' +
							'srcset="small.png 148w, big.png 1024w" ' +
							'width="1024">' +
						'</img>' +
					'</p>'
				);
			} );

			it( 'should not convert srcset attribute if is already consumed', () => {
				editor.data.downcastDispatcher.on( 'attribute:srcset:imageInline', ( evt, data, conversionApi ) => {
					const modelImage = data.item;

					conversionApi.consumable.consume( modelImage, evt.name );
				}, { priority: 'high' } );

				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</imageInline></paragraph>'
				);

				expect( editor.getData() ).to.equal( '<p><img alt="alt text" src="/assets/sample.png"></p>' );
			} );

			it( 'should not convert srcset attribute if has wrong data', () => {
				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "foo":"bar" }\'>' +
					'</imageInline></paragraph>' );

				const imageInline = doc.getRoot().getChild( 0 ).getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', imageInline );
				} );

				expect( editor.getData() ).to.equal( '<p><img alt="alt text" src="/assets/sample.png"></p>' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert image inline', () => {
				editor.setData( '<p><img src="/assets/sample.png" alt="alt text" /></p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline alt="alt text" src="/assets/sample.png"></imageInline></paragraph>' );
			} );

			it( 'should not convert if there is no img inside #1', () => {
				editor.setData( '<span class="image"></span>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph></paragraph>' );
			} );

			it( 'should not convert if there is no img inside #2', () => {
				editor.setData( '<span class="image">test</span>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>test</paragraph>' );
			} );

			it( 'should convert without alt attribute', () => {
				editor.setData( '<p><img src="/assets/sample.png" /></p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>' );
			} );

			it( 'should not convert without src attribute', () => {
				editor.setData( '<p><img alt="alt text" /></p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph></paragraph>' );
			} );

			it( 'should not convert in wrong context', () => {
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( childDef.name == 'imageInline' ) {
						return false;
					}
				} );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );

				editor.setData( '<div><img src="/assets/sample.png" alt="alt text" /></div>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<div></div>' );
			} );

			it( 'should not convert if img is already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:p', ( evt, data, conversionApi ) => {
					const img = data.viewItem.getChild( 0 );
					conversionApi.consumable.consume( img, { name: true } );
				}, { priority: 'high' } );

				editor.setData( '<p><img src="/assets/sample.png" alt="alt text" /></p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph></paragraph>' );
			} );

			it( 'should dispatch conversion for nested elements', () => {
				const conversionSpy = sinon.spy();
				editor.data.upcastDispatcher.on( 'element:img', conversionSpy );

				editor.setData( '<span class="image"><img src="/assets/sample.png" alt="alt text" /></span>' );

				sinon.assert.calledOnce( conversionSpy );
			} );

			it( 'should convert bare img element', () => {
				editor.setData( '<img src="/assets/sample.png" alt="alt text" />' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline alt="alt text" src="/assets/sample.png"></imageInline></paragraph>' );
			} );

			it( 'should not convert alt attribute on non-img element', () => {
				model.schema.register( 'div', {
					inheritAllFrom: '$block',
					allowAttributes: 'alt'
				} );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );

				editor.setData( '<div alt="foo"></div>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<div></div>' );
			} );

			it( 'should convert image with srcset attribute', () => {
				editor.setData(
					'<p><img src="/assets/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" /></p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal(
						'<paragraph>' +
							'<imageInline alt="alt text" src="/assets/sample.png" srcset="{"data":"small.png 148w, big.png 1024w"}">' +
							'</imageInline>' +
						'</paragraph>'
					);
			} );

			it( 'should convert image with srcset and width attributes', () => {
				editor.setData(
					'<p><img src="/assets/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" width="1024" /></p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><imageInline ' +
						'alt="alt text" ' +
						'src="/assets/sample.png" ' +
						'srcset="{"data":"small.png 148w, big.png 1024w","width":"1024"}">' +
					'</imageInline></paragraph>'
				);
			} );

			it( 'should ignore sizes attribute', () => {
				editor.setData(
					'<p><img src="/assets/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" sizes="50vw" /></p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal(
						'<paragraph>' +
							'<imageInline alt="alt text" src="/assets/sample.png" srcset="{"data":"small.png 148w, big.png 1024w"}">' +
							'</imageInline>' +
						'</paragraph>'
					);
			} );

			it( 'should not convert a link on an inline image', () => {
				editor.setData(
					'<a href="http://ckeditor.com"><img src="/assets/sample.png" alt="alt text" /></a>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal(
						'<paragraph>' +
							'<imageInline alt="alt text" src="/assets/sample.png"></imageInline>' +
						'</paragraph>'
					);
			} );

			describe( 'should autohoist images', () => {
				beforeEach( () => {
					model.schema.register( 'div', { inheritAllFrom: '$block' } );

					editor.conversion.elementToElement( { model: 'div', view: 'div' } );
				} );

				it( 'image between non-hoisted elements', () => {
					editor.setData( '<div>foo<img src="foo.jpg" alt="foo" />bar</div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div>foo<imageInline alt="foo" src="foo.jpg"></imageInline>bar</div>'
					);
				} );

				it( 'multiple images', () => {
					editor.setData( '<div>foo<img src="foo.jpg" alt="foo" />ba<img src="foo.jpg" alt="foo" />r</div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div>foo' +
						'<imageInline alt="foo" src="foo.jpg"></imageInline>' +
						'ba' +
						'<imageInline alt="foo" src="foo.jpg"></imageInline>' +
						'r</div>'
					);
				} );

				it( 'images on borders of parent', () => {
					editor.setData( '<div><img src="foo.jpg" alt="foo" />foobar<img src="foo.jpg" alt="foo" /></div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div>' +
						'<imageInline alt="foo" src="foo.jpg"></imageInline>' +
						'foobar' +
						'<imageInline alt="foo" src="foo.jpg"></imageInline>' +
						'</div>'
					);
				} );

				it( 'images are only content of parent', () => {
					editor.setData( '<div><img src="foo.jpg" alt="foo" /><img src="foo.jpg" alt="foo" /></div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div><imageInline alt="foo" src="foo.jpg"></imageInline><imageInline alt="foo" src="foo.jpg"></imageInline></div>'
					);
				} );

				it( 'deep autohoisting #1', () => {
					model.schema.extend( 'div', { allowIn: 'div' } );

					editor.setData( '<div>foo<div>xx<img src="foo.jpg" alt="foo" /></div>bar</div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
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

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
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
					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<limit><div>foo<imageInline alt="foo" src="foo.jpg"></imageInline>bar</div></limit>'
					);
				} );

				it( 'should not convert and autohoist image element without src attribute (which is not allowed by schema)', () => {
					editor.setData( '<div>foo<img alt="foo" />bar</div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<div>foobar</div>' );
				} );
			} );
		} );
	} );

	describe( 'conversion in editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'converted element should be widgetized', () => {
				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );
				const element = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

				expect( element.name ).to.equal( 'span' );
				expect( isImageWidget( element ) ).to.be.true;
			} );

			it( 'should convert attribute change', () => {
				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );
				const image = doc.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'alt', 'new text', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="new text" src="/assets/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'should convert attribute removal (but keeps an empty "alt" to the data)', () => {
				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );
				const image = doc.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false"><img alt="" src="/assets/sample.png"></img></span></p>'
				);
			} );

			it( 'should not convert change if is already consumed', () => {
				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );
				const image = doc.getRoot().getChild( 0 ).getChild( 0 );

				editor.editing.downcastDispatcher.on( 'attribute:alt:imageInline', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:alt' );
				}, { priority: 'high' } );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'should convert srcset attribute to srcset and sizes', () => {
				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data":"small.png 148w, big.png 1024w" }\'>' +
					'</imageInline></paragraph>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="alt text" sizes="100vw" src="/assets/sample.png" srcset="small.png 148w, big.png 1024w"></img>' +
					'</span></p>'
				);
			} );

			it( 'should not convert srcset attribute if has wrong data', () => {
				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "foo":"bar" }\'>' +
					'</imageInline></paragraph>' );

				const image = doc.getRoot().getChild( 0 ).getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'should convert srcset attribute to srcset, width and sizes', () => {
				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data":"small.png 148w, big.png 1024w", "width":"1024" }\'>' +
					'</imageInline></paragraph>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img ' +
							'alt="alt text" ' +
							'sizes="100vw" ' +
							'src="/assets/sample.png" ' +
							'srcset="small.png 148w, big.png 1024w" ' +
							'width="1024">' +
						'</img>' +
					'</span></p>'
				);
			} );

			it( 'should remove sizes and srcsset attribute when srcset attribute is removed from model', () => {
				setModelData( model,
					'<paragraph>' +
						'<imageInline src="/assets/sample.png" srcset=\'{ "data": "small.png 148w, big.png 1024w" }\'></imageInline>' +
					'</paragraph>'
				);
				const image = doc.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img src="/assets/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'should remove width, sizes and srcsset attribute when srcset attribute is removed from model', () => {
				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</imageInline></paragraph>'
				);
				const image = doc.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img src="/assets/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'should not convert srcset attribute if is already consumed', () => {
				editor.editing.downcastDispatcher.on( 'attribute:srcset:imageInline', ( evt, data, conversionApi ) => {
					const modelImage = data.item;

					conversionApi.consumable.consume( modelImage, evt.name );
				}, { priority: 'high' } );

				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</imageInline></paragraph>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</span></p>'
				);
			} );
		} );
	} );
} );
