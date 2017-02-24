/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ViewAttributeElement from '@ckeditor/ckeditor5-engine/src/view/attributeelement';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import viewWriter from '@ckeditor/ckeditor5-engine/src/view/writer';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import ImageCaptionEngine from '../../src/imagecaption/imagecaptionengine';
import ImageEngine from '../../src/image/imageengine';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';

describe( 'ImageCaptionEngine', () => {
	let editor, document, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ ImageCaptionEngine, ImageEngine ]
		} )
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				viewDocument = editor.editing.view;
				document.schema.registerItem( 'widget' );
				document.schema.allow( { name: 'widget', inside: '$root' } );
				document.schema.allow( { name: 'caption', inside: 'widget' } );
				document.schema.allow( { name: '$inline', inside: 'widget' } );

				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'widget' ).toElement( 'widget' );
				buildModelConverter().for( editor.data.modelToView, editor.editing.modelToView ).fromElement( 'widget' ).toElement( 'widget' );
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageCaptionEngine ) ).to.be.instanceOf( ImageCaptionEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( document.schema.check( { name: 'caption', iniside: 'image' } ) ).to.be.true;
		expect( document.schema.check( { name: '$inline', inside: 'caption' } ) ).to.be.true;
		expect( document.schema.limits.has( 'caption' ) );
	} );

	describe( 'data pipeline', () => {
		describe( 'view to model', () => {
			it( 'should convert figcaption inside image figure', () => {
				editor.setData( '<figure class="image"><img src="foo.png"/><figcaption>foo bar</figcaption></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<image src="foo.png"><caption>foo bar</caption></image>' );
			} );

			it( 'should add empty caption if there is no figcaption', () => {
				editor.setData( '<figure class="image"><img src="foo.png"/></figure>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<image src="foo.png"><caption></caption></image>' );
			} );

			it( 'should not convert figcaption inside other elements than image', () => {
				editor.setData( '<widget><figcaption>foobar</figcaption></widget>' );

				expect( getModelData( document, { withoutSelection: true } ) )
					.to.equal( '<widget>foobar</widget>' );
			} );
		} );

		describe( 'model to view', () => {
			it( 'should convert caption element to figcaption', () => {
				setModelData( document, '<image src="img.png"><caption>Foo bar baz.</caption></image>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img src="img.png"><figcaption>Foo bar baz.</figcaption></figure>' );
			} );

			it( 'should not convert caption if it\'s empty', () => {
				setModelData( document, '<image src="img.png"><caption></caption></image>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img src="img.png"></figure>' );
			} );

			it( 'should not convert caption from other elements', () => {
				setModelData( document, '<widget>foo bar<caption></caption></widget>' );
				expect( editor.getData() ).to.equal( '<widget>foo bar</widget>' );
			} );
		} );
	} );

	describe( 'editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert caption element to figcaption contenteditable', () => {
				setModelData( document, '<image src="img.png"><caption>Foo bar baz.</caption></image>' );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<figure class="image ck-widget" contenteditable="false">' +
						'<img src="img.png"></img>' +
						'<figcaption contenteditable="true">Foo bar baz.</figcaption>' +
					'</figure>'
				);
			} );

			it( 'should not convert caption if it\'s empty', () => {
				setModelData( document, '<image src="img.png"><caption></caption></image>' );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<figure class="image ck-widget" contenteditable="false"><img src="img.png"></img></figure>'
				);
			} );

			it( 'should not convert caption from other elements', () => {
				setModelData( document, '<widget>foo bar<caption></caption></widget>' );
				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( '<widget>foo bar</widget>' );
			} );

			it( 'should not convert when element is already consumed', () => {
				editor.editing.modelToView.on(
					'insert:caption',
					( evt, data, consumable, conversionApi ) => {
						consumable.consume( data.item, 'insert' );

						const imageFigure = conversionApi.mapper.toViewElement( data.range.start.parent );
						const viewElement = new ViewAttributeElement( 'span' );

						const viewPosition = ViewPosition.createAt( imageFigure, 'end' );
						conversionApi.mapper.bindElements( data.item, viewElement );
						viewWriter.insert( viewPosition, viewElement );
					},
					{ priority: 'high' }
				);

				setModelData( document, '<image src="img.png"><caption>Foo bar baz.</caption></image>' );

				expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
					'<figure class="image ck-widget" contenteditable="false"><img src="img.png"></img><span></span>Foo bar baz.</figure>'
				);
			} );
		} );
	} );

	describe( 'inserting image to document', () => {
		it( 'should add caption element if image does not have it', () => {
			const image = new ModelElement( 'image', { src: '', alt: '' } );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.insert( new ModelPosition( document.getRoot(), [ 0 ] ), image );
			} );

			expect( getModelData( document, { withoutSelection: true } ) ).to.equal(
				'<image alt="" src=""><caption></caption></image>'
			);
		} );

		it( 'should not add caption element if image does not have it', () => {
			const caption = new ModelElement( 'caption', null, 'foo bar' );
			const image = new ModelElement( 'image', { src: '', alt: '' }, caption );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.insert( new ModelPosition( document.getRoot(), [ 0 ] ), image );
			} );

			expect( getModelData( document, { withoutSelection: true } ) ).to.equal(
				'<image alt="" src=""><caption>foo bar</caption></image>'
			);
		} );

		it( 'should do nothing for other changes than insert', () => {
			setModelData( document, '<image src=""><caption>foo bar</caption></image>' );
			const image = document.getRoot().getChild( 0 );
			const batch = document.batch();

			document.enqueueChanges( () => {
				batch.setAttribute( image, 'alt', 'alt text' );
			} );

			expect( getModelData( document, { withoutSelection: true } ) ).to.equal(
				'<image alt="alt text" src=""><caption>foo bar</caption></image>'
			);
		} );
	} );

	describe( 'editing view', () => {
		it( 'image should have empty figcaption element when is selected', () => {
			setModelData( document, '[<image src=""><caption></caption></image>]' );

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption contenteditable="true"></figcaption>' +
				'</figure>]'
			);
		} );

		it( 'image should not have empty figcaption element when is not selected', () => {
			setModelData( document, '[]<image src=""><caption></caption></image>' );

			expect( getViewData( viewDocument ) ).to.equal(
				'[]<figure class="image ck-widget" contenteditable="false">' +
					'<img src=""></img>' +
				'</figure>'
			);
		} );

		it( 'should not add additional figcaption if one is already present', () => {
			setModelData( document, '[<image src=""><caption>foo bar</caption></image>]' );

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption contenteditable="true">foo bar</figcaption>' +
				'</figure>]'
			);
		} );

		it( 'should remove figcaption when caption is empty and image is no longer selected', () => {
			setModelData( document, '[<image src=""><caption></caption></image>]' );

			document.enqueueChanges( () => {
				document.selection.removeAllRanges();
			} );

			expect( getViewData( viewDocument ) ).to.equal(
				'[]<figure class="image ck-widget" contenteditable="false">' +
					'<img src=""></img>' +
				'</figure>'
			);
		} );

		it( 'should not remove figcaption when selection is inside it even when it is empty', () => {
			setModelData( document, '<image src=""><caption>[foo bar]</caption></image>' );

			document.enqueueChanges( () => {
				document.batch().remove( document.selection.getFirstRange() );
			} );

			expect( getViewData( viewDocument ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption contenteditable="true">[]</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should not remove figcaption when selection is moved from it to its image', () => {
			setModelData( document, '<image src=""><caption>[foo bar]</caption></image>' );
			const image = document.getRoot().getChild( 0 );

			document.enqueueChanges( () => {
				document.batch().remove( document.selection.getFirstRange() );
				document.selection.setRanges( [ ModelRange.createOn( image ) ] );
			} );

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption contenteditable="true"></figcaption>' +
				'</figure>]'
			);
		} );

		it( 'should not remove figcaption when selection is moved from it to other image', () => {
			setModelData( document, '<image src=""><caption>[foo bar]</caption></image><image src=""><caption></caption></image>' );
			const image = document.getRoot().getChild( 1 );

			document.enqueueChanges( () => {
				document.selection.setRanges( [ ModelRange.createOn( image ) ] );
			} );

			expect( getViewData( viewDocument ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption contenteditable="true">foo bar</figcaption>' +
				'</figure>' +
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption contenteditable="true"></figcaption>' +
				'</figure>]'
			);
		} );
	} );
} );
