/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageCaptioningEngine from '../../src/imagecaptioning/imagecaptioningengine';
import ImageEngine from '../../src/imageengine';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';

describe( 'ImageCaptioningEngine', () => {
	let editor, document, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ ImageCaptioningEngine, ImageEngine ]
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
		expect( editor.plugins.get( ImageCaptioningEngine ) ).to.be.instanceOf( ImageCaptioningEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( document.schema.check( { name: 'caption', iniside: 'image' } ) ).to.be.true;
		expect( document.schema.check( { name: '$inline', inside: 'caption' } ) ).to.be.true;
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
} );
