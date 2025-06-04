/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import LinkImageEditing from '@ckeditor/ckeditor5-link/src/linkimageediting.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import CloudServicesCoreMock from './_utils/cloudservicescoremock.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import CKBoxEditing from '../src/ckboxediting.js';
import CKBoxImageEditing from '../src/ckboximageedit/ckboximageeditediting.js';
import CKBoxCommand from '../src/ckboxcommand.js';
import CKBoxUploadAdapter from '../src/ckboxuploadadapter.js';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import CKBoxUtils from '../src/ckboxutils.js';

describe( 'CKBoxEditing', () => {
	let editor, model, view, originalCKBox, replaceImageSourceCommand;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		TokenMock.initialToken = 'ckbox-token';

		sinon.stub( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).resolves();

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
		expect( CKBoxEditing.pluginName ).to.equal( 'CKBoxEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( CKBoxEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( CKBoxEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( CKBoxEditing ) ).to.be.instanceOf( CKBoxEditing );
	} );

	it( 'should load link and picture features', () => {
		expect( CKBoxEditing.requires ).to.deep.equal( [ 'LinkEditing', 'PictureEditing', CKBoxUploadAdapter, CKBoxUtils ] );
	} );

	it( 'should register the "ckbox" command if CKBox lib is loaded', () => {
		expect( editor.commands.get( 'ckbox' ) ).to.be.instanceOf( CKBoxCommand );
	} );

	it( 'should not register the "ckbox" command if CKBox lib is missing', async () => {
		delete window.CKBox;

		const editor = await createTestEditor( {
			ckbox: {
				tokenUrl: 'http://cs.example.com'
			}
		} );

		expect( editor.commands.get( 'ckbox' ) ).to.be.undefined;
	} );

	describe( 'schema', () => {
		it( 'should extend the schema rules for image', () => {
			const linkedImageBlockElement = new ModelElement( 'imageBlock', { linkHref: 'http://cs.example.com' } );
			const linkedImageInlineElement = new ModelElement( 'imageInline', { linkHref: 'http://cs.example.com' } );

			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxImageId' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', linkedImageBlockElement ], 'ckboxLinkId' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxImageId' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', '$block', linkedImageInlineElement ], 'ckboxLinkId' ) ).to.be.true;
		} );

		it( 'should extend the schema rules for link', () => {
			const linkElement = new ModelElement( '$text', { linkHref: 'http://cs.example.com' } );

			expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', '$block', linkElement ], 'ckboxLinkId' ) ).to.be.true;
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

			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxImageId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', linkedImageBlockElement ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxImageId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', '$block', linkedImageInlineElement ], 'ckboxLinkId' ) ).to.be.false;

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

			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxImageId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', linkedImageBlockElement ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxImageId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', '$block', linkedImageInlineElement ], 'ckboxLinkId' ) ).to.be.false;

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

			expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', '$block', linkElement ], 'ckboxLinkId' ) ).to.be.false;

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

			expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'ckboxLinkId' ) ).to.be.false;
			expect( model.schema.checkAttribute( [ '$root', '$block', linkElement ], 'ckboxLinkId' ) ).to.be.false;

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
				expect( model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'ckboxImageId' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ '$root', '$block', 'imageInline' ], 'ckboxImageId' ) ).to.be.true;
			} );
		} );
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
			it( 'should convert "data-ckbox-resource-id" attribute from a link', () => {
				editor.setData( '<p><a href="/assets/file" data-ckbox-resource-id="link-id">foo</a>bar</p>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><$text ckboxLinkId="link-id" linkHref="/assets/file">foo</$text>bar</paragraph>'
				);
			} );

			it( 'should convert "data-ckbox-resource-id" attribute from an inline image', () => {
				editor.setData(
					'<p>' +
						'<picture>' +
							'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
							'<source srcset="/assets/sample.png">' +
							'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
						'</picture>' +
					'</p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>' +
						'<imageInline ' +
							'ckboxImageId="image-id" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/assets/sample.png">' +
						'</imageInline>' +
					'</paragraph>'
				);
			} );

			it( 'should convert both "data-ckbox-resource-id" attributes from a linked inline image', () => {
				editor.setData(
					'<p>' +
						'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</a>' +
					'</p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>' +
						'<$text ckboxLinkId="link-id" linkHref="/assets/sample.png">Foobar</$text>' +
						'<imageInline ' +
							'ckboxImageId="image-id" ' +
							'ckboxLinkId="link-id" ' +
							'linkHref="/assets/sample.png" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/assets/sample.png">' +
						'</imageInline>' +
					'</paragraph>'
				);
			} );

			it( 'should convert "data-ckbox-resource-id" attribute from a block image', () => {
				editor.setData(
					'<figure class="image" data-ckbox-resource-id="image-id">' +
						'<picture>' +
							'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
							'<source srcset="/assets/sample.png">' +
							'<img src="/assets/sample.png">' +
						'</picture>' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<imageBlock ' +
						'ckboxImageId="image-id" ' +
						'sources="[object Object],[object Object]" ' +
						'src="/assets/sample.png">' +
					'</imageBlock>'
				);
			} );

			it( 'should convert both "data-ckbox-resource-id" attributes from a linked block image', () => {
				editor.setData(
					'<figure class="image" data-ckbox-resource-id="image-id">' +
						'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
						'</a>' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<imageBlock ' +
						'ckboxImageId="image-id" ' +
						'ckboxLinkId="link-id" ' +
						'linkHref="/assets/sample.png" ' +
						'sources="[object Object],[object Object]" ' +
						'src="/assets/sample.png">' +
					'</imageBlock>'
				);
			} );

			it( 'should convert both "data-ckbox-resource-id" attributes from a linked block image (figcaption is a link)', () => {
				editor.setData(
					'<figure class="image" data-ckbox-resource-id="image-id">' +
						'<picture>' +
							'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
							'<source srcset="/assets/sample.png">' +
							'<img src="/assets/sample.png">' +
						'</picture>' +
						'<figcaption>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'Text of the caption' +
							'</a>' +
						'</figcaption>' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<imageBlock ' +
						'ckboxImageId="image-id" ' +
						'sources="[object Object],[object Object]" ' +
						'src="/assets/sample.png">' +
						'<caption>' +
							'<$text ckboxLinkId="link-id" linkHref="/assets/sample.png">' +
								'Text of the caption' +
							'</$text>' +
						'</caption>' +
					'</imageBlock>'
				);
			} );

			it( 'should not convert "data-ckbox-resource-id" attribute from disallowed element', () => {
				editor.setData( '<p data-ckbox-resource-id="id-foo"><a data-ckbox-resource-id="id-bar">foo</a>bar</p>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );
			} );

			it( 'should not consume the "data-ckbox-resource-id" attribute from link elements if already consumed (<a>)', () => {
				editor.conversion.for( 'upcast' ).add( dispatcher => {
					dispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
						const consumableAttributes = { attributes: [ 'data-ckbox-resource-id' ] };

						conversionApi.consumable.consume( data.viewItem, consumableAttributes );
					} );
				} );

				editor.setData( '<p><a href="/assets/file" data-ckbox-resource-id="link-id">foo</a>bar</p>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
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
						'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</a>' +
					'</p>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>' +
						'<$text linkHref="/assets/sample.png">Foobar</$text>' +
						'<imageInline ' +
							'ckboxImageId="image-id" ' +
							'linkHref="/assets/sample.png" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/assets/sample.png">' +
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
						'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</a>' +
					'</p>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>' +
						'<imageInline ' +
							'ckboxImageId="image-id" ' +
							'linkHref="/assets/sample.png" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/assets/sample.png">' +
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
						'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
						'</a>' +
					'</figure>'
					);

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock ' +
						'ckboxImageId="image-id" ' +
						'linkHref="/assets/sample.png" ' +
						'sources="[object Object],[object Object]" ' +
						'src="/assets/sample.png">' +
					'</imageBlock>'
					);
				}
			);

			it( 'should not convert the "data-ckbox-resource-id" attribute if empty', () => {
				editor.setData( '<p><a href="/assets/file" data-ckbox-resource-id>foo</a>bar</p>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
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

					expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
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

					editor.setData( '<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' );

					expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
						'<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>'
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
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>' +
							'<imageInline ' +
								'linkHref="/assets/sample.png" ' +
								'sources="[object Object],[object Object]" ' +
								'src="/assets/sample.png">' +
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
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock ' +
							'linkHref="/assets/sample.png" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/assets/sample.png">' +
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

					expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
						'<paragraph><$text linkHref="/assets/file">foo</$text>bar</paragraph>'
					);

					return editor.destroy();
				} );

				it( 'should not convert the "data-ckbox-resource-id" for an image element', async () => {
					const editor = await createTestEditor();

					editor.setData( '<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' );

					expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
						'<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>'
					);

					return editor.destroy();
				} );

				it( 'should not convert the "data-ckbox-resource-id" for the linked inline image', async () => {
					const editor = await createTestEditor();

					editor.setData(
						'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
						'<paragraph>' +
							'<imageInline ' +
								'linkHref="/assets/sample.png" ' +
								'sources="[object Object],[object Object]" ' +
								'src="/assets/sample.png">' +
							'</imageInline>' +
						'</paragraph>'
					);

					return editor.destroy();
				} );

				it( 'should not convert the "data-ckbox-resource-id" for the linked block image', async () => {
					const editor = await createTestEditor();

					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal(
						'<imageBlock ' +
							'linkHref="/assets/sample.png" ' +
							'sources="[object Object],[object Object]" ' +
							'src="/assets/sample.png">' +
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

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p><a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/assets/file">foo</a>bar</p>'
					);
				} );

				it( 'should convert "data-ckbox-resource-id" attribute from an inline image', () => {
					editor.setData(
						'<p>' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</p>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>' +
							'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
									'<source srcset="/assets/sample.png"></source>' +
									'<img src="/assets/sample.png"></img>' +
								'</picture>' +
							'</span>' +
						'</p>'
					);
				} );

				it( 'should convert both "data-ckbox-resource-id" attributes from a linked inline image', () => {
					editor.setData(
						'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/assets/sample.png">' +
								'Foobar' +
								'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
									'<picture>' +
										'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
										'<source srcset="/assets/sample.png"></source>' +
										'<img src="/assets/sample.png"></img>' +
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
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
						'</figure>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
								'<source srcset="/assets/sample.png"></source>' +
								'<img src="/assets/sample.png"></img>' +
							'</picture>' +
						'</figure>'
					);
				} );

				it( 'should convert both "data-ckbox-resource-id" attributes from a linked caption from block image', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
							'<figcaption>' +
								'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
									'Text of the caption' +
								'</a>' +
							'</figcaption>' +
						'</figure>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
								'<source srcset="/assets/sample.png"></source>' +
								'<img src="/assets/sample.png"></img>' +
							'</picture>' +
							'<figcaption ' +
								'aria-label="Caption for the image" ' +
								'class="ck-editor__editable ck-editor__nested-editable" ' +
								'contenteditable="true" ' +
								'data-placeholder="Enter image caption" ' +
								'role="textbox" ' +
								'tabindex="-1">' +
								'<a data-ckbox-resource-id="link-id" href="/assets/sample.png">Text of the caption</a>' +
							'</figcaption>' +
						'</figure>'
					);
				} );

				it( 'should convert both "data-ckbox-resource-id" attributes from a linked block image', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<a data-ckbox-resource-id="link-id" href="/assets/sample.png">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
									'<source srcset="/assets/sample.png"></source>' +
									'<img src="/assets/sample.png"></img>' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);
				} );

				it( 'should not convert "data-ckbox-resource-id" attribute from disallowed element', () => {
					editor.setData( '<p data-ckbox-resource-id="id"><a data-ckbox-resource-id="id">foo</a>bar</p>' );

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal( '<p>foobar</p>' );
				} );

				it( 'should not add the "data-ckbox-resource-id" attribute when removed from the model element (<imageBlock>)', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					editor.model.change( writer => {
						const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
						writer.removeAttribute( 'ckboxLinkId', imageBlock );
					} );

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
									'<source srcset="/assets/sample.png"></source>' +
									'<img src="/assets/sample.png"></img>' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);
				} );

				it( 'should modify the "data-ckbox-resource-id" attribute when updating its value in the model element (<imageBlock>)',
					() => {
						editor.setData(
							'<figure class="image" data-ckbox-resource-id="image-id">' +
						'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
						'<picture>' +
						'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
						'<source srcset="/assets/sample.png">' +
						'<img src="/assets/sample.png">' +
						'</picture>' +
						'</a>' +
						'</figure>'
						);

						editor.model.change( writer => {
							const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
							writer.setAttribute( 'ckboxLinkId', 'foo-bar-test', imageBlock );
						} );

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
						'<a data-ckbox-resource-id="foo-bar-test" href="/assets/sample.png">' +
						'<picture>' +
						'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
						'<source srcset="/assets/sample.png"></source>' +
						'<img src="/assets/sample.png"></img>' +
						'</picture>' +
						'</a>' +
						'</figure>'
						);
					}
				);

				it( 'should not wrap the image in the "<a>" element when the "linkHref" attribute is removed (<imageBlock>)', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					editor.model.change( writer => {
						const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
						writer.removeAttribute( 'linkHref', imageBlock );
					} );

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
								'<source srcset="/assets/sample.png"></source>' +
								'<img src="/assets/sample.png"></img>' +
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
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<figure class="ck-widget image" contenteditable="false" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
									'<source srcset="/assets/sample.png"></source>' +
									'<img src="/assets/sample.png"></img>' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);
				} );

				it( 'should not add the "data-ckbox-resource-id" attribute when removed from the model element (<imageInline>)', () => {
					editor.setData(
						'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					editor.model.change( writer => {
						const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
						writer.removeAttribute( 'ckboxLinkId', imageInline );
					} );

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/assets/sample.png">' +
								'Foobar' +
							'</a>' +
							'<a class="ck-link_selected" href="/assets/sample.png">' +
								'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
									'<picture>' +
										'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
										'<source srcset="/assets/sample.png"></source>' +
										'<img src="/assets/sample.png"></img>' +
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
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
						);

						editor.model.change( writer => {
							const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
							writer.setAttribute( 'ckboxLinkId', 'foo-bar-test', imageInline );
						} );

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
							'<p>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/assets/sample.png">' +
								'Foobar' +
							'</a>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="foo-bar-test" href="/assets/sample.png">' +
								'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
									'<picture>' +
										'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
										'<source srcset="/assets/sample.png"></source>' +
										'<img src="/assets/sample.png"></img>' +
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
						'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
						'Foobar' +
						'<picture>' +
						'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
						'<source srcset="/assets/sample.png">' +
						'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
						'</picture>' +
						'</a>' +
						'</p>'
					);

					editor.model.change( writer => {
						const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
						writer.removeAttribute( 'linkHref', imageInline );
					} );

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/assets/sample.png">' +
								'Foobar' +
							'</a>' +
							'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
									'<source srcset="/assets/sample.png"></source>' +
									'<img src="/assets/sample.png"></img>' +
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
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p>' +
							'<a class="ck-link_selected" data-ckbox-resource-id="link-id" href="/assets/sample.png">' +
								'Foobar' +
							'</a>' +
							'<a class="ck-link_selected" href="/assets/sample.png">' +
								'<span class="ck-widget image-inline" contenteditable="false" data-ckbox-resource-id="image-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png"></source>' +
									'<source srcset="/assets/sample.png"></source>' +
									'<img src="/assets/sample.png"></img>' +
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

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
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

						expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
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

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
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

					expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
						'<p><a class="ck-link_selected" href="/assets/file">foo</a>bar</p>'
					);
				} );
			} );

			describe( 'data', () => {
				it( 'should convert "data-ckbox-resource-id" attribute from a link', () => {
					const data = '<p><a href="/assets/file" data-ckbox-resource-id="link-id">foo</a>bar</p>';

					editor.setData( data );

					expect( editor.getData() ).to.equal( data );
				} );

				it( 'should convert "data-ckbox-resource-id" attribute from an inline image', () => {
					const data =
						'<p>' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
							'</picture>' +
						'</p>';

					editor.setData( data );

					expect( editor.getData() ).to.equal( data );
				} );

				it( 'should convert both "data-ckbox-resource-id" attributes from a linked inline image', () => {
					const data =
						'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>';

					editor.setData( data );

					expect( editor.getData() ).to.equal( data );
				} );

				it( 'should convert "data-ckbox-resource-id" attribute from a block image', () => {
					const data =
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
						'</figure>';

					editor.setData( data );

					expect( editor.getData() ).to.equal( data );
				} );

				it( 'should convert both "data-ckbox-resource-id" attributes from a linked block image', () => {
					const data =
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png">' +
							'</picture>' +
							'<figcaption>' +
								'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
									'Text of the caption' +
								'</a>' +
							'</figcaption>' +
						'</figure>';

					editor.setData( data );

					expect( editor.getData() ).to.equal( data );
				} );

				it( 'should not convert "data-ckbox-resource-id" attribute from disallowed element', () => {
					editor.setData( '<p data-ckbox-resource-id="id"><a data-ckbox-resource-id="id">foo</a>bar</p>' );

					expect( editor.getData() ).to.equal( '<p>foobar</p>' );
				} );

				it( 'should not add the "data-ckbox-resource-id" attribute when removed from the model element (<imageBlock>)', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					editor.model.change( writer => {
						const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
						writer.removeAttribute( 'ckboxLinkId', imageBlock );
					} );

					expect( editor.getData() ).to.equal(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);
				} );

				it( 'should modify the "data-ckbox-resource-id" attribute when updating its value in the model element (<imageBlock>)',
					() => {
						editor.setData(
							'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
						);

						editor.model.change( writer => {
							const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
							writer.setAttribute( 'ckboxLinkId', 'foo-bar-test', imageBlock );
						} );

						expect( editor.getData() ).to.equal(
							'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="foo-bar-test">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
						);
					}
				);

				it( 'should not wrap the image in the "<a>" element when the "linkHref" attribute is removed (<imageBlock>)', () => {
					editor.setData(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					editor.model.change( writer => {
						const imageBlock = editor.model.document.getRoot().getNodeByPath( [ 0 ] );
						writer.removeAttribute( 'linkHref', imageBlock );
					} );

					expect( editor.getData() ).to.equal(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png">' +
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
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);

					expect( editor.getData() ).to.equal(
						'<figure class="image" data-ckbox-resource-id="image-id">' +
							'<a href="/assets/sample.png">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png">' +
								'</picture>' +
							'</a>' +
						'</figure>'
					);
				} );

				it( 'should not add the "data-ckbox-resource-id" attribute when removed from the model element (<imageInline>)', () => {
					editor.setData(
						'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					editor.model.change( writer => {
						const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
						writer.removeAttribute( 'ckboxLinkId', imageInline );
					} );

					expect( editor.getData() ).to.equal(
						'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
							'</a>' +
							'<a href="/assets/sample.png">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);
				} );

				it( 'should modify the "data-ckbox-resource-id" attribute when updating its value in the model element (<imageInline>)',
					() => {
						editor.setData(
							'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
						);

						editor.model.change( writer => {
							const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
							writer.setAttribute( 'ckboxLinkId', 'foo-bar-test', imageInline );
						} );

						expect( editor.getData() ).to.equal(
							'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
							'</a>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="foo-bar-test">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
						);
					}
				);

				it( 'should not wrap the image in the "<a>" element when the "linkHref" attribute is removed (<imageInline>)', () => {
					editor.setData(
						'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					editor.model.change( writer => {
						const imageInline = editor.model.document.getRoot().getNodeByPath( [ 0, 6 ] );
						writer.removeAttribute( 'linkHref', imageInline );
					} );

					expect( editor.getData() ).to.equal(
						'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
								'Foobar' +
							'</a>' +
							'<picture>' +
								'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
								'<source srcset="/assets/sample.png">' +
								'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
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
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
								'<picture>' +
									'<source media="(max-width: 600px)" srcset="/assets/sample.png">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
								'</picture>' +
							'</a>' +
						'</p>'
					);

					expect( editor.getData() ).to.equal(
						'<p>' +
							'<a href="/assets/sample.png" data-ckbox-resource-id="link-id">' +
							'Foobar' +
							'</a>' +
							'<a href="/assets/sample.png">' +
								'<picture>' +
									'<source srcset="/assets/sample.png" media="(max-width: 600px)">' +
									'<source srcset="/assets/sample.png">' +
									'<img src="/assets/sample.png" data-ckbox-resource-id="image-id">' +
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

					expect( editor.getData() ).to.equal(
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

						expect( editor.getData() ).to.equal(
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

					expect( editor.getData() ).to.equal(
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

					expect( editor.getData() ).to.equal(
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

			expect( getModelData( model ) ).to.equal(
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

			expect( getModelData( model ) ).to.equal(
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

			expect( getModelData( model ) ).to.equal(
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

			expect( getModelData( model ) ).to.equal(
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
			setModelData( model, '<paragraph><$text ckboxLinkId="link-id" linkHref="/assets/file">[]foo</$text></paragraph>' );

			const viewDocument = editor.editing.view.document;
			const eventData = {
				keyCode: keyCodes.arrowleft,
				preventDefault: () => {}
			};

			viewDocument.fire( 'keydown', eventData );

			expect( getModelData( model ) ).to.equal(
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

			setModelData( model, '<paragraph><$text ckboxLinkId="link-id" linkHref="/assets/file">foo[]</$text></paragraph>' );

			viewDocument.fire( 'keydown', eventData );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text ckboxLinkId="link-id" linkHref="/assets/file">foo[]</$text></paragraph>'
			);

			await editor.destroy();
		} );

		it( 'should remove the "ckboxLinkId" attribute if "linkHref" has been removed', () => {
			setModelData( model, '<paragraph><$text ckboxLinkId="link-id" linkHref="/assets/file">[]foo</$text></paragraph>' );

			editor.execute( 'unlink' );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]foo</paragraph>' );
		} );
	} );

	describe( 'integrations', () => {
		describe( 'with the paragraph feature', () => {
			it( 'should not copy the "ckboxLinkId" attribute form text node when auto-paragrapinh', () => {
				editor.setData( '<a href="/asset/file" data-ckbox-resource-id="link-id">Example link</a>' );

				expect( getModelData( editor.model ) ).to.equal(
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

		setModelData( model, `[<imageBlock
			ckboxImageId="id"
		></imageBlock>]` );

		const element = model.document.selection.getSelectedElement();

		expect( element.getAttribute( 'ckboxImageId' ) ).to.equal( 'id' );

		replaceImageSourceCommand.execute( { source: 'bar/foo.jpg' } );

		expect( element.getAttribute( 'ckboxImageId' ) ).to.be.undefined;
	} );

	describe( 'permissions', () => {
		let sinonXHR;
		const CKBOX_API_URL = 'https://upload.example.com';
		const CKBOX_TOKEN_URL = 'http://cs.example.com';

		beforeEach( () => {
			sinonXHR = testUtils.sinon.useFakeServer();
			sinonXHR.autoRespond = true;
			sinonXHR.respondImmediately = true;
		} );

		afterEach( () => {
			sinonXHR.restore();
		} );

		it( 'should not disable image upload command if access allowed', async () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/permissions', [
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

			expect( uploadImageCommand.isEnabled ).to.be.true;
			expect( uploadImageCommand.isAccessAllowed ).to.be.true;

			await editor.destroy();
		} );

		it( 'should disable image upload command if access not allowed', async () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/permissions', [
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

			expect( uploadImageCommand.isEnabled ).to.be.false;
			expect( uploadImageCommand.isAccessAllowed ).to.be.false;

			await editor.destroy();
		} );

		it( 'should not disable image upload command if access allowed ( CKBox loaded first )', async () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/permissions', [
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

			expect( uploadImageCommand.isEnabled ).to.be.true;
			expect( uploadImageCommand.isAccessAllowed ).to.be.true;

			await editor.destroy();
		} );

		it( 'should disable image upload command if access not allowed ( CKBox loaded first )', async () => {
			sinonXHR.respondWith( 'GET', CKBOX_API_URL + '/permissions', [
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

			expect( uploadImageCommand.isEnabled ).to.be.false;
			expect( uploadImageCommand.isAccessAllowed ).to.be.false;

			await editor.destroy();
		} );
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
		CKBoxImageEditing
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
