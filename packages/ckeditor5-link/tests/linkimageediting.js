/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import LinkImageEditing from '../src/linkimageediting';
import LinkEditing from '../src/linkediting';

describe( 'LinkImageEditing', () => {
	let editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ImageBlockEditing, LinkImageEditing ]
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

	it( 'should set proper schema rules for image style when ImageBlock plugin is enabled', async () => {
		const newEditor = await VirtualTestEditor.create( {
			plugins: [ ImageBlockEditing, LinkImageEditing ]
		} );

		expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'linkHref' ) ).to.be.true;

		await newEditor.destroy();
	} );

	it( 'should set proper schema rules for image style when ImageInline plugin is enabled', async () => {
		const newEditor = await VirtualTestEditor.create( {
			plugins: [ ImageInlineEditing, LinkImageEditing ]
		} );

		expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'linkHref' ) ).to.be.true;

		await newEditor.destroy();
	} );

	it( 'should require ImageEditing by name', () => {
		expect( LinkImageEditing.requires ).to.include( 'ImageEditing' );
	} );

	it( 'should require ImageUtils by name', () => {
		expect( LinkImageEditing.requires ).to.include( 'ImageUtils' );
	} );

	it( 'should require LinkEditing', () => {
		expect( LinkImageEditing.requires ).to.include( LinkEditing );
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to data', () => {
			it( 'should convert an image with a link', () => {
				setModelData( model, '<imageBlock src="/assets/sample.png" alt="alt text" linkHref="http://ckeditor.com"></imageBlock>' );

				expect( editor.getData() ).to.equal(
					'<figure class="image"><a href="http://ckeditor.com"><img alt="alt text" src="/assets/sample.png"></a></figure>'
				);
			} );

			it( 'should convert an image with a link and without alt attribute', () => {
				setModelData( model, '<imageBlock src="/assets/sample.png" linkHref="http://ckeditor.com"></imageBlock>' );

				expect( editor.getData() ).to.equal(
					'<figure class="image"><a href="http://ckeditor.com"><img src="/assets/sample.png"></a></figure>'
				);
			} );

			it( 'should convert srcset attribute to srcset and sizes attribute wrapped into a link', () => {
				setModelData( model,
					'<imageBlock src="/assets/sample.png" ' +
						'linkHref="http://ckeditor.com" ' +
						'srcset=\'{ "data": "small.png 148w, big.png 1024w" }\'>' +
					'</imageBlock>'
				);

				expect( normalizeHtml( editor.getData() ) ).to.equal(
					'<figure class="image">' +
						'<a href="http://ckeditor.com">' +
							'<img sizes="100vw" src="/assets/sample.png" srcset="small.png 148w, big.png 1024w"></img>' +
						'</a>' +
					'</figure>'
				);
			} );

			it( 'should be overridable', () => {
				const spy = sinon.spy();

				editor.data.downcastDispatcher.on( 'attribute:linkHref:imageBlock', ( evt, data, { consumable } ) => {
					consumable.consume( data.item, evt.name );

					spy();
				}, { priority: 'highest' } );

				setModelData( model, '<imageBlock src="/assets/sample.png" alt="alt text" linkHref="http://ckeditor.com"></imageBlock>' );

				expect( editor.getData() ).to.equal(
					'<figure class="image"><img alt="alt text" src="/assets/sample.png"></figure>'
				);
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'should convert a link containing an inline image as a single anchor element in data', async () => {
				const editor = await VirtualTestEditor.create( {
					plugins: [ Paragraph, ImageInlineEditing, LinkImageEditing ]
				} );
				const model = editor.model;

				setModelData( model,
					'<paragraph>' +
						'<$text linkhref="http://ckeditor.com">foo </$text>' +
						'<imageInline src="/assets/sample.png" alt="alt text" linkHref="http://ckeditor.com"></imageInline>' +
						'<$text linkhref="http://ckeditor.com"> bar</$text>' +
					'</paragraph>'
				);

				expect( editor.getData() ).to.equal(
					'<p>foo <a href="http://ckeditor.com"><img alt="alt text" src="/assets/sample.png"></a>bar</p>'
				);

				return editor.destroy();
			} );

			it( 'should convert a linked block image that uses <picture> element internally', async () => {
				const editor = await VirtualTestEditor.create( {
					plugins: [ Paragraph, ImageBlockEditing, LinkImageEditing, PictureEditing ]
				} );
				const model = editor.model;

				setModelData( model,
					'<imageBlock src="/assets/sample.png" ' +
						'linkHref="http://ckeditor.com" ' +
						'sources=\'[ { "srcset": "small.png" } ]\'>' +
					'</imageBlock>'
				);

				expect( editor.getData() ).to.equal(
					'<figure class="image">' +
						'<a href="http://ckeditor.com">' +
							'<picture>' +
								'<source srcset="small.png">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
						'</a>' +
					'</figure>'
				);

				await editor.destroy();
			} );

			it( 'should convert a linked inline image that uses <picture> element internally', async () => {
				const editor = await VirtualTestEditor.create( {
					plugins: [ Paragraph, ImageInlineEditing, LinkImageEditing, PictureEditing ]
				} );
				const model = editor.model;

				setModelData( model,
					'<paragraph>' +
						'<$text linkhref="http://ckeditor.com">foo</$text>' +
						'<imageInline ' +
							'src="/assets/sample.png" ' +
							'alt="alt text" ' +
							'sources=\'[ { "srcset": "small.png" } ]\' ' +
							'linkHref="http://ckeditor.com">' +
						'</imageInline>' +
						'<$text linkhref="http://ckeditor.com">bar</$text>' +
					'</paragraph>'
				);

				expect( editor.getData() ).to.equal(
					'<p>' +
						'foo' +
						'<a href="http://ckeditor.com">' +
							'<picture><source srcset="small.png"><img alt="alt text" src="/assets/sample.png"></picture>' +
						'</a>' +
						'bar' +
					'</p>'
				);

				await editor.destroy();
			} );
		} );

		describe( 'view to model', () => {
			describe( 'figure > a > img', () => {
				it( 'should convert a link in an image figure', () => {
					editor.setData(
						'<figure class="image"><a href="http://ckeditor.com"><img src="/assets/sample.png" alt="alt text" /></a></figure>'
					);

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<imageBlock alt="alt text" linkHref="http://ckeditor.com" src="/assets/sample.png"></imageBlock>' );
				} );

				it( 'should convert an image with a link and without alt attribute', () => {
					editor.setData( '<figure class="image"><a href="http://ckeditor.com"><img src="/assets/sample.png" /></a></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<imageBlock linkHref="http://ckeditor.com" src="/assets/sample.png"></imageBlock>' );
				} );

				it( 'should convert without src attribute', () => {
					editor.setData( '<figure class="image"><a href="http://ckeditor.com"><img alt="alt text" /></a></figure>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<imageBlock alt="alt text" linkHref="http://ckeditor.com"></imageBlock>' );
				} );

				it( 'should not convert in wrong context', () => {
					model.schema.register( 'div', { inheritAllFrom: '$block' } );
					model.schema.addChildCheck( ( ctx, childDef ) => {
						if ( ctx.endsWith( '$root' ) && childDef.name == 'imageBlock' ) {
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
						.to.equal( '<imageBlock alt="alt text" src="/assets/sample.png"></imageBlock>' );
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
				it( 'should convert an image surrounded by a link', () => {
					editor.setData(
						'<a href="http://ckeditor.com"><img src="/assets/sample.png" alt="alt text" /></a>'
					);

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<imageBlock alt="alt text" linkHref="http://ckeditor.com" src="/assets/sample.png"></imageBlock>' );
				} );

				it( 'should convert an image surrounded by a link without alt attribute', () => {
					editor.setData( '<a href="http://ckeditor.com"><img src="/assets/sample.png" /></a>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<imageBlock linkHref="http://ckeditor.com" src="/assets/sample.png"></imageBlock>' );
				} );

				it( 'should convert an image surrounded by a link without src attribute', () => {
					editor.setData( '<a href="http://ckeditor.com"><img alt="alt text" /></a>' );

					expect( getModelData( model, { withoutSelection: true } ) )
						.to.equal( '<imageBlock alt="alt text" linkHref="http://ckeditor.com"></imageBlock>' );
				} );

				it( 'should not convert in wrong context', () => {
					model.schema.register( 'div', { inheritAllFrom: '$block' } );
					model.schema.addChildCheck( ( ctx, childDef ) => {
						if ( ctx.endsWith( '$root' ) && childDef.name == 'imageBlock' ) {
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
						.to.equal( '<imageBlock alt="alt text" src="/assets/sample.png"></imageBlock>' );
				} );

				it( 'should not convert an image surrounded by a link to a linked block image' +
					'when the ImageInline plugin is loaded', async () => {
					const editor = await VirtualTestEditor.create( {
						plugins: [ Paragraph, ImageBlockEditing, ImageInlineEditing, LinkImageEditing ]
					} );
					const model = editor.model;

					editor.setData(
						'<a href="http://ckeditor.com"><img src="/assets/sample.png" alt="alt text" /></a>'
					);

					// If ImageInline is loaded, then ☝️ should be a plain linked inline image in the editor.
					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>' +
							'<imageInline alt="alt text" linkHref="http://ckeditor.com" src="/assets/sample.png"></imageInline>' +
						'</paragraph>'
					);

					await editor.destroy();
				} );
			} );

			describe( 'figure > a > img + figcaption', () => {
				it( 'should convert a link and the caption element', () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, ImageBlockEditing, LinkImageEditing, ImageCaptionEditing ]
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
								'<imageBlock alt="alt text" linkHref="http://ckeditor.com" src="/assets/sample.png">' +
									'<caption>Foo Bar.</caption>' +
								'</imageBlock>'
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
				setModelData( model, '<imageBlock linkHref="http://ckeditor.com" src="/assets/sample.png" alt="alt text"></imageBlock>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<a href="http://ckeditor.com">' +
							'<img alt="alt text" src="/assets/sample.png"></img>' +
						'</a>' +
					'</figure>'
				);
			} );

			it( 'should convert attribute change', () => {
				setModelData( model, '<imageBlock linkHref="http://ckeditor.com" src="/assets/sample.png" alt="alt text"></imageBlock>' );
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
				setModelData( model, '<imageBlock linkHref="http://ckeditor.com" src="/assets/sample.png" alt="alt text"></imageBlock>' );
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

			it( 'should be overridable', () => {
				const spy = sinon.spy();

				editor.editing.downcastDispatcher.on( 'attribute:linkHref:imageBlock', ( evt, data, { consumable } ) => {
					consumable.consume( data.item, evt.name );

					spy();
				}, { priority: 'highest' } );

				setModelData( model, '<imageBlock linkHref="http://ckeditor.com" src="/assets/sample.png" alt="alt text"></imageBlock>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img alt="alt text" src="/assets/sample.png"></img>' +
					'</figure>'
				);
				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'should link a text including an inline image as a single anchor element', async () => {
				const editor = await VirtualTestEditor.create( {
					plugins: [ Paragraph, ImageInlineEditing, LinkImageEditing ]
				} );
				const model = editor.model;

				setModelData( model,
					'<paragraph>[foo<imageInline src="/assets/sample.png" alt="alt text"></imageInline>bar]</paragraph>'
				);

				editor.execute( 'link', 'https://cksource.com' );

				expect( getViewData( editor.editing.view ) ).to.equal(
					'<p>' +
						'[<a class="ck-link_selected" href="https://cksource.com">' +
							'foo<span class="ck-widget image-inline" contenteditable="false">' +
								'<img alt="alt text" src="/assets/sample.png"></img>' +
							'</span>bar' +
						'</a>]' +
					'</p>'
				);

				return editor.destroy();
			} );
		} );

		describe( 'figure > a > img + span + figcaption', () => {
			it( 'should convert a link and the caption element', () => {
				return VirtualTestEditor
					.create( {
						plugins: [ Paragraph, ImageBlockEditing, LinkImageEditing, ImageCaptionEditing ]
					} )
					.then( editor => {
						setModelData( editor.model,
							'<imageBlock linkHref="http://ckeditor.com" src="/assets/sample.png" alt="alt text">' +
								'<caption>Foo Bar.</caption>' +
							'</imageBlock>'
						);

						expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
							'<figure class="ck-widget image" contenteditable="false">' +
								'<a href="http://ckeditor.com">' +
									'<img alt="alt text" src="/assets/sample.png"></img>' +
								'</a>' +
								'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
									'contenteditable="true" data-placeholder="Enter image caption">' +
										'Foo Bar.' +
								'</figcaption>' +
							'</figure>'
						);
						return editor.destroy();
					} );
			} );
		} );
	} );

	describe( 'link attributes decorator', () => {
		describe( 'default behavior', () => {
			const testLinks = [
				{
					external: true,
					url: 'http://example.com'
				}, {
					external: true,
					url: 'https://cksource.com'
				}, {
					external: false,
					url: 'ftp://server.io'
				}, {
					external: true,
					url: '//schemaless.org'
				}, {
					external: false,
					url: 'www.ckeditor.com'
				}, {
					external: false,
					url: '/relative/url.html'
				}, {
					external: false,
					url: 'another/relative/url.html'
				}, {
					external: false,
					url: '#anchor'
				}, {
					external: false,
					url: 'mailto:some@user.org'
				}, {
					external: false,
					url: 'tel:123456789'
				}
			];

			describe( 'for link.addTargetToExternalLinks=false', () => {
				let editor, model;

				beforeEach( async () => {
					editor = await VirtualTestEditor.create( {
						plugins: [ Paragraph, ImageBlockEditing, LinkImageEditing ],
						link: {
							addTargetToExternalLinks: false
						}
					} );

					model = editor.model;
					view = editor.editing.view;
				} );

				afterEach( async () => {
					await editor.destroy();
				} );

				testLinks.forEach( link => {
					it( `link: ${ link.url } should not get 'target' and 'rel' attributes`, () => {
						// Upcast check.
						editor.setData(
							'<figure class="image">' +
								`<a href="${ link.url }" target="_blank" rel="noopener noreferrer">` +
									'<img src="/assets/sample.png">' +
								'</a>' +
							'</figure>'
						);

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( `<imageBlock linkHref="${ link.url }" src="/assets/sample.png"></imageBlock>` );

						// Downcast check.
						expect( editor.getData() ).to.equal(
							'<figure class="image">' +
								`<a href="${ link.url }">` +
									'<img src="/assets/sample.png">' +
								'</a>' +
							'</figure>'
						);
					} );
				} );
			} );

			describe( 'for link.addTargetToExternalLinks=true', () => {
				let editor, model;

				beforeEach( async () => {
					editor = await VirtualTestEditor.create( {
						plugins: [ Paragraph, ImageBlockEditing, LinkImageEditing ],
						link: {
							addTargetToExternalLinks: true
						}
					} );

					model = editor.model;
					view = editor.editing.view;
				} );

				afterEach( async () => {
					await editor.destroy();
				} );

				testLinks.forEach( link => {
					it( `link: ${ link.url } should be treat as ${ link.external ? 'external' : 'non-external' } link`, () => {
						// Upcast check.
						editor.setData(
							`<a href="${ link.url }" target="_blank" rel="noopener noreferrer"><img src="/assets/sample.png"></a>`
						);

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( `<imageBlock linkHref="${ link.url }" src="/assets/sample.png"></imageBlock>` );

						// Downcast check.
						if ( link.external ) {
							expect( editor.getData() ).to.equal(
								'<figure class="image">' +
									`<a href="${ link.url }" target="_blank" rel="noopener noreferrer">` +
										'<img src="/assets/sample.png">' +
									'</a>' +
								'</figure>'
							);
						} else {
							expect( editor.getData() ).to.equal(
								'<figure class="image">' +
									`<a href="${ link.url }">` +
										'<img src="/assets/sample.png">' +
									'</a>' +
								'</figure>'
							);
						}
					} );
				} );
			} );
		} );

		describe( 'custom config', () => {
			describe( 'mode: automatic', () => {
				let editor;

				const testLinks = [
					{
						url: 'relative/url.html',
						attributes: {}
					}, {
						url: 'http://example.com',
						attributes: {
							target: '_blank'
						}
					}, {
						url: 'https://example.com/download/link.pdf',
						attributes: {
							target: '_blank',
							download: 'download'
						}
					}, {
						url: 'mailto:some@person.io',
						attributes: {
							class: 'mail-url'
						}
					}, {
						url: 'ftp://example.com',
						attributes: {
							class: 'file',
							style: 'text-decoration:underline;'
						}
					}
				];

				beforeEach( async () => {
					editor = await VirtualTestEditor.create( {
						plugins: [ Paragraph, ImageBlockEditing, LinkImageEditing ],
						link: {
							addTargetToExternalLinks: false,
							decorators: {
								isExternal: {
									mode: 'automatic',
									callback: url => url.startsWith( 'http' ),
									attributes: {
										target: '_blank'
									}
								},
								isDownloadable: {
									mode: 'automatic',
									callback: url => url.includes( 'download' ),
									attributes: {
										download: 'download'
									}
								},
								isMail: {
									mode: 'automatic',
									callback: url => url.startsWith( 'mailto:' ),
									attributes: {
										class: 'mail-url'
									}
								},
								isFile: {
									mode: 'automatic',
									callback: url => url.startsWith( 'ftp' ),
									classes: 'file',
									styles: {
										'text-decoration': 'underline'
									}
								}
							}
						}
					} );

					model = editor.model;
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				testLinks.forEach( link => {
					it( `Link: ${ link.url } should get attributes: ${ JSON.stringify( link.attributes ) }`, () => {
						const ORDER = [ 'class', 'style', 'href', 'target', 'download' ];
						const attributes = Object.assign( {}, link.attributes, {
							href: link.url
						} );
						const attr = Object.entries( attributes ).sort( ( a, b ) => {
							const aIndex = ORDER.indexOf( a[ 0 ] );
							const bIndex = ORDER.indexOf( b[ 0 ] );
							return aIndex - bIndex;
						} );
						const reducedAttr = attr.reduce( ( acc, cur ) => {
							return acc + `${ cur[ 0 ] }="${ cur[ 1 ] }" `;
						}, '' ).trim();

						editor.setData( `<a href="${ link.url }"><img src="/assets/sample.png"></a>` );

						expect( getModelData( model, { withoutSelection: true } ) )
							.to.equal( `<imageBlock linkHref="${ link.url }" src="/assets/sample.png"></imageBlock>` );

						// Order of attributes is important, that's why this is assert is construct in such way.
						expect( editor.getData() ).to.equal(
							'<figure class="image">' +
								`<a ${ reducedAttr }>` +
									'<img src="/assets/sample.png">' +
								'</a>' +
							'</figure>'
						);
					} );
				} );
			} );
		} );

		describe( 'upcast converter', () => {
			let editor, model;

			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ Paragraph, ImageBlockEditing, LinkImageEditing ],
						link: {
							decorators: {
								isExternal: {
									mode: 'manual',
									label: 'Open in a new tab',
									attributes: {
										target: '_blank',
										rel: 'noopener noreferrer'
									}
								},
								isDownloadable: {
									mode: 'manual',
									label: 'Downloadable',
									attributes: {
										download: 'download'
									}
								},
								isGallery: {
									mode: 'manual',
									label: 'Gallery link',
									classes: 'gallery'
								},
								isHighlighted: {
									mode: 'manual',
									label: 'Important',
									classes: 'highlighted',
									styles: {
										'text-decoration': 'underline'
									}
								}
							}
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			it( 'should register manual decorators for block images', async () => {
				const newEditor = await VirtualTestEditor.create( {
					plugins: [ Paragraph, ImageBlockEditing, LinkImageEditing ],
					link: {
						decorators: {
							isGallery: {
								mode: 'manual'
							}
						}
					}
				} );

				expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'linkIsGallery' ) ).to.be.true;
				await newEditor.destroy();
			} );

			it( 'should register manual decorators for inline images', async () => {
				const newEditor = await VirtualTestEditor.create( {
					plugins: [ Paragraph, ImageInlineEditing, LinkImageEditing ],
					link: {
						decorators: {
							isGallery: {
								mode: 'manual'
							}
						}
					}
				} );

				expect( newEditor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'linkIsGallery' ) ).to.be.true;
				await newEditor.destroy();
			} );

			it( 'should upcast attributes', async () => {
				editor.setData(
					'<figure class="image">' +
						'<a href="url" target="_blank" rel="noopener noreferrer" download="download" ' +
						'class="highlighted" style="text-decoration:underline;">' +
							'<img src="/assets/sample.png">' +
						'</a>' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<imageBlock linkHref="url" linkIsDownloadable="true" linkIsExternal="true" ' +
					'linkIsHighlighted="true" src="/assets/sample.png"></imageBlock>'
				);

				await editor.destroy();
			} );

			it( 'should not upcast partial and incorrect attributes', async () => {
				editor.setData(
					'<figure class="image">' +
						'<a href="url" target="_blank" rel="noopener noreferrer" download="something">' +
							'<img src="/assets/sample.png">' +
						'</a>' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<imageBlock linkHref="url" linkIsExternal="true" src="/assets/sample.png"></imageBlock>'
				);
			} );

			it( 'allows overwriting conversion process using highest priority', () => {
				// Block manual decorator converter. Consume all attributes and do nothing with them.
				editor.conversion.for( 'upcast' ).add( dispatcher => {
					dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
						const consumableAttributes = {
							attributes: [ 'target', 'rel', 'download' ]
						};

						conversionApi.consumable.consume( data.viewItem, consumableAttributes );
					}, { priority: 'highest' } );
				} );

				editor.setData(
					'<figure class="image">' +
						'<a href="url" target="_blank" rel="noopener noreferrer" download="something">' +
							'<img src="/assets/sample.png">' +
						'</a>' +
					'</figure>'
				);

				expect( editor.getData() ).to.equal( '<figure class="image"><a href="url"><img src="/assets/sample.png"></a></figure>' );
			} );

			it( 'should upcast the decorators when linked image (figure > a > img)', () => {
				// (#7975)
				editor.setData(
					'<figure class="image">' +
						'<a class="gallery highlighted" href="https://cksource.com" target="_blank" ' +
						'rel="noopener noreferrer" download="download" style="text-decoration:underline;">' +
							'<img src="sample.jpg" alt="bar">' +
						'</a>' +
						'<figcaption>Caption</figcaption>' +
					'</figure>' +
					'<p>' +
						'<a href="https://cksource.com" target="_blank" rel="noopener noreferrer" download="download">' +
							'https://cksource.com' +
						'</a>' +
					'</p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<imageBlock alt="bar" ' +
						'linkHref="https://cksource.com" ' +
						'linkIsDownloadable="true" ' +
						'linkIsExternal="true" ' +
						'linkIsGallery="true" ' +
						'linkIsHighlighted="true" ' +
						'src="sample.jpg">' +
					'</imageBlock>' +
					'<paragraph>' +
						'<$text linkHref="https://cksource.com" linkIsDownloadable="true" linkIsExternal="true">' +
							'https://cksource.com' +
						'</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should upcast the decorators when linked image (a > img)', () => {
				// (#7975)
				editor.setData(
					'<a class="gallery highlighted" href="https://cksource.com" target="_blank" rel="noopener noreferrer"' +
					'download="download" style="text-decoration:underline;">' +
						'<img src="sample.jpg" alt="bar">' +
					'</a>' +
					'<p>' +
						'<a href="https://cksource.com" target="_blank" rel="noopener noreferrer" download="download">' +
							'https://cksource.com' +
						'</a>' +
					'</p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<imageBlock alt="bar" ' +
						'linkHref="https://cksource.com" ' +
						'linkIsDownloadable="true" ' +
						'linkIsExternal="true" ' +
						'linkIsGallery="true" ' +
						'linkIsHighlighted="true" ' +
						'src="sample.jpg">' +
					'</imageBlock>' +
					'<paragraph>' +
						'<$text linkHref="https://cksource.com" linkIsDownloadable="true" linkIsExternal="true">' +
							'https://cksource.com' +
						'</$text>' +
					'</paragraph>'
				);
			} );

			it( 'should properly upcast manual decorators for linked inline images', async () => {
				const newEditor = await VirtualTestEditor.create( {
					plugins: [ Paragraph, ImageBlockEditing, ImageInlineEditing, LinkImageEditing ],
					link: {
						decorators: {
							isGallery: {
								mode: 'manual',
								classes: 'gallery'
							}
						}
					}
				} );

				newEditor.setData(
					'<p>' +
						'foo ' +
						'<a class="gallery" href="https://cksource.com">' +
							'abc ' +
							'<img src="sample.jpg" alt="bar">' +
							' 123' +
						'</a>' +
						' bar' +
					'</p>'
				);

				expect( getModelData( newEditor.model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>' +
						'foo ' +
						'<$text linkHref="https://cksource.com" linkIsGallery="true">abc </$text>' +
						'<imageInline alt="bar" linkHref="https://cksource.com" linkIsGallery="true" src="sample.jpg"></imageInline>' +
						'<$text linkHref="https://cksource.com" linkIsGallery="true"> 123</$text>' +
						' bar' +
					'</paragraph>'
				);

				await newEditor.destroy();
			} );
		} );

		describe( 'downcast converter', () => {
			let editor, model;

			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ Paragraph, ImageBlockEditing, LinkImageEditing ],
						link: {
							decorators: {
								isExternal: {
									mode: 'manual',
									label: 'Open in a new tab',
									attributes: {
										target: '_blank',
										rel: 'noopener noreferrer'
									}
								},
								isDownloadable: {
									mode: 'manual',
									label: 'Downloadable',
									attributes: {
										download: 'download'
									}
								},
								isGallery: {
									mode: 'manual',
									label: 'Gallery link',
									classes: 'gallery'
								},
								isHighlighted: {
									mode: 'manual',
									label: 'Important',
									classes: 'highlighted',
									styles: {
										'text-decoration': 'underline'
									}
								}
							}
						}
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			it( 'should downcast the decorators after applying a change', () => {
				setModelData( model,
					'[<imageBlock alt="bar" src="sample.jpg"></imageBlock>]' +
					'<paragraph>' +
						'<$text>https://cksource.com</$text>' +
					'</paragraph>'
				);

				editor.execute( 'link', 'https://cksource.com', {
					linkIsDownloadable: true,
					linkIsExternal: true,
					linkIsGallery: true,
					linkIsHighlighted: true
				} );

				model.change( writer => {
					writer.setSelection( model.document.getRoot().getChild( 1 ).getChild( 0 ), 'on' );
				} );

				editor.execute( 'link', 'https://cksource.com', {
					linkIsDownloadable: true,
					linkIsExternal: true,
					linkIsGallery: true,
					linkIsHighlighted: true
				} );

				expect( editor.getData() ).to.equal(
					'<figure class="image">' +
						'<a class="gallery highlighted" style="text-decoration:underline;" href="https://cksource.com" ' +
						'download="download" target="_blank" rel="noopener noreferrer">' +
							'<img src="sample.jpg" alt="bar">' +
						'</a>' +
					'</figure>' +
					'<p>' +
						'<a class="gallery highlighted" style="text-decoration:underline;" href="https://cksource.com" ' +
						'download="download" target="_blank" rel="noopener noreferrer">' +
							'https://cksource.com' +
						'</a>' +
					'</p>'
				);
			} );

			// See #8401.
			it( 'should downcast without error if the image already has no link', () => {
				setModelData( model,
					'[<imageBlock alt="bar" src="sample.jpg"></imageBlock>]'
				);

				editor.execute( 'link', 'https://cksource.com', {
					linkIsDownloadable: true,
					linkIsExternal: true,
					linkIsGallery: true,
					linkIsHighlighted: true
				} );

				// Attributes will be removed along with the link, but the downcast will be fired.
				// The lack of link should not affect the downcasting.
				expect( () => {
					editor.execute( 'unlink', 'https://cksource.com', {
						linkIsDownloadable: true,
						linkIsExternal: true,
						linkIsGallery: true,
						linkIsHighlighted: true
					} );
				} ).to.not.throw();

				expect( editor.getData() ).to.equal(
					'<figure class="image">' +
							'<img src="sample.jpg" alt="bar">' +
						'</figure>'
				);
			} );

			// See #8401.
			describe( 'order of model updates', () => {
				it( 'should not affect converters - base link attributes first', () => {
					setModelData( model,
						'[<imageBlock src="https://cksource.com"></imageBlock>]'
					);

					model.change( writer => {
						const ranges = model.schema.getValidRanges( model.document.selection.getRanges(), 'linkIsDownloadable' );

						for ( const range of ranges ) {
							// The `linkHref` should be processed first - this is the default order of `LinkCommand`.
							writer.setAttribute( 'linkHref', 'url', range );
							writer.setAttribute( 'linkIsDownloadable', true, range );
						}
					} );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock linkHref="url" linkIsDownloadable="true" src="https://cksource.com"></imageBlock>'
					);
				} );

				it( 'should not affect converters - decorators first', () => {
					setModelData( model,
						'[<imageBlock src="https://cksource.com"></imageBlock>]'
					);

					model.change( writer => {
						const ranges = model.schema.getValidRanges( model.document.selection.getRanges(), 'linkIsDownloadable' );

						for ( const range of ranges ) {
							// Here we force attributes to be set on a model in a different order
							// to force unusual order of downcast converters down the line.
							// Normally, the `linkHref` gets processed first, as it is just the first property assigned
							// to the model by `LinkCommand`.
							writer.setAttribute( 'linkIsDownloadable', true, range );
							writer.setAttribute( 'linkHref', 'url', range );
						}
					} );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock linkHref="url" linkIsDownloadable="true" src="https://cksource.com"></imageBlock>'
					);
				} );
			} );
		} );
	} );
} );
