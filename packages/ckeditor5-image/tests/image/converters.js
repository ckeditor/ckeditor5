/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { viewToModelImage, createImageAttributeConverter } from '../../src/image/converters';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { createImageViewElement } from '../../src/image/imageengine';
import { toImageWidget } from '../../src/image/utils';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
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

				buildModelConverter().for( )
					.fromElement( 'image' )
					.toElement( () => toImageWidget( createImageViewElement() ) );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'image' )
					.toElement( () => toImageWidget( createImageViewElement() ) );

				createImageAttributeConverter( [ editor.editing.modelToView ], 'src' );
				createImageAttributeConverter( [ editor.editing.modelToView ], 'alt' );
			} );
	} );

	describe( 'viewToModelImage', () => {
		let dispatcher, schema;

		beforeEach( () => {
			schema = document.schema;
			dispatcher = editor.data.viewToModel;
			dispatcher.on( 'element:figure', viewToModelImage() );
		} );

		it( 'should convert view figure element', () => {
			editor.setData( '<figure class="image"><img src="foo.png" alt="bar baz"></img></figure>' );
			expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '<image alt="bar baz" src="foo.png"></image>' );
		} );

		it( 'should convert without alt', () => {
			editor.setData( '<figure class="image"><img src="foo.png"></img></figure>' );
			expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '<image src="foo.png"></image>' );
		} );

		it( 'should not convert if figure element is already consumed', () => {
			dispatcher.on( 'element:figure', ( evt, data, consumable ) => {
				consumable.consume( data.input, { name: true, class: 'image' } );

				data.output = new ModelElement( 'not-image' );
			}, { priority: 'high' } );

			editor.setData( '<figure class="image"><img src="foo.png" alt="bar baz"></img></figure>' );
			expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '<not-image></not-image>' );
		} );

		it( 'should not convert image if schema disallows it', () => {
			schema.disallow( { name: 'image', attributes: [ 'alt', 'src' ], inside: '$root' } );

			editor.setData( '<figure class="image"><img src="foo.png"></img></figure>' );
			expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '' );
		} );

		it( 'should not convert image if there is no img element', () => {
			editor.setData( '<figure class="image"></figure>' );
			expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '' );
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
