/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { viewToModelImage, modelToViewSelection, createImageAttributeConverter } from '../src/converters';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { createImageViewElement } from '../src/imageengine';
import { toImageWidget } from '../src/utils';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import ViewConversionDispatcher from '@ckeditor/ckeditor5-engine/src/conversion/viewconversiondispatcher';
import Schema from '@ckeditor/ckeditor5-engine/src/model/schema';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { stringify as stringifyModel, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe.only( 'Image converters', () => {
	describe( 'viewToModelImage', () => {
		let dispatcher, schema;

		beforeEach( () => {
			schema = new Schema();
			setImageSchema( schema );

			dispatcher = new ViewConversionDispatcher( { schema } );
			dispatcher.on( 'element:figure', viewToModelImage() );
		} );

		it( 'should convert view figure element', () => {
			test(
				'<figure class="image"><img src="foo.png" alt="bar baz"></img></figure>',
				'<image alt="bar baz" src="foo.png"></image>'
			);
		} );

		it( 'should convert without alt', () => {
			test(
				'<figure class="image"><img src="foo.png"></img></figure>',
				'<image src="foo.png"></image>'
			);
		} );

		it( 'should not convert if figure element is already consumed', () => {
			dispatcher.on( 'element:figure', ( evt, data, consumable ) => {
				consumable.consume( data.input, { name: true, class: 'image' } );

				data.output = new ModelElement( 'not-image' );
			}, { priority: 'high' } );

			test(
				'<figure class="image"><img src="foo.png" alt="bar baz"></img></figure>',
				'<not-image></not-image>'
			);
		} );

		it( 'should not convert image if schema disallows it', () => {
			schema.disallow( { name: 'image', attributes: [ 'alt', 'src' ], inside: '$root' } );
			const element = parseView( '<figure class="image"><img src="foo.png"></img></figure>' );
			const model = dispatcher.convert( element );

			expect( model ).to.be.null;
		} );

		it( 'should not convert image if there is no img element', () => {
			const element = parseView( '<figure class="image"></figure>' );
			const model = dispatcher.convert( element );

			expect( model ).to.be.null;
		} );

		function test( viewString, modelString ) {
			const element = parseView( viewString );
			const model = dispatcher.convert( element );

			expect( stringifyModel( model ) ).to.equal( modelString );
		}
	} );

	describe( 'modelToViewSelection', () => {
		let editor, document, viewDocument;

		beforeEach( () => {
			return VirtualTestEditor.create()
				.then( newEditor => {
					editor = newEditor;
					document = editor.document;
					viewDocument = editor.editing.view;
					setImageSchema( document.schema );

					buildModelConverter().for( )
						.fromElement( 'image' )
						.toElement( () => toImageWidget( createImageViewElement() ) );

					editor.editing.modelToView.on( 'selection', modelToViewSelection( editor.t ), { priority: 'lowest' } );
					buildModelConverter().for( editor.editing.modelToView )
						.fromElement( 'image' )
						.toElement( () => toImageWidget( createImageViewElement() ) );

					createImageAttributeConverter( [ editor.editing.modelToView ], 'src' );
					createImageAttributeConverter( [ editor.editing.modelToView ], 'alt' );
				} );
		} );

		it( 'should convert selection over image to fake selection', () => {
			setModelData( document, '[<image src=""></image>]' );

			expect( viewDocument.selection.isFake ).to.be.true;
			expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'image widget' );
		} );

		it( 'should convert fake selection label with alt', () => {
			setModelData( document, '[<image src="" alt="foo bar"></image>]' );

			expect( viewDocument.selection.isFake ).to.be.true;
			expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'foo bar image widget' );
		} );

		it( 'should not convert fake selection if image is not selected', () => {
			setModelData( document, '[]<image src="" alt="foo bar"></image>' );

			expect( viewDocument.selection.isFake ).to.be.false;
		} );
	} );
} );

function setImageSchema( schema ) {
	schema.registerItem( 'image' );
	schema.requireAttributes( 'image', [ 'src' ] );
	schema.allow( { name: 'image', attributes: [ 'alt', 'src' ], inside: '$root' } );
	schema.objects.add( 'image' );
}
