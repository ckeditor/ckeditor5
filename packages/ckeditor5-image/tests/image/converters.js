/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { viewFigureToModel, createImageAttributeConverter } from '../../src/image/converters';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { createImageViewElement } from '../../src/image/imageengine';
import { toImageWidget } from '../../src/image/utils';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
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
			editor.editing.modelToView.on( `changeAttribute:alt:image`, ( evt, data, consumable ) => {
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
} );
