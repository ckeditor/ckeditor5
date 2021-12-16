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

import ImageEditing from '../../src/image/imageediting';
import ImageLoadObserver from '../../src/image/imageloadobserver';
import InsertImageCommand from '../../src/image/insertimagecommand';
import ImageTypeCommand from '../../src/image/imagetypecommand';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageInlineEditing from '../../src/image/imageinlineediting';

describe( 'ImageEditing', () => {
	let editor, model, doc, view, viewDocument;

	testUtils.createSinonSandbox();

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
		expect( ImageEditing.pluginName ).to.equal( 'ImageEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageEditing ) ).to.be.instanceOf( ImageEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.isRegistered( 'imageBlock' ) ).to.be.true;
		expect( model.schema.isBlock( 'imageBlock' ) ).to.be.true;
		expect( model.schema.isObject( 'imageBlock' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'imageBlock' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'src' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'alt' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root', 'imageBlock' ], 'imageBlock' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', 'imageBlock' ], '$text' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', '$block' ], 'imageBlock' ) ).to.be.false;

		expect( model.schema.isRegistered( 'imageInline' ) ).to.be.true;
		expect( model.schema.isInline( 'imageInline' ) ).to.be.true;
		expect( model.schema.isObject( 'imageInline' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root', '$block' ], 'imageInline' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'src' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'alt' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'imageInline' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', '$block', 'imageInline' ], 'imageBlock' ) ).to.be.false;
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

	it( 'should register the imageTypeBlock and imageTypeInline commands', () => {
		expect( editor.commands.get( 'imageTypeBlock' ) ).to.be.instanceOf( ImageTypeCommand );
		expect( editor.commands.get( 'imageTypeInline' ) ).to.be.instanceOf( ImageTypeCommand );
	} );

	// See https://github.com/ckeditor/ckeditor5-image/issues/142.
	it( 'should update the ui after image has been loaded in the DOM', async () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		const editor = await ClassicTestEditor.create( element, {
			plugins: [ ImageBlockEditing ]
		} );

		editor.data.set( '<figure class="image"><img src="/assets/sample.png" alt="bar" /></figure>' );

		const spy = sinon.spy();

		editor.ui.on( 'update', spy );

		const htmlImageElement = editor.ui.getEditableElement().querySelector( 'img' );
		htmlImageElement.dispatchEvent( new Event( 'load' ) );

		sinon.assert.calledOnce( spy );

		await editor.destroy();
		await element.remove();
	} );

	it( 'should update the ui after inline image has been loaded in the DOM', async () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		const editor = await ClassicTestEditor.create( element, {
			plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ]
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
				setModelData( model, '<imageBlock src="/assets/sample.png" alt="alt text"></imageBlock>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img alt="alt text" src="/assets/sample.png"></figure>' );

				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );

				expect( editor.getData() ).to.equal( '<p><img alt="alt text" src="/assets/sample.png"></p>' );
			} );

			it( 'should convert without alt attribute', () => {
				setModelData( model, '<imageBlock src="/assets/sample.png"></imageBlock>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );

				setModelData( model, '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>' );

				expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"></p>' );
			} );

			it( 'should convert srcset attribute to srcset and sizes attribute', () => {
				setModelData( model,
					'<imageBlock src="/assets/sample.png" alt="alt text" srcset=\'{ "data": "small.png 148w, big.png 1024w" }\'>' +
					'</imageBlock>'
				);

				expect( normalizeHtml( editor.getData() ) ).to.equal(
					'<figure class="image">' +
						'<img alt="alt text" sizes="100vw" src="/assets/sample.png" srcset="small.png 148w, big.png 1024w"></img>' +
					'</figure>'
				);

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
					'<imageBlock ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</imageBlock>'
				);

				expect( normalizeHtml( editor.getData() ) ).to.equal(
					'<figure class="image">' +
						'<img ' +
							'alt="alt text" ' +
							'sizes="100vw" ' +
							'src="/assets/sample.png" ' +
							'srcset="small.png 148w, big.png 1024w" ' +
							'width="1024">' +
						'</img>' +
					'</figure>'
				);

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
				editor.data.downcastDispatcher.on( 'attribute:srcset:imageBlock', ( evt, data, conversionApi ) => {
					const modelImage = data.item;

					conversionApi.consumable.consume( modelImage, evt.name );
				}, { priority: 'high' } );

				setModelData( model,
					'<imageBlock ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</imageBlock>'
				);

				expect( editor.getData() ).to.equal(
					'<figure class="image">' +
						'<img alt="alt text" src="/assets/sample.png">' +
					'</figure>'
				);

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
					'<imageBlock ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "foo":"bar" }\'>' +
					'</imageBlock>' );

				const image = doc.getRoot().getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( editor.getData() ).to.equal(
					'<figure class="image">' +
						'<img alt="alt text" src="/assets/sample.png">' +
					'</figure>'
				);

				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "foo":"bar" }\'>' +
					'</imageInline></paragraph>' );

				const imageInline = doc.getRoot().getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', imageInline );
				} );

				expect( editor.getData() ).to.equal( '<p><img alt="alt text" src="/assets/sample.png"></p>' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert image figure', () => {
				editor.setData( '<figure class="image"><img src="/assets/sample.png" alt="alt text" /></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<imageBlock alt="alt text" src="/assets/sample.png"></imageBlock>' );
			} );

			it( 'should convert image inline', () => {
				editor.setData( '<p><img src="/assets/sample.png" alt="alt text" /></p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline alt="alt text" src="/assets/sample.png"></imageInline></paragraph>' );
			} );

			it( 'should not convert if there is no image class in figure', () => {
				editor.setData( '<figure class="quote">My quote</figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>My quote</paragraph>' );
			} );

			it( 'should not convert if there is no img inside figure #1', () => {
				editor.setData( '<figure class="image"></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph></paragraph>' );
			} );

			it( 'should not convert if there is no img inside figure #2', () => {
				editor.setData( '<figure class="image">test</figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>test</paragraph>' );
			} );

			it( 'should convert without alt attribute', () => {
				editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<imageBlock src="/assets/sample.png"></imageBlock>' );

				editor.setData( '<p><img src="/assets/sample.png" /></p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>' );
			} );

			it( 'should convert without src attribute', () => {
				editor.setData( '<figure class="image"><img alt="alt text" /></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<imageBlock alt="alt text"></imageBlock>' );

				editor.setData( '<p><img alt="alt text" /></p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline alt="alt text"></imageInline></paragraph>' );
			} );

			it( 'should not convert in wrong context', () => {
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( ctx.endsWith( '$root' ) && childDef.name == 'imageBlock' ) {
						return false;
					}
				} );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );

				editor.setData( '<div><figure class="image"><img src="/assets/sample.png" alt="alt text" /></figure></div>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<div></div>' );

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
				editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
					const img = data.viewItem.getChild( 0 );
					conversionApi.consumable.consume( img, { name: true } );
				}, { priority: 'high' } );

				editor.setData( '<figure class="image"><img src="/assets/sample.png" alt="alt text" /></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph></paragraph>' );

				editor.data.upcastDispatcher.on( 'element:p', ( evt, data, conversionApi ) => {
					const img = data.viewItem.getChild( 0 );
					conversionApi.consumable.consume( img, { name: true } );
				}, { priority: 'high' } );

				editor.setData( '<p><img src="/assets/sample.png" alt="alt text" /></p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph></paragraph>' );
			} );

			it( 'should not convert if figure is already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { name: true, class: 'image' } );
				}, { priority: 'high' } );

				editor.setData( '<figure class="image"><img src="/assets/sample.png" alt="alt text" /></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph></paragraph>' );
			} );

			it( 'should dispatch conversion for nested elements', () => {
				const conversionSpy = sinon.spy();
				editor.data.upcastDispatcher.on( 'element:figcaption', conversionSpy );

				editor.setData( '<figure class="image"><img src="/assets/sample.png" alt="alt text" /><figcaption></figcaption></figure>' );

				editor.data.upcastDispatcher.on( 'element:img', conversionSpy );

				editor.setData( '<span class="image"><img src="/assets/sample.png" alt="alt text" /></span>' );

				sinon.assert.calledTwice( conversionSpy );
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
					'<figure class="image">' +
						'<img src="/assets/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" />' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal(
						'<imageBlock alt="alt text" src="/assets/sample.png" srcset="{"data":"small.png 148w, big.png 1024w"}">' +
						'</imageBlock>'
					);

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
					'<figure class="image">' +
					'<img src="/assets/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" width="1024" />' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<imageBlock ' +
						'alt="alt text" ' +
						'src="/assets/sample.png" ' +
						'srcset="{"data":"small.png 148w, big.png 1024w","width":"1024"}">' +
					'</imageBlock>'
				);

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
					'<figure class="image">' +
						'<img src="/assets/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" sizes="50vw" />' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal(
						'<imageBlock alt="alt text" src="/assets/sample.png" srcset="{"data":"small.png 148w, big.png 1024w"}">' +
						'</imageBlock>'
					);

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
					editor.setData( '<div>foo<figure class="image"><img src="foo.jpg" alt="foo" /></figure>bar</div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div>foo</div>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<div>bar</div>'
					);

					editor.setData( '<div>foo<img src="foo.jpg" alt="foo" />bar</div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
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

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div>foo</div>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<div>ba</div>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<div>r</div>'
					);

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
					editor.setData( '<div><figure class="image"><img src="foo.jpg" alt="foo" /></figure>foobar' +
						'<figure class="image"><img src="foo.jpg" alt="foo" /></figure></div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<div>foobar</div>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>'
					);

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
					editor.setData( '<div><figure class="image"><img src="foo.jpg" alt="foo" /></figure>' +
						'<figure class="image"><img src="foo.jpg" alt="foo" /></figure></div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>' +
						'<imageBlock alt="foo" src="foo.jpg"></imageBlock>'
					);

					editor.setData( '<div><img src="foo.jpg" alt="foo" /><img src="foo.jpg" alt="foo" /></div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div><imageInline alt="foo" src="foo.jpg"></imageInline><imageInline alt="foo" src="foo.jpg"></imageInline></div>'
					);
				} );

				it( 'deep autohoisting #1', () => {
					model.schema.extend( 'div', { allowIn: 'div' } );

					editor.setData( '<div>foo<div>xx<figure class="image"><img src="foo.jpg" alt="foo" /></figure></div>bar</div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
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

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
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

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div>x</div><imageBlock alt="foo" src="foo.jpg"></imageBlock><div>y</div>'
					);

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

					editor.setData( '<limit><div>foo<figure class="image"><img src="foo.jpg" alt="foo" /></figure>bar</div></limit>' );

					// <limit> element does not have converters so it is not converted.
					expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<limit><div>foobar</div></limit>' );

					editor.setData( '<limit><div>foo<img src="foo.jpg" alt="foo" />bar</div></limit>' );

					// <limit> element does not have converters so it is not converted.
					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<limit><div>foo<imageInline alt="foo" src="foo.jpg"></imageInline>bar</div></limit>'
					);
				} );

				it( 'should convert and autohoist image element without src attribute', () => {
					editor.setData( '<div>foo<img alt="foo" />bar</div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div>foo<imageInline alt="foo"></imageInline>bar</div>'
					);
				} );
			} );
		} );
	} );

	describe( 'conversion in editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( model, '<imageBlock src="/assets/sample.png" alt="alt text"></imageBlock>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false"><img alt="alt text" src="/assets/sample.png"></img></figure>'
				);

				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</span></p>'
				);
			} );

			it( 'converted element should be widgetized', () => {
				setModelData( model, '<imageBlock src="/assets/sample.png" alt="alt text"></imageBlock>' );
				const figure = viewDocument.getRoot().getChild( 0 );

				expect( figure.name ).to.equal( 'figure' );
				expect( editor.plugins.get( 'ImageUtils' ).isImageWidget( figure ) ).to.be.true;

				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );
				const element = viewDocument.getRoot().getChild( 0 ).getChild( 0 );

				expect( element.name ).to.equal( 'span' );
				expect( editor.plugins.get( 'ImageUtils' ).isImageWidget( element ) ).to.be.true;
			} );

			it( 'should convert attribute change', () => {
				setModelData( model, '<imageBlock src="/assets/sample.png" alt="alt text"></imageBlock>' );
				let image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'alt', 'new text', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false"><img alt="new text" src="/assets/sample.png"></img></figure>'
				);

				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );
				image = doc.getRoot().getChild( 0 ).getChild( 0 );

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
				setModelData( model, '<imageBlock src="/assets/sample.png" alt="alt text"></imageBlock>' );
				let image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false"><img alt="" src="/assets/sample.png"></img></figure>'
				);

				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );
				image = doc.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><span class="ck-widget image-inline" contenteditable="false"><img alt="" src="/assets/sample.png"></img></span></p>'
				);
			} );

			it( 'should not convert change if is already consumed', () => {
				setModelData( model, '<imageBlock src="/assets/sample.png" alt="alt text"></imageBlock>' );
				let image = doc.getRoot().getChild( 0 );

				editor.editing.downcastDispatcher.on( 'attribute:alt:imageBlock', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:alt' );
				}, { priority: 'high' } );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false"><img alt="alt text" src="/assets/sample.png"></img></figure>'
				);

				setModelData( model, '<paragraph><imageInline src="/assets/sample.png" alt="alt text"></imageInline></paragraph>' );
				image = doc.getRoot().getChild( 0 ).getChild( 0 );

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
					'<imageBlock ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data":"small.png 148w, big.png 1024w" }\'>' +
					'</imageBlock>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" sizes="100vw" src="/assets/sample.png" srcset="small.png 148w, big.png 1024w"></img>' +
					'</figure>'
				);

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
					'<imageBlock ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "foo":"bar" }\'>' +
					'</imageBlock>' );

				let image = doc.getRoot().getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</figure>'
				);

				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "foo":"bar" }\'>' +
					'</imageInline></paragraph>' );

				image = doc.getRoot().getChild( 0 ).getChild( 0 );
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
					'<imageBlock ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data":"small.png 148w, big.png 1024w", "width":"1024" }\'>' +
					'</imageBlock>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img ' +
							'alt="alt text" ' +
							'sizes="100vw" ' +
							'src="/assets/sample.png" ' +
							'srcset="small.png 148w, big.png 1024w" ' +
							'width="1024">' +
						'</img>' +
					'</figure>'
				);

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
					'<imageBlock src="/assets/sample.png" srcset=\'{ "data": "small.png 148w, big.png 1024w" }\'>' +
					'</imageBlock>'
				);
				let image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src="/assets/sample.png"></img>' +
					'</figure>'
				);

				setModelData( model,
					'<paragraph>' +
						'<imageInline src="/assets/sample.png" srcset=\'{ "data": "small.png 148w, big.png 1024w" }\'></imageInline>' +
					'</paragraph>'
				);
				image = doc.getRoot().getChild( 0 ).getChild( 0 );

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
					'<imageBlock ' +
						'src="/assets/sample.png" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</imageBlock>'
				);
				let image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
					'<img src="/assets/sample.png"></img>' +
					'</figure>'
				);

				setModelData( model,
					'<paragraph><imageInline ' +
						'src="/assets/sample.png" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</imageInline></paragraph>'
				);
				image = doc.getRoot().getChild( 0 ).getChild( 0 );

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
				editor.editing.downcastDispatcher.on( 'attribute:srcset:imageBlock', ( evt, data, conversionApi ) => {
					const modelImage = data.item;

					conversionApi.consumable.consume( modelImage, evt.name );
				}, { priority: 'high' } );

				setModelData( model,
					'<imageBlock ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</imageBlock>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</figure>'
				);

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
