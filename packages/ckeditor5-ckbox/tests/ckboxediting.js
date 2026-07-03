/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { LinkEditing, LinkImageEditing } from '@ckeditor/ckeditor5-link';
import {
	PictureEditing,
	ImageUploadEditing,
	ImageUploadProgress,
	ImageBlockEditing,
	ImageInlineEditing,
	ImageCaptionEditing
} from '@ckeditor/ckeditor5-image';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { ModelElement, _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import { CommandCollection } from '@ckeditor/ckeditor5-core';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { CloudServicesCoreMock } from './_utils/cloudservicescoremock.js';

import { CKBoxEditing } from '../src/ckboxediting.js';
import { CKBoxImageEditEditing } from '../src/ckboximageedit/ckboximageeditediting.js';
import { CKBoxCommand } from '../src/ckboxcommand.js';
import { CKBoxUploadAdapter } from '../src/ckboxuploadadapter.js';
import { TokenMock } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import { CKBoxUtils } from '../src/ckboxutils.js';

describe( 'CKBoxEditing', () => {
	let editor, model, view, originalCKBox, replaceImageSourceCommand;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( async () => {
		TokenMock.initialToken = 'ckbox-token';

		// `CKBoxEditing#init()` fires an unawaited upload permission request. Stub the network layer out so
		// the request does not end up as an unhandled rejection that fails the Vitest run. Tests exercising
		// the permission request replace `window.XMLHttpRequest` with a fake server, so they are not affected.
		vi.spyOn( window.XMLHttpRequest.prototype, 'send' ).mockImplementation( () => {} );
		vi.spyOn( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).mockResolvedValue();

		originalCKBox = window.CKBox;
		window.CKBox = {};

		editor = await createTestEditor( {
			ckbox: {
				tokenUrl: 'http://cs.example.com'
			}
		} );

		replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );
		model = editor.model;
		view = editor.editing.view;
	} );

	afterEach( async () => {
		window.CKBox = originalCKBox;
		await editor.destroy();
	} );

	it( 'should have proper name', () => {
		expect( CKBoxEditing.pluginName ).toEqual( 'CKBoxEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKBoxEditing ) ).toBeInstanceOf( CKBoxEditing );
	} );

	it( 'should load link and picture features', () => {
		expect( CKBoxEditing.requires ).toEqual( [ LinkEditing, PictureEditing, CKBoxUploadAdapter, CKBoxUtils ] );
	} );

	it( 'should register the "ckbox" command if CKBox lib is loaded', () => {
		expect( editor.commands.get( 'ckbox' ) ).toBeInstanceOf( CKBoxCommand );
	} );

	it( 'should not register the "ckbox" command if CKBox lib is missing', async () => {
		delete window.CKBox;

		const editor = await createTestEditor( {
			ckbox: {
				tokenUrl: 'http://cs.example.com'
			}
		} );

		expect( editor.commands.get( 'ckbox' ) ).toBeUndefined();
	} );

	describe( 'schema', () => {
		it( 'should extend the schema rules for image', () => {
			const linkedImageBlockElement = new ModelElement( 'imageBlock', { linkHref: 'http://cs.example.com' } );
			const linkedImageInlineElement = new ModelElement( 'imageInline', { linkHref: 'http://cs.example.com' } );

			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxImageId' ) ).toBe( true );
			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', linkedImageBlockElement ], 'ckboxLinkId' ) ).toBe( true );
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxImageId' ) ).toBe( true );
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', '$block', linkedImageInlineElement ], 'ckboxLinkId' ) ).toBe( true );
		} );

		it( 'should extend the schema rules for link', () => {
			const linkElement = new ModelElement( '$text', { linkHref: 'http://cs.example.com' } );

			expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', '$block', linkElement ], 'ckboxLinkId' ) ).toBe( true );
		} );

		it( 'should not extend the schema rules for image if ID insertion is disabled', async () => {
			const editor = await createTestEditor( {
				ckbox: {
					ignoreDataId: true,
					tokenUrl: 'http://cs.example.com'
				}
			} );

			const model = editor.model;

			const linkedImageBlockElement = new ModelElement( 'imageBlock', { linkHref: 'http://cs.example.com' } );
			const linkedImageInlineElement = new ModelElement( 'imageInline', { linkHref: 'http://cs.example.com' } );

			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxImageId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', linkedImageBlockElement ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxImageId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', '$block', linkedImageInlineElement ], 'ckboxLinkId' ) ).toBe( false );

			await editor.destroy();
		} );

		it( 'should not extend the schema rules for image if CKBox lib and `config.ckbox` are missing', async () => {
			delete window.CKBox;

			const editor = await createTestEditor( {
				cloudServices: {
					tokenUrl: 'http://cs.example.com'
				}
			} );

			const model = editor.model;

			const linkedImageBlockElement = new ModelElement( 'imageBlock', { linkHref: 'http://cs.example.com' } );
			const linkedImageInlineElement = new ModelElement( 'imageInline', { linkHref: 'http://cs.example.com' } );

			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxImageId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', linkedImageBlockElement ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxImageId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', '$block', linkedImageInlineElement ], 'ckboxLinkId' ) ).toBe( false );

			await editor.destroy();
		} );

		it( 'should not extend the schema rules for link if ID insertion is disabled', async () => {
			const editor = await createTestEditor( {
				ckbox: {
					ignoreDataId: true,
					tokenUrl: 'http://cs.example.com'
				}
			} );

			const model = editor.model;

			const linkElement = new ModelElement( '$text', { linkHref: 'http://cs.example.com' } );

			expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', '$block', linkElement ], 'ckboxLinkId' ) ).toBe( false );

			await editor.destroy();
		} );

		it( 'should not extend the schema rules for link if CKBox lib and `config.ckbox` are missing', async () => {
			delete window.CKBox;

			const editor = await createTestEditor( {
				cloudServices: {
					tokenUrl: 'http://cs.example.com'
				}
			} );

			const model = editor.model;

			const linkElement = new ModelElement( '$text', { linkHref: 'http://cs.example.com' } );

			expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'ckboxLinkId' ) ).toBe( false );
			expect( model.schema.checkAttribute( [ '$root', '$block', linkElement ], 'ckboxLinkId' ) ).toBe( false );

			await editor.destroy();
		} );

		describe( 'CKBox loaded before the ImageBlock and ImageInline plugins', () => {
			let editor, model, originalCKBox;

			beforeEach( async () => {
				TokenMock.initialToken = 'ckbox-token';

				originalCKBox = window.CKBox;
				window.CKBox = {};

				editor = await createTestEditor( {
					ckbox: {
						tokenUrl: 'http://cs.example.com'
					}
				}, true );

				model = editor.model;
			} );

			afterEach( async () => {
				window.CKBox = originalCKBox;
				await editor.destroy();
			} );

			// https://github.com/ckeditor/ckeditor5/issues/15581
			it( 'should extend the schema rules for imageBlock and imageInline', () => {
				expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxImageId' ) ).toBe( true );
				expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxImageId' ) ).toBe( true );
			} );
		} );
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
			it( 'should convert "data-ckbox-resource-id" attribute from a link', () => {
				editor.setData( '<p><a href="/assets/file" data-ckbox-resource-id="link-id">foo</a>bar</p>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
					'<paragraph><$text ckboxLinkId="link-id" linkHref="/assets/file">foo</$text>bar</paragraph>'
				);
			} );

			it( 'should convert "data-ckbox-resource-id" attribute from an inline image', () => {
				editor.setData(
					'<p>' +
						'<picture>' +
							'<source srcset="/sample.png" media="(max-width: 600px)">' +
							'<source srcset="/sample.png">' +
							'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
						'</picture>' +
					'</p>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
					'<paragraph>' +
						'<imageInline ' +
							'ckboxImageId="image-id" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/sample.png">' +
						'</imageInline>' +
					'</paragraph>'
				);
			} );

			it( 'should convert both "data-ckbox-resource-id" attributes from a linked inline image', () => {
				editor.setData(
					'<p>' +
						'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</a>' +
					'</p>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
					'<paragraph>' +
						'<$text ckboxLinkId="link-id" linkHref="/sample.png">Foobar</$text>' +
						'<imageInline ' +
							'ckboxImageId="image-id" ' +
							'ckboxLinkId="link-id" ' +
							'linkHref="/sample.png" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/sample.png">' +
						'</imageInline>' +
					'</paragraph>'
				);
			} );

			it( 'should convert "data-ckbox-resource-id" attribute from a block image', () => {
				editor.setData(
					'<figure class="image" data-ckbox-resource-id="image-id">' +
						'<picture>' +
							'<source srcset="/sample.png" media="(max-width: 600px)">' +
							'<source srcset="/sample.png">' +
							'<img src="/sample.png">' +
						'</picture>' +
					'</figure>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
					'<imageBlock ' +
						'ckboxImageId="image-id" ' +
						'sources="[object Object],[object Object]" ' +
						'src="/sample.png">' +
					'</imageBlock>'
				);
			} );

			it( 'should convert both "data-ckbox-resource-id" attributes from a linked block image', () => {
				editor.setData(
					'<figure class="image" data-ckbox-resource-id="image-id">' +
						'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png">' +
							'</picture>' +
						'</a>' +
					'</figure>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
					'<imageBlock ' +
						'ckboxImageId="image-id" ' +
						'ckboxLinkId="link-id" ' +
						'linkHref="/sample.png" ' +
						'sources="[object Object],[object Object]" ' +
						'src="/sample.png">' +
					'</imageBlock>'
				);
			} );

			it( 'should convert both "data-ckbox-resource-id" attributes from a linked block image (figcaption is a link)', () => {
				editor.setData(
					'<figure class="image" data-ckbox-resource-id="image-id">' +
						'<picture>' +
							'<source srcset="/sample.png" media="(max-width: 600px)">' +
							'<source srcset="/sample.png">' +
							'<img src="/sample.png">' +
						'</picture>' +
						'<figcaption>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'Text of the caption' +
							'</a>' +
						'</figcaption>' +
					'</figure>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
					'<imageBlock ' +
						'ckboxImageId="image-id" ' +
						'sources="[object Object],[object Object]" ' +
						'src="/sample.png">' +
						'<caption>' +
							'<$text ckboxLinkId="link-id" linkHref="/sample.png">' +
								'Text of the caption' +
							'</$text>' +
						'</caption>' +
					'</imageBlock>'
				);
			} );

			it( 'should not convert "data-ckbox-resource-id" attribute from disallowed element', () => {
				editor.setData( '<p data-ckbox-resource-id="id-foo"><a data-ckbox-resource-id="id-bar">foo</a>bar</p>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foobar</paragraph>' );
			} );

			it( 'should not consume the "data-ckbox-resource-id" attribute from link elements if already consumed (<a>)', () => {
				editor.conversion.for( 'upcast' ).add( dispatcher => {
					dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
						const consumableAttributes = { attributes: [ 'data-ckbox-resource-id' ] };

						conversionApi.consumable.consume( data.viewItem, consumableAttributes );
					} );
				} );

				editor.setData( '<p><a href="/assets/file" data-ckbox-resource-id="link-id">foo</a>bar</p>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
					'<paragraph><$text linkHref="/assets/file">foo</$text>bar</paragraph>'
				);
			} );

			it( 'should not consume the "data-ckbox-resource-id" attribute from link elements if already consumed (<a> + inline image)',
				() => {
					editor.conversion.for( 'upcast' ).add( dispatcher => {
						dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
							const consumableAttributes = { attributes: [ 'data-ckbox-resource-id' ] };

							conversionApi.consumable.consume( data.viewItem, consumableAttributes );
						} );
					} );

					editor.setData(
						'<p>' +
						'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</a>' +
					'</p>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
						'<paragraph>' +
						'<$text linkHref="/sample.png">Foobar</$text>' +
						'<imageInline ' +
							'ckboxImageId="image-id" ' +
							'linkHref="/sample.png" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/sample.png">' +
						'</imageInline>' +
					'</paragraph>'
					);
				}
			);

			it( 'should not consume the "data-ckbox-resource-id" attribute from link elements if already consumed (linked inline image)',
				() => {
					editor.conversion.for( 'upcast' ).add( dispatcher => {
						dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
							const consumableAttributes = { attributes: [ 'data-ckbox-resource-id' ] };

							conversionApi.consumable.consume( data.viewItem, consumableAttributes );
						} );
					} );

					editor.setData(
						'<p>' +
						'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</a>' +
					'</p>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
						'<paragraph>' +
						'<imageInline ' +
							'ckboxImageId="image-id" ' +
							'linkHref="/sample.png" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/sample.png">' +
						'</imageInline>' +
					'</paragraph>'
					);
				}
			);

			it( 'should not consume the "data-ckbox-resource-id" attribute from link elements if already consumed (linked block image)',
				() => {
					editor.conversion.for( 'upcast' ).add( dispatcher => {
						dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
							const consumableAttributes = { attributes: [ 'data-ckbox-resource-id' ] };

							conversionApi.consumable.consume( data.viewItem, consumableAttributes );
						} );
					} );

					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
						'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png">' +
							'</picture>' +
						'</a>' +
					'</figure>'
					);

					expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
						'<imageBlock ' +
						'ckboxImageId="image-id" ' +
						'linkHref="/sample.png" ' +
						'sources="[object Object],[object Object]" ' +
						'src="/sample.png">' +
					'</imageBlock>'
					);
				}
			);

			it( 'should not convert the "data-ckbox-resource-id" attribute if empty', () => {
				editor.setData( '<p><a href="/assets/file" data-ckbox-resource-id>foo</a>bar</p>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual(
					'<paragraph><$text linkHref="/assets/file">foo</$text>bar</paragraph>'
				);
			} );

			describe( 'ckbox.ignoreDataId = true', () => {
				it( 'should not convert the "data-ckbox-resource-id" for the link element', async () => {
					const editor = await createTestEditor( {
						ckbox: {
							tokenUrl: 'http://cs.example.com',
							ignoreDataId: true
						}
					} );

					editor.setData( '<p><a href="/assets/file" data-ckbox-resource-id="link-id">foo</a>bar</p>' );

					expect( _getModelData( editor.model, { withoutSelection: true } ) ).toEqual(
						'<paragraph><$text linkHref="/assets/file">foo</$text>bar</paragraph>'
					);

					return editor.destroy();
				} );

				it( 'should not convert the "data-ckbox-resource-id" for an image element', async () => {
					const editor = await createTestEditor( {
						ckbox: {
							tokenUrl: 'http://cs.example.com',
							ignoreDataId: true
						}
					} );

					editor.setData( '<img src="/sample.png" data-ckbox-resource-id="image-id">' );

					expect( _getModelData( editor.model, { withoutSelection: true } ) ).toEqual(
						'<paragraph><imageInline src="/sample.png"></imageInline></paragraph>'
					);

					return editor.destroy();
				} );

				it( 'should not convert the "data-ckbox-resource-id" for the linked inline image', async () => {
					const editor = await createTestEditor( {
						ckbox: {
							tokenUrl: 'http://cs.example.com',
							ignoreDataId: true
						}
					} );

					editor.setData(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					expect( _getModelData( editor.model, { withoutSelection: true } ) ).toEqual(
						'<paragraph>' +
							'<imageInline ' +
								'linkHref="/sample.png" ' +
								'sources="[object Object],[object Object]" ' +
								'src="/sample.png">' +
							'</imageInline>' +
						'</paragraph>'
					);

					return editor.destroy();
				} );

				it( 'should not convert the "data-ckbox-resource-id" for the linked block image', async () => {
					const editor = await createTestEditor( {
						ckbox: {
							tokenUrl: 'http://cs.example.com',
							ignoreDataId: true
						}
					} );

					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					expect( _getModelData( editor.model, { withoutSelection: true } ) ).toEqual(
						'<imageBlock ' +
							'linkHref="/sample.png" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/sample.png">' +
						'</imageBlock>'
					);

					return editor.destroy();
				} );
			} );

			describe( 'CKBox lib and `config.ckbox` are missing', () => {
				beforeEach( () => {
					delete window.CKBox;
				} );

				it( 'should not convert the "data-ckbox-resource-id" for the link element', async () => {
					const editor = await createTestEditor();

					editor.setData( '<p><a href="/assets/file" data-ckbox-resource-id="link-id">foo</a>bar</p>' );

					expect( _getModelData( editor.model, { withoutSelection: true } ) ).toEqual(
						'<paragraph><$text linkHref="/assets/file">foo</$text>bar</paragraph>'
					);

					return editor.destroy();
				} );

				it( 'should not convert the "data-ckbox-resource-id" for an image element', async () => {
					const editor = await createTestEditor();

					editor.setData( '<img src="/sample.png" data-ckbox-resource-id="image-id">' );

					expect( _getModelData( editor.model, { withoutSelection: true } ) ).toEqual(
						'<paragraph><imageInline src="/sample.png"></imageInline></paragraph>'
					);

					return editor.destroy();
				} );

				it( 'should not convert the "data-ckbox-resource-id" for the linked inline image', async () => {
					const editor = await createTestEditor();

					editor.setData(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					expect( _getModelData( editor.model, { withoutSelection: true } ) ).toEqual(
						'<paragraph>' +
							'<imageInline ' +
								'linkHref="/sample.png" ' +
								'sources="[object Object],[object Object]" ' +
								'src="/sample.png">' +
							'</imageInline>' +
						'</paragraph>'
					);

					return editor.destroy();
				} );

				it( 'should not convert the "data-ckbox-resource-id" for the linked block image', async () => {
					const editor = await createTestEditor();

					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					expect( _getModelData( editor.model, { withoutSelection: true } ) ).toEqual(
						'<imageBlock ' +
							'linkHref="/sample.png" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/sample.png">' +
						'</imageBlock>'
					);

					return editor.destroy();
				} );
			} );
		} );

		describe( 'downcast', () => {
			describe( 'editing', () => {
				it( 'should convert "data-ckbox-resource-id" attribute from a link', () => {
					editor.setData(
						'<p><a data-ckbox-resource-id="link-id" href="/assets/file">foo</a>bar</p>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<p><a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/assets/file">foo</a>bar</p>'
					);
				} );

				it( 'should convert "data-ckbox-resource-id" attribute from an inline image', () => {
					editor.setData(
						'<p>' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</p>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<p>' +
							'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
									'<source srcset="/sample.png"></source>' +
									'<img src="/sample.png"></img>' +
								'</picture>' +
							'</span>' +
						'</p>'
					);
				} );

				it( 'should convert both "data-ckbox-resource-id" attributes from a linked inline image', () => {
					editor.setData(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<p>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/sample.png">' +
								'Foobar' +
								'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
									'<picture>' +
										'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
										'<source srcset="/sample.png"></source>' +
										'<img src="/sample.png"></img>' +
									'</picture>' +
								'</span>' +
							'</a>' +
						'</p>'
					);
				} );

				it( 'should convert "data-ckbox-resource-id" attribute from a block image', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png">' +
							'</picture>' +
						'</figure>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
								'<source srcset="/sample.png"></source>' +
								'<img src="/sample.png"></img>' +
							'</picture>' +
						'</figure>'
					);
				} );

				it( 'should convert both "data-ckbox-resource-id" attributes from a linked caption from block image', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png">' +
							'</picture>' +
							'<figcaption>' +
								'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
									'Text of the caption' +
								'</a>' +
							'</figcaption>' +
						'</figure>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
								'<source srcset="/sample.png"></source>' +
								'<img src="/sample.png"></img>' +
							'</picture>' +
							'<figcaption ' +
								'aria-label="Caption for the image" ' +
								'class="ck-editor__editable ck-editor__nested-editable" ' +
								'contenteditable="true" ' +
								'data-placeholder="Enter image caption" ' +
								'role="textbox" ' +
								'tabindex="-1">' +
								'<a data-ckbox-resource-id="link-id" href="/sample.png">Text of the caption</a>' +
							'</figcaption>' +
						'</figure>'
					);
				} );

				it( 'should convert both "data-ckbox-resource-id" attributes from a linked block image', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<a data-ckbox-resource-id="link-id" href="/sample.png">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
									'<source srcset="/sample.png"></source>' +
									'<img src="/sample.png"></img>' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);
				} );

				it( 'should not convert "data-ckbox-resource-id" attribute from disallowed element', () => {
					editor.setData( '<p data-ckbox-resource-id="id"><a data-ckbox-resource-id="id">foo</a>bar</p>' );

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual( '<p>foobar</p>' );
				} );

				it( 'should not add the "data-ckbox-resource-id" attribute when removed from the model element (<imageBlock>)', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					editor.model.change( writer => {
						const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
						writer.removeAttribute( 'ckboxLinkId', imageBlock );
					} );

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
									'<source srcset="/sample.png"></source>' +
									'<img src="/sample.png"></img>' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);
				} );

				it( 'should modify the "data-ckbox-resource-id" attribute when updating its value in the model element (<imageBlock>)',
					() => {
						editor.setData(
							'<figure class="image" data-ckbox-resource-id="image-id">' +
						'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
						'<picture>' +
						'<source srcset="/sample.png" media="(max-width: 600px)">' +
						'<source srcset="/sample.png">' +
						'<img src="/sample.png">' +
						'</picture>' +
						'</a>' +
						'</figure>'
						);

						editor.model.change( writer => {
							const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
							writer.setAttribute( 'ckboxLinkId', 'foo-bar-test', imageBlock );
						} );

						expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
							'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
						'<a data-ckbox-resource-id="foo-bar-test" href="/sample.png">' +
						'<picture>' +
						'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
						'<source srcset="/sample.png"></source>' +
						'<img src="/sample.png"></img>' +
						'</picture>' +
						'</a>' +
						'</figure>'
						);
					}
				);

				it( 'should not wrap the image in the "<a>" element when the "linkHref" attribute is removed (<imageBlock>)', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					editor.model.change( writer => {
						const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
						writer.removeAttribute( 'linkHref', imageBlock );
					} );

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
								'<source srcset="/sample.png"></source>' +
								'<img src="/sample.png"></img>' +
							'</picture>' +
						'</figure>'
					);
				} );

				it( 'should not consume the "ckboxLinkId" attribute if already consumed (<imageBlock>)', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher => {
						dispatcher.on( 'attribute:ckboxLinkId:imageBlock', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						} );
					} );

					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
									'<source srcset="/sample.png"></source>' +
									'<img src="/sample.png"></img>' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);
				} );

				it( 'should not add the "data-ckbox-resource-id" attribute when removed from the model element (<imageInline>)', () => {
					editor.setData(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					editor.model.change( writer => {
						const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
						writer.removeAttribute( 'ckboxLinkId', imageInline );
					} );

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<p>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/sample.png">' +
								'Foobar' +
							'</a>' +
							'<a class="ck-link_selected" href="/sample.png">' +
								'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
									'<picture>' +
										'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
										'<source srcset="/sample.png"></source>' +
										'<img src="/sample.png"></img>' +
									'</picture>' +
								'</span>' +
							'</a>' +
						'</p>'
					);
				} );

				it( 'should modify the "data-ckbox-resource-id" attribute when updating its value in the model element (<imageInline>)',
					() => {
						editor.setData(
							'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
						);

						editor.model.change( writer => {
							const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
							writer.setAttribute( 'ckboxLinkId', 'foo-bar-test', imageInline );
						} );

						expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
							'<p>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/sample.png">' +
								'Foobar' +
							'</a>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="foo-bar-test" href="/sample.png">' +
								'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
									'<picture>' +
										'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
										'<source srcset="/sample.png"></source>' +
										'<img src="/sample.png"></img>' +
									'</picture>' +
								'</span>' +
							'</a>' +
						'</p>'
						);
					}
				);

				it( 'should not wrap the image in the "<a>" element when the "linkHref" attribute is removed (<imageInline>)', () => {
					editor.setData(
						'<p>' +
						'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
						'Foobar' +
						'<picture>' +
						'<source srcset="/sample.png" media="(max-width: 600px)">' +
						'<source srcset="/sample.png">' +
						'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
						'</picture>' +
						'</a>' +
						'</p>'
					);

					editor.model.change( writer => {
						const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
						writer.removeAttribute( 'linkHref', imageInline );
					} );

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<p>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/sample.png">' +
								'Foobar' +
							'</a>' +
							'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
									'<source srcset="/sample.png"></source>' +
									'<img src="/sample.png"></img>' +
								'</picture>' +
							'</span>' +
						'</p>'
					);
				} );

				it( 'should not consume the "ckboxLinkId" attribute if already consumed (<imageInline>)', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher => {
						dispatcher.on( 'attribute:ckboxLinkId:imageInline', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						} );
					} );

					editor.setData(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<p>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/sample.png">' +
								'Foobar' +
							'</a>' +
							'<a class="ck-link_selected" href="/sample.png">' +
								'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png"></source>' +
									'<source srcset="/sample.png"></source>' +
									'<img src="/sample.png"></img>' +
								'</picture>' +
								'</span>' +
							'</a>' +
						'</p>'
					);
				} );

				it( 'should not add the "data-ckbox-resource-id" attribute when removed from the model element ([linkHref])', () => {
					editor.setData(
						'<p><a data-ckbox-resource-id="link-id" href="/assets/file">foo</a>bar</p>'
					);

					editor.model.change( writer => {
						const textNode = editor.model.document.getRoot().getNodeByPath( [ 0, 0 ] );
						writer.removeAttribute( 'ckboxLinkId', textNode );
					} );

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<p><a class="ck-link_selected" href="/assets/file">foo</a>bar</p>'
					);
				} );

				it( 'should modify the "data-ckbox-resource-id" attribute when updating its value in the model element ([linkHref])',
					() => {
						editor.setData(
							'<p><a data-ckbox-resource-id="link-id" href="/assets/file">foo</a>bar</p>'
						);

						editor.model.change( writer => {
							const textNode = editor.model.document.getRoot().getNodeByPath( [ 0, 0 ] );
							writer.setAttribute( 'ckboxLinkId', 'foo-bar-test', textNode );
						} );

						expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
							'<p><a class="ck-link_selected" data-ckbox-resource-id="foo-bar-test" href="/assets/file">foo</a>bar</p>'
						);
					}
				);

				it( 'should not wrap the text node when the "linkHref" attribute is removed ([linkHref])', () => {
					editor.setData(
						'<p><a data-ckbox-resource-id="link-id" href="/assets/file">foo</a>bar</p>'
					);

					editor.model.change( writer => {
						const textNode = editor.model.document.getRoot().getNodeByPath( [ 0, 0 ] );
						writer.removeAttribute( 'linkHref', textNode );
					} );

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<p>foobar</p>'
					);
				} );

				it( 'should not consume the "ckboxLinkId" attribute if already consumed ([linkHref])', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher => {
						dispatcher.on( 'attribute:ckboxLinkId:$text', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						} );
					} );

					editor.setData(
						'<p><a data-ckbox-resource-id="link-id" href="/assets/file">foo</a>bar</p>'
					);

					expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
						'<p><a class="ck-link_selected" href="/assets/file">foo</a>bar</p>'
					);
				} );
			} );

			describe( 'data', () => {
				it( 'should convert "data-ckbox-resource-id" attribute from a link', () => {
					const data = '<p><a href="/assets/file" data-ckbox-resource-id="link-id">foo</a>bar</p>';

					editor.setData( data );

					expect( editor.getData() ).toEqual( data );
				} );

				it( 'should convert "data-ckbox-resource-id" attribute from an inline image', () => {
					const data =
						'<p>' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</p>';

					editor.setData( data );

					expect( editor.getData() ).toEqual( data );
				} );

				it( 'should convert both "data-ckbox-resource-id" attributes from a linked inline image', () => {
					const data =
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>';

					editor.setData( data );

					expect( editor.getData() ).toEqual( data );
				} );

				it( 'should convert "data-ckbox-resource-id" attribute from a block image', () => {
					const data =
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png">' +
							'</picture>' +
						'</figure>';

					editor.setData( data );

					expect( editor.getData() ).toEqual( data );
				} );

				it( 'should convert both "data-ckbox-resource-id" attributes from a linked block image', () => {
					const data =
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png">' +
							'</picture>' +
							'<figcaption>' +
								'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
									'Text of the caption' +
								'</a>' +
							'</figcaption>' +
						'</figure>';

					editor.setData( data );

					expect( editor.getData() ).toEqual( data );
				} );

				it( 'should not convert "data-ckbox-resource-id" attribute from disallowed element', () => {
					editor.setData( '<p data-ckbox-resource-id="id"><a data-ckbox-resource-id="id">foo</a>bar</p>' );

					expect( editor.getData() ).toEqual( '<p>foobar</p>' );
				} );

				it( 'should not add the "data-ckbox-resource-id" attribute when removed from the model element (<imageBlock>)', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					editor.model.change( writer => {
						const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
						writer.removeAttribute( 'ckboxLinkId', imageBlock );
					} );

					expect( editor.getData() ).toEqual(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);
				} );

				it( 'should modify the "data-ckbox-resource-id" attribute when updating its value in the model element (<imageBlock>)',
					() => {
						editor.setData(
							'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
						);

						editor.model.change( writer => {
							const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
							writer.setAttribute( 'ckboxLinkId', 'foo-bar-test', imageBlock );
						} );

						expect( editor.getData() ).toEqual(
							'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="foo-bar-test">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
						);
					}
				);

				it( 'should not wrap the image in the "<a>" element when the "linkHref" attribute is removed (<imageBlock>)', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					editor.model.change( writer => {
						const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
						writer.removeAttribute( 'linkHref', imageBlock );
					} );

					expect( editor.getData() ).toEqual(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png">' +
							'</picture>' +
						'</figure>'
					);
				} );

				it( 'should not consume the "ckboxLinkId" attribute if already consumed (<imageBlock>)', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher => {
						dispatcher.on( 'attribute:ckboxLinkId:imageBlock', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						} );
					} );

					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					expect( editor.getData() ).toEqual(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/sample.png">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);
				} );

				it( 'should not add the "data-ckbox-resource-id" attribute when removed from the model element (<imageInline>)', () => {
					editor.setData(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					editor.model.change( writer => {
						const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
						writer.removeAttribute( 'ckboxLinkId', imageInline );
					} );

					expect( editor.getData() ).toEqual(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
							'</a>' +
							'<a href="/sample.png">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);
				} );

				it( 'should modify the "data-ckbox-resource-id" attribute when updating its value in the model element (<imageInline>)',
					() => {
						editor.setData(
							'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
						);

						editor.model.change( writer => {
							const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
							writer.setAttribute( 'ckboxLinkId', 'foo-bar-test', imageInline );
						} );

						expect( editor.getData() ).toEqual(
							'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
							'</a>' +
							'<a href="/sample.png" data-ckbox-resource-id="foo-bar-test">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
						);
					}
				);

				it( 'should not wrap the image in the "<a>" element when the "linkHref" attribute is removed (<imageInline>)', () => {
					editor.setData(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					editor.model.change( writer => {
						const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
						writer.removeAttribute( 'linkHref', imageInline );
					} );

					expect( editor.getData() ).toEqual(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
							'</a>' +
							'<picture>' +
								'<source srcset="/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/sample.png">' +
								'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</p>'
					);
				} );

				it( 'should not consume the "ckboxLinkId" attribute if already consumed (<imageInline>)', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher => {
						dispatcher.on( 'attribute:ckboxLinkId:imageInline', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						} );
					} );

					editor.setData(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/sample.png">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					expect( editor.getData() ).toEqual(
						'<p>' +
							'<a href="/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
							'</a>' +
							'<a href="/sample.png">' +
								'<picture>' +
									'<source srcset="/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/sample.png">' +
									'<img src="/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);
				} );

				it( 'should not add the "data-ckbox-resource-id" attribute when removed from the model element ([linkHref])', () => {
					editor.setData(
						'<p><a data-ckbox-resource-id="link-id" href="/assets/file">foo</a>bar</p>'
					);

					editor.model.change( writer => {
						const textNode = editor.model.document.getRoot().getNodeByPath( [ 0, 0 ] );
						writer.removeAttribute( 'ckboxLinkId', textNode );
					} );

					expect( editor.getData() ).toEqual(
						'<p><a href="/assets/file">foo</a>bar</p>'
					);
				} );

				it( 'should modify the "data-ckbox-resource-id" attribute when updating its value in the model element ([linkHref])',
					() => {
						editor.setData(
							'<p><a data-ckbox-resource-id="link-id" href="/assets/file">foo</a>bar</p>'
						);

						editor.model.change( writer => {
							const textNode = editor.model.document.getRoot().getNodeByPath( [ 0, 0 ] );
							writer.setAttribute( 'ckboxLinkId', 'foo-bar-test', textNode );
						} );

						expect( editor.getData() ).toEqual(
							'<p><a href="/assets/file" data-ckbox-resource-id="foo-bar-test">foo</a>bar</p>'
						);
					}
				);

				it( 'should not wrap the text node when the "linkHref" attribute is removed ([linkHref])', () => {
					editor.setData(
						'<p><a href="/assets/file" data-ckbox-resource-id="link-id">foo</a>bar</p>'
					);

					editor.model.change( writer => {
						const textNode = editor.model.document.getRoot().getNodeByPath( [ 0, 0 ] );
						writer.removeAttribute( 'linkHref', textNode );
					} );

					expect( editor.getData() ).toEqual(
						'<p>foobar</p>'
					);
				} );

				it( 'should not consume the "ckboxLinkId" attribute if already consumed ([linkHref])', () => {
					editor.conversion.for( 'downcast' ).add( dispatcher => {
						dispatcher.on( 'attribute:ckboxLinkId:$text', ( evt, data, conversionApi ) => {
							conversionApi.consumable.consume( data.item, evt.name );
						} );
					} );

					editor.setData(
						'<p><a data-ckbox-resource-id="link-id" href="/assets/file">foo</a>bar</p>'
					);

					expect( editor.getData() ).toEqual(
						'<p><a href="/assets/file">foo</a>bar</p>'
					);
				} );
			} );
		} );
	} );

	describe( 'fixers', () => {
		let assets;

		beforeEach( () => {
			assets = {
				link: {
					id: 'link-id',
					type: 'link',
					attributes: {
						linkHref: 'https://cksource.com/assets/link-id/file?download=true',
						linkName: 'file'
					}
				},
				image: {
					id: 'image-id',
					type: 'image',
					attributes: {
						imageFallbackUrl: 'https://cksource.com/assets/image-id/images/200.png',
						imageSources: [
							{
								sizes: '(max-width: 200px) 100vw, 200px',
								srcset:
								'https://cksource.com/assets/image-id/images/120.webp 120w,' +
								'https://cksource.com/assets/image-id/images/200.webp 200w',
								type: 'image/webp'
							}
						],
						imageTextAlternative: 'foo'
					}
				}
			};
		} );

		it( 'should insert the "ckboxImageId" and "ckboxLinkId" attributes if ID insertion is enabled (by default)', async () => {
			const command = editor.commands.get( 'ckbox' );

			command._chosenAssets.add( assets.link );
			command._chosenAssets.add( assets.image );

			model.change( writer => {
				writer.insert(
					writer.createElement( 'imageInline', { src: 'https://cksource.com/assets/image-id/images/200.png' } ),
					model.document.selection.getFirstPosition()
				);

				writer.insert(
					writer.createText( 'foo', { linkHref: 'https://cksource.com/assets/link-id/file?download=true' } ),
					model.document.selection.getFirstPosition()
				);
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>' +
					'<$text ' +
						'ckboxLinkId="link-id" ' +
						'linkHref="https://cksource.com/assets/link-id/file?download=true">[]foo' +
					'</$text>' +
					'<imageInline ' +
						'ckboxImageId="image-id" ' +
						'src="https://cksource.com/assets/image-id/images/200.png">' +
					'</imageInline>' +
				'</paragraph>'
			);
		} );

		it( 'should not insert the "ckboxImageId" and "ckboxLinkId" attributes if ID insertion is disabled', async () => {
			const editor = await createTestEditor( {
				ckbox: {
					ignoreDataId: true,
					tokenUrl: 'http://cs.example.com'
				}
			} );

			const model = editor.model;
			const command = editor.commands.get( 'ckbox' );

			command._chosenAssets.add( assets.link );
			command._chosenAssets.add( assets.image );

			model.change( writer => {
				writer.insert(
					writer.createElement( 'imageInline', { src: 'https://cksource.com/assets/image-id/images/200.png' } ),
					model.document.selection.getFirstPosition()
				);

				writer.insert(
					writer.createText( 'foo', { linkHref: 'https://cksource.com/assets/link-id/file?download=true' } ),
					model.document.selection.getFirstPosition()
				);
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>' +
					'<$text linkHref="https://cksource.com/assets/link-id/file?download=true">[]foo</$text>' +
					'<imageInline src="https://cksource.com/assets/image-id/images/200.png"></imageInline>' +
				'</paragraph>'
			);

			await editor.destroy();
		} );

		it( 'should not insert the "ckboxImageId" attribute if image asset is not found', () => {
			const command = editor.commands.get( 'ckbox' );

			// Only link asset is known. The image asset should not have the "ckboxImageId" attribute set.
			command._chosenAssets.add( assets.link );

			model.change( writer => {
				writer.insert(
					writer.createElement( 'imageInline', { src: 'https://cksource.com/assets/image-id/images/200.png' } ),
					model.document.selection.getFirstPosition()
				);

				writer.insert(
					writer.createText( 'foo', { linkHref: 'https://cksource.com/assets/link-id/file?download=true' } ),
					model.document.selection.getFirstPosition()
				);
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>' +
					'<$text ' +
						'ckboxLinkId="link-id" ' +
						'linkHref="https://cksource.com/assets/link-id/file?download=true">[]foo' +
					'</$text>' +
					'<imageInline src="https://cksource.com/assets/image-id/images/200.png"></imageInline>' +
				'</paragraph>'
			);
		} );

		it( 'should not insert the "ckboxLinkId" attribute if link asset is not found', () => {
			const command = editor.commands.get( 'ckbox' );

			// Only image asset is known. The link asset should not have the "ckboxLinkId" attribute set.
			command._chosenAssets.add( assets.image );

			model.change( writer => {
				writer.insert(
					writer.createElement( 'imageInline', { src: 'https://cksource.com/assets/image-id/images/200.png' } ),
					model.document.selection.getFirstPosition()
				);

				writer.insert(
					writer.createText( 'foo', { linkHref: 'https://cksource.com/assets/link-id/file?download=true' } ),
					model.document.selection.getFirstPosition()
				);
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>' +
					'<$text linkHref="https://cksource.com/assets/link-id/file?download=true">[]foo</$text>' +
					'<imageInline ' +
						'ckboxImageId="image-id" ' +
						'src="https://cksource.com/assets/image-id/images/200.png">' +
					'</imageInline>' +
				'</paragraph>'
			);
		} );

		it( 'should sync "ckboxLinkId" with "linkHref" on selection change on the left side of an anchor', () => {
			_setModelData( model, '<paragraph><$text ckboxLinkId="link-id" linkHref="/assets/file">[]foo</$text></paragraph>' );

			const viewDocument = editor.editing.view.document;
			const eventData = {
				keyCode: keyCodes.arrowleft,
				preventDefault: () => {}
			};

			viewDocument.fire( 'keydown', eventData );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>[]<$text ckboxLinkId="link-id" linkHref="/assets/file">foo</$text></paragraph>'
			);
		} );

		it( 'should sync "ckboxLinkId" with "linkHref" on selection change on the right side of an anchor for RTL language', async () => {
			const editor = await createTestEditor( {
				language: {
					content: 'ar'
				},
				ckbox: {
					tokenUrl: 'http://cs.example.com'
				}
			} );

			const model = editor.model;
			const viewDocument = editor.editing.view.document;
			const eventData = {
				keyCode: keyCodes.arrowright,
				preventDefault: () => {},
				domTarget: {
					ownerDocument: {
						defaultView: {
							getSelection: () => ( { rangeCount: 0 } )
						}
					}
				}
			};

			_setModelData( model, '<paragraph><$text ckboxLinkId="link-id" linkHref="/assets/file">foo[]</$text></paragraph>' );

			viewDocument.fire( 'keydown', eventData );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph><$text ckboxLinkId="link-id" linkHref="/assets/file">foo[]</$text></paragraph>'
			);

			await editor.destroy();
		} );

		it( 'should remove the "ckboxLinkId" attribute if "linkHref" has been removed', () => {
			_setModelData( model, '<paragraph><$text ckboxLinkId="link-id" linkHref="/assets/file">[]foo</$text></paragraph>' );

			editor.execute( 'unlink' );

			expect( _getModelData( model ) ).toEqual( '<paragraph>[]foo</paragraph>' );
		} );
	} );

	describe( 'integrations', () => {
		describe( 'with the paragraph feature', () => {
			it( 'should not copy the "ckboxLinkId" attribute form text node when auto-paragrapinh', () => {
				editor.setData( '<a href="/asset/file" data-ckbox-resource-id="link-id">Example link</a>' );

				expect( _getModelData( editor.model ) ).toEqual(
					'<paragraph>' +
						'<$text ckboxLinkId="link-id" linkHref="/asset/file">[]Example link</$text>' +
					'</paragraph>'
				);
			} );
		} );
	} );

	it( 'should remove ckboxImageId attribute on image replace', () => {
		const schema = model.schema;
		schema.extend( 'imageBlock', { allowAttributes: 'ckboxImageId' } );

		_setModelData( model, `[<imageBlock
			ckboxImageId="id"
		></imageBlock>]` );

		const element = model.document.selection.getSelectedElement();

		expect( element.getAttribute( 'ckboxImageId' ) ).toEqual( 'id' );

		replaceImageSourceCommand.execute( { source: '/sample.png' } );

		expect( element.getAttribute( 'ckboxImageId' ) ).toBeUndefined();
	} );

	describe( 'permissions', () => {
		let fakeServer;
		const CKBOX_API_URL = 'https://upload.example.com';
		const CKBOX_TOKEN_URL = 'http://cs.example.com';

		beforeEach( () => {
			fakeServer = createFakeXHRServer();
		} );

		afterEach( () => {
			fakeServer.restore();
		} );

		it( 'should not disable image upload command if access allowed', async () => {
			fakeServer.respondWith( 'GET', CKBOX_API_URL + '/permissions', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					'id1': {
						'asset:create': true
					}
				} )
			] );

			const editor = await createTestEditor( {
				ckbox: {
					tokenUrl: CKBOX_TOKEN_URL,
					serviceOrigin: CKBOX_API_URL
				}
			} );

			const uploadImageCommand = editor.commands.get( 'uploadImage' );

			expect( uploadImageCommand.isEnabled ).toBe( true );
			expect( uploadImageCommand.isAccessAllowed ).toBe( true );

			await editor.destroy();
		} );

		it( 'should disable image upload command if access not allowed', async () => {
			fakeServer.respondWith( 'GET', CKBOX_API_URL + '/permissions', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					'id1': {
						'asset:create': false
					}
				} )
			] );

			const editor = await createTestEditor( {
				ckbox: {
					tokenUrl: CKBOX_TOKEN_URL,
					serviceOrigin: CKBOX_API_URL
				}
			} );

			const uploadImageCommand = editor.commands.get( 'uploadImage' );

			expect( uploadImageCommand.isEnabled ).toBe( false );
			expect( uploadImageCommand.isAccessAllowed ).toBe( false );

			await editor.destroy();
		} );

		it( 'should not disable image upload command if access allowed ( CKBox loaded first )', async () => {
			fakeServer.respondWith( 'GET', CKBOX_API_URL + '/permissions', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					'id1': {
						'asset:create': true
					}
				} )
			] );

			const editor = await createTestEditor( {
				ckbox: {
					tokenUrl: CKBOX_TOKEN_URL,
					serviceOrigin: CKBOX_API_URL
				}
			}, true );

			const uploadImageCommand = editor.commands.get( 'uploadImage' );

			expect( uploadImageCommand.isEnabled ).toBe( true );
			expect( uploadImageCommand.isAccessAllowed ).toBe( true );

			await editor.destroy();
		} );

		it( 'should disable image upload command if access not allowed ( CKBox loaded first )', async () => {
			fakeServer.respondWith( 'GET', CKBOX_API_URL + '/permissions', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					'id1': {
						'asset:create': false
					}
				} )
			] );

			const editor = await createTestEditor( {
				ckbox: {
					tokenUrl: CKBOX_TOKEN_URL,
					serviceOrigin: CKBOX_API_URL
				}
			}, true );

			const uploadImageCommand = editor.commands.get( 'uploadImage' );

			expect( uploadImageCommand.isEnabled ).toBe( false );
			expect( uploadImageCommand.isAccessAllowed ).toBe( false );

			await editor.destroy();
		} );

		it( 'should not throw when blocking commands and "uploadImage" is missing', async () => {
			fakeServer.respondWith( 'GET', CKBOX_API_URL + '/permissions', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					'id1': {
						'asset:create': false
					}
				} )
			] );

			// `ImageUploadEditing` is required transitively by `CKBoxUploadAdapter`, so the
			// only way to exercise the missing-command path is to hide the command at lookup time.
			const originalGet = CommandCollection.prototype.get;

			vi.spyOn( CommandCollection.prototype, 'get' ).mockImplementation( function( name ) {
				if ( name === 'uploadImage' ) {
					return undefined;
				}

				return originalGet.call( this, name );
			} );

			const editor = await createTestEditor( {
				ckbox: {
					tokenUrl: CKBOX_TOKEN_URL,
					serviceOrigin: CKBOX_API_URL
				}
			} );

			// `ckboxImageEdit` is still blocked while `uploadImage` is silently skipped.
			expect( editor.commands.get( 'uploadImage' ) ).toBeUndefined();
			expect( editor.commands.get( 'ckboxImageEdit' ).isEnabled ).toBe( false );

			await editor.destroy();
		} );

		it( 'should not throw when blocking commands and "ckboxImageEdit" plugin is not loaded', async () => {
			fakeServer.respondWith( 'GET', CKBOX_API_URL + '/permissions', [
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify( {
					'id1': {
						'asset:create': false
					}
				} )
			] );

			// `CKBoxImageEditEditing` is optional, so we omit it from the plugin list to make
			// the `ckboxImageEdit` command absent.
			const editor = await VirtualTestEditor.create( {
				plugins: [
					Paragraph,
					ImageBlockEditing,
					ImageInlineEditing,
					ImageCaptionEditing,
					LinkEditing,
					LinkImageEditing,
					PictureEditing,
					ImageUploadEditing,
					ImageUploadProgress,
					CloudServices,
					CKBoxUploadAdapter,
					CKBoxEditing
				],
				substitutePlugins: [
					CloudServicesCoreMock
				],
				ckbox: {
					tokenUrl: CKBOX_TOKEN_URL,
					serviceOrigin: CKBOX_API_URL
				}
			} );

			expect( editor.commands.get( 'ckboxImageEdit' ) ).toBeUndefined();
			expect( editor.commands.get( 'uploadImage' ).isEnabled ).toBe( false );

			await editor.destroy();
		} );
	} );

	it( 'should not register the "cleanupImage" listener when the "replaceImageSource" command is missing', async () => {
		// `replaceImageSource` is registered by `ImageEditing`, which is transitively required
		// by `PictureEditing`, so the only way to hit the defensive branch is to hide the
		// command at lookup time.
		const originalGet = CommandCollection.prototype.get;

		vi.spyOn( CommandCollection.prototype, 'get' ).mockImplementation( function( name ) {
			if ( name === 'replaceImageSource' ) {
				return undefined;
			}

			return originalGet.call( this, name );
		} );

		const editor = await createTestEditor( {
			ckbox: {
				tokenUrl: 'http://cs.example.com'
			}
		} );

		expect( editor.commands.get( 'replaceImageSource' ) ).toBeUndefined();

		await editor.destroy();
	} );
} );

function createTestEditor( config = {}, loadCKBoxFirst = false ) {
	const plugins = [
		Paragraph,
		ImageBlockEditing,
		ImageInlineEditing,
		ImageCaptionEditing,
		LinkEditing,
		LinkImageEditing,
		PictureEditing,
		ImageUploadEditing,
		ImageUploadProgress,
		CloudServices,
		CKBoxUploadAdapter,
		CKBoxImageEditEditing
	];

	if ( loadCKBoxFirst ) {
		plugins.unshift( CKBoxEditing );
	} else {
		plugins.push( CKBoxEditing );
	}

	return VirtualTestEditor.create( {
		plugins,
		substitutePlugins: [
			CloudServicesCoreMock
		],
		...config
	} );
}

// Minimal fake XHR server used in this file:
// - `respondWith( method, url, [ status, headers, body ] )` — register an immediate response.
// - `restore()` — revert the `XMLHttpRequest` global.
//
// Responses fire synchronously from `send()`.
function createFakeXHRServer() {
	const responses = [];
	const OriginalXMLHttpRequest = window.XMLHttpRequest;

	class FakeXMLHttpRequest {
		constructor() {
			this.listeners = new Map();
			this.requestHeaders = {};
			this.upload = {
				addEventListener: () => {},
				removeEventListener: () => {}
			};
			this.status = 0;
			this.response = null;
			this.responseText = '';
			this.responseType = '';
			this.aborted = false;
		}

		open( method, url ) {
			this.method = method;
			this.url = url;
		}

		setRequestHeader( name, value ) {
			this.requestHeaders[ name ] = value;
		}

		addEventListener( event, callback ) {
			const callbacks = this.listeners.get( event ) || [];
			callbacks.push( callback );
			this.listeners.set( event, callbacks );
		}

		removeEventListener( event, callback ) {
			const callbacks = this.listeners.get( event ) || [];
			const index = callbacks.indexOf( callback );

			if ( index !== -1 ) {
				callbacks.splice( index, 1 );
			}
		}

		abort() {
			this.aborted = true;
			this._dispatchEvent( 'abort' );
		}

		send() {
			this._dispatchEvent( 'loadstart' );

			const match = responses.find( entry => entry.method === this.method && entry.url === this.url );

			if ( !match ) {
				this.status = 404;
				this._dispatchEvent( 'load' );
				this._dispatchEvent( 'loadend' );
				return;
			}

			const [ status, headers, body ] = match.response;

			this.status = status;
			this.responseHeaders = headers;
			this.responseText = body;
			this.response = this.responseType === 'json' ? JSON.parse( body ) : body;

			this._dispatchEvent( 'load' );
			this._dispatchEvent( 'loadend' );
		}

		_dispatchEvent( event, data ) {
			for ( const callback of this.listeners.get( event ) || [] ) {
				callback( data );
			}
		}
	}

	window.XMLHttpRequest = FakeXMLHttpRequest;

	return {
		respondWith( method, url, response ) {
			responses.push( { method, url, response } );
		},
		restore() {
			window.XMLHttpRequest = OriginalXMLHttpRequest;
		}
	};
}
