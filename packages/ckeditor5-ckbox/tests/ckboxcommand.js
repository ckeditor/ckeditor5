/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles';
import { HeadingEditing } from '@ckeditor/ckeditor5-heading';
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
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { CloudServicesCoreMock } from './_utils/cloudservicescoremock.js';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';
import { TokenMock } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';

import { CKBoxEditing } from '../src/ckboxediting.js';
import { CKBoxCommand } from '../src/ckboxcommand.js';
import { CKBoxUtils } from '../src/ckboxutils.js';
import { blurHashToDataUrl } from '../src/utils.js';

describe( 'CKBoxCommand', () => {
	let editor, model, command, originalCKBox;

	beforeEach( async () => {
		// `CKBoxEditing#init()` and `CKBoxUtils#init()` fire unawaited network requests (the upload permission
		// check and the private categories authorization). Stub them out so they do not end up as unhandled
		// rejections that fail the Vitest run.
		vi.spyOn( window.XMLHttpRequest.prototype, 'send' ).mockImplementation( () => {} );
		vi.spyOn( CKBoxUtils.prototype, '_authorizePrivateCategoriesAccess' ).mockResolvedValue();

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
			mount: vi.fn()
		};

		vi.spyOn( document.body, 'appendChild' ).mockImplementation( () => {} );

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
		_setModelData( model, '<paragraph>foo[]</paragraph>' );
	} );

	afterEach( async () => {
		window.CKBox = originalCKBox;
		await editor.destroy();
		vi.restoreAllMocks();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true only when "insertImage" or "link" commands are enabled', () => {
			const insertImageCommand = editor.commands.get( 'insertImage' );
			const linkCommand = editor.commands.get( 'link' );

			insertImageCommand.isEnabled = false;
			linkCommand.isEnabled = false;

			command.refresh();
			expect( command.isEnabled ).toBe( false );

			linkCommand.isEnabled = false;
			insertImageCommand.isEnabled = true;

			command.refresh();
			expect( command.isEnabled ).toBe( true );

			linkCommand.isEnabled = true;
			insertImageCommand.isEnabled = false;

			command.refresh();
			expect( command.isEnabled ).toBe( true );
		} );
	} );

	describe( 'refresh', () => {
		it( 'should refresh the command each time the "ckbox:*" event is fired', () => {
			const refreshSpy = vi.spyOn( command, 'refresh' );

			command.fire( 'ckbox:open' );
			command.fire( 'ckbox:choose', [] );
			command.fire( 'ckbox:close' );

			expect( refreshSpy ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should refresh the command after the "ckbox:*" event handler is called', () => {
			const refreshSpy = vi.spyOn( command, 'refresh' );

			const openSpy = vi.fn();
			const chooseSpy = vi.fn();
			const closeSpy = vi.fn();

			command.on( 'ckbox:open', openSpy );
			command.on( 'ckbox:choose', chooseSpy );
			command.on( 'ckbox:close', closeSpy );

			command.fire( 'ckbox:open' );
			command.fire( 'ckbox:choose', [] );
			command.fire( 'ckbox:close' );

			expect( openSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( refreshSpy.mock.invocationCallOrder[ 0 ] );
			expect( chooseSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( refreshSpy.mock.invocationCallOrder[ 1 ] );
			expect( closeSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( refreshSpy.mock.invocationCallOrder[ 2 ] );
		} );
	} );

	describe( 'execute', () => {
		it( 'should fire "ckbox:open" event after command execution', () => {
			const spy = vi.fn();

			command.on( 'ckbox:open', spy );
			command.execute();

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should fire "ckbox:open" event as many times as command executions', () => {
			const spy = vi.fn();

			command.on( 'ckbox:open', spy );

			for ( let i = 1; i <= 5; i++ ) {
				command.execute();
			}

			expect( spy ).toHaveBeenCalledTimes( 5 );
		} );
	} );

	describe( 'events', () => {
		describe( 'opening dialog ("ckbox:open")', () => {
			beforeEach( () => {
				vi.useFakeTimers( { now: Date.now() } );
			} );

			afterEach( () => {
				vi.useRealTimers();
				vi.restoreAllMocks();
			} );

			it( 'should create a wrapper if it is not yet created and mount it in the document body', () => {
				command.execute();

				const wrapper = command._wrapper;

				expect( wrapper.nodeName ).toEqual( 'DIV' );
				expect( wrapper.className ).toEqual( 'ck ckbox-wrapper' );
				expect( document.body.appendChild ).toHaveBeenCalledTimes( 1 );
				expect( document.body.appendChild.mock.calls[ 0 ][ 0 ] ).toEqual( wrapper );
			} );

			it( 'should create and mount a wrapper only once', () => {
				command.execute();

				const wrapper1 = command._wrapper;

				command.execute();

				const wrapper2 = command._wrapper;

				command.execute();

				const wrapper3 = command._wrapper;

				expect( wrapper1 ).toEqual( wrapper2 );
				expect( wrapper2 ).toEqual( wrapper3 );
				expect( document.body.appendChild ).toHaveBeenCalledTimes( 1 );
				expect( document.body.appendChild.mock.calls[ 0 ][ 0 ] ).toEqual( wrapper1 );
			} );

			it( 'should not create a wrapper if the command is disabled', () => {
				command.isEnabled = false;
				command.execute();

				expect( command._wrapper ).toEqual( null );
				expect( document.body.appendChild ).not.toHaveBeenCalled();
			} );

			it( 'should open the CKBox dialog instance only once', () => {
				command.execute();
				command.execute();
				command.execute();

				expect( window.CKBox.mount ).toHaveBeenCalledTimes( 1 );
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

				_setModelData( model, '<paragraph>foo[]</paragraph>' );

				command.execute();

				const options = command._prepareOptions();

				expect( options ).toHaveProperty( 'theme', 'theme-01' );
				expect( options ).toHaveProperty( 'language', 'es' );
				expect( options ).toHaveProperty( 'serviceOrigin', 'https://service.ckeditor.com' );
				expect( options ).toHaveProperty( 'tokenUrl', 'token-url' );
				expect( options ).toHaveProperty( 'forceDemoLabel', true );
				expect( options.dialog ).toHaveProperty( 'width', 500 );
				expect( options.dialog ).toHaveProperty( 'height', 500 );
				expect( options.categories.icons ).toHaveProperty( 'key', 'svg' );
				expect( options.view ).toHaveProperty( 'openLastView', true );
				expect( options.view ).toHaveProperty( 'startupFolderId', 'id' );
				expect( options.view ).toHaveProperty( 'startupCategoryId', 'id2' );
				expect( options.view ).toHaveProperty( 'hideMaximizeButton', false );
				expect( options.upload ).toHaveProperty( 'componentsHideTimeout', 3000 );
				expect( options.upload ).toHaveProperty( 'dialogMinimizeTimeout', 5000 );
				expect( options.choosableFileExtensions ).toEqual( [ 'jpg' ] );
				expect( options ).not.toHaveProperty( 'defaultUploadCategories' );
				expect( options ).not.toHaveProperty( 'ignoreDataId' );
				expect( options ).not.toHaveProperty( 'unsupportedOption' );
				expect( typeof options.dialog.onClose ).toBe( 'function' );
				expect( typeof options.assets.onChoose ).toBe( 'function' );

				await editor.destroy();
			} );
		} );

		describe( 'closing dialog ("ckbox:close")', () => {
			let onClose;

			beforeEach( () => {
				onClose = command._prepareOptions().dialog.onClose;
			} );

			it( 'should fire "ckbox:close" event after closing the CKBox dialog', () => {
				const spy = vi.fn();

				command.on( 'ckbox:close', spy );
				onClose();

				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );

			it( 'should remove the wrapper after closing the CKBox dialog', () => {
				command.execute();

				expect( command._wrapper ).not.toEqual( null );

				const spy = vi.spyOn( command._wrapper, 'remove' );

				onClose();

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( command._wrapper ).toEqual( null );
			} );

			it( 'should focus view after closing the CKBox dialog', () => {
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				const openSpy = vi.fn();
				const closeSpy = vi.fn();

				command.on( 'ckbox:open', openSpy );
				command.execute();

				command.on( 'ckbox:close', closeSpy );
				onClose();

				expect( openSpy ).toHaveBeenCalledTimes( 1 );
				expect( closeSpy ).toHaveBeenCalledTimes( 1 );

				expect( focusSpy ).toHaveBeenCalledTimes( 1 );
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
				const spy = vi.fn();

				command.on( 'ckbox:choose', spy );
				onChoose( [ ...assets.images, ...assets.links ] );

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( [ ...assets.images, ...assets.links ] );
			} );

			it( 'should not store chosen assets if command is disabled', () => {
				command.isEnabled = false;

				onChoose( [ ...assets.images, ...assets.links ] );

				expect( command._chosenAssets.size ).toEqual( 0 );
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

				expect( command._chosenAssets.size ).toEqual( 0 );

				await editor.destroy();
			} );

			it( 'should store chosen assets if command is enabled and ID insertion is enabled', () => {
				onChoose( [ ...assets.images, ...assets.links ] );

				expect( [ ...command._chosenAssets ] ).toEqual(
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
				vi.useFakeTimers();

				onChoose( [ ...assets.images, ...assets.links ] );

				vi.advanceTimersByTime( 1000 );

				expect( command._chosenAssets.size ).toEqual( 0 );

				vi.useRealTimers();
			} );

			it( 'should remove all stored assets after a timeout even if they were not inserted due to any reason', () => {
				vi.useFakeTimers();

				editor.commands.get( 'link' ).on( 'execute', evt => {
					evt.stop();
				}, { priority: 'highest' } );

				editor.commands.get( 'insertImage' ).on( 'execute', evt => {
					evt.stop();
				}, { priority: 'highest' } );

				onChoose( [ ...assets.images, ...assets.links ] );

				vi.advanceTimersByTime( 1000 );

				expect( command._chosenAssets.size ).toEqual( 0 );

				vi.useRealTimers();
			} );

			it( 'should remove stored assets independently on each other after a timeout', () => {
				vi.useFakeTimers();
				let chosenAssets;

				onChoose( [ assets.images[ 0 ], assets.links[ 0 ] ] );

				vi.advanceTimersByTime( 200 );

				chosenAssets = [ ...command._chosenAssets ]; // chosenAssets = [ 0.2s, 0.2s ]

				expect( chosenAssets.length ).toEqual( 2 );
				expect( chosenAssets[ 0 ] ).toHaveProperty( 'id', 'image-id1' );
				expect( chosenAssets[ 1 ] ).toHaveProperty( 'id', 'link-id1' );

				onChoose( [ assets.images[ 1 ] ] );

				vi.advanceTimersByTime( 500 );

				chosenAssets = [ ...command._chosenAssets ]; // chosenAssets = [ 0.7s, 0.7s, 0.5s ]

				expect( chosenAssets.length ).toEqual( 3 );
				expect( chosenAssets[ 0 ] ).toHaveProperty( 'id', 'image-id1' );
				expect( chosenAssets[ 1 ] ).toHaveProperty( 'id', 'link-id1' );
				expect( chosenAssets[ 2 ] ).toHaveProperty( 'id', 'image-id2' );

				onChoose( [ assets.links[ 1 ] ] );

				vi.advanceTimersByTime( 300 );

				chosenAssets = [ ...command._chosenAssets ]; // chosenAssets = [ 1s, 1s, 0.8s, 0.3s ] => [ 0.8s, 0.3s ]

				expect( chosenAssets.length ).toEqual( 2 );
				expect( chosenAssets[ 0 ] ).toHaveProperty( 'id', 'image-id2' );
				expect( chosenAssets[ 1 ] ).toHaveProperty( 'id', 'link-id2' );

				vi.advanceTimersByTime( 200 );

				chosenAssets = [ ...command._chosenAssets ]; // chosenAssets = [ 1s, 0.5s ] => [ 0.5s ]

				expect( chosenAssets.length ).toEqual( 1 );
				expect( chosenAssets[ 0 ] ).toHaveProperty( 'id', 'link-id2' );

				vi.advanceTimersByTime( 500 );

				chosenAssets = [ ...command._chosenAssets ]; // chosenAssets = [ 1s ] => []

				expect( chosenAssets.length ).toEqual( 0 );

				vi.useRealTimers();
			} );

			it( 'should not change the model if no assets are chosen', () => {
				const spy = vi.fn();

				model.document.on( 'change', spy );
				onChoose( [] );

				expect( _getModelData( model ) ).toEqual( '<paragraph>foo[]</paragraph>' );

				expect( spy ).not.toHaveBeenCalled();
			} );

			it( 'should insert an image inline', () => {
				const spy = vi.spyOn( editor, 'execute' );

				onChoose( [ assets.images[ 0 ] ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertImage' );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
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
				const spy = vi.spyOn( editor, 'execute' );
				const placeholder = blurHashToDataUrl( assets.imagesWithBlurHash[ 0 ].data.metadata.blurHash );

				onChoose( [ assets.imagesWithBlurHash[ 0 ] ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertImage' );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
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
				const spy = vi.spyOn( editor, 'execute' );

				_setModelData( model, '<paragraph>[]</paragraph>' );

				onChoose( [ assets.images[ 1 ] ] );

				expect( _getModelData( model ) ).toEqual(
					'[<imageBlock ' +
						'alt="foo" ' +
						'ckboxImageId="image-id2" ' +
						'height="200" ' +
						'sources="[object Object]" ' +
						'src="https://example.com/workspace1/assets/image-id2/images/200.png" ' +
						'width="200">' +
					'</imageBlock>]'
				);

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertImage' );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
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
				const spy = vi.spyOn( editor, 'execute' );
				const placeholder = blurHashToDataUrl( assets.imagesWithBlurHash[ 0 ].data.metadata.blurHash );

				_setModelData( model, '<paragraph>[]</paragraph>' );

				onChoose( [ assets.imagesWithBlurHash[ 0 ] ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertImage' );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
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
				const spy = vi.spyOn( editor, 'execute' );

				_setModelData( model, '<paragraph>[foo]</paragraph>' );

				onChoose( [ assets.images[ 0 ] ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertImage' );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
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
				const spy = vi.spyOn( editor, 'execute' );

				onChoose( [ assets.links[ 0 ] ] );

				expect( _getModelData( model ) ).toEqual(
					'<paragraph>' +
						'foo' +
						'[<$text ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'file1' +
						'</$text>]' +
					'</paragraph>'
				);

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( 'https://example.com/workspace1/assets/link-id1/file?download=true' );
			} );

			it( 'should insert a link with selected content as a link name', () => {
				const spy = vi.spyOn( editor, 'execute' );

				_setModelData( model, '<paragraph>[foo]</paragraph>' );

				onChoose( [ assets.links[ 0 ] ] );

				expect( _getModelData( model ) ).toEqual(
					'<paragraph>' +
						'[<$text ' +
							'ckboxLinkId="link-id1" ' +
							'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
							'foo' +
						'</$text>]' +
					'</paragraph>'
				);

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( 'https://example.com/workspace1/assets/link-id1/file?download=true' );
			} );

			it( 'should use adjacent attributes for the inserted link', () => {
				const spy = vi.spyOn( editor, 'execute' );

				_setModelData( model, '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

				onChoose( [ assets.links[ 0 ] ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( 'https://example.com/workspace1/assets/link-id1/file?download=true' );
			} );

			it( 'should clear the adjacent "linkHref" attributes before inserting a link', () => {
				const spy = vi.spyOn( editor, 'execute' );

				_setModelData( model, '<paragraph><$text bold="true" linkHref="bar" ckboxLinkId="old-id">foo[]</$text></paragraph>' );

				onChoose( [ assets.links[ 0 ] ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( 'https://example.com/workspace1/assets/link-id1/file?download=true' );
			} );

			it( 'should clear the adjacent "linkHref" attributes before inserting an image', () => {
				const spy = vi.spyOn( editor, 'execute' );

				_setModelData( model, '<paragraph><$text bold="true" linkHref="bar" ckboxLinkId="old-id">foo[]</$text></paragraph>' );

				onChoose( [ assets.images[ 0 ] ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertImage' );
				expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
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
				const spy = vi.spyOn( editor, 'execute' );

				onChoose( [ assets.links[ 0 ], assets.images[ 0 ], assets.links[ 1 ], assets.images[ 1 ] ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 6 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 1 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 2 ][ 0 ] ).toEqual( 'insertImage' );
				expect( spy.mock.calls[ 3 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 4 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 5 ][ 0 ] ).toEqual( 'insertImage' );
			} );

			it( 'should insert multiple images and links in mixed order - link, link, image, image', () => {
				const spy = vi.spyOn( editor, 'execute' );

				onChoose( [ ...assets.links, ...assets.images ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 6 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 1 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 2 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 3 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 4 ][ 0 ] ).toEqual( 'insertImage' );
				expect( spy.mock.calls[ 5 ][ 0 ] ).toEqual( 'insertImage' );
			} );

			it( 'should reuse the current empty paragraph when inserting multiple links', () => {
				_setModelData( model, '<paragraph>[]</paragraph>' );
				const spy = vi.spyOn( editor, 'execute' );

				onChoose( [ ...assets.links ] );

				expect( _getModelData( model ) ).toEqual(
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

				// First link reuses the empty paragraph (no leading `insertParagraph`); the second link still needs a fresh one.
				expect( spy ).toHaveBeenCalledTimes( 3 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 1 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 2 ][ 0 ] ).toEqual( 'link' );
			} );

			it( 'should split heading and insert multiple links', () => {
				_setModelData( model, '<heading1>foo[]bar</heading1>' );
				const spy = vi.spyOn( editor, 'execute' );

				onChoose( [ ...assets.links ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 4 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 1 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 2 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 3 ][ 0 ] ).toEqual( 'link' );
			} );

			it( 'should insert multiple links before heading', () => {
				_setModelData( model, '<heading1>[]foobar</heading1>' );
				const spy = vi.spyOn( editor, 'execute' );

				onChoose( [ ...assets.links ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 4 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 1 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 2 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 3 ][ 0 ] ).toEqual( 'link' );
			} );

			it( 'should insert multiple links after heading', () => {
				_setModelData( model, '<heading1>foobar[]</heading1>' );
				const spy = vi.spyOn( editor, 'execute' );

				onChoose( [ ...assets.links ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 4 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 1 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 2 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 3 ][ 0 ] ).toEqual( 'link' );
			} );

			it( 'should insert only links if "insertImage" is disabled', () => {
				const spy = vi.spyOn( editor, 'execute' );

				editor.commands.get( 'insertImage' ).isEnabled = false;

				onChoose( [ ...assets.links, ...assets.images ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 4 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 1 ][ 0 ] ).toEqual( 'link' );
				expect( spy.mock.calls[ 2 ][ 0 ] ).toEqual( 'insertParagraph' );
				expect( spy.mock.calls[ 3 ][ 0 ] ).toEqual( 'link' );
			} );

			it( 'should insert only images if "link" is disabled', () => {
				const spy = vi.spyOn( editor, 'execute' );

				editor.commands.get( 'link' ).isEnabled = false;

				onChoose( [ ...assets.links, ...assets.images ] );

				expect( _getModelData( model ) ).toEqual(
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

				expect( spy ).toHaveBeenCalledTimes( 2 );
				expect( spy.mock.calls[ 0 ][ 0 ] ).toEqual( 'insertImage' );
				expect( spy.mock.calls[ 1 ][ 0 ] ).toEqual( 'insertImage' );
			} );

			it( 'should remove all stored assets and the wrapper after editor is destroyed', async () => {
				onChoose( [ ...assets.images, ...assets.links ] );

				await editor.destroy();

				expect( command._chosenAssets.size ).toEqual( 0 );
				expect( command._wrapper ).toEqual( null );
			} );

			it( 'should focus view after assets were chosen', () => {
				const focusSpy = vi.spyOn( editor.editing.view, 'focus' );

				onChoose( [ ...assets.images, ...assets.links ] );

				expect( focusSpy ).toHaveBeenCalledTimes( 1 );
			} );

			describe( 'downloadable files configuration', () => {
				let command;

				beforeEach( async () => {
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
						]
					};
				} );

				it( 'should add download parameter to URLs by default', async () => {
					const editor = await createTestEditor( {
						ckbox: {
							tokenUrl: 'foo'
						}
					} );

					command = editor.commands.get( 'ckbox' );
					onChoose = command._prepareOptions().assets.onChoose;

					onChoose( [ assets.links[ 1 ] ] );

					expect( _getModelData( editor.model ) ).toEqual(
						'<paragraph>' +
							'[<$text ' +
								'ckboxLinkId="link-id2" ' +
								'linkHref="https://example.com/workspace1/assets/link-id2/file?download=true">' +
								'file2' +
							'</$text>]' +
						'</paragraph>'
					);

					await editor.destroy();
				} );

				it( 'should allow custom function for determining downloadable files', async () => {
					const editor = await createTestEditor( {
						ckbox: {
							tokenUrl: 'foo',
							downloadableFiles: asset => asset.data.name === 'file1'
						}
					} );

					const command = editor.commands.get( 'ckbox' );
					const onChoose = command._prepareOptions().assets.onChoose;

					// `file1` should have download parameter.
					onChoose( [ assets.links[ 0 ] ] );

					expect( _getModelData( editor.model ) ).toEqual(
						'<paragraph>' +
							'[<$text ' +
								'ckboxLinkId="link-id1" ' +
								'linkHref="https://example.com/workspace1/assets/link-id1/file?download=true">' +
								'file1' +
							'</$text>]' +
						'</paragraph>'
					);

					// `file2` should not have download parameter.
					editor.setData( '' );
					onChoose( [ assets.links[ 1 ] ] );

					expect( _getModelData( editor.model ) ).toEqual(
						'<paragraph>' +
							'[<$text ' +
								'ckboxLinkId="link-id2" ' +
								'linkHref="https://example.com/workspace1/assets/link-id2/file">' +
								'file2' +
							'</$text>]' +
						'</paragraph>'
					);

					await editor.destroy();
				} );

				it( 'should not affect image assets', async () => {
					const editor = await createTestEditor( {
						ckbox: {
							tokenUrl: 'foo'
						}
					} );

					const command = editor.commands.get( 'ckbox' );
					const onChoose = command._prepareOptions().assets.onChoose;

					onChoose( [ assets.images[ 0 ] ] );

					expect( _getModelData( editor.model ) ).toEqual(
						'[<imageBlock ' +
							'alt="" ' +
							'ckboxImageId="image-id1" ' +
							'height="100" ' +
							'sources="[object Object]" ' +
							'src="https://example.com/workspace1/assets/image-id1/images/100.png" ' +
							'width="100">' +
						'</imageBlock>]'
					);

					await editor.destroy();
				} );
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
