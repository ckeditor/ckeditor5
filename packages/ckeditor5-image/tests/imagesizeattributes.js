/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ImageBlockEditing from '../src/image/imageblockediting';
import ImageInlineEditing from '../src/image/imageinlineediting';
import ImageSizeAttributes from '../src/imagesizeattributes';
import ImageUtils from '../src/imageutils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'ImageSizeAttributes', () => {
	let editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, ImageBlockEditing, ImageInlineEditing, ImageSizeAttributes ]
		} );

		model = editor.model;
		view = editor.editing.view;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( ImageSizeAttributes.pluginName ).to.equal( 'ImageSizeAttributes' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageSizeAttributes ) ).to.be.instanceOf( ImageSizeAttributes );
	} );

	it( 'should require ImageUtils', () => {
		expect( ImageSizeAttributes.requires ).to.have.members( [ ImageUtils ] );
	} );

	describe( 'schema', () => {
		it( 'should allow the "width" and "height" attributes on the imageBlock element', () => {
			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'width' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'height' ) ).to.be.true;
		} );

		it( 'should allow the "width" and "height" attributes on the imageInline element', () => {
			expect( model.schema.checkAttribute( [ '$root', 'imageInline' ], 'width' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', 'imageInline' ], 'height' ) ).to.be.true;
		} );
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
			describe( 'inline images', () => {
				it( 'should upcast width attribute correctly', () => {
					editor.setData(
						'<p>Lorem <img width="100px" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>' +
							'Lorem ' +
							'<imageInline src="/assets/sample.png" width="100px"></imageInline>' +
							' ipsum' +
						'</paragraph>'
					);
				} );

				it( 'should upcast height attribute correctly', () => {
					editor.setData(
						'<p>Lorem <img height="50px" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>' +
							'Lorem ' +
							'<imageInline height="50px" src="/assets/sample.png"></imageInline>' +
							' ipsum' +
						'</paragraph>'
					);
				} );
			} );

			describe( 'block images', () => {
				it( 'should upcast width attribute correctly', () => {
					editor.setData(
						'<figure class="image"><img width="100px" src="/assets/sample.png"></figure>'
					);

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock src="/assets/sample.png" width="100px"></imageBlock>'
					);
				} );

				it( 'should upcast height attribute correctly', () => {
					editor.setData(
						'<figure class="image"><img height="50px" src="/assets/sample.png"></figure>'
					);

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock height="50px" src="/assets/sample.png"></imageBlock>'
					);
				} );
			} );
		} );

		describe( 'downcast', () => {
			describe( 'inline images', () => {
				it( 'should downcast width attribute correctly', () => {
					editor.setData(
						'<p>Lorem <img width="100px" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>Lorem <span class="ck-widget image-inline" contenteditable="false">' +
							'<img src="/assets/sample.png" width="100px"></img>' +
						'</span> ipsum</p>'
					);

					expect( editor.getData() ).to.equal(
						'<p>Lorem <img src="/assets/sample.png" width="100px"> ipsum</p>'
					);
				} );

				it( 'should downcast height attribute correctly', () => {
					editor.setData(
						'<p>Lorem <img height="50px" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>Lorem <span class="ck-widget image-inline" contenteditable="false">' +
							'<img height="50px" src="/assets/sample.png"></img>' +
						'</span> ipsum</p>'
					);

					expect( editor.getData() ).to.equal(
						'<p>Lorem <img src="/assets/sample.png" height="50px"> ipsum</p>'
					);
				} );

				it( 'should not downcast consumed tokens for width attribute', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher =>
						dispatcher.on( 'attribute:width:imageInline', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:width:imageInline' );
						}, { priority: 'high' } )
					);
					setData( model, '<paragraph><imageInline src="/assets/sample.png" width="100px"></imageInline></paragraph>' );

					expect( editor.getData() ).to.equal(
						'<p><img src="/assets/sample.png"></p>'
					);
				} );

				it( 'should not downcast consumed tokens for height attribute', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher =>
						dispatcher.on( 'attribute:height:imageInline', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:height:imageInline' );
						}, { priority: 'high' } )
					);
					setData( model, '<paragraph><imageInline src="/assets/sample.png" height="50px"></imageInline></paragraph>' );

					expect( editor.getData() ).to.equal(
						'<p><img src="/assets/sample.png"></p>'
					);
				} );

				it( 'should remove width attribute properly', () => {
					setData( model, '<paragraph><imageInline src="/assets/sample.png" width="100px"></imageInline></paragraph>' );

					const imageModel = editor.model.document.getRoot().getChild( 0 ).getChild( 0 );

					editor.model.change( writer => {
						writer.removeAttribute( 'width', imageModel );
					} );

					expect( editor.getData() )
						.to.equal( '<p><img src="/assets/sample.png"></p>' );
				} );

				it( 'should remove height attribute properly', () => {
					setData( model, '<paragraph><imageInline src="/assets/sample.png" height="50px"></imageInline></paragraph>' );

					const imageModel = editor.model.document.getRoot().getChild( 0 ).getChild( 0 );

					editor.model.change( writer => {
						writer.removeAttribute( 'height', imageModel );
					} );

					expect( editor.getData() )
						.to.equal( '<p><img src="/assets/sample.png"></p>' );
				} );
			} );

			describe( 'block images', () => {
				it( 'should downcast width attribute correctly', () => {
					editor.setData(
						'<figure class="image"><img width="100px" src="/assets/sample.png"></figure>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false">' +
							'<img src="/assets/sample.png" width="100px"></img>' +
						'</figure>'
					);

					expect( editor.getData() ).to.equal(
						'<figure class="image"><img src="/assets/sample.png" width="100px"></figure>'
					);
				} );

				it( 'should downcast height attribute correctly', () => {
					editor.setData(
						'<figure class="image"><img height="50px" src="/assets/sample.png"></figure>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false">' +
							'<img height="50px" src="/assets/sample.png"></img>' +
						'</figure>'
					);

					expect( editor.getData() ).to.equal(
						'<figure class="image"><img src="/assets/sample.png" height="50px"></figure>'
					);
				} );

				it( 'should not downcast consumed tokens for width attribute', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher =>
						dispatcher.on( 'attribute:width:imageBlock', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:width:imageBlock' );
						}, { priority: 'high' } )
					);
					setData( model, '<imageBlock src="/assets/sample.png" width="100px"></imageBlock>' );

					expect( editor.getData() ).to.equal(
						'<figure class="image"><img src="/assets/sample.png"></figure>'
					);
				} );

				it( 'should not downcast consumed tokens for height attribute', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher =>
						dispatcher.on( 'attribute:height:imageBlock', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:height:imageBlock' );
						}, { priority: 'high' } )
					);
					setData( model, '<imageBlock src="/assets/sample.png" height="50px"></imageBlock>' );

					expect( editor.getData() ).to.equal(
						'<figure class="image"><img src="/assets/sample.png"></figure>'
					);
				} );

				it( 'should remove width attribute properly', () => {
					setData( model, '<imageBlock src="/assets/sample.png" width="100px"></imageBlock>' );

					const imageModel = editor.model.document.getRoot().getChild( 0 );

					editor.model.change( writer => {
						writer.removeAttribute( 'width', imageModel );
					} );

					expect( editor.getData() )
						.to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
				} );

				it( 'should remove height attribute properly', () => {
					setData( model, '<imageBlock src="/assets/sample.png" height="50px"></imageBlock>' );

					const imageModel = editor.model.document.getRoot().getChild( 0 );

					editor.model.change( writer => {
						writer.removeAttribute( 'height', imageModel );
					} );

					expect( editor.getData() )
						.to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
				} );
			} );
		} );
	} );
} );
