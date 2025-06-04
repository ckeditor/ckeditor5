/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import ReplaceImageSourceCommand from '../src/image/replaceimagesourcecommand.js';
import ImageBlockEditing from '../src/image/imageblockediting.js';
import ImageInlineEditing from '../src/image/imageinlineediting.js';
import ImageSizeAttributes from '../src/imagesizeattributes.js';
import ImageResizeEditing from '../src/imageresize/imageresizeediting.js';
import PictureEditing from '../src/pictureediting.js';
import ImageUtils from '../src/imageutils.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageSizeAttributes.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageSizeAttributes.isPremiumPlugin ).to.be.false;
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
						'<p>Lorem <img width="100" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>' +
							'Lorem ' +
							'<imageInline src="/assets/sample.png" width="100"></imageInline>' +
							' ipsum' +
						'</paragraph>'
					);
				} );

				it( 'should upcast height attribute correctly', () => {
					editor.setData(
						'<p>Lorem <img height="50" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>' +
							'Lorem ' +
							'<imageInline height="50" src="/assets/sample.png"></imageInline>' +
							' ipsum' +
						'</paragraph>'
					);
				} );

				it( 'should upcast width & height styles if they both are set', () => {
					editor.setData(
						'<p>Lorem <img style="width:200px;height:100px;" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>' +
							'Lorem ' +
							'<imageInline height="100" src="/assets/sample.png" width="200"></imageInline>' +
							' ipsum' +
						'</paragraph>'
					);
				} );

				it( 'should not upcast width style if height style is missing', () => {
					editor.setData(
						'<p>Lorem <img style="width:200px;" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( editor.model.document.getRoot().getChild( 0 ).getChild( 1 ).getAttribute( 'width' ) ).to.be.undefined;
				} );

				it( 'should not upcast height style if width style is missing', () => {
					editor.setData(
						'<p>Lorem <img style="height:200px;" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( editor.model.document.getRoot().getChild( 0 ).getChild( 1 ).getAttribute( 'height' ) ).to.be.undefined;
				} );

				it( 'should consume aspect-ratio style during upcast when width and height are set', () => {
					const consumeSpy = sinon.spy( ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: [ 'aspect-ratio' ] } ) ).to.be.false;
					} );

					editor.data.upcastDispatcher.on( 'element:img', consumeSpy, { priority: 'lowest' } );
					editor.setData(
						'<p>Lorem <img width="100" height="50" style="aspect-ratio: 2/1;" src="/assets/sample.png"> ipsum</p>'
					);

					expect( consumeSpy ).to.be.called;
				} );

				it( 'should not consume aspect-ratio style during upcast when width or height is missing', () => {
					const consumeSpy = sinon.spy( ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: [ 'aspect-ratio' ] } ) ).to.be.true;
					} );

					editor.data.upcastDispatcher.on( 'element:img', consumeSpy, { priority: 'lowest' } );
					editor.setData(
						'<p>Lorem <img width="100" style="aspect-ratio: 2/1;" src="/assets/sample.png"> ipsum</p>'
					);

					expect( consumeSpy ).to.be.called;
				} );
			} );

			describe( 'block images', () => {
				it( 'should upcast width attribute correctly', () => {
					editor.setData(
						'<figure class="image"><img width="100" src="/assets/sample.png"></figure>'
					);

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock src="/assets/sample.png" width="100"></imageBlock>'
					);
				} );

				it( 'should upcast height attribute correctly', () => {
					editor.setData(
						'<figure class="image"><img height="50" src="/assets/sample.png"></figure>'
					);

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock height="50" src="/assets/sample.png"></imageBlock>'
					);
				} );

				it( 'should upcast width & height styles if they both are set', () => {
					editor.setData(
						'<figure class="image"><img style="width:200px;height:100px;" src="/assets/sample.png"></figure>'
					);

					expect( getData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock height="100" src="/assets/sample.png" width="200"></imageBlock>'
					);
				} );

				it( 'should not upcast width style if height style is missing', () => {
					editor.setData(
						'<figure class="image"><img style="width:200px;" src="/assets/sample.png"></figure>'
					);

					expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'width' ) ).to.be.undefined;
				} );

				it( 'should not upcast height style if width style is missing', () => {
					editor.setData(
						'<figure class="image"><img style="height:200px;" src="/assets/sample.png"></figure>'
					);

					expect( editor.model.document.getRoot().getChild( 0 ).getAttribute( 'height' ) ).to.be.undefined;
				} );

				it( 'should consume aspect-ratio style during upcast when width and height are set', () => {
					const consumeSpy = sinon.spy( ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: [ 'aspect-ratio' ] } ) ).to.be.false;
					} );

					editor.data.upcastDispatcher.on( 'element:img', consumeSpy, { priority: 'lowest' } );
					editor.setData(
						'<figure class="image"><img width="100" height="50" style="aspect-ratio: 2/1;" src="/assets/sample.png"></figure>'
					);

					expect( consumeSpy ).to.be.called;
				} );

				it( 'should not consume aspect-ratio style during upcast when width or height is missing', () => {
					const consumeSpy = sinon.spy( ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: [ 'aspect-ratio' ] } ) ).to.be.true;
					} );

					editor.data.upcastDispatcher.on( 'element:img', consumeSpy, { priority: 'lowest' } );
					editor.setData(
						'<figure class="image"><img height="50" style="aspect-ratio: 2/1;" src="/assets/sample.png"></figure>'
					);

					expect( consumeSpy ).to.be.called;
				} );
			} );
		} );

		describe( 'downcast', () => {
			describe( 'inline images', () => {
				it( 'should downcast width attribute correctly', () => {
					editor.setData(
						'<p>Lorem <img width="100" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>Lorem <span class="ck-widget image-inline" contenteditable="false">' +
							'<img src="/assets/sample.png" width="100"></img>' +
						'</span> ipsum</p>'
					);

					expect( editor.getData() ).to.equal(
						'<p>Lorem <img src="/assets/sample.png" width="100"> ipsum</p>'
					);
				} );

				it( 'should downcast height attribute correctly', () => {
					editor.setData(
						'<p>Lorem <img height="50" src="/assets/sample.png" "> ipsum</p>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>Lorem <span class="ck-widget image-inline" contenteditable="false">' +
							'<img height="50" src="/assets/sample.png"></img>' +
						'</span> ipsum</p>'
					);

					expect( editor.getData() ).to.equal(
						'<p>Lorem <img src="/assets/sample.png" height="50"> ipsum</p>'
					);
				} );

				it( 'should not downcast consumed tokens for width attribute', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher =>
						dispatcher.on( 'attribute:width:imageInline', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:width:imageInline' );
						}, { priority: 'high' } )
					);
					setData( model, '<paragraph><imageInline src="/assets/sample.png" width="100"></imageInline></paragraph>' );

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
					setData( model, '<paragraph><imageInline src="/assets/sample.png" height="50"></imageInline></paragraph>' );

					expect( editor.getData() ).to.equal(
						'<p><img src="/assets/sample.png"></p>'
					);
				} );

				it( 'should remove width attribute properly', () => {
					setData( model, '<paragraph><imageInline src="/assets/sample.png" width="100"></imageInline></paragraph>' );

					const imageModel = editor.model.document.getRoot().getChild( 0 ).getChild( 0 );

					editor.model.change( writer => {
						writer.removeAttribute( 'width', imageModel );
					} );

					expect( editor.getData() )
						.to.equal( '<p><img src="/assets/sample.png"></p>' );
				} );

				it( 'should remove height attribute properly', () => {
					setData( model, '<paragraph><imageInline src="/assets/sample.png" height="50"></imageInline></paragraph>' );

					const imageModel = editor.model.document.getRoot().getChild( 0 ).getChild( 0 );

					editor.model.change( writer => {
						writer.removeAttribute( 'height', imageModel );
					} );

					expect( editor.getData() )
						.to.equal( '<p><img src="/assets/sample.png"></p>' );
				} );

				describe( 'with image resize plugin', () => {
					let editor, view;

					beforeEach( async () => {
						editor = await VirtualTestEditor.create( {
							plugins: [ Paragraph, ImageInlineEditing, PictureEditing, ImageResizeEditing ]
						} );

						view = editor.editing.view;
					} );

					afterEach( async () => {
						await editor.destroy();
					} );

					it( 'should add aspect-ratio if attributes are set and image is resized', () => {
						editor.setData(
							'<p><img class="image_resized" width="100" height="200" style="width:50px" src="/assets/sample.png" "></p>'
						);

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<p><span class="ck-widget image-inline image_resized" contenteditable="false" style="width:50px">' +
								'<img height="200" loading="lazy" src="/assets/sample.png" style="aspect-ratio:100/200" width="100">' +
								'</img>' +
							'</span></p>'
						);

						expect( editor.getData() ).to.equal(
							'<p><img class="image_resized" style="aspect-ratio:100/200;width:50px;" ' +
								'src="/assets/sample.png" width="100" height="200"></p>'
						);
					} );

					it( 'should add aspect-ratio if attributes are set but image is not resized (but to editing view only)', () => {
						editor.setData(
							'<p><img class="image_resized" width="100" height="200" src="/assets/sample.png" "></p>'
						);

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<p><span class="ck-widget image-inline" contenteditable="false">' +
								'<img height="200" loading="lazy" src="/assets/sample.png" style="aspect-ratio:100/200" width="100">' +
								'</img>' +
							'</span></p>'
						);

						expect( editor.getData() ).to.equal(
							'<p><img src="/assets/sample.png" width="100" height="200"></p>'
						);
					} );

					it( 'should not add aspect-ratio if it is a picture', () => {
						editor.setData(
							'<p>' +
								'<picture>' +
									'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</p>'
						);

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<p>' +
								'<span class="ck-widget image-inline" contenteditable="false">' +
									'<picture>' +
										'<source media="(min-width: 800px)" sizes="2000px" srcset="/assets/sample.png" type="image/png">' +
										'</source>' +
										'<img src="/assets/sample.png"></img>' +
									'</picture>' +
								'</span>' +
							'</p>'
						);

						expect( editor.getData() ).to.equal(
							'<p>' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(min-width: 800px)" type="image/png" sizes="2000px">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</p>'
						);
					} );

					it( 'should not add aspect-ratio if it is a picture and image has width and height set', () => {
						editor.setData(
							'<p>' +
								'<picture>' +
									'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
									'<img width="100" height="200" src="/assets/sample.png">' +
								'</picture>' +
							'</p>'
						);

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<p>' +
								'<span class="ck-widget image-inline" contenteditable="false">' +
									'<picture>' +
										'<source media="(min-width: 800px)" sizes="2000px" srcset="/assets/sample.png" type="image/png">' +
										'</source>' +
										'<img height="200" loading="lazy" src="/assets/sample.png" width="100"></img>' +
									'</picture>' +
								'</span>' +
							'</p>'
						);

						expect( editor.getData() ).to.equal(
							'<p>' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(min-width: 800px)" type="image/png" sizes="2000px">' +
									'<img src="/assets/sample.png" width="100" height="200">' +
								'</picture>' +
							'</p>'
						);
					} );
				} );
			} );

			describe( 'block images', () => {
				it( 'should downcast width attribute correctly', () => {
					editor.setData(
						'<figure class="image"><img width="100" src="/assets/sample.png"></figure>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false">' +
							'<img src="/assets/sample.png" width="100"></img>' +
						'</figure>'
					);

					expect( editor.getData() ).to.equal(
						'<figure class="image"><img src="/assets/sample.png" width="100"></figure>'
					);
				} );

				it( 'should downcast height attribute correctly', () => {
					editor.setData(
						'<figure class="image"><img height="50" src="/assets/sample.png"></figure>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false">' +
							'<img height="50" src="/assets/sample.png"></img>' +
						'</figure>'
					);

					expect( editor.getData() ).to.equal(
						'<figure class="image"><img src="/assets/sample.png" height="50"></figure>'
					);
				} );

				it( 'should not downcast consumed tokens for width attribute', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher =>
						dispatcher.on( 'attribute:width:imageBlock', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, 'attribute:width:imageBlock' );
						}, { priority: 'high' } )
					);
					setData( model, '<imageBlock src="/assets/sample.png" width="100"></imageBlock>' );

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
					setData( model, '<imageBlock src="/assets/sample.png" width="100"></imageBlock>' );

					const imageModel = editor.model.document.getRoot().getChild( 0 );

					editor.model.change( writer => {
						writer.removeAttribute( 'width', imageModel );
					} );

					expect( editor.getData() )
						.to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
				} );

				it( 'should remove height attribute properly', () => {
					setData( model, '<imageBlock src="/assets/sample.png" height="50"></imageBlock>' );

					const imageModel = editor.model.document.getRoot().getChild( 0 );

					editor.model.change( writer => {
						writer.removeAttribute( 'height', imageModel );
					} );

					expect( editor.getData() )
						.to.equal( '<figure class="image"><img src="/assets/sample.png"></figure>' );
				} );

				describe( 'with image resize plugin', () => {
					let editor, view;

					beforeEach( async () => {
						editor = await VirtualTestEditor.create( {
							plugins: [ Paragraph, ImageBlockEditing, PictureEditing, ImageResizeEditing ]
						} );

						view = editor.editing.view;
					} );

					afterEach( async () => {
						await editor.destroy();
					} );

					it( 'should add aspect-ratio if attributes are set and image is resized', () => {
						editor.setData(
							'<figure class="image" style="width: 50px;"><img width="100" height="200" src="/assets/sample.png"></figure>'
						);

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<figure class="ck-widget image image_resized" contenteditable="false" style="width:50px">' +
								'<img height="200" loading="lazy" src="/assets/sample.png" style="aspect-ratio:100/200" width="100">' +
								'</img>' +
							'</figure>'
						);

						expect( editor.getData() ).to.equal(
							'<figure class="image image_resized" style="width:50px;">' +
								'<img style="aspect-ratio:100/200;" src="/assets/sample.png" width="100" height="200">' +
							'</figure>'
						);
					} );

					it( 'should add aspect-ratio if attributes are set but image is not resized', () => {
						editor.setData(
							'<figure class="image"><img width="100" height="200" src="/assets/sample.png"></figure>'
						);

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<figure class="ck-widget image" contenteditable="false">' +
								'<img height="200" loading="lazy" src="/assets/sample.png" style="aspect-ratio:100/200" width="100">' +
								'</img>' +
							'</figure>'
						);

						expect( editor.getData() ).to.equal(
							'<figure class="image">' +
								'<img style="aspect-ratio:100/200;" src="/assets/sample.png" width="100" height="200">' +
							'</figure>'
						);
					} );

					it( 'should not add aspect-ratio if it is a picture', () => {
						editor.setData(
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 800px)" type="image/png">' +
									'<img src="/assets/sample.png" alt="">' +
								'</picture>' +
							'</figure>'
						);

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<figure class="ck-widget image" contenteditable="false">' +
								'<picture>' +
									'<source media="(max-width: 800px)" srcset="/assets/sample.png" type="image/png"></source>' +
									'<img alt="" src="/assets/sample.png"></img>' +
								'</picture>' +
							'</figure>'
						);

						expect( editor.getData() ).to.equal(
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 800px)" type="image/png">' +
									'<img src="/assets/sample.png" alt="">' +
								'</picture>' +
							'</figure>'
						);
					} );

					it( 'should not add aspect-ratio if it is a picture and image has width and height set', () => {
						editor.setData(
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 800px)" type="image/png">' +
									'<img width="100" height="200" src="/assets/sample.png" alt="">' +
								'</picture>' +
							'</figure>'
						);

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<figure class="ck-widget image" contenteditable="false">' +
								'<picture>' +
									'<source media="(max-width: 800px)" srcset="/assets/sample.png" type="image/png"></source>' +
									'<img alt="" height="200" loading="lazy" src="/assets/sample.png" width="100"></img>' +
								'</picture>' +
							'</figure>'
						);

						expect( editor.getData() ).to.equal(
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 800px)" type="image/png">' +
									'<img src="/assets/sample.png" alt="" width="100" height="200">' +
								'</picture>' +
							'</figure>'
						);
					} );
				} );
			} );
		} );

		it( 'should set aspect-ration on replaced image', done => {
			const imageUtils = editor.plugins.get( 'ImageUtils' );
			const command = new ReplaceImageSourceCommand( editor );

			setData( model, `[<imageBlock
				src="foo/bar.jpg"
				width="100"
				height="200"
			></imageBlock>]` );

			const element = model.document.selection.getSelectedElement();
			const viewElement = editor.editing.mapper.toViewElement( element );
			const img = imageUtils.findViewImgElement( viewElement );

			expect( img.getStyle( 'aspect-ratio' ) ).to.equal( '100/200' );

			command.execute( { source: '/assets/sample.png' } );

			setTimeout( () => {
				expect( img.getStyle( 'aspect-ratio' ) ).to.equal( '96/96' );
				done();
			}, 100 );
		} );
	} );
} );
