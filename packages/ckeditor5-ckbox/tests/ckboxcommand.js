/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window, btoa */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import LinkImageEditing from '@ckeditor/ckeditor5-link/src/linkimageediting.js';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
import ImageUploadEditing from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadediting.js';
import ImageUploadProgress from '@ckeditor/ckeditor5-image/src/imageupload/imageuploadprogress.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import CloudServicesCoreMock from './_utils/cloudservicescoremock.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';

import CKBoxEditing from '../src/ckboxediting.js';
import CKBoxCommand from '../src/ckboxcommand.js';
import { blurHashToDataUrl } from '../src/utils.js';

describe( 'CKBoxCommand', () => {
	let editor, model, command, originalCKBox;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		TokenMock.initialToken = [
			// Header.
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
			// Payload.
			btoa( JSON.stringify( { auth: { ckbox: { workspaces: [ 'workspace1' ] } } } ) ),
			// Signature.
			'signature'
		].join( '.' );

		originalCKBox = window.CKBox;
		window.CKBox = {
			mount: sinon.stub()
		};

		sinon.stub( document.body, 'appendChild' );

		editor = await createTestEditor( {
			ckbox: {
				tokenUrl: 'foo'
			},
			substitutePlugins: [
				CloudServicesCoreMock
			]
		} );

		model = editor.model;
		command = editor.commands.get( 'ckbox' );
		setModelData( model, '<paragraph>foo[]</paragraph>' );
	} );

	afterEach( async () => {
		window.CKBox = originalCKBox;
		await editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true only when "insertImage" or "link" commands are enabled', () => {
			const insertImageCommand = editor.commands.get( 'insertImage' );
			const linkCommand = editor.commands.get( 'link' );

			insertImageCommand.isEnabled = false;
			linkCommand.isEnabled = false;

			command.refresh();
			expect( command.isEnabled ).to.be.false;

			linkCommand.isEnabled = false;
			insertImageCommand.isEnabled = true;

			command.refresh();
			expect( command.isEnabled ).to.be.true;

			linkCommand.isEnabled = true;
			insertImageCommand.isEnabled = false;

			command.refresh();
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'refresh', () => {
		it( 'should refresh the command each time the "ckbox:*" event is fired', () => {
			sinon.spy( command, 'refresh' );

			command.fire( 'ckbox:open' );
			command.fire( 'ckbox:choose', [] );
			command.fire( 'ckbox:close' );

			expect( command.refresh.callCount ).to.equal( 3 );
		} );

		it( 'should refresh the command after the "ckbox:*" event handler is called', () => {
			sinon.spy( command, 'refresh' );

			const openSpy = sinon.spy();
			const chooseSpy = sinon.spy();
			const closeSpy = sinon.spy();

			command.on( 'ckbox:open', openSpy );
			command.on( 'ckbox:choose', chooseSpy );
			command.on( 'ckbox:close', closeSpy );

			command.fire( 'ckbox:open' );
			command.fire( 'ckbox:choose', [] );
			command.fire( 'ckbox:close' );

			expect( openSpy.calledBefore( command.refresh ) ).to.be.true;
			expect( chooseSpy.calledBefore( command.refresh ) ).to.be.true;
			expect( closeSpy.calledBefore( command.refresh ) ).to.be.true;
		} );
	} );

	describe( 'execute', () => {
		it( 'should fire "ckbox:open" event after command execution', () => {
			const spy = sinon.spy();

			command.on( 'ckbox:open', spy );
			command.execute();

			expect( spy.callCount ).to.equal( 1 );
		} );

		it( 'should fire "ckbox:open" event as many times as command executions', () => {
			const spy = sinon.spy();

			command.on( 'ckbox:open', spy );

			for ( let i = 1; i <= 5; i++ ) {
				command.execute();
			}

			expect( spy.callCount ).to.equal( 5 );
		} );
	} );

	describe( 'events', () => {
		describe( 'opening dialog ("ckbox:open")', () => {
			beforeEach( () => {
				sinon.useFakeTimers( { now: Date.now() } );
			} );

			afterEach( () => {
				sinon.restore();
			} );

			it( 'should create a wrapper if it is not yet created and mount it in the document body', () => {
				command.execute();

				const wrapper = command._wrapper;

				expect( wrapper.nodeName ).to.equal( 'DIV' );
				expect( wrapper.className ).to.equal( 'ck ckbox-wrapper' );
				expect( document.body.appendChild.callCount ).to.equal( 1 );
				expect( document.body.appendChild.args[ 0 ][ 0 ] ).to.equal( wrapper );
			} );

			it( 'should create and mount a wrapper only once', () => {
				command.execute();

				const wrapper1 = command._wrapper;

				command.execute();

				const wrapper2 = command._wrapper;

				command.execute();

				const wrapper3 = command._wrapper;

				expect( wrapper1 ).to.equal( wrapper2 );
				expect( wrapper2 ).to.equal( wrapper3 );
				expect( document.body.appendChild.callCount ).to.equal( 1 );
				expect( document.body.appendChild.args[ 0 ][ 0 ] ).to.equal( wrapper1 );
			} );

			it( 'should not create a wrapper if the command is disabled', () => {
				command.isEnabled = false;
				command.execute();

				expect( command._wrapper ).to.equal( null );
				expect( document.body.appendChild.called ).to.be.false;
			} );

			it( 'should open the CKBox dialog instance only once', () => {
				command.execute();
				command.execute();
				command.execute();

				expect( window.CKBox.mount.callCount ).to.equal( 1 );
			} );

			it( 'should prepare options for the CKBox dialog instance', async () => {
				const editor = await createTestEditor( {
					ckbox: {
						theme: 'theme-01',
						defaultUploadCategories: {
							Images: [ 'png' ]
						},
						ignoreDataId: true,
						language: 'es',
						serviceOrigin: 'https://service.ckeditor.com',
						tokenUrl: 'token-url',
						forceDemoLabel: true,
						unsupportedOption: 'bar',
						choosableFileExtensions: [ 'jpg' ],
						dialog: {
							width: 500,
							height: 500
						},
						categories: {
							icons: {
								key: 'svg'
							}
						},
						view: {
							openLastView: true,
							startupFolderId: 'id',
							startupCategoryId: 'id2',
							hideMaximizeButton: false
						},
						upload: {
							componentsHideTimeout: 3000,
							dialogMinimizeTimeout: 5000
						}
					}
				} );

				const model = editor.model;
				const command = new CKBoxCommand( editor );

				setModelData( model, '<paragraph>foo[]</paragraph>' );

				command.execute();

				const options = command._prepareOptions();

				expect( options ).to.have.property( 'theme', 'theme-01' );
				expect( options ).to.have.property( 'language', 'es' );
				expect( options ).to.have.property( 'serviceOrigin', 'https://service.ckeditor.com' );
				expect( options ).to.have.property( 'tokenUrl', 'token-url' );
				expect( options ).to.have.property( 'forceDemoLabel', true );
				expect( options.dialog ).to.have.property( 'width', 500 );
				expect( options.dialog ).to.have.property( 'height', 500 );
				expect( options.categories.icons ).to.have.property( 'key', 'svg' );
				expect( options.view ).to.have.property( 'openLastView', true );
				expect( options.view ).to.have.property( 'startupFolderId', 'id' );
				expect( options.view ).to.have.property( 'startupCategoryId', 'id2' );
				expect( options.view ).to.have.property( 'hideMaximizeButton', false );
				expect( options.upload ).to.have.property( 'componentsHideTimeout', 3000 );
				expect( options.upload ).to.have.property( 'dialogMinimizeTimeout', 5000 );
				expect( options ).to.have.deep.property( 'choosableFileExtensions', [ 'jpg' ] );
				expect( options ).to.not.have.property( 'defaultUploadCategories' );
				expect( options ).to.not.have.property( 'ignoreDataId' );
				expect( options ).to.not.have.property( 'unsupportedOption' );
				expect( options.dialog.onClose ).to.be.a( 'function' );
				expect( options.assets.onChoose ).to.be.a( 'function' );

				await editor.destroy();
			} );
		} );

		describe( 'closing dialog ("ckbox:close")', () => {
			let onClose;

			beforeEach( () => {
				onClose = command._prepareOptions().dialog.onClose;
			} );

			it( 'should fire "ckbox:close" event after closing the CKBox dialog', () => {
				const spy = sinon.spy();

				command.on( 'ckbox:close', spy );
				onClose();

				expect( spy.callCount ).to.equal( 1 );
			} );

			it( 'should remove the wrapper after closing the CKBox dialog', () => {
				command.execute();

				expect( command._wrapper ).not.to.equal( null );

				const spy = sinon.spy( command._wrapper, 'remove' );

				onClose();

				expect( spy.callCount ).to.equal( 1 );
				expect( command._wrapper ).to.equal( null );
			} );

			it( 'should focus view after closing the CKBox dialog', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				const openSpy = sinon.spy();
				const closeSpy = sinon.spy();

				command.on( 'ckbox:open', openSpy );
				command.execute();

				command.on( 'ckbox:close', closeSpy );
				onClose();

				expect( openSpy.callCount ).to.equal( 1 );
				expect( closeSpy.callCount ).to.equal( 1 );

				sinon.assert.calledOnce( focusSpy );
			} );
		} );

		describe( 'choosing assets ("ckbox:choose")', () => {
			let onChoose, assets;

			beforeEach( () => {
				onChoose = command._prepareOptions().assets.onChoose;

				assets = {
					images: [
						{
							data: {
								id: 'image-id1',
								extension: 'png',
								metadata: {
									width: 100,
									height: 100
								},
								name: 'image1',
								imageUrls: {
									100: 'https://example.com/workspace1/assets/image-id1/images/100.webp',
									default: 'https://example.com/workspace1/assets/image-id1/images/100.png'
								},
								url: 'https://example.com/workspace1/assets/image-id1/file'
							}
						},
						{
							data: {
								id: 'image-id2',
								extension: 'png',
								metadata: {
									description: 'foo',
									width: 200,
									height: 200
								},
								name: 'image2',
								imageUrls: {
									120: 'https://example.com/workspace1/assets/image-id2/images/120.webp',
									200: 'https://example.com/workspace1/assets/image-id2/images/200.webp',
									default: 'https://example.com/workspace1/assets/image-id2/images/200.png'
								},
								url: 'https://example.com/workspace1/assets/image-id2/file'
							}
						}
					],
					links: [
						{
							data: {
								id: 'link-id1',
								extension: 'pdf',
								name: 'file1',
								url: 'https://example.com/workspace1/assets/link-id1/file'
							}
						},
						{
							data: {
								id: 'link-id2',
								extension: 'zip',
								name: 'file2',
								url: 'https://example.com/workspace1/assets/link-id2/file'
							}
						}
					],
					imagesWithBlurHash: [
						{
							data: {
								id: 'image-id3',
								extension: 'png',
								metadata: {
									width: 200,
									height: 100,
									blurHash: 'KTF55N=ZR4PXSirp5ZOZW9'
								},
								name: 'image3',
								imageUrls: {
									120: 'https://example.com/workspace1/assets/image-id3/images/120.webp',
									200: 'https://example.com/workspace1/assets/image-id3/images/200.webp',
									default: 'https://example.com/workspace1/assets/image-id3/images/200.png'
								},
								url: 'https://example.com/workspace1/assets/image-id2/file'
							}
						}
					]
				};
			} );

			it( 'should fire "ckbox:choose" event after choosing the assets', () => {
				const spy = sinon.spy();

				command.on( 'ckbox:choose', spy );
				onChoose( [ ...assets.images, ...assets.links ] );

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( [ ...assets.images, ...assets.links ] );
			} );

			it( 'should not store chosen assets if command is disabled', () => {
				command.isEnabled = false;

				onChoose( [ ...assets.images, ...assets.links ] );

				expect( command._chosenAssets.size ).to.equal( 0 );
			} );

			it( 'should not store chosen assets if command is enabled but ID insertion is disabled', async () => {
				const editor = await createTestEditor( {
					ckbox: {
						ignoreDataId: true,
						tokenUrl: 'foo'
					}
				} );

				const command = editor.commands.get( 'ckbox' );
				const onChoose = command._prepareOptions().assets.onChoose;

				onChoose( [ ...assets.images, ...assets.links ] );

				expect( command._chosenAssets.size ).to.equal( 0 );

				await editor.destroy();
			} );

			it( 'should store chosen assets if command is enabled and ID insertion is enabled', () => {
				onChoose( [ ...assets.images, ...assets.links ] );

				expect( [ ...command._chosenAssets ] ).to.deep.equal(
					[
						{
							id: 'image-id1',
							type: 'image',
							attributes: {
								imageFallbackUrl: 'https://example.com/workspace1/assets/image-id1/images/100.png',
								imageSources: [
									{
										sizes: '(max-width: 100px) 100vw, 100px',
										srcset: 'https://example.com/workspace1/assets/image-id1/images/100.webp 100w',
										type: 'image/webp'
									}
								],
								imageWidth: 100,
								imageHeight: 100,
								imageTextAlternative: ''
							}
						},
						{
							id: 'image-id2',
							type: 'image',
							attributes: {
								imageFallbackUrl: 'https://example.com/workspace1/assets/image-id2/images/200.png',
								imageSources: [
									{
										sizes: '(max-width: 200px) 100vw, 200px',
										srcset:
											'https://example.com/workspace1/assets/image-id2/images/120.webp 120w,' +
											'https://example.com/workspace1/assets/image-id2/images/200.webp 200w',
										type: 'image/webp'
									}
								],
								imageWidth: 200,
								imageHeight: 200,
								imageTextAlternative: 'foo'
							}
						},
						{
							id: 'link-id1',
							type: 'link',
							attributes: {
								linkHref: 'https://example.com/workspace1/assets/link-id1/file?download=true',
								linkName: 'file1'
							}
						},
						{
							id: 'link-id2',
							type: 'link',
							attributes: {
								linkHref: 'https://example.com/workspace1/assets/link-id2/file?download=true',
								linkName: 'file2'
							}
						}
					]
				);
			} );

			it( 'should remove all stored assets after a timeout', () => {
				const clock = sinon.useFakeTimers();

				onChoose( [ ...assets.images, ...assets.links ] );

				clock.tick( 1000 );

				expect( command._chosenAssets.size ).to.equal( 0 );
			} );

			it( 'should remove all stored assets after a timeout even if they were not inserted due to any reason', () => {
				const clock = sinon.useFakeTimers();

				editor.commands.get( 'link' ).on( 'execute', evt => {
					evt.stop();
				}, { priority: 'highest' } );

				editor.commands.get( 'insertImage' ).on( 'execute', evt => {
					evt.stop();
				}, { priority: 'highest' } );

				onChoose( [ ...assets.images, ...assets.links ] );

				clock.tick( 1000 );

				expect( command._chosenAssets.size ).to.equal( 0 );
			} );

			it( 'should remove stored assets independently on each other after a timeout', () => {
				const clock = sinon.useFakeTimers();
				let chosenAssets;

				onChoose( [ assets.images[ 0 ], assets.links[ 0 ] ] );

				clock.tick( 200 );

				chosenAssets = [ ...command._chosenAssets ]; // chosenAssets = [ 0.2s, 0.2s ]

				expect( chosenAssets.length ).to.equal( 2 );
				expect( chosenAssets[ 0 ] ).to.have.property( 'id', 'image-id1' );
				expect( chosenAssets[ 1 ] ).to.have.property( 'id', 'link-id1' );

				onChoose( [ assets.images[ 1 ] ] );

				clock.tick( 500 );

				chosenAssets = [ ...command._chosenAssets ]; // chosenAssets = [ 0.7s, 0.7s, 0.5s ]

				expect( chosenAssets.length ).to.equal( 3 );
				expect( chosenAssets[ 0 ] ).to.have.property( 'id', 'image-id1' );
				expect( chosenAssets[ 1 ] ).to.have.property( 'id', 'link-id1' );
				expect( chosenAssets[ 2 ] ).to.have.property( 'id', 'image-id2' );

				onChoose( [ assets.links[ 1 ] ] );

				clock.tick( 300 );

				chosenAssets = [ ...command._chosenAssets ]; // chosenAssets = [ 1s, 1s, 0.8s, 0.3s ] => [ 0.8s, 0.3s ]

				expect( chosenAssets.length ).to.equal( 2 );
				expect( chosenAssets[ 0 ] ).to.have.property( 'id', 'image-id2' );
				expect( chosenAssets[ 1 ] ).to.have.property( 'id', 'link-id2' );

				clock.tick( 200 );

				chosenAssets = [ ...command._chosenAssets ]; // chosenAssets = [ 1s, 0.5s ] => [ 0.5s ]

				expect( chosenAssets.length ).to.equal( 1 );
				expect( chosenAssets[ 0 ] ).to.have.property( 'id', 'link-id2' );

				clock.tick( 500 );

				chosenAssets = [ ...command._chosenAssets ]; // chosenAssets = [ 1s ] => []

				expect( chosenAssets.length ).to.equal( 0 );
			} );

			it( 'should not change the model if no assets are chosen', () => {
				const spy = sinon.spy();

				model.document.on( 'change', spy );
				onChoose( [] );

				expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph>' );

				expect( spy.callCount ).to.equal( 0 );
			} );

			it( 'should insert an image inline', () => {
				const spy = sinon.spy( editor, 'execute' );

				onChoose( [ assets.images[ 0 ] ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'foo' +
						'[<imageInline ' +
							'alt="" ' +
							'ckboxImageId="image-id1" ' +
							'height="100" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
							'width="100">' +
						'</imageInline>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertImage' );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( {
					source: {
						alt: '',
						sources: [
							{
								sizes: '(max-width: 100px) 100vw, 100px',
								srcset: 'https://example.com/workspace1/assets/image-id1/images/100.webp 100w',
								type: 'image/webp'
							}
						],
						src: 'https://example.com/workspace1/assets/image-id1/images/100.png',
						width: 100,
						height: 100
					}
				} );
			} );

			it( 'should insert an image inline (with blurhash placeholder)', () => {
				const spy = sinon.spy( editor, 'execute' );
				const placeholder = blurHashToDataUrl( assets.imagesWithBlurHash[ 0 ].data.metadata.blurHash );

				onChoose( [ assets.imagesWithBlurHash[ 0 ] ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'foo' +
						'[<imageInline ' +
							'alt="" ' +
							'ckboxImageId="image-id3" ' +
							'height="100" ' +
							'placeholder="' + placeholder + '" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id3/images/200.png" ' +
							'width="200">' +
						'</imageInline>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertImage' );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( {
					source: {
						alt: '',
						sources: [
							{
								sizes: '(max-width: 200px) 100vw, 200px',
								srcset:
									'https://example.com/workspace1/assets/image-id3/images/120.webp 120w,' +
									'https://example.com/workspace1/assets/image-id3/images/200.webp 200w',
								type: 'image/webp'
							}
						],
						src: 'https://example.com/workspace1/assets/image-id3/images/200.png',
						width: 200,
						height: 100,
						placeholder
					}
				} );
			} );

			it( 'should insert an image block', () => {
				const spy = sinon.spy( editor, 'execute' );

				setModelData( model, '<paragraph>[]</paragraph>' );

				onChoose( [ assets.images[ 1 ] ] );

				expect( getModelData( model ) ).to.equal(
					'[<imageBlock ' +
						'alt="foo" ' +
						'ckboxImageId="image-id2" ' +
						'height="200" ' +
						'sources="[object Object]" ' +
						'src="https://example.com/workspace1/assets/image-id2/images/200.png" ' +
						'width="200">' +
					'</imageBlock>]'
				);

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertImage' );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( {
					source: {
						alt: 'foo',
						sources: [
							{
								sizes: '(max-width: 200px) 100vw, 200px',
								srcset:
									'https://example.com/workspace1/assets/image-id2/images/120.webp 120w,' +
									'https://example.com/workspace1/assets/image-id2/images/200.webp 200w',
								type: 'image/webp'
							}
						],
						src: 'https://example.com/workspace1/assets/image-id2/images/200.png',
						width: 200,
						height: 200
					}
				} );
			} );

			it( 'should insert an image block (with blurhash placeholder)', () => {
				const spy = sinon.spy( editor, 'execute' );
				const placeholder = blurHashToDataUrl( assets.imagesWithBlurHash[ 0 ].data.metadata.blurHash );

				setModelData( model, '<paragraph>[]</paragraph>' );

				onChoose( [ assets.imagesWithBlurHash[ 0 ] ] );

				expect( getModelData( model ) ).to.equal(
					'[<imageBlock ' +
						'alt="" ' +
						'ckboxImageId="image-id3" ' +
						'height="100" ' +
						'placeholder="' + placeholder + '" ' +
						'sources="[object Object]" ' +
						'src="https://example.com/workspace1/assets/image-id3/images/200.png" ' +
						'width="200">' +
					'</imageBlock>]'
				);

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertImage' );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( {
					source: {
						alt: '',
						sources: [
							{
								sizes: '(max-width: 200px) 100vw, 200px',
								srcset:
									'https://example.com/workspace1/assets/image-id3/images/120.webp 120w,' +
									'https://example.com/workspace1/assets/image-id3/images/200.webp 200w',
								type: 'image/webp'
							}
						],
						src: 'https://example.com/workspace1/assets/image-id3/images/200.png',
						width: 200,
						height: 100,
						placeholder
					}
				} );
			} );

			it( 'should replace the selected content after inserting an image', () => {
				const spy = sinon.spy( editor, 'execute' );

				setModelData( model, '<paragraph>[foo]</paragraph>' );

				onChoose( [ assets.images[ 0 ] ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'[<imageInline ' +
							'alt="" ' +
							'ckboxImageId="image-id1" ' +
							'height="100" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
							'width="100">' +
						'</imageInline>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertImage' );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( {
					source: {
						alt: '',
						sources: [
							{
								sizes: '(max-width: 100px) 100vw, 100px',
								srcset: 'https://example.com/workspace1/assets/image-id1/images/100.webp 100w',
								type: 'image/webp'
							}
						],
						src: 'https://example.com/workspace1/assets/image-id1/images/100.png',
						width: 100,
						height: 100
					}
				} );
			} );

			it( 'should insert a link with original file name', () => {
				const spy = sinon.spy( editor, 'execute' );

				onChoose( [ assets.links[ 0 ] ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'foo' +
						'[<$text ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'file1' +
						'</$text>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 0 ][ 1 ] ).to.equal( 'https://example.com/workspace1/assets/link-id1/file?download=true' );
			} );

			it( 'should insert a link with selected content as a link name', () => {
				const spy = sinon.spy( editor, 'execute' );

				setModelData( model, '<paragraph>[foo]</paragraph>' );

				onChoose( [ assets.links[ 0 ] ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'[<$text ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'foo' +
						'</$text>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 0 ][ 1 ] ).to.equal( 'https://example.com/workspace1/assets/link-id1/file?download=true' );
			} );

			it( 'should use adjacent attributes for the inserted link', () => {
				const spy = sinon.spy( editor, 'execute' );

				setModelData( model, '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

				onChoose( [ assets.links[ 0 ] ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'<$text ' +
							'bold="true">' +
							'foo' +
						'</$text>' +
						'[<$text ' +
							'bold="true" ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'file1' +
						'</$text>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 0 ][ 1 ] ).to.equal( 'https://example.com/workspace1/assets/link-id1/file?download=true' );
			} );

			it( 'should clear the adjacent "linkHref" attributes before inserting a link', () => {
				const spy = sinon.spy( editor, 'execute' );

				setModelData( model, '<paragraph><$text bold="true" linkHref="bar" ckboxLinkId="old-id">foo[]</$text></paragraph>' );

				onChoose( [ assets.links[ 0 ] ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'<$text ' +
							'bold="true" ' +
							'ckboxLinkId="old-id" ' +
							'linkHref="bar">' +
							'foo' +
						'</$text>' +
						'[<$text ' +
							'bold="true" ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'file1' +
						'</$text>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 0 ][ 1 ] ).to.equal( 'https://example.com/workspace1/assets/link-id1/file?download=true' );
			} );

			it( 'should clear the adjacent "linkHref" attributes before inserting an image', () => {
				const spy = sinon.spy( editor, 'execute' );

				setModelData( model, '<paragraph><$text bold="true" linkHref="bar" ckboxLinkId="old-id">foo[]</$text></paragraph>' );

				onChoose( [ assets.images[ 0 ] ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'<$text ' +
							'bold="true" ' +
							'ckboxLinkId="old-id" ' +
							'linkHref="bar">' +
							'foo' +
						'</$text>' +
						'[<imageInline ' +
							'alt="" ' +
							'bold="true" ' +
							'ckboxImageId="image-id1" ' +
							'height="100" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
							'width="100">' +
						'</imageInline>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 1 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertImage' );
				expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( {
					source: {
						alt: '',
						sources: [
							{
								sizes: '(max-width: 100px) 100vw, 100px',
								srcset: 'https://example.com/workspace1/assets/image-id1/images/100.webp 100w',
								type: 'image/webp'
							}
						],
						src: 'https://example.com/workspace1/assets/image-id1/images/100.png',
						width: 100,
						height: 100
					}
				} );
			} );

			it( 'should insert multiple images and links in mixed order - link, image, link, image', () => {
				const spy = sinon.spy( editor, 'execute' );

				onChoose( [ assets.links[ 0 ], assets.images[ 0 ], assets.links[ 1 ], assets.images[ 1 ] ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<paragraph>' +
						'<$text ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'file1' +
						'</$text>' +
						'<imageInline ' +
							'alt="" ' +
							'ckboxImageId="image-id1" ' +
							'height="100" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
							'width="100">' +
						'</imageInline>' +
					'</paragraph>' +
					'<paragraph>' +
						'<$text ' +
							'ckboxLinkId="link-id2" ' +
							'linkHref="https://example.com/workspace1/assets/link-id2/file?download=true">' +
							'file2' +
						'</$text>' +
						'[<imageInline ' +
							'alt="foo" ' +
							'ckboxImageId="image-id2" ' +
							'height="200" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id2/images/200.png" ' +
							'width="200">' +
						'</imageInline>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 6 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 1 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 2 ][ 0 ] ).to.equal( 'insertImage' );
				expect( spy.args[ 3 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 4 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 5 ][ 0 ] ).to.equal( 'insertImage' );
			} );

			it( 'should insert multiple images and links in mixed order - link, link, image, image', () => {
				const spy = sinon.spy( editor, 'execute' );

				onChoose( [ ...assets.links, ...assets.images ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<paragraph>' +
						'<$text ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'file1' +
						'</$text>' +
					'</paragraph>' +
					'<paragraph>' +
						'<$text ' +
							'ckboxLinkId="link-id2" ' +
							'linkHref="https://example.com/workspace1/assets/link-id2/file?download=true">' +
							'file2' +
						'</$text>' +
						'<imageInline ' +
							'alt="" ' +
							'ckboxImageId="image-id1" ' +
							'height="100" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
							'width="100">' +
						'</imageInline>' +
						'[<imageInline ' +
							'alt="foo" ' +
							'ckboxImageId="image-id2" ' +
							'height="200" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id2/images/200.png" ' +
							'width="200">' +
						'</imageInline>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 6 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 1 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 2 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 3 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 4 ][ 0 ] ).to.equal( 'insertImage' );
				expect( spy.args[ 5 ][ 0 ] ).to.equal( 'insertImage' );
			} );

			it( 'should split heading and insert multiple links', () => {
				setModelData( model, '<heading1>foo[]bar</heading1>' );
				const spy = sinon.spy( editor, 'execute' );

				onChoose( [ ...assets.links ] );

				expect( getModelData( model ) ).to.equal(
					'<heading1>foo</heading1>' +
					'<paragraph>' +
						'<$text ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'file1' +
						'</$text>' +
					'</paragraph>' +
					'<paragraph>' +
						'[<$text ' +
							'ckboxLinkId="link-id2" ' +
							'linkHref="https://example.com/workspace1/assets/link-id2/file?download=true">' +
							'file2' +
						'</$text>]' +
					'</paragraph>' +
					'<heading1>bar</heading1>'
				);

				expect( spy.callCount ).to.equal( 4 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 1 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 2 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 3 ][ 0 ] ).to.equal( 'link' );
			} );

			it( 'should insert multiple links before heading', () => {
				setModelData( model, '<heading1>[]foobar</heading1>' );
				const spy = sinon.spy( editor, 'execute' );

				onChoose( [ ...assets.links ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'<$text ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'file1' +
						'</$text>' +
					'</paragraph>' +
					'<paragraph>' +
						'[<$text ' +
							'ckboxLinkId="link-id2" ' +
							'linkHref="https://example.com/workspace1/assets/link-id2/file?download=true">' +
							'file2' +
						'</$text>]' +
					'</paragraph>' +
					'<heading1>foobar</heading1>'
				);

				expect( spy.callCount ).to.equal( 4 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 1 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 2 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 3 ][ 0 ] ).to.equal( 'link' );
			} );

			it( 'should insert multiple links after heading', () => {
				setModelData( model, '<heading1>foobar[]</heading1>' );
				const spy = sinon.spy( editor, 'execute' );

				onChoose( [ ...assets.links ] );

				expect( getModelData( model ) ).to.equal(
					'<heading1>foobar</heading1>' +
					'<paragraph>' +
						'<$text ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'file1' +
						'</$text>' +
					'</paragraph>' +
					'<paragraph>' +
						'[<$text ' +
							'ckboxLinkId="link-id2" ' +
							'linkHref="https://example.com/workspace1/assets/link-id2/file?download=true">' +
							'file2' +
						'</$text>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 4 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 1 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 2 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 3 ][ 0 ] ).to.equal( 'link' );
			} );

			it( 'should insert only links if "insertImage" is disabled', () => {
				const spy = sinon.spy( editor, 'execute' );

				editor.commands.get( 'insertImage' ).isEnabled = false;

				onChoose( [ ...assets.links, ...assets.images ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<paragraph>' +
						'<$text ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'file1' +
						'</$text>' +
					'</paragraph>' +
					'<paragraph>' +
						'[<$text ' +
							'ckboxLinkId="link-id2" ' +
							'linkHref="https://example.com/workspace1/assets/link-id2/file?download=true">' +
							'file2' +
						'</$text>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 4 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 1 ][ 0 ] ).to.equal( 'link' );
				expect( spy.args[ 2 ][ 0 ] ).to.equal( 'insertParagraph' );
				expect( spy.args[ 3 ][ 0 ] ).to.equal( 'link' );
			} );

			it( 'should insert only images if "link" is disabled', () => {
				const spy = sinon.spy( editor, 'execute' );

				editor.commands.get( 'link' ).isEnabled = false;

				onChoose( [ ...assets.links, ...assets.images ] );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'foo' +
						'<imageInline ' +
							'alt="" ' +
							'ckboxImageId="image-id1" ' +
							'height="100" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
							'width="100">' +
						'</imageInline>' +
						'[<imageInline ' +
							'alt="foo" ' +
							'ckboxImageId="image-id2" ' +
							'height="200" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id2/images/200.png" ' +
							'width="200">' +
						'</imageInline>]' +
					'</paragraph>'
				);

				expect( spy.callCount ).to.equal( 2 );
				expect( spy.args[ 0 ][ 0 ] ).to.equal( 'insertImage' );
				expect( spy.args[ 1 ][ 0 ] ).to.equal( 'insertImage' );
			} );

			it( 'should remove all stored assets and the wrapper after editor is destroyed', async () => {
				onChoose( [ ...assets.images, ...assets.links ] );

				await editor.destroy();

				expect( command._chosenAssets.size ).to.equal( 0 );
				expect( command._wrapper ).to.equal( null );
			} );

			it( 'should focus view after assets were chosen', () => {
				const focusSpy = testUtils.sinon.spy( editor.editing.view, 'focus' );

				onChoose( [ ...assets.images, ...assets.links ] );

				sinon.assert.calledOnce( focusSpy );
			} );
		} );
	} );
} );

function createTestEditor( config = {} ) {
	return VirtualTestEditor.create( {
		plugins: [
			BoldEditing,
			HeadingEditing,
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
			CKBoxEditing
		],
		substitutePlugins: [
			CloudServicesCoreMock
		],
		image: { insert: { type: 'auto' } },
		...config
	} );
}
