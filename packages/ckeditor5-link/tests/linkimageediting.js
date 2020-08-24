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
			it( 'should attach a link indicator to the image element', () => {
				setModelData( model, '<image src="/assets/sample.png" alt="alt text" linkHref="foo"></image>' );

				expect( getViewData( view, { withoutSelection: true, renderUIElements: true } ) ).to.match( new RegExp(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<a href="foo">' +
							'<img alt="alt text" src="/assets/sample.png"></img>' +
							'<span class="ck ck-link-image_icon">' +
								'<svg[^>]+>.*<\\/svg>' +
							'</span>' +
						'</a>' +
					'</figure>'
				) );
			} );
		} );

		describe( 'model to data', () => {
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
							// Content of the UIElement is skipped here.
							'<span class="ck ck-link-image_icon"></span>' +
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
							// Content of the UIElement is skipped here.
							'<span class="ck ck-link-image_icon"></span>' +
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

		describe( 'figure > a > img + span + figcaption', () => {
			it( 'should convert a link and the caption element', () => {
				return VirtualTestEditor
					.create( {
						plugins: [ Paragraph, LinkImageEditing, ImageCaptionEditing ]
					} )
					.then( editor => {
						setModelData( editor.model,
							'<image linkHref="http://ckeditor.com" src="/assets/sample.png" alt="alt text">' +
								'<caption>Foo Bar.</caption>' +
							'</image>'
						);

						expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
							'<figure class="ck-widget image" contenteditable="false">' +
								'<a href="http://ckeditor.com">' +
									'<img alt="alt text" src="/assets/sample.png"></img>' +
									// Content of the UIElement is skipped here.
									'<span class="ck ck-link-image_icon"></span>' +
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
						plugins: [ Paragraph, LinkImageEditing ],
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
							.to.equal( `<image linkHref="${ link.url }" src="/assets/sample.png"></image>` );

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
						plugins: [ Paragraph, LinkImageEditing ],
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
							.to.equal( `<image linkHref="${ link.url }" src="/assets/sample.png"></image>` );

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
						url: 'http://exmaple.com',
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
					}
				];

				beforeEach( async () => {
					editor = await VirtualTestEditor.create( {
						plugins: [ Paragraph, LinkImageEditing ],
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
						const ORDER = [ 'class', 'href', 'target', 'download' ];
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
							.to.equal( `<image linkHref="${ link.url }" src="/assets/sample.png"></image>` );

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
			let editor;

			it( 'should upcast attributes from initial data', async () => {
				editor = await VirtualTestEditor.create( {
					initialData: '<figure class="image"><a href="url" target="_blank" rel="noopener noreferrer" download="file">' +
						'<img src="/assets/sample.png"></a></figure>',
					plugins: [ Paragraph, LinkImageEditing ],
					link: {
						decorators: {
							isExternal: {
								mode: 'manual',
								label: 'Open in a new window',
								attributes: {
									target: '_blank',
									rel: 'noopener noreferrer'
								}
							},
							isDownloadable: {
								mode: 'manual',
								label: 'Downloadable',
								attributes: {
									download: 'file'
								}
							}
						}
					}
				} );

				model = editor.model;

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<image linkHref="url" linkIsDownloadable="true" linkIsExternal="true" src="/assets/sample.png"></image>'
				);

				await editor.destroy();
			} );

			it( 'should not upcast partial and incorrect attributes', async () => {
				editor = await VirtualTestEditor.create( {
					initialData: '<figure class="image"><a href="url" target="_blank" rel="noopener noreferrer" download="something">' +
						'<img src="/assets/sample.png"></a></figure>',
					plugins: [ Paragraph, LinkImageEditing ],
					link: {
						decorators: {
							isExternal: {
								mode: 'manual',
								label: 'Open in a new window',
								attributes: {
									target: '_blank',
									rel: 'noopener noreferrer'
								}
							},
							isDownloadable: {
								mode: 'manual',
								label: 'Downloadable',
								attributes: {
									download: 'file'
								}
							}
						}
					}
				} );

				model = editor.model;

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<image linkHref="url" linkIsExternal="true" src="/assets/sample.png"></image>'
				);

				await editor.destroy();
			} );

			it( 'allows overwriting conversion process using highest priority', async () => {
				editor = await VirtualTestEditor.create( {
					initialData: '',
					plugins: [ Paragraph, LinkImageEditing ],
					link: {
						decorators: {
							isExternal: {
								mode: 'manual',
								label: 'Open in a new window',
								attributes: {
									target: '_blank',
									rel: 'noopener noreferrer'
								}
							},
							isDownloadable: {
								mode: 'manual',
								label: 'Downloadable',
								attributes: {
									download: 'file'
								}
							}
						}
					}
				} );

				model = editor.model;

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

				await editor.destroy();
			} );
		} );
	} );
} );
