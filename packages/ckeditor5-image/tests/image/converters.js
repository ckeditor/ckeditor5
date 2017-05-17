/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	viewFigureToModel,
	createImageAttributeConverter,
	convertHoistableImage,
	hoistImageThroughElement
} from '../../src/image/converters';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { createImageViewElement } from '../../src/image/imageengine';
import { toImageWidget } from '../../src/image/utils';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ViewEmptyElement from '@ckeditor/ckeditor5-engine/src/view/emptyelement';
import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import { convertToModelFragment } from '@ckeditor/ckeditor5-engine/src/conversion/view-to-model-converters';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Image converters', () => {
	let editor, document, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				viewDocument = editor.editing.view;
				const schema = document.schema;

				schema.registerItem( 'image' );
				schema.requireAttributes( 'image', [ 'src' ] );
				schema.allow( { name: 'image', attributes: [ 'alt', 'src' ], inside: '$root' } );
				schema.objects.add( 'image' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'image' )
					.toElement( () => toImageWidget( createImageViewElement() ) );

				createImageAttributeConverter( [ editor.editing.modelToView ], 'src' );
				createImageAttributeConverter( [ editor.editing.modelToView ], 'alt' );
			} );
	} );

	describe( 'viewFigureToModel', () => {
		function expectModel( model ) {
			expect( getModelData( document, { withoutSelection: true } ) ).to.equal( model );
		}

		let dispatcher, schema, imgConverterCalled;

		beforeEach( () => {
			imgConverterCalled = false;

			schema = document.schema;
			schema.allow( { name: '$text', inside: 'image' } );

			dispatcher = editor.data.viewToModel;
			dispatcher.on( 'element:figure', viewFigureToModel() );
			dispatcher.on( 'element:img', ( evt, data, consumable ) => {
				if ( consumable.consume( data.input, { name: true, attribute: 'src' } ) ) {
					data.output = new ModelElement( 'image', { src: data.input.getAttribute( 'src' ) } );

					imgConverterCalled = true;
				}
			} );
		} );

		it( 'should find img element among children and convert it using already defined converters', () => {
			editor.setData( '<figure class="image"><img src="foo.png" /></figure>' );

			expectModel( '<image src="foo.png"></image>' );
			expect( imgConverterCalled ).to.be.true;
		} );

		it( 'should convert non-img children in image context and append them to model image element', () => {
			buildViewConverter().for( editor.data.viewToModel ).fromElement( 'foo' ).toElement( 'foo' );
			buildViewConverter().for( editor.data.viewToModel ).fromElement( 'bar' ).toElement( 'bar' );

			schema.registerItem( 'foo' );
			schema.registerItem( 'bar' );

			schema.allow( { name: 'foo', inside: 'image' } );

			editor.setData( '<figure class="image">x<img src="foo.png" />y<foo></foo><bar></bar></figure>' );

			// Element bar not converted because schema does not allow it.
			expectModel( '<image src="foo.png">xy<foo></foo></image>' );
		} );

		it( 'should be possible to overwrite', () => {
			dispatcher.on( 'element:figure', ( evt, data, consumable ) => {
				consumable.consume( data.input, { name: true } );
				consumable.consume( data.input.getChild( 0 ), { name: true } );

				data.output = new ModelElement( 'myImage', { data: { src: data.input.getChild( 0 ).getAttribute( 'src' ) } } );
			}, { priority: 'high' } );

			editor.setData( '<figure class="image"><img src="foo.png" />xyz</figure>' );

			expectModel( '<myImage data="{"src":"foo.png"}"></myImage>' );
		} );

		// Test exactly what figure converter does, which is putting it's children element to image element.
		// If this has not been done, it means that figure converter was not used.
		it( 'should not convert if figure do not have class="image" attribute', () => {
			editor.setData( '<figure><img src="foo.png" />xyz</figure>' );

			// Default image converter will be fired.
			expectModel( '<image src="foo.png"></image>' );
		} );

		it( 'should not convert if there is no img element among children', () => {
			editor.setData( '<figure class="image">xyz</figure>' );

			// Figure converter outputs nothing and text is disallowed in root.
			expectModel( '' );
		} );

		it( 'should not convert if img element was not converted', () => {
			// Image element missing src attribute.
			editor.setData( '<figure class="image"><img alt="abc" />xyz</figure>' );

			// Figure converter outputs nothing and text is disallowed in root.
			expectModel( '' );
		} );
	} );

	describe( 'modelToViewAttributeConverter', () => {
		it( 'should convert adding attribute to image', () => {
			setModelData( document, '<image src=""></image>' );
			const image = document.getRoot().getChild( 0 );

			document.enqueueChanges( () => {
				const batch = document.batch();

				batch.setAttribute( image, 'alt', 'foo bar' );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img alt="foo bar" src=""></img></figure>'
			);
		} );

		it( 'should convert removing attribute from image', () => {
			setModelData( document, '<image src="" alt="foo bar"></image>' );
			const image = document.getRoot().getChild( 0 );

			document.enqueueChanges( () => {
				const batch = document.batch();

				batch.removeAttribute( image, 'alt' );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img src=""></img></figure>'
			);
		} );

		it( 'should convert change of attribute image', () => {
			setModelData( document, '<image src="" alt="foo bar"></image>' );
			const image = document.getRoot().getChild( 0 );

			document.enqueueChanges( () => {
				const batch = document.batch();

				batch.setAttribute( image, 'alt', 'baz quix' );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img alt="baz quix" src=""></img></figure>'
			);
		} );

		it( 'should not change attribute if change is already consumed', () => {
			editor.editing.modelToView.on( 'changeAttribute:alt:image', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'changeAttribute:alt' );
			}, { priority: 'high' } );

			setModelData( document, '<image src="" alt="foo bar"></image>' );
			const image = document.getRoot().getChild( 0 );

			document.enqueueChanges( () => {
				const batch = document.batch();

				batch.setAttribute( image, 'alt', 'baz quix' );
			} );

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false"><img alt="foo bar" src=""></img></figure>'
			);
		} );
	} );

	// More integration tests are in imageengine.js.
	describe( 'autohoist converters', () => {
		let dispatcher, schema, imgConverterCalled, viewImg, modelDiv, modelParagraph, modelLimit;

		beforeEach( () => {
			imgConverterCalled = false;

			schema = document.schema;

			dispatcher = editor.data.viewToModel;
			dispatcher.on( 'element:img', ( evt, data, consumable ) => {
				if ( !schema.check( { name: 'image', attributes: [ 'src' ], inside: data.context } ) ) {
					return;
				}

				if ( consumable.consume( data.input, { name: true, attribute: 'src' } ) ) {
					data.output = new ModelElement( 'image', { src: data.input.getAttribute( 'src' ) } );

					imgConverterCalled = true;
				}
			} );

			// Make sure to pass document element to the converter and fire this callback after "normal" image callback.
			dispatcher.on( 'element:img', convertHoistableImage, { priority: 'low' } );

			viewImg = new ViewEmptyElement( 'img', { src: 'foo.jpg' } );

			modelDiv = new ModelElement( 'div' );
			modelParagraph = new ModelElement( 'paragraph' );
			modelLimit = new ModelElement( 'limit' );
		} );

		describe( 'convertHoistableImage', () => {
			it( 'should convert img element using already added converters if it is allowed in any point of given context #1', () => {
				const result = dispatcher.convert( viewImg, { context: [ '$root', 'div', 'paragraph' ] } );

				// `result` is a model document fragment.
				expect( result.childCount ).to.equal( 1 );
				expect( result.getChild( 0 ).is( 'image' ) ).to.be.true;
				expect( result.getChild( 0 ).getAttribute( 'src' ) ).to.equal( 'foo.jpg' );
				expect( imgConverterCalled ).to.be.true;
			} );

			it( 'should convert img element using already added converters if it is allowed in any point of given context #2', () => {
				const result = dispatcher.convert( viewImg, { context: [ '$root', modelDiv, modelParagraph ] } );

				// `result` is a model document fragment.
				expect( result.childCount ).to.equal( 1 );
				expect( result.getChild( 0 ).is( 'image' ) ).to.be.true;
				expect( result.getChild( 0 ).getAttribute( 'src' ) ).to.equal( 'foo.jpg' );
				expect( imgConverterCalled ).to.be.true;
			} );

			it( 'should not convert img element if there is no allowed context #1', () => {
				const result = dispatcher.convert( viewImg, { context: [ 'div', 'paragraph' ] } );

				// `result` is an empty model document fragment.
				expect( result.childCount ).to.equal( 0 );
				expect( imgConverterCalled ).to.be.false;
			} );

			it( 'should not convert img element if there is no allowed context #2', () => {
				const result = dispatcher.convert( viewImg, { context: [ modelDiv, modelParagraph ] } );

				// `result` is an empty model document fragment.
				expect( result.childCount ).to.equal( 0 );
				expect( imgConverterCalled ).to.be.false;
			} );

			it( 'should not convert img element if allowed context is "above" limiting element #1', () => {
				schema.limits.add( 'limit' );

				const result = dispatcher.convert( viewImg, { context: [ '$root', 'limit', 'div', 'paragraph' ] } );

				// `result` is an empty model document fragment.
				expect( result.childCount ).to.equal( 0 );
				expect( imgConverterCalled ).to.be.false;
			} );

			it( 'should not convert img element if allowed context is "above" limiting element #2', () => {
				schema.limits.add( 'limit' );

				const result = dispatcher.convert( viewImg, { context: [ '$root', modelLimit, modelDiv, modelParagraph ] } );

				// `result` is an empty model document fragment.
				expect( result.childCount ).to.equal( 0 );
				expect( imgConverterCalled ).to.be.false;
			} );
		} );

		describe( 'hoistImageThroughElement', () => {
			it( 'should hoist img element that was converted by convertHoistableImage', () => {
				schema.registerItem( 'div', '$block' );

				buildModelConverter().for( editor.data.modelToView, editor.editing.modelToView ).fromElement( 'div' ).toElement( 'div' );
				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'div' ).toElement( 'div' );

				// Make sure to fire this callback after "normal" div callback.
				dispatcher.on( 'element:div', hoistImageThroughElement, { priority: 'low' } );

				// If img view element is converted it must have been converted thanks to convertHoistableImage,
				// because image is not allowed in div.
				const viewDiv = new ViewContainerElement( 'div', null, [ 'foo', viewImg, 'bar' ] );

				const result = dispatcher.convert( viewDiv, { context: [ '$root' ] } );

				// `result` is a model document fragment.
				expect( result.childCount ).to.equal( 3 );
				expect( result.getChild( 0 ).is( 'div' ) ).to.be.true;
				expect( result.getChild( 1 ).is( 'image' ) ).to.be.true;
				expect( result.getChild( 2 ).is( 'div' ) ).to.be.true;
			} );

			it( 'should work fine with elements that are converted to document fragments', () => {
				// The example here is <p> that contains some text and an <img> and is converted in $root > div context.
				// This way we enable autohoisting for <img> and test how it will work when <p> is converted to model document fragment.
				schema.registerItem( 'div', '$block' );

				dispatcher.on( 'element:p', convertToModelFragment() );
				dispatcher.on( 'element:p', hoistImageThroughElement, { priority: 'low' } );

				const viewDiv = new ViewContainerElement( 'p', null, [ 'foo', viewImg, 'bar' ] );

				const result = dispatcher.convert( viewDiv, { context: [ '$root', 'div' ] } );

				// `result` is a model document fragment.
				expect( result.childCount ).to.equal( 3 );
				expect( result.getChild( 0 ).is( 'text' ) ).to.be.true;
				expect( result.getChild( 1 ).is( 'image' ) ).to.be.true;
				expect( result.getChild( 2 ).is( 'text' ) ).to.be.true;
			} );
		} );
	} );
} );
