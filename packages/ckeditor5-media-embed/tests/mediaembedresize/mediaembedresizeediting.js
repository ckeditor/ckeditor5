/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedResizeEditing } from '../../src/mediaembedresize/mediaembedresizeediting.js';
import { ResizeMediaEmbedCommand } from '../../src/mediaembedresize/resizemediaembedcommand.js';

describe( 'MediaEmbedResizeEditing', () => {
	let editor, model;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( MediaEmbedResizeEditing.pluginName ).to.equal( 'MediaEmbedResizeEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedResizeEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `true`', () => {
		expect( MediaEmbedResizeEditing.isPremiumPlugin ).to.be.true;
	} );

	it( 'should have `licenseFeatureCode` static flag set to `MER`', () => {
		expect( MediaEmbedResizeEditing.licenseFeatureCode ).to.equal( 'MER' );
	} );

	it( 'should require MediaEmbedEditing', () => {
		expect( MediaEmbedResizeEditing.requires ).to.include( MediaEmbedEditing );
	} );

	describe( 'schema', () => {
		it( 'allows resizedWidth attribute on media', () => {
			expect( model.schema.checkAttribute( [ '$root', 'media' ], 'resizedWidth' ) ).to.be.true;
		} );

		it( 'marks resizedWidth as a formatting attribute', () => {
			expect( model.schema.getAttributeProperties( 'resizedWidth' ) ).to.deep.include( {
				isFormatting: true
			} );
		} );
	} );

	describe( 'command', () => {
		it( 'registers the resizeMediaEmbed command', () => {
			expect( editor.commands.get( 'resizeMediaEmbed' ) ).to.be.instanceOf( ResizeMediaEmbedCommand );
		} );
	} );

	describe( 'conversion (data pipeline)', () => {
		describe( 'downcast', () => {
			it( 'converts resizedWidth to inline style and media_resized class on the figure', () => {
				_setModelData( model, '<media resizedWidth="50%" url="https://youtu.be/foo"></media>' );

				expect( editor.getData() ).to.match(
					/^<figure class="media media_resized" style="width:50%;"><oembed url="https:\/\/youtu\.be\/foo">/
				);
			} );

			it( 'removes style and class when resizedWidth is cleared', () => {
				_setModelData( model, '<media resizedWidth="50%" url="https://youtu.be/foo"></media>' );

				const mediaModel = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'resizedWidth', mediaModel );
				} );

				const data = editor.getData();

				expect( data ).to.match( /^<figure class="media">/ );
				expect( data ).not.to.match( /media_resized/ );
				expect( data ).not.to.match( /style=/ );
			} );

			it( 'does not downcast resizedWidth if the event was already consumed', () => {
				editor.conversion.for( 'downcast' ).add( dispatcher =>
					dispatcher.on( 'attribute:resizedWidth:media', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'attribute:resizedWidth:media' );
					}, { priority: 'high' } )
				);

				_setModelData( model, '<media resizedWidth="50%" url="https://youtu.be/foo"></media>' );

				const data = editor.getData();

				expect( data ).not.to.match( /media_resized/ );
				expect( data ).not.to.match( /style=/ );
			} );
		} );

		describe( 'upcast', () => {
			it( 'converts style.width on the figure to resizedWidth', () => {
				editor.setData(
					'<figure class="media" style="width:50%;"><oembed url="https://youtu.be/foo"></oembed></figure>'
				);

				const mediaModel = model.document.getRoot().getChild( 0 );

				expect( mediaModel.getAttribute( 'resizedWidth' ) ).to.equal( '50%' );
			} );

			it( 'upcasts px widths', () => {
				editor.setData(
					'<figure class="media" style="width:400px;"><oembed url="https://youtu.be/foo"></oembed></figure>'
				);

				const mediaModel = model.document.getRoot().getChild( 0 );

				expect( mediaModel.getAttribute( 'resizedWidth' ) ).to.equal( '400px' );
			} );

			it( 'consumes the media_resized class so it does not remain unhandled', () => {
				const consumeSpy = sinon.spy( ( evt, data, conversionApi ) => {
					expect( conversionApi.consumable.test( data.viewItem, { classes: [ 'media_resized' ] } ) ).to.be.false;
				} );

				editor.data.upcastDispatcher.on( 'element:figure', consumeSpy, { priority: 'lowest' } );

				editor.setData(
					'<figure class="media media_resized" style="width:50%;">' +
						'<oembed url="https://youtu.be/foo"></oembed>' +
					'</figure>'
				);

				expect( consumeSpy.calledOnce ).to.be.true;
			} );

			it( 'does not set resizedWidth when width is not present', () => {
				editor.setData(
					'<figure class="media"><oembed url="https://youtu.be/foo"></oembed></figure>'
				);

				const mediaModel = model.document.getRoot().getChild( 0 );

				expect( mediaModel.hasAttribute( 'resizedWidth' ) ).to.be.false;
			} );

			it( 'does not set resizedWidth on a non-media figure that upcasts to another model element', () => {
				// Regression: this converter used to match any <figure> with a width style, racing
				// image resize's figure-width upcast. The value-callback guard (`hasClass('media')`)
				// prevents that. Simulate image resize's setup by registering a schema element that
				// accepts `resizedWidth` and upcasts from a non-media figure.
				editor.model.schema.register( 'customWidget', {
					inheritAllFrom: '$blockObject',
					allowAttributes: [ 'resizedWidth' ]
				} );
				editor.conversion.elementToElement( {
					view: { name: 'figure', classes: [ 'widget' ] },
					model: 'customWidget'
				} );

				editor.setData( '<figure class="widget" style="width:50%;"></figure>' );

				const widget = model.document.getRoot().getChild( 0 );

				expect( widget.name ).to.equal( 'customWidget' );
				expect( widget.hasAttribute( 'resizedWidth' ), 'resizedWidth not set on non-media figure' ).to.be.false;
			} );
		} );

		describe( 'round-trip', () => {
			it( 'preserves a resized media embed through load-and-save', () => {
				const input = '<figure class="media media_resized" style="width:50%;">' +
					'<oembed url="https://youtu.be/foo"></oembed>' +
				'</figure>';

				editor.setData( input );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<media resizedWidth="50%" url="https://youtu.be/foo"></media>'
				);

				expect( editor.getData() ).to.equal( input );
			} );
		} );
	} );

	describe( 'conversion with previewsInData: true', () => {
		let previewEditor, previewModel;

		beforeEach( async () => {
			previewEditor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing ],
				mediaEmbed: {
					previewsInData: true
				}
			} );

			previewModel = previewEditor.model;
		} );

		afterEach( async () => {
			await previewEditor.destroy();
		} );

		describe( 'downcast', () => {
			it( 'emits the resize style alongside the preview HTML', () => {
				_setModelData( previewModel, '<media resizedWidth="50%" url="https://youtu.be/foo"></media>' );

				const data = previewEditor.getData();

				expect( data ).to.match( /^<figure class="media media_resized" style="width:50%;">/ );
				expect( data ).to.match( /data-oembed-url="https:\/\/youtu\.be\/foo"/ );
				expect( data ).to.match( /<iframe/ );
				expect( data ).to.match( /aspect-ratio: ?16 ?\/ ?9/ );
			} );
		} );

		describe( 'upcast', () => {
			it( 'converts style.width on the figure to resizedWidth even when preview HTML is present', () => {
				previewEditor.setData(
					'<figure class="media media_resized" style="width:50%;">' +
						'<div data-oembed-url="https://youtu.be/foo">' +
							'<iframe src="https://www.youtube.com/embed/foo" ' +
								'width="1280" height="720" ' +
								'style="width: 100%; height: auto; aspect-ratio: 16 / 9; border: 0; display: block;">' +
							'</iframe>' +
						'</div>' +
					'</figure>'
				);

				const mediaModel = previewModel.document.getRoot().getChild( 0 );

				expect( mediaModel.getAttribute( 'resizedWidth' ) ).to.equal( '50%' );
				expect( mediaModel.getAttribute( 'url' ) ).to.equal( 'https://youtu.be/foo' );
			} );
		} );

		describe( 'round-trip (data migration)', () => {
			it( 'migrates legacy padding-bottom HTML to the modern aspect-ratio format', () => {
				// Legacy format: wrapper div with padding-bottom + absolute-positioned iframe.
				const legacyInput =
					'<figure class="media">' +
						'<div data-oembed-url="https://youtu.be/foo">' +
							'<div style="position: relative; padding-bottom: 56.2493%; height: 0;">' +
								'<iframe src="https://www.youtube.com/embed/foo" ' +
									'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">' +
								'</iframe>' +
							'</div>' +
						'</div>' +
					'</figure>';

				previewEditor.setData( legacyInput );

				const output = previewEditor.getData();

				// Legacy markup must be gone.
				expect( output ).not.to.match( /padding-bottom/ );
				expect( output ).not.to.match( /position: ?absolute/ );

				// New markup must be present.
				expect( output ).to.match( /aspect-ratio: ?16 ?\/ ?9/ );
				expect( output ).to.match( /data-oembed-url="https:\/\/youtu\.be\/foo"/ );
			} );

			it( 'preserves resizedWidth when migrating legacy format', () => {
				// Legacy format with an outer resize style on the figure.
				const legacyResized =
					'<figure class="media media_resized" style="width:60%;">' +
						'<div data-oembed-url="https://youtu.be/foo">' +
							'<div style="position: relative; padding-bottom: 56.2493%; height: 0;">' +
								'<iframe src="https://www.youtube.com/embed/foo" ' +
									'style="position: absolute; width: 100%; height: 100%;">' +
								'</iframe>' +
							'</div>' +
						'</div>' +
					'</figure>';

				previewEditor.setData( legacyResized );

				const mediaModel = previewModel.document.getRoot().getChild( 0 );
				expect( mediaModel.getAttribute( 'resizedWidth' ) ).to.equal( '60%' );

				const output = previewEditor.getData();
				expect( output ).to.match( /^<figure class="media media_resized" style="width:60%;">/ );
				expect( output ).to.match( /aspect-ratio: ?16 ?\/ ?9/ );
			} );
		} );
	} );

	describe( 'resizedWidth post-fixer', () => {
		it( 'removes resizedWidth when URL changes from a resizable to a non-resizable provider', () => {
			_setModelData( model, '<media resizedWidth="50%" url="https://youtu.be/foo"></media>' );

			const mediaModel = model.document.getRoot().getChild( 0 );

			model.change( writer => writer.setAttribute( 'url', 'https://open.spotify.com/track/foo', mediaModel ) );

			expect( mediaModel.hasAttribute( 'resizedWidth' ) ).to.be.false;
			expect( editor.getData() ).to.not.match( /style="width/ );
			expect( editor.getData() ).to.not.match( /media_resized/ );
		} );

		it( 'keeps resizedWidth when URL changes between two resizable providers', () => {
			_setModelData( model, '<media resizedWidth="50%" url="https://youtu.be/foo"></media>' );

			const mediaModel = model.document.getRoot().getChild( 0 );

			model.change( writer => writer.setAttribute( 'url', 'https://vimeo.com/1234', mediaModel ) );

			expect( mediaModel.getAttribute( 'resizedWidth' ) ).to.equal( '50%' );
		} );

		it( 'is a no-op on URL change when the media has no resizedWidth', () => {
			_setModelData( model, '<media url="https://youtu.be/foo"></media>' );

			const mediaModel = model.document.getRoot().getChild( 0 );

			expect( () =>
				model.change( writer => writer.setAttribute( 'url', 'https://open.spotify.com/track/foo', mediaModel ) )
			).to.not.throw();

			expect( mediaModel.hasAttribute( 'resizedWidth' ) ).to.be.false;
		} );
	} );
} );
