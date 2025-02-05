/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import LinkImageEditing from '@ckeditor/ckeditor5-link/src/linkimageediting.js';

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { NativeFileReaderMock, UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';

import ImageInlineEditing from '../src/image/imageinlineediting.js';
import ImageBlockEditing from '../src/image/imageblockediting.js';
import PictureEditing from '../src/pictureediting.js';
import ImageEditing from '../src/image/imageediting.js';
import ImageUtils from '../src/imageutils.js';
import ImageResizeEditing from '../src/imageresize/imageresizeediting.js';
import ImageCaptionEditing from '../src/imagecaption/imagecaptionediting.js';
import ImageUploadEditing from '../src/imageupload/imageuploadediting.js';

describe( 'PictureEditing', () => {
	let editor, model, modelDocument, view, imageUtils;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				Paragraph,
				PictureEditing,
				ItalicEditing,
				ImageBlockEditing, ImageInlineEditing,
				LinkImageEditing, ImageResizeEditing, ImageCaptionEditing
			]
		} );

		model = editor.model;
		modelDocument = model.document;
		view = editor.editing.view;
		imageUtils = editor.plugins.get( 'ImageUtils' );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( PictureEditing.pluginName ).to.equal( 'PictureEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( PictureEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( PictureEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( PictureEditing ) ).to.be.instanceOf( PictureEditing );
	} );

	it( 'should require ImageEditing and ImageUtils', () => {
		expect( PictureEditing.requires ).to.have.members( [ ImageEditing, ImageUtils ] );
	} );

	describe( 'schema rules', () => {
		describe( 'when only ImageBlockEditing is loaded', () => {
			it( 'should allow the "sources" attribute on the imageBlock element', async () => {
				const editor = await VirtualTestEditor.create( {
					plugins: [ PictureEditing, ImageBlockEditing ]
				} );

				expect( editor.model.schema.isRegistered( 'imageInline' ) ).to.be.false;
				expect( editor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'sources' ) ).to.be.true;

				await editor.destroy();
			} );
		} );

		describe( 'when only ImageInlineEditing is loaded', () => {
			it( 'should allow the "sources" attribute on the imageInline element', async () => {
				const editor = await VirtualTestEditor.create( {
					plugins: [ PictureEditing, ImageInlineEditing ]
				} );

				expect( editor.model.schema.isRegistered( 'imageBlock' ) ).to.be.false;
				expect( editor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'sources' ) ).to.be.true;

				await editor.destroy();
			} );
		} );

		describe( 'when both ImageBlockEditing and ImageInlineEditing are loaded', () => {
			it( 'should allow the "sources" attribute on the imageBlock and imageInline elements', () => {
				expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'sources' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', 'imageInline' ], 'sources' ) ).to.be.true;
			} );
		} );
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
			describe( 'inline images', () => {
				it( 'should upcast a plain inline image', () => {
					editor.setData(
						'<p>' +
							'foo<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
								'<img src="/assets/sample.png">' +
							'</picture>bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal(
						'<paragraph>[]' +
							'foo' +
							'<imageInline sources="[object Object],[object Object]" src="/assets/sample.png"></imageInline>' +
							'bar' +
						'</paragraph>'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png',
							type: 'image/png',
							media: '(min-width: 800px)',
							sizes: '2000px'
						},
						{
							srcset: '/assets/sample.png?foo',
							type: 'image/png',
							media: '(max-width: 800px)',
							sizes: '400px'
						}
					] );
				} );

				it( 'should upcast a plain inline image (random order inside <picture>)', () => {
					editor.setData(
						'<p>' +
							'foo<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<img src="/assets/sample.png">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
							'</picture>bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal(
						'<paragraph>[]' +
							'foo' +
							'<imageInline sources="[object Object],[object Object]" src="/assets/sample.png"></imageInline>' +
							'bar' +
						'</paragraph>'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png',
							type: 'image/png',
							media: '(min-width: 800px)',
							sizes: '2000px'
						},
						{
							srcset: '/assets/sample.png?foo',
							type: 'image/png',
							media: '(max-width: 800px)',
							sizes: '400px'
						}
					] );
				} );

				it( 'should upcast a plain inline image (without any <source>)', () => {
					editor.setData(
						'<p>' +
							'foo<picture>' +
								'<img src="/assets/sample.png">' +
							'</picture>bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal(
						'<paragraph>[]' +
							'foo' +
							'<imageInline src="/assets/sample.png"></imageInline>' +
							'bar' +
						'</paragraph>'
					);
				} );

				it( 'should upcast a linked inline image', () => {
					editor.setData(
						'<p>' +
							'foo<a href="http://ckeditor.com"><picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<img src="/assets/sample.png">' +
							'</a></picture>bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal(
						'<paragraph>[]' +
							'foo' +
							'<imageInline linkHref="http://ckeditor.com" sources="[object Object]" src="/assets/sample.png">' +
							'</imageInline>' +
							'bar' +
						'</paragraph>'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png',
							type: 'image/png',
							media: '(min-width: 800px)',
							sizes: '2000px'
						}
					] );
				} );

				it( 'should upcast a resized inline image', () => {
					editor.setData(
						'<p>' +
							'foo<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<img src="/assets/sample.png" style="width:123px">' +
							'</picture>bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal(
						'<paragraph>[]' +
							'foo' +
							'<imageInline resizedWidth="123px" sources="[object Object]" src="/assets/sample.png"></imageInline>' +
							'bar' +
						'</paragraph>'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png',
							type: 'image/png',
							media: '(min-width: 800px)',
							sizes: '2000px'
						}
					] );
				} );

				it( 'should not upcast unknown source element attributes', () => {
					editor.setData(
						'<p>' +
							'foo<picture>' +
								'<source srcset="/assets/sample.png" foo="bar" baz="qux">' +
								'<source a="b" c="d" e="f">' +
								'<img src="/assets/sample.png">' +
							'</picture>bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal(
						'<paragraph>[]' +
							'foo' +
							'<imageInline sources="[object Object]" src="/assets/sample.png"></imageInline>' +
							'bar' +
						'</paragraph>'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png'
						}
					] );
				} );

				it( 'should not upcast an image without <picture>', () => {
					editor.setData(
						'<p>' +
							'foo' +
							'<img src="/assets/sample.png">' +
							'bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal(
						'<paragraph>[]' +
							'foo' +
							'<imageInline src="/assets/sample.png"></imageInline>' +
							'bar' +
						'</paragraph>'
					);
				} );
			} );

			describe( 'block images', () => {
				it( 'should upcast a plain block image (without caption)', () => {
					editor.setData(
						'<figure class="image">' +
							'<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
						'</figure>'
					);

					expect( getModelData( model ) ).to.equal(
						'[<imageBlock sources="[object Object],[object Object]" src="/assets/sample.png">' +
						'</imageBlock>]'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png',
							type: 'image/png',
							media: '(min-width: 800px)',
							sizes: '2000px'
						},
						{
							srcset: '/assets/sample.png?foo',
							type: 'image/png',
							media: '(max-width: 800px)',
							sizes: '400px'
						}
					] );
				} );

				it( 'should upcast a plain block image (with caption)', () => {
					editor.setData(
						'<figure class="image">' +
							'<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
							'<figcaption>' +
								'Text of the caption' +
							'</figcaption>' +
						'</figure>'
					);

					expect( getModelData( model ) ).to.equal(
						'[<imageBlock sources="[object Object],[object Object]" src="/assets/sample.png">' +
							'<caption>Text of the caption</caption>' +
						'</imageBlock>]'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png',
							type: 'image/png',
							media: '(min-width: 800px)',
							sizes: '2000px'
						},
						{
							srcset: '/assets/sample.png?foo',
							type: 'image/png',
							media: '(max-width: 800px)',
							sizes: '400px'
						}
					] );
				} );

				it( 'should upcast a plain block image (with caption, different order)', () => {
					editor.setData(
						'<figure class="image">' +
							'<figcaption>' +
								'Text of the caption' +
							'</figcaption>' +
							'<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
						'</figure>'
					);

					expect( getModelData( model ) ).to.equal(
						'[<imageBlock sources="[object Object],[object Object]" src="/assets/sample.png">' +
							'<caption>Text of the caption</caption>' +
						'</imageBlock>]'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png',
							type: 'image/png',
							media: '(min-width: 800px)',
							sizes: '2000px'
						},
						{
							srcset: '/assets/sample.png?foo',
							type: 'image/png',
							media: '(max-width: 800px)',
							sizes: '400px'
						}
					] );
				} );

				it( 'should upcast a linked block image', () => {
					editor.setData(
						'<figure class="image">' +
							'<a href="https://cksource.com">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
							'<figcaption>' +
								'Text of the caption' +
							'</figcaption>' +
						'</figure>'
					);

					expect( getModelData( model ) ).to.equal(
						'[<imageBlock linkHref="https://cksource.com" sources="[object Object],[object Object]" src="/assets/sample.png">' +
							'<caption>Text of the caption</caption>' +
						'</imageBlock>]'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png',
							type: 'image/png',
							media: '(min-width: 800px)',
							sizes: '2000px'
						},
						{
							srcset: '/assets/sample.png?foo',
							type: 'image/png',
							media: '(max-width: 800px)',
							sizes: '400px'
						}
					] );
				} );

				it( 'should upcast a resized block image', () => {
					editor.setData(
						'<figure class="image" style="width:123px">' +
							'<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
							'<figcaption>' +
								'Text of the caption' +
							'</figcaption>' +
						'</figure>'
					);

					expect( getModelData( model ) ).to.equal(
						'[<imageBlock ' +
							'resizedWidth="123px" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/assets/sample.png"' +
						'>' +
							'<caption>Text of the caption</caption>' +
						'</imageBlock>]'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png',
							type: 'image/png',
							media: '(min-width: 800px)',
							sizes: '2000px'
						},
						{
							srcset: '/assets/sample.png?foo',
							type: 'image/png',
							media: '(max-width: 800px)',
							sizes: '400px'
						}
					] );
				} );

				it( 'should not upcast unknown source element attributes', () => {
					editor.setData(
						'<figure class="image" style="width:123px">' +
							'<a href="https://cksource.com">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" foo="bar" baz="qux">' +
									'<source a="b" c="d" e="f">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
							'<figcaption>' +
								'Text of the caption' +
							'</figcaption>' +
						'</figure>'
					);

					expect( getModelData( model ) ).to.equal(
						'[<imageBlock ' +
							'linkHref="https://cksource.com" ' +
							'resizedWidth="123px" ' +
							'sources="[object Object]" ' +
							'src="/assets/sample.png"' +
						'>' +
							'<caption>Text of the caption</caption>' +
						'</imageBlock>]'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png'
						}
					] );
				} );

				it( 'should not upcast elements wihtout <picture>', () => {
					editor.setData(
						'<figure class="image">' +
							'<img src="/assets/sample.png">' +
						'</figure>'
					);

					expect( getModelData( model ) ).to.equal(
						'[<imageBlock src="/assets/sample.png"></imageBlock>]'
					);
				} );
			} );

			describe( 'integration with other converters and edge cases', () => {
				it( 'should not upcast <picture> if already consumed by other converters', () => {
					editor.data.upcastDispatcher.on( 'element:picture', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.viewItem, { name: true } );
					}, { priority: 'highest' } );

					editor.setData(
						'<p>' +
							'foo<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
								'<img src="/assets/sample.png">' +
							'</picture>bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal( '<paragraph>[]foobar</paragraph>' );
				} );

				it( 'should not upcast individual <source> attributes if already consumed by other converters', () => {
					editor.data.upcastDispatcher.on( 'element:picture', ( evt, data, conversionApi ) => {
						for ( const childSourceElement of data.viewItem.getChildren() ) {
							conversionApi.consumable.consume( childSourceElement, { attributes: [ 'media', 'sizes' ] } );
						}
					}, { priority: 'highest' } );

					editor.setData(
						'<p>' +
							'foo<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
								'<img src="/assets/sample.png">' +
							'</picture>bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal(
						'<paragraph>[]' +
							'foo' +
							'<imageInline sources="[object Object],[object Object]" src="/assets/sample.png"></imageInline>' +
							'bar' +
						'</paragraph>'
					);

					assertPictureSources( model, imageUtils, [
						{
							srcset: '/assets/sample.png',
							type: 'image/png'
						},
						{
							srcset: '/assets/sample.png?foo',
							type: 'image/png'
						}
					] );
				} );

				it( 'should not upcast <picture> (and not throw) if there is no <img> inside because this is an invalid HTML', () => {
					editor.data.upcastDispatcher.on( 'element:picture', ( evt, data, conversionApi ) => {
						for ( const childSourceElement of data.viewItem.getChildren() ) {
							conversionApi.consumable.consume( childSourceElement, { attributes: 'media' } );
						}
					}, { priority: 'highest' } );

					editor.setData(
						'<p>' +
							'foo<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
							'</picture>bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal( '<paragraph>[]foobar</paragraph>' );
				} );

				it( 'should upcast <picture> (and not throw) if the <img> inside was broken (without src attribute)', () => {
					editor.data.upcastDispatcher.on( 'element:picture', ( evt, data, conversionApi ) => {
						for ( const childSourceElement of data.viewItem.getChildren() ) {
							conversionApi.consumable.consume( childSourceElement, { attributes: 'media' } );
						}
					}, { priority: 'highest' } );

					editor.setData(
						'<p>' +
							'foo<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
								'<img alt="alt text">' +
							'</picture>bar' +
						'</p>'
					);

					expect( getModelData( model ) ).to.equal(
						'<paragraph>[]' +
							'foo' +
							'<imageInline alt="alt text" sources="[object Object],[object Object]">' +
							'</imageInline>' +
							'bar' +
						'</paragraph>'
					);
				} );
			} );
		} );

		describe( 'downcast', () => {
			describe( 'editing', () => {
				describe( 'inline images', () => {
					it( 'should downcast a plain inline image', () => {
						editor.setData(
							'<p>' +
								'foo<picture>' +
									'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
									'<img src="/assets/sample.png">' +
								'</picture>bar' +
							'</p>'
						);

						expect( getViewData( view ) ).to.equal(
							'<p>' +
								'{}foo' +
								'<span class="ck-widget image-inline" contenteditable="false">' +
									'<picture>' +
										'<source ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px" ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png">' +
										'</source>' +
										'<source ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px" ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png">' +
										'</source>' +
										'<img src="/assets/sample.png"></img>' +
									'</picture>' +
								'</span>' +
								'bar' +
							'</p>'
						);
					} );

					it( 'should downcast a linked inline image', () => {
						editor.setData(
							'<p>' +
								'foo<a href="http://ckeditor.com"><picture>' +
									'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
									'<img src="/assets/sample.png">' +
								'</picture></a>bar' +
							'</p>'
						);

						expect( getViewData( view ) ).to.equal(
							'<p>' +
								'{}foo' +
								'<a href="http://ckeditor.com">' +
									'<span class="ck-widget image-inline" contenteditable="false">' +
										'<picture>' +
											'<source ' +
												'media="(min-width: 800px)" ' +
												'sizes="2000px" ' +
												'srcset="/assets/sample.png" ' +
												'type="image/png">' +
											'</source>' +
											'<img src="/assets/sample.png"></img>' +
										'</picture>' +
									'</span>' +
								'</a>' +
								'bar' +
							'</p>'
						);
					} );

					it( 'should downcast a resized inline image', () => {
						editor.setData(
							'<p>' +
								'foo<picture>' +
									'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
									'<img src="/assets/sample.png" style="width:321px">' +
								'</picture>bar' +
							'</p>'
						);

						expect( getViewData( view ) ).to.equal(
							'<p>' +
								'{}foo' +
								'<span class="ck-widget image-inline image_resized" contenteditable="false" style="width:321px">' +
									'<picture>' +
										'<source ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px" ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png">' +
										'</source>' +
										'<source ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px" ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png">' +
										'</source>' +
										'<img src="/assets/sample.png"></img>' +
									'</picture>' +
								'</span>' +
								'bar' +
							'</p>'
						);
					} );

					describe( 'setting the "sources" model attribute', () => {
						it( 'should downcast a plain inline image', () => {
							editor.setData(
								'<p>' +
									'foo' +
									'<img src="/assets/sample.png">' +
									'bar' +
								'</p>'
							);

							model.change( writer => {
								writer.setAttribute(
									'sources',
									[
										{
											srcset: '/assets/sample.png'
										}
									],
									modelDocument.getRoot().getChild( 0 ).getChild( 1 )
								);
							} );

							expect( getViewData( view ) ).to.equal(
								'<p>' +
									'{}foo' +
									'<span class="ck-widget image-inline" contenteditable="false">' +
										'<picture>' +
											'<source srcset="/assets/sample.png"></source>' +
											'<img src="/assets/sample.png"></img>' +
										'</picture>' +
									'</span>' +
									'bar' +
								'</p>'
							);
						} );

						it( 'should downcast a linked inline image', () => {
							editor.setData(
								'<p>' +
									'foo' +
									'<a href="http://ckeditor.com">' +
										'<img src="/assets/sample.png">' +
									'</a>' +
									'bar' +
								'</p>'
							);

							model.change( writer => {
								writer.setAttribute(
									'sources',
									[
										{
											srcset: '/assets/sample.png'
										}
									],
									modelDocument.getRoot().getChild( 0 ).getChild( 1 )
								);
							} );

							expect( getViewData( view ) ).to.equal(
								'<p>' +
									'{}foo' +
									'<a href="http://ckeditor.com">' +
										'<span class="ck-widget image-inline" contenteditable="false">' +
											'<picture>' +
												'<source srcset="/assets/sample.png"></source>' +
												'<img src="/assets/sample.png"></img>' +
											'</picture>' +
										'</span>' +
									'</a>' +
									'bar' +
								'</p>'
							);
						} );

						it( 'should downcast a resized inline image', () => {
							editor.setData(
								'<p>' +
									'foo' +
									'<img src="/assets/sample.png" style="width:321px">' +
									'bar' +
								'</p>'
							);

							model.change( writer => {
								writer.setAttribute(
									'sources',
									[
										{
											srcset: '/assets/sample.png'
										}
									],
									modelDocument.getRoot().getChild( 0 ).getChild( 1 )
								);
							} );

							expect( getViewData( view ) ).to.equal(
								'<p>' +
									'{}foo' +
									'<span class="ck-widget image-inline image_resized" contenteditable="false" style="width:321px">' +
										'<picture>' +
											'<source srcset="/assets/sample.png"></source>' +
											'<img src="/assets/sample.png"></img>' +
										'</picture>' +
									'</span>' +
									'bar' +
								'</p>'
							);
						} );
					} );

					describe( 'removing the "sources" model attribute', () => {
						it( 'should downcast a plain inline image', () => {
							editor.setData(
								'<p>' +
									'foo<picture>' +
										'<source ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png" ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px">' +
										'<source ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png" ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px">' +
										'<img src="/assets/sample.png">' +
									'</picture>bar' +
								'</p>'
							);

							model.change( writer => {
								writer.removeAttribute( 'sources', modelDocument.getRoot().getChild( 0 ).getChild( 1 ) );
							} );

							expect( getViewData( view ) ).to.equal(
								'<p>' +
									'{}foo' +
									'<span class="ck-widget image-inline" contenteditable="false">' +
										'<img src="/assets/sample.png"></img>' +
									'</span>' +
									'bar' +
								'</p>'
							);
						} );

						it( 'should downcast a linked inline image', () => {
							editor.setData(
								'<p>' +
									'foo<a href="http://ckeditor.com"><picture>' +
										'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
										'<img src="/assets/sample.png">' +
									'</a></picture>bar' +
								'</p>'
							);

							model.change( writer => {
								writer.removeAttribute( 'sources', modelDocument.getRoot().getChild( 0 ).getChild( 1 ) );
							} );

							expect( getViewData( view ) ).to.equal(
								'<p>' +
									'{}foo' +
									'<a href="http://ckeditor.com">' +
										'<span class="ck-widget image-inline" contenteditable="false">' +
											'<img src="/assets/sample.png"></img>' +
										'</span>' +
									'</a>' +
									'bar' +
								'</p>'
							);
						} );

						it( 'should downcast a resized inline image', () => {
							editor.setData(
								'<p>' +
									'foo<picture>' +
										'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
										'<img src="/assets/sample.png" style="width:123px">' +
									'</picture>bar' +
								'</p>'
							);

							model.change( writer => {
								writer.removeAttribute( 'sources', modelDocument.getRoot().getChild( 0 ).getChild( 1 ) );
							} );

							expect( getViewData( view ) ).to.equal(
								'<p>' +
									'{}foo' +
									'<span class="ck-widget image-inline image_resized" contenteditable="false" style="width:123px">' +
										'<img src="/assets/sample.png"></img>' +
									'</span>' +
									'bar' +
								'</p>'
							);
						} );

						it( 'should downcast a plain inline image if the previous value was an empty array', () => {
							editor.setData(
								'<p>' +
									'foo<picture>' +
										'<source ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png" ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px">' +
										'<source ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png" ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px">' +
										'<img src="/assets/sample.png">' +
									'</picture>bar' +
								'</p>'
							);

							model.change( writer => {
								writer.setAttribute(
									'sources',
									[],
									modelDocument.getRoot().getChild( 0 ).getChild( 1 )
								);
							} );

							expect( getViewData( view ) ).to.equal(
								'<p>' +
									'{}foo' +
									'<span class="ck-widget image-inline" contenteditable="false">' +
										'<img src="/assets/sample.png"></img>' +
									'</span>' +
									'bar' +
								'</p>'
							);

							model.change( writer => {
								writer.removeAttribute( 'sources', modelDocument.getRoot().getChild( 0 ).getChild( 1 ) );
							} );

							expect( getViewData( view ) ).to.equal(
								'<p>' +
									'{}foo' +
									'<span class="ck-widget image-inline" contenteditable="false">' +
										'<img src="/assets/sample.png"></img>' +
									'</span>' +
									'bar' +
								'</p>'
							);
						} );
					} );
				} );

				describe( 'block images', () => {
					it( 'should downcast a plain block image', () => {
						editor.setData(
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</figure>'
						);

						expect( getViewData( view ) ).to.equal(
							'[<figure class="ck-widget image" contenteditable="false">' +
								'<picture>' +
									'<source ' +
										'media="(min-width: 800px)" ' +
										'sizes="2000px" ' +
										'srcset="/assets/sample.png" ' +
										'type="image/png">' +
									'</source>' +
									'<source ' +
										'media="(max-width: 800px)" ' +
										'sizes="400px" ' +
										'srcset="/assets/sample.png?foo" ' +
										'type="image/png">' +
									'</source>' +
									'<img src="/assets/sample.png"></img>' +
								'</picture>' +
							'</figure>]'
						);
					} );

					it( 'should downcast a plain block image (with caption)', () => {
						editor.setData(
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
								'<figcaption>Caption</figcaption>' +
							'</figure>'
						);

						expect( getViewData( view ) ).to.equal(
							'[<figure class="ck-widget image" contenteditable="false">' +
								'<picture>' +
									'<source ' +
										'media="(min-width: 800px)" ' +
										'sizes="2000px" ' +
										'srcset="/assets/sample.png" ' +
										'type="image/png">' +
									'</source>' +
									'<source ' +
										'media="(max-width: 800px)" ' +
										'sizes="400px" ' +
										'srcset="/assets/sample.png?foo" ' +
										'type="image/png">' +
									'</source>' +
									'<img src="/assets/sample.png"></img>' +
								'</picture>' +
								'<figcaption ' +
									'aria-label="Caption for the image" ' +
									'class="ck-editor__editable ck-editor__nested-editable" ' +
									'contenteditable="true" ' +
									'data-placeholder="Enter image caption" ' +
									'role="textbox" ' +
									'tabindex="-1"' +
								'>' +
									'Caption' +
								'</figcaption>' +
							'</figure>]'
						);
					} );

					it( 'should downcast a linked block image', () => {
						editor.setData(
							'<figure class="image">' +
								'<a href="https://ckeditor.com">' +
									'<picture>' +
										'<source ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png" ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px">' +
										'<source ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png" ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
								'</a>' +
							'</figure>'
						);

						expect( getViewData( view ) ).to.equal(
							'[<figure class="ck-widget image" contenteditable="false">' +
								'<a href="https://ckeditor.com">' +
									'<picture>' +
										'<source ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px" ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png">' +
										'</source>' +
										'<source ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px" ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png">' +
										'</source>' +
										'<img src="/assets/sample.png"></img>' +
									'</picture>' +
								'</a>' +
							'</figure>]'
						);
					} );

					it( 'should downcast a linked block image ("linkHref" added after "sources" were added)', () => {
						editor.setData(
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</figure>'
						);

						model.change( writer => {
							writer.setAttribute( 'linkHref', 'https://ckeditor.com', modelDocument.getRoot().getChild( 0 ) );
						} );

						expect( getViewData( view ) ).to.equal(
							'[<figure class="ck-widget image" contenteditable="false">' +
								'<a href="https://ckeditor.com">' +
									'<picture>' +
										'<source ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px" ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png">' +
										'</source>' +
										'<source ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px" ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png">' +
										'</source>' +
										'<img src="/assets/sample.png"></img>' +
									'</picture>' +
								'</a>' +
							'</figure>]'
						);
					} );

					it( 'should downcast a block image ("linkHref" removed after "sources" were added)', () => {
						editor.setData(
							'<figure class="image">' +
								'<a href="https://ckeditor.com">' +
									'<picture>' +
										'<source ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png" ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px">' +
										'<source ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png" ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
								'</a>' +
							'</figure>'
						);

						model.change( writer => {
							writer.removeAttribute( 'linkHref', modelDocument.getRoot().getChild( 0 ) );
						} );

						expect( getViewData( view ) ).to.equal(
							'[<figure class="ck-widget image" contenteditable="false">' +
								'<picture>' +
									'<source ' +
										'media="(min-width: 800px)" ' +
										'sizes="2000px" ' +
										'srcset="/assets/sample.png" ' +
										'type="image/png">' +
									'</source>' +
									'<source ' +
										'media="(max-width: 800px)" ' +
										'sizes="400px" ' +
										'srcset="/assets/sample.png?foo" ' +
										'type="image/png">' +
									'</source>' +
									'<img src="/assets/sample.png"></img>' +
								'</picture>' +
							'</figure>]'
						);
					} );

					it( 'should downcast a resized block image', () => {
						editor.setData(
							'<figure class="image" style="width:123px">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
								'<figcaption>' +
									'Text of the caption' +
								'</figcaption>' +
							'</figure>'
						);

						expect( getViewData( view ) ).to.equal(
							'[<figure class="ck-widget image image_resized" contenteditable="false" style="width:123px">' +
								'<picture>' +
									'<source ' +
										'media="(min-width: 800px)" ' +
										'sizes="2000px" ' +
										'srcset="/assets/sample.png" ' +
										'type="image/png">' +
									'</source>' +
									'<source ' +
										'media="(max-width: 800px)" ' +
										'sizes="400px" ' +
										'srcset="/assets/sample.png?foo" ' +
										'type="image/png">' +
									'</source>' +
									'<img src="/assets/sample.png"></img>' +
								'</picture>' +
								'<figcaption ' +
									'aria-label="Caption for the image" ' +
									'class="ck-editor__editable ck-editor__nested-editable" ' +
									'contenteditable="true" ' +
									'data-placeholder="Enter image caption" ' +
									'role="textbox" ' +
									'tabindex="-1"' +
								'>' +
									'Text of the caption' +
								'</figcaption>' +
							'</figure>]'
						);
					} );

					describe( 'setting the "sources" model attribute', () => {
						it( 'should downcast a plain block image', () => {
							editor.setData(
								'<figure class="image">' +
									'<img src="/assets/sample.png">' +
								'</figure>'
							);

							model.change( writer => {
								writer.setAttribute(
									'sources',
									[
										{
											srcset: '/assets/sample.png'
										}
									],
									modelDocument.getRoot().getChild( 0 )
								);
							} );

							expect( getViewData( view ) ).to.equal(
								'[<figure class="ck-widget image" contenteditable="false">' +
									'<picture>' +
										'<source srcset="/assets/sample.png"></source>' +
										'<img src="/assets/sample.png"></img>' +
									'</picture>' +
								'</figure>]'
							);
						} );

						it( 'should downcast a linked block image', () => {
							editor.setData(
								'<figure class="image">' +
									'<a href="https://ckeditor.com">' +
										'<img src="/assets/sample.png">' +
									'</a>' +
								'</figure>'
							);

							model.change( writer => {
								writer.setAttribute(
									'sources',
									[
										{
											srcset: '/assets/sample.png'
										}
									],
									modelDocument.getRoot().getChild( 0 )
								);
							} );

							expect( getViewData( view ) ).to.equal(
								'[<figure class="ck-widget image" contenteditable="false">' +
									'<a href="https://ckeditor.com">' +
										'<picture>' +
											'<source srcset="/assets/sample.png"></source>' +
											'<img src="/assets/sample.png"></img>' +
										'</picture>' +
									'</a>' +
								'</figure>]'
							);
						} );

						it( 'should downcast a resized block image', () => {
							editor.setData(
								'<figure class="image" style="width:123px">' +
									'<img src="/assets/sample.png">' +
								'</figure>'
							);

							model.change( writer => {
								writer.setAttribute(
									'sources',
									[
										{
											srcset: '/assets/sample.png'
										}
									],
									modelDocument.getRoot().getChild( 0 )
								);
							} );

							expect( getViewData( view ) ).to.equal(
								'[<figure class="ck-widget image image_resized" contenteditable="false" style="width:123px">' +
									'<picture>' +
										'<source srcset="/assets/sample.png"></source>' +
										'<img src="/assets/sample.png"></img>' +
									'</picture>' +
								'</figure>]'
							);
						} );
					} );

					describe( 'removing the "sources" model attribute', () => {
						it( 'should downcast a plain block image', () => {
							editor.setData(
								'<figure class="image">' +
									'<picture>' +
										'<source ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png" ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px">' +
										'<source ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png" ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
								'</figure>'
							);

							model.change( writer => {
								writer.removeAttribute( 'sources', modelDocument.getRoot().getChild( 0 ) );
							} );

							expect( getViewData( view ) ).to.equal(
								'[<figure class="ck-widget image" contenteditable="false">' +
									'<img src="/assets/sample.png"></img>' +
								'</figure>]'
							);
						} );

						it( 'should downcast a plain block image (with caption>', () => {
							editor.setData(
								'<figure class="image">' +
									'<picture>' +
										'<source ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png" ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px">' +
										'<source ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png" ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
									'<figcaption>Caption</figcaption>' +
								'</figure>'
							);

							model.change( writer => {
								writer.removeAttribute( 'sources', modelDocument.getRoot().getChild( 0 ) );
							} );

							expect( getViewData( view ) ).to.equal(
								'[<figure class="ck-widget image" contenteditable="false">' +
									'<img src="/assets/sample.png"></img>' +
									'<figcaption ' +
										'aria-label="Caption for the image" ' +
										'class="ck-editor__editable ck-editor__nested-editable" ' +
										'contenteditable="true" ' +
										'data-placeholder="Enter image caption" ' +
										'role="textbox" ' +
										'tabindex="-1"' +
									'>' +
										'Caption' +
									'</figcaption>' +
								'</figure>]'
							);
						} );

						it( 'should downcast a linked block image', () => {
							editor.setData(
								'<figure class="image">' +
									'<a href="https://cksource.com">' +
										'<picture>' +
											'<source ' +
												'srcset="/assets/sample.png" ' +
												'type="image/png" ' +
												'media="(min-width: 800px)" ' +
												'sizes="2000px">' +
											'<source ' +
												'srcset="/assets/sample.png?foo" ' +
												'type="image/png" ' +
												'media="(max-width: 800px)" ' +
												'sizes="400px">' +
											'<img src="/assets/sample.png">' +
										'</picture>' +
									'</a>' +
									'<figcaption>' +
										'Text of the caption' +
									'</figcaption>' +
								'</figure>'
							);

							model.change( writer => {
								writer.removeAttribute( 'sources', modelDocument.getRoot().getChild( 0 ) );
							} );

							expect( getViewData( view ) ).to.equal(
								'[<figure class="ck-widget image" contenteditable="false">' +
									'<a href="https://cksource.com">' +
										'<img src="/assets/sample.png"></img>' +
									'</a>' +
									'<figcaption ' +
										'aria-label="Caption for the image" ' +
										'class="ck-editor__editable ck-editor__nested-editable" ' +
										'contenteditable="true" ' +
										'data-placeholder="Enter image caption" ' +
										'role="textbox" ' +
										'tabindex="-1"' +
									'>' +
										'Text of the caption' +
									'</figcaption>' +
								'</figure>]'
							);
						} );

						it( 'should downcast a resized block image', () => {
							editor.setData(
								'<figure class="image" style="width:123px">' +
									'<picture>' +
										'<source ' +
											'srcset="/assets/sample.png" ' +
											'type="image/png" ' +
											'media="(min-width: 800px)" ' +
											'sizes="2000px">' +
										'<source ' +
											'srcset="/assets/sample.png?foo" ' +
											'type="image/png" ' +
											'media="(max-width: 800px)" ' +
											'sizes="400px">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
									'<figcaption>' +
										'Text of the caption' +
									'</figcaption>' +
								'</figure>'
							);

							model.change( writer => {
								writer.removeAttribute( 'sources', modelDocument.getRoot().getChild( 0 ) );
							} );

							expect( getViewData( view ) ).to.equal(
								'[<figure class="ck-widget image image_resized" contenteditable="false" style="width:123px">' +
									'<img src="/assets/sample.png"></img>' +
									'<figcaption ' +
										'aria-label="Caption for the image" ' +
										'class="ck-editor__editable ck-editor__nested-editable" ' +
										'contenteditable="true" ' +
										'data-placeholder="Enter image caption" ' +
										'role="textbox" ' +
										'tabindex="-1"' +
									'>' +
										'Text of the caption' +
									'</figcaption>' +
								'</figure>]'
							);
						} );
					} );
				} );
			} );

			describe( 'data', () => {
				describe( 'inline images', () => {
					it( 'should downcast a plain inline image', () => {
						const data = '<p>' +
							'foo<picture>' +
								'<source srcset="/assets/sample.png" media="(min-width: 800px)" type="image/png" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" media="(max-width: 800px)" type="image/png" sizes="400px">' +
								'<img src="/assets/sample.png">' +
							'</picture>bar' +
						'</p>';

						editor.setData( data );
						expect( editor.getData() ).to.equal( data );
					} );

					it( 'should downcast a linked inline image', () => {
						const data = '<p>' +
							'foo<a href="http://ckeditor.com"><picture>' +
								'<source srcset="/assets/sample.png" media="(min-width: 800px)" type="image/png" sizes="2000px">' +
								'<img src="/assets/sample.png">' +
							'</picture></a>bar' +
						'</p>';

						editor.setData( data );
						expect( editor.getData() ).to.equal( data );
					} );

					it( 'should downcast a linked inline image ("sources" set after linking)', () => {
						editor.setData(
							'<p>' +
								'foo<a href="http://ckeditor.com">' +
									'<img src="/assets/sample.png">' +
								'</a>bar' +
							'</p>'
						);

						model.change( writer => {
							writer.setAttribute(
								'sources',
								[
									{
										srcset: '/assets/sample.png'
									}
								],
								modelDocument.getRoot().getChild( 0 ).getChild( 1 )
							);
						} );

						expect( editor.getData() ).to.equal(
							'<p>' +
								'foo<a href="http://ckeditor.com">' +
									'<picture>' +
										'<source srcset="/assets/sample.png">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
								'</a>bar' +
							'</p>'
						);
					} );

					it( 'should downcast an inline image wrapped in multiple attirbute elements ("sources" set after linking)', () => {
						editor.model.schema.extend( 'imageInline', {
							allowAttributes: [ 'italic' ]
						} );

						editor.setData(
							'<p>' +
								'foo<a href="http://ckeditor.com">' +
									'<i>' +
										'<img src="/assets/sample.png">' +
									'</i>' +
								'</a>bar' +
							'</p>'
						);

						model.change( writer => {
							writer.setAttribute(
								'sources',
								[
									{
										srcset: '/assets/sample.png'
									}
								],
								modelDocument.getRoot().getChild( 0 ).getChild( 1 )
							);
						} );

						expect( editor.getData() ).to.equal(
							'<p>' +
								'foo<a href="http://ckeditor.com">' +
										'<i>' +
											'<picture>' +
												'<source srcset="/assets/sample.png">' +
												'<img src="/assets/sample.png">' +
											'</picture>' +
										'</i>' +
								'</a>bar' +
							'</p>'
						);
					} );

					it( 'should downcast an inline image wrapped in multiple attirbute elements ' +
						'("sources" set after linking + text around the image)', () => {
						editor.model.schema.extend( 'imageInline', {
							allowAttributes: [ 'italic' ]
						} );

						editor.setData(
							'<p>' +
								'foo<a href="http://ckeditor.com">ab' +
									'<i>c' +
										'<img src="/assets/sample.png">' +
									'd</i>' +
								'ef</a>bar' +
							'</p>'
						);

						model.change( writer => {
							writer.setAttribute(
								'sources',
								[
									{
										srcset: '/assets/sample.png'
									}
								],
								modelDocument.getRoot().getChild( 0 ).getChild( 3 )
							);
						} );

						expect( editor.getData() ).to.equal(
							'<p>' +
								'foo<a href="http://ckeditor.com">ab' +
										'<i>c' +
											'<picture>' +
												'<source srcset="/assets/sample.png">' +
												'<img src="/assets/sample.png">' +
											'</picture>' +
										'd</i>' +
								'ef</a>bar' +
							'</p>'
						);
					} );

					it( 'should downcast a linked inline image ("sources" removed after linking)', () => {
						editor.setData(
							'<p>' +
								'foo<a href="http://ckeditor.com">' +
									'<picture>' +
										'<source srcset="/assets/sample.png">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
								'</a>bar' +
							'</p>'
						);

						model.change( writer => {
							writer.removeAttribute(
								'sources',
								modelDocument.getRoot().getChild( 0 ).getChild( 1 )
							);
						} );

						expect( editor.getData() ).to.equal(
							'<p>' +
								'foo<a href="http://ckeditor.com">' +
									'<img src="/assets/sample.png">' +
								'</a>bar' +
							'</p>'
						);
					} );

					it( 'should downcast a resized inline image', () => {
						const data =
							'<p>' +
								'foo<picture>' +
									'<source srcset="/assets/sample.png" media="(min-width: 800px)" type="image/png" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" media="(max-width: 800px)" type="image/png" sizes="400px">' +
									'<img class="image_resized" style="width:321px;" src="/assets/sample.png">' +
								'</picture>bar' +
							'</p>';

						editor.setData( data );
						expect( editor.getData() ).to.equal( data );
					} );
				} );

				describe( 'block images', () => {
					it( 'should downcast a plain block image', () => {
						const data =
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(min-width: 800px)" type="image/png" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" media="(max-width: 800px)" type="image/png" sizes="400px">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</figure>';

						editor.setData( data );
						expect( editor.getData() ).to.equal( data );
					} );

					it( 'should downcast a plain block image (with caption)', () => {
						const data =
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(min-width: 800px)" type="image/png" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" media="(max-width: 800px)" type="image/png" sizes="400px">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
								'<figcaption>Caption</figcaption>' +
							'</figure>';

						editor.setData( data );
						expect( editor.getData() ).to.equal( data );
					} );

					it( 'should downcast a linked block image', () => {
						const data =
							'<figure class="image">' +
								'<a href="https://ckeditor.com">' +
									'<picture>' +
										'<source ' +
											'srcset="/assets/sample.png" ' +
											'media="(min-width: 800px)" ' +
											'type="image/png" ' +
											'sizes="2000px">' +
										'<source ' +
											'srcset="/assets/sample.png?foo" ' +
											'media="(max-width: 800px)" ' +
											'type="image/png" ' +
											'sizes="400px">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
								'</a>' +
							'</figure>';

						editor.setData( data );
						expect( editor.getData() ).to.equal( data );
					} );

					it( 'should downcast a linked block image ("sources" added after linking)', () => {
						editor.setData(
							'<figure class="image">' +
								'<a href="https://ckeditor.com">' +
									'<img src="/assets/sample.png">' +
								'</a>' +
								'<figcaption>Caption</figcaption>' +
							'</figure>'
						);

						model.change( writer => {
							writer.setAttribute(
								'sources',
								[
									{
										srcset: '/assets/sample.png'
									}
								],
								modelDocument.getRoot().getChild( 0 )
							);
						} );

						expect( editor.getData() ).to.equal(
							'<figure class="image">' +
								'<a href="https://ckeditor.com">' +
									'<picture>' +
										'<source srcset="/assets/sample.png">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
								'</a>' +
								'<figcaption>Caption</figcaption>' +
							'</figure>'
						);
					} );

					it( 'should downcast a linked block image ("linkHref" added after "sources")', () => {
						editor.setData(
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
								'<figcaption>Caption</figcaption>' +
							'</figure>'
						);

						model.change( writer => {
							writer.setAttribute( 'linkHref', 'https://ckeditor.com', modelDocument.getRoot().getChild( 0 ) );
						} );

						expect( editor.getData() ).to.equal(
							'<figure class="image">' +
								'<a href="https://ckeditor.com">' +
									'<picture>' +
										'<source srcset="/assets/sample.png">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
								'</a>' +
								'<figcaption>Caption</figcaption>' +
							'</figure>'
						);
					} );

					it( 'should downcast a linked block image ("linkHref" removed after adding "sources")', () => {
						editor.setData(
							'<figure class="image">' +
								'<a href="https://ckeditor.com">' +
									'<picture>' +
										'<source srcset="/assets/sample.png">' +
										'<img src="/assets/sample.png">' +
									'</picture>' +
								'</a>' +
								'<figcaption>Caption</figcaption>' +
							'</figure>'
						);

						model.change( writer => {
							writer.removeAttribute( 'linkHref', modelDocument.getRoot().getChild( 0 ) );
						} );

						expect( editor.getData() ).to.equal(
							'<figure class="image">' +
								'<picture>' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
								'<figcaption>Caption</figcaption>' +
							'</figure>'
						);
					} );

					it( 'should downcast a resized block image', () => {
						const data =
							'<figure class="image image_resized" style="width:123px;">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(min-width: 800px)" type="image/png" sizes="2000px">' +
									'<source srcset="/assets/sample.png?foo" media="(max-width: 800px)" type="image/png" sizes="400px">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
								'<figcaption>' +
									'Text of the caption' +
								'</figcaption>' +
							'</figure>';

						editor.setData( data );
						expect( editor.getData() ).to.equal( data );
					} );
				} );
			} );

			describe( 'integration with other converters and edge cases', () => {
				it( 'should not downcast the "sources" attribute if already consumed by some other converter', () => {
					editor.data.downcastDispatcher.on( 'attribute:sources:imageInline', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'high' } );

					editor.setData(
						'<p>' +
							'foo<picture>' +
								'<source srcset="/assets/sample.png" type="image/png" media="(min-width: 800px)" sizes="2000px">' +
								'<source srcset="/assets/sample.png?foo" type="image/png" media="(max-width: 800px)" sizes="400px">' +
								'<img src="/assets/sample.png">' +
							'</picture>bar' +
						'</p>'
					);

					expect( editor.getData() ).to.equal( '<p>foo<img src="/assets/sample.png">bar</p>' );
				} );

				it( 'should downcast changed "sources" attribute on an existing picture element', () => {
					editor.setData(
						'<figure class="image">' +
							'<picture>' +
								'<source srcset="">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
							'<figcaption>Caption</figcaption>' +
						'</figure>'
					);

					model.change( writer => {
						writer.setAttribute(
							'sources',
							[
								{
									srcset: '/assets/sample2.png'
								}
							],
							modelDocument.getRoot().getChild( 0 )
						);
					} );

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false">' +
							'<picture>' +
								'<source srcset="/assets/sample2.png"></source>' +
								'<img src="/assets/sample.png"></img>' +
							'</picture>' +
							'<figcaption ' +
								'aria-label="Caption for the image" ' +
								'class="ck-editor__editable ck-editor__nested-editable" ' +
								'contenteditable="true" ' +
								'data-placeholder="Enter image caption" ' +
								'role="textbox" ' +
								'tabindex="-1">' +
									'Caption' +
							'</figcaption>' +
						'</figure>'
					);
				} );

				it( 'should downcast changed "sources" attribute on an existing linked picture element', () => {
					editor.setData(
						'<figure class="image">' +
							'<a href="https://ckeditor.com">' +
								'<picture>' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
							'<figcaption>Caption</figcaption>' +
						'</figure>'
					);

					model.change( writer => {
						writer.setAttribute(
							'sources',
							[
								{
									srcset: '/assets/sample2.png'
								}
							],
							modelDocument.getRoot().getChild( 0 )
						);
					} );

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false">' +
							'<a href="https://ckeditor.com">' +
								'<picture>' +
									'<source srcset="/assets/sample2.png"></source>' +
									'<img src="/assets/sample.png"></img>' +
								'</picture>' +
							'</a>' +
							'<figcaption ' +
								'aria-label="Caption for the image" ' +
								'class="ck-editor__editable ck-editor__nested-editable" ' +
								'contenteditable="true" ' +
								'data-placeholder="Enter image caption" ' +
								'role="textbox" ' +
								'tabindex="-1">' +
									'Caption' +
							'</figcaption>' +
						'</figure>'
					);
				} );

				it( 'should keep existing picture element attributes when downcasting "sources" attribute', () => {
					editor.model.schema.extend( 'imageBlock', {
						allowAttributes: [ 'pictureClass' ]
					} );

					editor.conversion.for( 'upcast' ).add( dispatcher => {
						dispatcher.on( 'element:picture', ( _evt, data, conversionApi ) => {
							const viewItem = data.viewItem;
							const modelElement = data.modelCursor.parent;

							conversionApi.writer.setAttribute( 'pictureClass', viewItem.getAttribute( 'class' ), modelElement );
						} );
					} );

					editor.conversion.for( 'downcast' ).add( dispatcher => {
						dispatcher.on( 'attribute:pictureClass:imageBlock', ( evt, data, conversionApi ) => {
							const element = conversionApi.mapper.toViewElement( data.item );
							const pictureElement = element.getChild( 0 );

							conversionApi.writer.setAttribute( 'class', data.attributeNewValue, pictureElement );
						} );
					} );

					editor.setData(
						'<figure class="image">' +
							'<picture class="test-class">' +
								'<source srcset="">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
							'<figcaption>Caption</figcaption>' +
						'</figure>'
					);

					model.change( writer => {
						writer.setAttribute(
							'sources',
							[
								{
									srcset: '/assets/sample2.png'
								}
							],
							modelDocument.getRoot().getChild( 0 )
						);
					} );

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false">' +
							'<picture class="test-class">' +
								'<source srcset="/assets/sample2.png"></source>' +
								'<img src="/assets/sample.png"></img>' +
							'</picture>' +
							'<figcaption ' +
								'aria-label="Caption for the image" ' +
								'class="ck-editor__editable ck-editor__nested-editable" ' +
								'contenteditable="true" ' +
								'data-placeholder="Enter image caption" ' +
								'role="textbox" ' +
								'tabindex="-1">' +
									'Caption' +
							'</figcaption>' +
						'</figure>'
					);
				} );
			} );
		} );
	} );

	describe( 'integration with ImageUploadEditing (uploadComplete event)', () => {
		let editor, model, fileRepository, nativeReaderMock, adapterMock, loader;

		beforeEach( async () => {
			testUtils.sinon.stub( global.window, 'FileReader' ).callsFake( () => {
				nativeReaderMock = new NativeFileReaderMock();

				return nativeReaderMock;
			} );

			editor = await VirtualTestEditor.create( {
				plugins: [
					Paragraph,
					PictureEditing,
					ImageBlockEditing, ImageInlineEditing,
					LinkImageEditing, ImageResizeEditing, ImageCaptionEditing, ImageUploadEditing,
					UploadAdapterPluginMock
				],
				image: { insert: { type: 'auto' } }
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should use "sources" in the #uploadComplete event', async () => {
			editor.setData( '<p>foo</p>' );
			editor.execute( 'uploadImage', { file: () => {} } );

			await new Promise( res => {
				model.document.once( 'change', res );
				loader.file.then( () => nativeReaderMock.mockSuccess( 'foo' ) );
			} );

			await new Promise( res => {
				model.document.once( 'change', res, { priority: 'lowest' } );
				loader.file.then( () => {
					adapterMock.mockSuccess( {
						default: 'image.png',
						sources: [
							{ srcset: 'bar.png', type: 'image/png', media: '(max-width: 800px)' },
							{ srcset: 'baz.png', type: 'image/png', media: '(min-width: 800px)' }
						]
					} );
				} );
			} );

			expect( getModelData( editor.model ) ).to.equal(
				'<paragraph>' +
					'[<imageInline sources="[object Object],[object Object]" src="image.png"></imageInline>]' +
					'foo' +
				'</paragraph>'
			);

			assertPictureSources( model, editor.plugins.get( 'ImageUtils' ), [
				{
					media: '(max-width: 800px)',
					srcset: 'bar.png',
					type: 'image/png'
				},
				{
					media: '(min-width: 800px)',
					srcset: 'baz.png',
					type: 'image/png'
				}
			] );
		} );

		it( 'should not activate if "sources" in the #uploadComplete event is missing', async () => {
			editor.setData( '<p>foo</p>' );
			editor.execute( 'uploadImage', { file: () => {} } );

			await new Promise( res => {
				model.document.once( 'change', res );
				loader.file.then( () => nativeReaderMock.mockSuccess( 'foo' ) );
			} );

			await new Promise( res => {
				model.document.once( 'change', res, { priority: 'lowest' } );
				loader.file.then( () => {
					adapterMock.mockSuccess( { default: 'image.png' } );
				} );
			} );

			expect( getModelData( editor.model ) ).to.equal(
				'<paragraph>' +
					'[<imageInline src="image.png"></imageInline>]' +
					'foo' +
				'</paragraph>'
			);
		} );

		class UploadAdapterPluginMock extends Plugin {
			init() {
				fileRepository = this.editor.plugins.get( 'FileRepository' );
				fileRepository.createUploadAdapter = newLoader => {
					loader = newLoader;
					adapterMock = new UploadAdapterMock( loader );

					return adapterMock;
				};
			}
		}
	} );
} );

// Asserts the value of the "sources" attribute of the first imageBlock/imageInline found in the document.
// @private
function assertPictureSources( model, imageUtils, expectedSources ) {
	// Recursively search for the first image.
	const image = [ ...model.createRangeIn( model.document.getRoot() ).getItems() ]
		.find( item => imageUtils.isImage( item ) );

	expect( image.getAttribute( 'sources' ) ).to.deep.equal( expectedSources );
}
