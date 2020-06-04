/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import LinkImageEditing from '../src/linkimageediting';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting';

describe( 'LinkImageEditing', () => {
	let editor, model, view;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, LinkImageEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( LinkImageEditing.pluginName ).to.equal( 'LinkImageEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( LinkImageEditing ) ).to.be.instanceOf( LinkImageEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'image' ], 'linkHref' ) ).to.be.true;
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert an image with a link', () => {
				setModelData( model, '<image src="/assets/sample.png" alt="alt text" linkHref="http://ckeditor.com"></image>' );

				expect( editor.getData() ).to.equal(
					'<figure class="image"><a href="http://ckeditor.com"><img alt="alt text" src="/assets/sample.png"></a></figure>'
				);
			} );

			it( 'should convert an image with a link and without alt attribute', () => {
				setModelData( model, '<image src="/assets/sample.png" linkHref="http://ckeditor.com"></image>' );

				expect( editor.getData() ).to.equal(
					'<figure class="image"><a href="http://ckeditor.com"><img src="/assets/sample.png"></a></figure>'
				);
			} );

			it( 'should convert srcset attribute to srcset and sizes attribute wrapped into a link', () => {
				setModelData( model,
					'<image src="/assets/sample.png" ' +
						'linkHref="http://ckeditor.com" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w" }\'>' +
					'</image>'
				);

				expect( normalizeHtml( editor.getData() ) ).to.equal(
					'<figure class="image">' +
						'<a href="http://ckeditor.com">' +
							'<img sizes="100vw" src="/assets/sample.png" srcset="small.png 148w, big.png 1024w"></img>' +
						'</a>' +
					'</figure>'
				);
			} );
		} );

		describe( 'view to model', () => {
			describe( 'figure > a > img', () => {
				it( 'should convert a link in an image figure', () => {
					editor.setData(
						'<figure class="image"><a href="http://ckeditor.com"><img src="/assets/sample.png" alt="alt text" /></a></figure>'
					);

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<image alt="alt text" linkHref="http://ckeditor.com" src="/assets/sample.png"></image>' );
				} );

				it( 'should convert an image with a link and without alt attribute', () => {
					editor.setData( '<figure class="image"><a href="http://ckeditor.com"><img src="/assets/sample.png" /></a></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<image linkHref="http://ckeditor.com" src="/assets/sample.png"></image>' );
				} );

				it( 'should not convert without src attribute', () => {
					editor.setData( '<figure class="image"><a href="http://ckeditor.com"><img alt="alt text" /></a></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<paragraph></paragraph>' );
				} );

				it( 'should not convert in wrong context', () => {
					model.schema.register( 'div', { inheritAllFrom: '$block' } );
					model.schema.addChildCheck( ( ctx, childDef ) => {
						if ( ctx.endsWith( '$root' ) && childDef.name == 'image' ) {
							return false;
						}
					} );

					editor.conversion.elementToElement( { model: 'div', view: 'div' } );

					editor.setData(
						'<div>' +
							'<figure class="image">' +
								'<a href="http://ckeditor.com">' +
									'<img src="/assets/sample.png" alt="alt text" />' +
								'</a>' +
							'</figure>' +
						'</div>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<div></div>' );
				} );

				it( 'should not convert "a" element if is already consumed', () => {
					editor.data.upcastDispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.viewItem, { attributes: [ 'href' ] } );
					}, { priority: 'highest' } );

					editor.setData(
						'<figure class="image"><a href="http://ckeditor.com"><img src="/assets/sample.png" alt="alt text" /></a></figure>'
					);

					expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png" alt="alt text"></figure>' );
				} );

				it( 'should not convert if a link misses "href" attribute', () => {
					editor.setData(
						'<figure class="image"><a href=""><img src="/assets/sample.png" alt="alt text" /></a></figure>'
					);

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<image alt="alt text" src="/assets/sample.png"></image>' );
				} );

				it( 'should convert a link without an image to a paragraph with the link', () => {
					editor.setData(
						'<figure class="image"><a href="http://ckeditor.com">Foo</a></figure>'
					);

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<paragraph><$text linkHref="http://ckeditor.com">Foo</$text></paragraph>' );
				} );
			} );

			describe( 'a > img', () => {
				it( 'should convert a link in an image figure', () => {
					editor.setData(
						'<a href="http://ckeditor.com"><img src="/assets/sample.png" alt="alt text" /></a>'
					);

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<image alt="alt text" linkHref="http://ckeditor.com" src="/assets/sample.png"></image>' );
				} );

				it( 'should convert an image with a link and without alt attribute', () => {
					editor.setData( '<a href="http://ckeditor.com"><img src="/assets/sample.png" /></a>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<image linkHref="http://ckeditor.com" src="/assets/sample.png"></image>' );
				} );

				it( 'should not convert without src attribute', () => {
					editor.setData( '<a href="http://ckeditor.com"><img alt="alt text" /></a>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<paragraph></paragraph>' );
				} );

				it( 'should not convert in wrong context', () => {
					model.schema.register( 'div', { inheritAllFrom: '$block' } );
					model.schema.addChildCheck( ( ctx, childDef ) => {
						if ( ctx.endsWith( '$root' ) && childDef.name == 'image' ) {
							return false;
						}
					} );

					editor.conversion.elementToElement( { model: 'div', view: 'div' } );

					editor.setData(
						'<div>' +
							'<a href="http://ckeditor.com">' +
								'<img src="/assets/sample.png" alt="alt text" />' +
							'</a>' +
						'</div>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<div></div>' );
				} );

				it( 'should not convert "a" element if is already consumed', () => {
					editor.data.upcastDispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.viewItem, { attributes: [ 'href' ] } );
					}, { priority: 'highest' } );

					editor.setData(
						'<a href="http://ckeditor.com"><img src="/assets/sample.png" alt="alt text" /></a>'
					);

					expect( editor.getData() ).to.equal( '<figure class="image"><img src="/assets/sample.png" alt="alt text"></figure>' );
				} );

				it( 'should not convert if a link misses "href" attribute', () => {
					editor.setData(
						'<a href=""><img src="/assets/sample.png" alt="alt text" /></a>'
					);

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<image alt="alt text" src="/assets/sample.png"></image>' );
				} );
			} );

			describe( 'figure > a > img + figcaption', () => {
				it( 'should convert a link and the caption element', () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, LinkImageEditing, ImageCaptionEditing ]
						} )
						.then( editor => {
							editor.setData(
								'<figure class="image">' +
									'<a href="http://ckeditor.com">' +
										'<img src="/assets/sample.png" alt="alt text" />' +
									'</a>' +
									'<figcaption>' +
										'Foo Bar.' +
									'</figcaption>' +
								'</figure>'
							);

							expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
								'<image alt="alt text" linkHref="http://ckeditor.com" src="/assets/sample.png">' +
									'<caption>Foo Bar.</caption>' +
								'</image>'
							);

							return editor.destroy();
						} );
				} );
			} );
		} );
	} );

	describe( 'conversion in editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert the image element', () => {
				setModelData( model, '<image linkHref="http://ckeditor.com" src="/assets/sample.png" alt="alt text"></image>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<a href="http://ckeditor.com">' +
							'<img alt="alt text" src="/assets/sample.png"></img>' +
						'</a>' +
					'</figure>'
				);
			} );

			it( 'should convert attribute change', () => {
				setModelData( model, '<image linkHref="http://ckeditor.com" src="/assets/sample.png" alt="alt text"></image>' );
				const image = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'linkHref', 'https://ckeditor.com/why-ckeditor/', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<a href="https://ckeditor.com/why-ckeditor/">' +
							'<img alt="alt text" src="/assets/sample.png"></img>' +
						'</a>' +
					'</figure>'
				);
			} );

			it( 'should convert attribute removal', () => {
				setModelData( model, '<image linkHref="http://ckeditor.com" src="/assets/sample.png" alt="alt text"></image>' );
				const image = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'linkHref', image );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</figure>'
				);
			} );
		} );
	} );
} );
