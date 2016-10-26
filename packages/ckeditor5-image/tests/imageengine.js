/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from 'tests/core/_utils/virtualtesteditor.js';
import ImageEngine from 'ckeditor5/image/imageengine.js';
import { getData as getModelData, setData as setModelData } from 'ckeditor5/engine/dev-utils/model.js';
import buildViewConverter from 'ckeditor5/engine/conversion/buildviewconverter.js';
import buildModelConverter from 'ckeditor5/engine/conversion/buildmodelconverter.js';

describe( `ImageEngine`, () => {
	let editor, document;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			features: [ ImageEngine ]
		} )
		.then( newEditor => {
			editor = newEditor;
			document = editor.document;
		} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageEngine ) ).to.be.instanceOf( ImageEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( document.schema.check( { name: 'image', attributes: [ 'src', 'alt' ] } ) ).to.be.true;
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( document, '<image src="foo.png" alt="alt text"></image>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png" alt="alt text"></figure>' );
			} );

			it( 'should convert without alt attribute', () => {
				setModelData( document, '<image src="foo.png"></image>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
			} );

			it( 'should convert without src attribute', () => {
				setModelData( document, '<image alt="alt text"></image>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img alt="alt text"></figure>' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert image figure', () => {
				editor.setData( '<figure class="image"><img src="foo.png" alt="alt text" /></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<image alt="alt text" src="foo.png"></image>' );
			} );

			it( 'should not convert if there is no image class', () => {
				editor.setData( '<figure><img src="foo.png" alt="alt text" /></figure>' );

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

			it( 'should convert without src attribute', () => {
				editor.setData( '<figure class="image"><img alt="alt text" /></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<image alt="alt text"></image>' );
			} );

			it( 'should not convert in wrong context', () => {
				const data = editor.data;
				const editing = editor.editing;

				document.schema.registerItem( 'div', '$block' );
				buildModelConverter().for( data.modelToView, editing.modelToView ).fromElement( 'div' ).toElement( 'div' );
				buildViewConverter().for( data.viewToModel ).fromElement( 'div' ).toElement( 'div' );
				document.schema.disallow( { name: 'image', inside: 'div' } );

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
		} );
	} );
} );
