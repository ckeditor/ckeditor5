/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageEngine from '../../src/image/imageengine';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import { isImageWidget } from '../../src/image/utils';

describe( 'ImageEngine', () => {
	let editor, document, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				viewDocument = editor.editing.view;
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageEngine ) ).to.be.instanceOf( ImageEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( document.schema.check( { name: 'image', attributes: [ 'src', 'alt' ], inside: '$root' } ) ).to.be.true;
		expect( document.schema.objects.has( 'image' ) ).to.be.true;
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( document, '<image src="foo.png" alt="alt text"></image>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img alt="alt text" src="foo.png"></figure>' );
			} );

			it( 'should convert without alt attribute', () => {
				setModelData( document, '<image src="foo.png"></image>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
			} );

			it( 'should convert with srcset attribute and add sizes attribute', () => {
				setModelData( document, '<image src="foo.png" alt="alt text" srcset="small.png 148w, big.png 1024w"></image>' );

				expect( editor.getData() ).to.equal(
					'<figure class="image">' +
						'<img srcset="small.png 148w, big.png 1024w" sizes="100vw" alt="alt text" src="foo.png">' +
					'</figure>'
				);
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert image figure', () => {
				editor.setData( '<figure class="image"><img src="foo.png" alt="alt text" /></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<image alt="alt text" src="foo.png"></image>' );
			} );

			it( 'should not convert if there is no image class', () => {
				editor.setData( '<figure class="quote">My quote</figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should not convert if there is no img inside #1', () => {
				editor.setData( '<figure class="image"></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should not convert if there is no img inside #2', () => {
				editor.setData( '<figure class="image">test</figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should convert without alt attribute', () => {
				editor.setData( '<figure class="image"><img src="foo.png" /></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<image src="foo.png"></image>' );
			} );

			it( 'should not convert without src attribute', () => {
				editor.setData( '<figure class="image"><img alt="alt text" /></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should not convert in wrong context', () => {
				const data = editor.data;
				const editing = editor.editing;

				document.schema.registerItem( 'div', '$block' );
				document.schema.disallow( { name: 'image', inside: '$root', attributes: 'src' } );

				buildModelConverter().for( data.modelToView, editing.modelToView ).fromElement( 'div' ).toElement( 'div' );
				buildViewConverter().for( data.viewToModel ).fromElement( 'div' ).toElement( 'div' );

				editor.setData( '<div><figure class="image"><img src="foo.png" alt="alt text" /></figure></div>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<div></div>' );
			} );

			it( 'should not convert if img is already consumed', () => {
				editor.data.viewToModel.on( 'element:figure', ( evt, data, consumable ) => {
					const img = data.input.getChild( 0 );
					consumable.consume( img, { name: true } );
				}, { priority: 'high' } );

				editor.setData( '<figure class="image"><img src="foo.png" alt="alt text" /></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should not convert if figure is already consumed', () => {
				editor.data.viewToModel.on( 'element:figure', ( evt, data, consumable ) => {
					const figure = data.input;
					consumable.consume( figure, { name: true, class: 'image' } );
				}, { priority: 'high' } );

				editor.setData( '<figure class="image"><img src="foo.png" alt="alt text" /></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should dispatch conversion for nested elements', () => {
				const conversionSpy = sinon.spy();
				editor.data.viewToModel.on( 'element:figcaption', conversionSpy );

				editor.setData( '<figure class="image"><img src="foo.png" alt="alt text" /><figcaption></figcaption></figure>' );

				sinon.assert.calledOnce( conversionSpy );
			} );

			it( 'should convert bare img element', () => {
				editor.setData( '<img src="foo.png" alt="alt text" />' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<image alt="alt text" src="foo.png"></image>' );
			} );

			it( 'should not convert alt attribute on non-img element', () => {
				const data = editor.data;
				const editing = editor.editing;

				document.schema.registerItem( 'div', '$block' );
				document.schema.allow( { name: 'div', attributes: 'alt', inside: '$root' } );

				buildModelConverter().for( data.modelToView, editing.modelToView ).fromElement( 'div' ).toElement( 'div' );
				buildViewConverter().for( data.viewToModel ).fromElement( 'div' ).toElement( 'div' );

				editor.setData( '<div alt="foo"></div>' );

				expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '<div></div>' );
			} );

			it( 'should handle figure with two images', () => {
				document.schema.allow( { name: '$text', inside: 'image' } );

				editor.setData( '<figure class="image"><img src="foo.jpg" /><img src="bar.jpg" />abc</figure>' );

				// The foo.jpg image is properly converted using figure converter. The other image was tried to
				// be added as a child of foo.jpg and then was autohoisted.
				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<image src="bar.jpg"></image><image src="foo.jpg">abc</image>' );
			} );

			it( 'should convert image with srcset attribute', () => {
				editor.setData(
					'<figure class="image">' +
						'<img src="foo.png" alt="alt text" srcset="small.png 148w, big.png 1024w" />' +
					'</figure>'
				);

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<image alt="alt text" src="foo.png" srcset="small.png 148w, big.png 1024w"></image>' );
			} );

			it( 'should ignore sizes attribute', () => {
				editor.setData(
					'<figure class="image">' +
						'<img src="foo.png" alt="alt text" srcset="small.png 148w, big.png 1024w" sizes="50vw" />' +
					'</figure>'
				);

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<image alt="alt text" src="foo.png" srcset="small.png 148w, big.png 1024w"></image>' );
			} );

			describe( 'should autohoist images', () => {
				beforeEach( () => {
					document.schema.registerItem( 'div', '$block' );

					buildModelConverter()
						.for( editor.data.modelToView, editor.editing.modelToView )
						.fromElement( 'div' )
						.toElement( 'div' );

					buildViewConverter()
						.for( editor.data.viewToModel )
						.fromElement( 'div' )
						.toElement( 'div' );
				} );

				it( 'image between non-hoisted elements', () => {
					editor.setData( '<div>foo<img src="foo.jpg" alt="foo" />bar</div>' );

					expect( getModelData( document, { withoutSelection: true } ) ).to.equal(
						'<div>foo</div>' +
						'<image alt="foo" src="foo.jpg"></image>' +
						'<div>bar</div>'
					);
				} );

				it( 'multiple images', () => {
					editor.setData( '<div>foo<img src="foo.jpg" alt="foo" />ba<img src="foo.jpg" alt="foo" />r</div>' );

					expect( getModelData( document, { withoutSelection: true } ) ).to.equal(
						'<div>foo</div>' +
						'<image alt="foo" src="foo.jpg"></image>' +
						'<div>ba</div>' +
						'<image alt="foo" src="foo.jpg"></image>' +
						'<div>r</div>'
					);
				} );

				it( 'images on borders of parent', () => {
					editor.setData( '<div><img src="foo.jpg" alt="foo" />foobar<img src="foo.jpg" alt="foo" /></div>' );

					expect( getModelData( document, { withoutSelection: true } ) ).to.equal(
						'<image alt="foo" src="foo.jpg"></image>' +
						'<div>foobar</div>' +
						'<image alt="foo" src="foo.jpg"></image>'
					);
				} );

				it( 'images are only content of parent', () => {
					editor.setData( '<div><img src="foo.jpg" alt="foo" /><img src="foo.jpg" alt="foo" /></div>' );

					expect( getModelData( document, { withoutSelection: true } ) ).to.equal(
						'<image alt="foo" src="foo.jpg"></image>' +
						'<image alt="foo" src="foo.jpg"></image>'
					);
				} );

				it( 'deep autohoisting #1', () => {
					document.schema.allow( { name: 'div', inside: 'div' } );

					editor.setData( '<div>foo<div>xx<img src="foo.jpg" alt="foo" /></div>bar</div>' );

					expect( getModelData( document, { withoutSelection: true } ) ).to.equal(
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
					document.schema.allow( { name: 'div', inside: 'div' } );

					editor.setData(
						'<div>x</div>' +
						'<div><div><div><img src="foo.jpg" alt="foo" /></div></div></div>' +
						'<div>y</div>'
					);

					expect( getModelData( document, { withoutSelection: true } ) ).to.equal(
						'<div>x</div><image alt="foo" src="foo.jpg"></image><div>y</div>'
					);
				} );

				it( 'should not break a limiting element', () => {
					document.schema.registerItem( 'limit', '$block' );
					document.schema.allow( { name: 'div', inside: 'limit' } );
					document.schema.limits.add( 'limit' );

					buildModelConverter()
						.for( editor.data.modelToView, editor.editing.modelToView ).fromElement( 'limit' ).toElement( 'limit' );

					buildViewConverter().for( editor.data.viewToModel ).fromElement( 'limit' ).toElement( 'limit' );

					editor.setData( '<limit><div>foo<img src="foo.jpg" alt="foo" />bar</div></limit>' );

					// <limit> element does not have converters so it is not converted.
					expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '<limit><div>foobar</div></limit>' );
				} );

				it( 'should not convert and autohoist image element without src attribute (which is not allowed by schema)', () => {
					editor.setData( '<div>foo<img alt="foo" />bar</div>' );

					expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '<div>foobar</div>' );
				} );
			} );
		} );
	} );

	describe( 'conversion in editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( document, '<image src="foo.png" alt="alt text"></image>' );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<figure class="image ck-widget" contenteditable="false"><img alt="alt text" src="foo.png"></img></figure>'
				);
			} );

			it( 'converted element should be widgetized', () => {
				setModelData( document, '<image src="foo.png" alt="alt text"></image>' );
				const figure = viewDocument.getRoot().getChild( 0 );

				expect( figure.name ).to.equal( 'figure' );
				expect( isImageWidget( figure ) ).to.be.true;
			} );

			it( 'should convert attribute change', () => {
				setModelData( document, '<image src="foo.png" alt="alt text"></image>' );
				const image = document.getRoot().getChild( 0 );

				document.enqueueChanges( () => {
					const batch = document.batch();

					batch.setAttribute( image, 'alt', 'new text' );
				} );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<figure class="image ck-widget" contenteditable="false"><img alt="new text" src="foo.png"></img></figure>'
				);
			} );

			it( 'should convert attribute removal', () => {
				setModelData( document, '<image src="foo.png" alt="alt text"></image>' );
				const image = document.getRoot().getChild( 0 );

				document.enqueueChanges( () => {
					const batch = document.batch();

					batch.removeAttribute( image, 'alt' );
				} );

				expect( getViewData( viewDocument, { withoutSelection: true } ) )
					.to.equal( '<figure class="image ck-widget" contenteditable="false"><img src="foo.png"></img></figure>' );
			} );

			it( 'should not convert change if is already consumed', () => {
				setModelData( document, '<image src="foo.png" alt="alt text"></image>' );
				const image = document.getRoot().getChild( 0 );

				editor.editing.modelToView.on( 'removeAttribute:alt:image', ( evt, data, consumable ) => {
					consumable.consume( data.item, 'removeAttribute:alt' );
				}, { priority: 'high' } );

				document.enqueueChanges( () => {
					const batch = document.batch();

					batch.removeAttribute( image, 'alt' );
				} );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<figure class="image ck-widget" contenteditable="false"><img alt="alt text" src="foo.png"></img></figure>'
				);
			} );

			it( 'should convert srcset attribute to srcset and sizes', () => {
				setModelData( document, '<image src="foo.png" alt="alt text" srcset="small.png 148w, big.png 1024w"></image>' );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<figure class="image ck-widget" contenteditable="false">' +
						'<img alt="alt text" sizes="100vw" src="foo.png" srcset="small.png 148w, big.png 1024w"></img>' +
					'</figure>'
				);
			} );

			it( 'should remove sizes attribute when srcset attribute is removed', () => {
				setModelData( document, '<image src="foo.png" srcset="small.png 148w, big.png 1024w"></image>' );
				const image = document.getRoot().getChild( 0 );

				document.enqueueChanges( () => {
					const batch = document.batch();

					batch.removeAttribute( image, 'srcset' );
				} );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<figure class="image ck-widget" contenteditable="false">' +
						'<img src="foo.png"></img>' +
					'</figure>'
				);
			} );
		} );
	} );
} );
