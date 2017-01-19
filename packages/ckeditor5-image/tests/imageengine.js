/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageEngine from '../src/imageengine';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import { isImageWidget } from '../src/utils';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';

describe( 'ImageEngine', () => {
	let editor, document, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor.create( {
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

				expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png" alt="alt text"></figure>' );
			} );

			it( 'should convert without alt attribute', () => {
				setModelData( document, '<image src="foo.png"></image>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img src="foo.png"></figure>' );
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

			it( 'should not convert without src attribute', () => {
				editor.setData( '<figure class="image"><img alt="alt text" /></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '' );
			} );

			it( 'should not convert in wrong context', () => {
				const data = editor.data;
				const editing = editor.editing;

				document.schema.registerItem( 'div', '$block' );
				document.schema.disallow( { name: 'image', inside: 'div', attributes: [ 'src' ] } );

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
		} );
	} );

	describe( 'conversion in editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert', () => {
				setModelData( document, '<image src="foo.png" alt="alt text"></image>' );

				expect( getViewData( viewDocument, { withoutSelection: true } ) )
					.to.equal( '<figure class="image ck-widget" contenteditable="false"><img alt="alt text" src="foo.png"></img></figure>' );
			} );

			it( 'converted element should be widgetized', () => {
				setModelData( document, '<image src="foo.png" alt="alt text"></image>' );
				const figure = viewDocument.getRoot().getChild( 0 );

				expect( figure.name ).to.equal( 'figure' );
				expect( isImageWidget( figure ) ).to.be.true;
			} );
		} );
	} );

	describe( 'selection conversion', () => {
		it( 'should convert selection', () => {
			setModelData( document, '[<image alt="alt text" src="foo.png"></image>]' );

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
					'<img alt="alt text" src="foo.png"></img>' +
				'</figure>]'
			);

			expect( viewDocument.selection.isFake ).to.be.true;
			expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'alt text image widget' );
		} );

		it( 'should create proper fake selection label when alt attribute is empty', () => {
			setModelData( document, '[<image src="foo.png" alt=""></image>]' );

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
					'<img alt="" src="foo.png"></img>' +
				'</figure>]'
			);

			expect( viewDocument.selection.isFake ).to.be.true;
			expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'image widget' );
		} );

		it( 'should remove selected class from previously selected element', () => {
			setModelData( document,
				'[<image src="foo.png" alt="alt text"></image>]' +
				'<image src="foo.png" alt="alt text"></image>'
			);

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
					'<img alt="alt text" src="foo.png"></img>' +
				'</figure>]' +
				'<figure class="image ck-widget" contenteditable="false">' +
					'<img alt="alt text" src="foo.png"></img>' +
				'</figure>'
			);

			document.enqueueChanges( () => {
				const secondImage = document.getRoot().getChild( 1 );
				document.selection.setRanges( [ ModelRange.createOn( secondImage ) ] );
			} );

			expect( getViewData( viewDocument ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false">' +
					'<img alt="alt text" src="foo.png"></img>' +
				'</figure>' +
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
					'<img alt="alt text" src="foo.png"></img>' +
				'</figure>]'
			);
		} );
	} );
} );
