/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageEditing from '../../src/image/imageediting';
import ImageLoadObserver from '../../src/image/imageloadobserver';
import ImageInsertCommand from '../../src/image/imageinsertcommand';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { isImageWidget } from '../../src/image/utils';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';
import env from '@ckeditor/ckeditor5-utils/src/env';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ImageEditing', () => {
	let editor, model, doc, view, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		// Most tests assume non-edge environment but we do not set `contenteditable=false` on Edge so stub `env.isEdge`.
		testUtils.sinon.stub( env, 'isEdge' ).get( () => false );

		return VirtualTestEditor
			.create( {
				plugins: [ ImageEditing ]
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
		expect( model.schema.checkChild( [ '$root' ], 'image' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'image' ], 'src' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'image' ], 'alt' ) ).to.be.true;

		expect( model.schema.isObject( 'image' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root', 'image' ], 'image' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', 'image' ], '$text' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', '$block' ], 'image' ) ).to.be.false;
	} );

	it( 'should register ImageLoadObserver', () => {
		expect( view.getObserver( ImageLoadObserver ) ).to.be.instanceOf( ImageLoadObserver );
	} );

	it( 'should register imageInsert command', () => {
		expect( editor.commands.get( 'imageInsert' ) ).to.be.instanceOf( ImageInsertCommand );
	} );

	// See https://github.com/ckeditor/ckeditor5-image/issues/142.
	it( 'should update the ui after image has been loaded in the DOM', () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor.create( element, {
			plugins: [ ImageEditing ]
		} ).then( editor => {
			editor.data.set( '<figure class="image"><img src="/assets/sample.png" alt="bar" /></figure>' );

			const spy = sinon.spy();

			editor.ui.on( 'update', spy );

			const htmlImageElement = editor.ui.getEditableElement().querySelector( 'img' );
			htmlImageElement.dispatchEvent( new Event( 'load' ) );

			sinon.assert.calledOnce( spy );

			return editor.destroy().then( () => element.remove() );
		} );
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( model, '<image src="/assets/sample.png" alt="alt text"></image>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img alt="alt text" src="/assets/sample.png"></figure>' );
			} );

			it( 'should convert without alt attribute', () => {
				setModelData( model, '<image src="/assets/sample.png"></image>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
			} );

			it( 'should convert srcset attribute to srcset and sizes attribute', () => {
				setModelData( model,
					'<image src="/assets/sample.png" alt="alt text" srcset=\'{ "data": "small.png 148w, big.png 1024w" }\'></image>'
				);

				expect( normalizeHtml( editor.getData() ) ).to.equal(
					'<figure class="image">' +
						'<img alt="alt text" sizes="100vw" src="/assets/sample.png" srcset="small.png 148w, big.png 1024w"></img>' +
					'</figure>'
				);
			} );

			it( 'should convert srcset attribute to width, srcset and add sizes attribute', () => {
				setModelData( model,
					'<image ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</image>'
				);

				/* eslint-disable max-len */
				expect( normalizeHtml( editor.getData() ) ).to.equal(
					'<figure class="image">' +
						'<img alt="alt text" sizes="100vw" src="/assets/sample.png" srcset="small.png 148w, big.png 1024w" width="1024"></img>' +
					'</figure>'
				);
				/* eslint-enable max-len */
			} );

			it( 'should not convert srcset attribute if is already consumed', () => {
				editor.data.downcastDispatcher.on( 'attribute:srcset:image', ( evt, data, conversionApi ) => {
					const modelImage = data.item;

					conversionApi.consumable.consume( modelImage, evt.name );
				}, { priority: 'high' } );

				setModelData( model,
					'<image ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</image>'
				);

				expect( editor.getData() ).to.equal(
					'<figure class="image">' +
						'<img alt="alt text" src="/assets/sample.png">' +
					'</figure>'
				);
			} );

			it( 'should not convert srcset attribute if has wrong data', () => {
				setModelData( model,
					'<image ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "foo":"bar" }\'>' +
					'</image>' );

				const image = doc.getRoot().getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( editor.getData() ).to.equal(
					'<figure class="image">' +
						'<img alt="alt text" src="/assets/sample.png">' +
					'</figure>'
				);
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert image figure', () => {
				editor.setData( '<figure class="image"><img src="/assets/sample.png" alt="alt text" /></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<image alt="alt text" src="/assets/sample.png"></image>' );
			} );

			it( 'should not convert if there is no image class', () => {
				editor.setData( '<figure class="quote">My quote</figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should not convert if there is no img inside #1', () => {
				editor.setData( '<figure class="image"></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should not convert if there is no img inside #2', () => {
				editor.setData( '<figure class="image">test</figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should convert without alt attribute', () => {
				editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<image src="/assets/sample.png"></image>' );
			} );

			it( 'should not convert without src attribute', () => {
				editor.setData( '<figure class="image"><img alt="alt text" /></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should not convert in wrong context', () => {
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
				model.schema.addChildCheck( ( ctx, childDef ) => {
					if ( ctx.endsWith( '$root' ) && childDef.name == 'image' ) {
						return false;
					}
				} );

				editor.conversion.elementToElement( { model: 'div', view: 'div' } );

				editor.setData( '<div><figure class="image"><img src="/assets/sample.png" alt="alt text" /></figure></div>' );

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
					.to.equal( '' );
			} );

			it( 'should not convert if figure is already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:figure', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { name: true, class: 'image' } );
				}, { priority: 'high' } );

				editor.setData( '<figure class="image"><img src="/assets/sample.png" alt="alt text" /></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should dispatch conversion for nested elements', () => {
				const conversionSpy = sinon.spy();
				editor.data.upcastDispatcher.on( 'element:figcaption', conversionSpy );

				editor.setData( '<figure class="image"><img src="/assets/sample.png" alt="alt text" /><figcaption></figcaption></figure>' );

				sinon.assert.calledOnce( conversionSpy );
			} );

			it( 'should convert bare img element', () => {
				editor.setData( '<img src="/assets/sample.png" alt="alt text" />' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<image alt="alt text" src="/assets/sample.png"></image>' );
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
						'<image alt="alt text" src="/assets/sample.png" srcset="{"data":"small.png 148w, big.png 1024w"}"></image>'
					);
			} );

			it( 'should convert image with srcset and width attributes', () => {
				editor.setData(
					'<figure class="image">' +
					'<img src="/assets/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" width="1024" />' +
					'</figure>'
				);

				/* eslint-disable max-len */
				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<image alt="alt text" src="/assets/sample.png" srcset="{"data":"small.png 148w, big.png 1024w","width":"1024"}"></image>'
				);
				/* eslint-enable max-len */
			} );

			it( 'should ignore sizes attribute', () => {
				editor.setData(
					'<figure class="image">' +
						'<img src="/assets/sample.png" alt="alt text" srcset="small.png 148w, big.png 1024w" sizes="50vw" />' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal(
						'<image alt="alt text" src="/assets/sample.png" srcset="{"data":"small.png 148w, big.png 1024w"}"></image>'
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
						'<div>foo</div>' +
						'<image alt="foo" src="foo.jpg"></image>' +
						'<div>bar</div>'
					);
				} );

				it( 'multiple images', () => {
					editor.setData( '<div>foo<img src="foo.jpg" alt="foo" />ba<img src="foo.jpg" alt="foo" />r</div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div>foo</div>' +
						'<image alt="foo" src="foo.jpg"></image>' +
						'<div>ba</div>' +
						'<image alt="foo" src="foo.jpg"></image>' +
						'<div>r</div>'
					);
				} );

				it( 'images on borders of parent', () => {
					editor.setData( '<div><img src="foo.jpg" alt="foo" />foobar<img src="foo.jpg" alt="foo" /></div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<image alt="foo" src="foo.jpg"></image>' +
						'<div>foobar</div>' +
						'<image alt="foo" src="foo.jpg"></image>'
					);
				} );

				it( 'images are only content of parent', () => {
					editor.setData( '<div><img src="foo.jpg" alt="foo" /><img src="foo.jpg" alt="foo" /></div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<image alt="foo" src="foo.jpg"></image>' +
						'<image alt="foo" src="foo.jpg"></image>'
					);
				} );

				it( 'deep autohoisting #1', () => {
					model.schema.extend( 'div', { allowIn: 'div' } );

					editor.setData( '<div>foo<div>xx<img src="foo.jpg" alt="foo" /></div>bar</div>' );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<div>' +
							'foo' +
							'<div>' +
								'xx' +
							'</div>' +
						'</div>' +
						'<image alt="foo" src="foo.jpg"></image>' +
						'<div>bar</div>'
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
						'<div>x</div><image alt="foo" src="foo.jpg"></image><div>y</div>'
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
					expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<limit><div>foobar</div></limit>' );
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
				setModelData( model, '<image src="/assets/sample.png" alt="alt text"></image>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false"><img alt="alt text" src="/assets/sample.png"></img></figure>'
				);
			} );

			it( 'converted element should be widgetized', () => {
				setModelData( model, '<image src="/assets/sample.png" alt="alt text"></image>' );
				const figure = viewDocument.getRoot().getChild( 0 );

				expect( figure.name ).to.equal( 'figure' );
				expect( isImageWidget( figure ) ).to.be.true;
			} );

			it( 'should convert attribute change', () => {
				setModelData( model, '<image src="/assets/sample.png" alt="alt text"></image>' );
				const image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'alt', 'new text', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false"><img alt="new text" src="/assets/sample.png"></img></figure>'
				);
			} );

			it( 'should convert attribute removal', () => {
				setModelData( model, '<image src="/assets/sample.png" alt="alt text"></image>' );
				const image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) )
					.to.equal( '<figure class="ck-widget image" contenteditable="false"><img src="/assets/sample.png"></img></figure>' );
			} );

			it( 'should not convert change if is already consumed', () => {
				setModelData( model, '<image src="/assets/sample.png" alt="alt text"></image>' );
				const image = doc.getRoot().getChild( 0 );

				editor.editing.downcastDispatcher.on( 'attribute:alt:image', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:alt' );
				}, { priority: 'high' } );

				model.change( writer => {
					writer.removeAttribute( 'alt', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false"><img alt="alt text" src="/assets/sample.png"></img></figure>'
				);
			} );

			it( 'should convert srcset attribute to srcset and sizes', () => {
				setModelData( model,
					'<image ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data":"small.png 148w, big.png 1024w" }\'>' +
					'</image>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" sizes="100vw" src="/assets/sample.png" srcset="small.png 148w, big.png 1024w"></img>' +
					'</figure>'
				);
			} );

			it( 'should not convert srcset attribute if has wrong data', () => {
				setModelData( model,
					'<image ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "foo":"bar" }\'>' +
					'</image>' );

				const image = doc.getRoot().getChild( 0 );
				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</figure>'
				);
			} );

			it( 'should convert srcset attribute to srcset, width and sizes', () => {
				setModelData( model,
					'<image ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data":"small.png 148w, big.png 1024w", "width":"1024" }\'>' +
					'</image>' );

				/* eslint-disable max-len */
				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" sizes="100vw" src="/assets/sample.png" srcset="small.png 148w, big.png 1024w" width="1024"></img>' +
					'</figure>'
				);
				/* eslint-enable max-len */
			} );

			it( 'should remove sizes and srcsset attribute when srcset attribute is removed from model', () => {
				setModelData( model, '<image src="/assets/sample.png" srcset=\'{ "data": "small.png 148w, big.png 1024w" }\'></image>' );
				const image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src="/assets/sample.png"></img>' +
					'</figure>'
				);
			} );

			it( 'should remove width, sizes and srcsset attribute when srcset attribute is removed from model', () => {
				setModelData( model,
					'<image ' +
						'src="/assets/sample.png" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</image>'
				);
				const image = doc.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'srcset', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
					'<img src="/assets/sample.png"></img>' +
					'</figure>'
				);
			} );

			it( 'should not convert srcset attribute if is already consumed', () => {
				editor.editing.downcastDispatcher.on( 'attribute:srcset:image', ( evt, data, conversionApi ) => {
					const modelImage = data.item;

					conversionApi.consumable.consume( modelImage, evt.name );
				}, { priority: 'high' } );

				setModelData( model,
					'<image ' +
						'src="/assets/sample.png" ' +
						'alt="alt text" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w", "width": "1024" }\'>' +
					'</image>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</figure>'
				);
			} );
		} );
	} );
} );
