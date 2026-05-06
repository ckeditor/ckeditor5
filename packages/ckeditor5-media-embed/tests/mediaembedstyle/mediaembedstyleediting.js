/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedStyleEditing } from '../../src/mediaembedstyle/mediaembedstyleediting.js';
import { MediaEmbedStyleCommand } from '../../src/mediaembedstyle/mediaembedstylecommand.js';

const YOUTUBE_URL = 'https://youtu.be/foo';

describe( 'MediaEmbedStyleEditing', () => {
	let editor, model;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( MediaEmbedStyleEditing.pluginName ).to.equal( 'MediaEmbedStyleEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedStyleEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedStyleEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should require MediaEmbedEditing', () => {
		expect( MediaEmbedStyleEditing.requires ).to.include( MediaEmbedEditing );
	} );

	describe( 'schema', () => {
		it( 'allows mediaStyle attribute on media', () => {
			expect( model.schema.checkAttribute( [ '$root', 'media' ], 'mediaStyle' ) ).to.be.true;
		} );

		it( 'marks mediaStyle as a formatting attribute', () => {
			expect( model.schema.getAttributeProperties( 'mediaStyle' ) ).to.deep.include( {
				isFormatting: true
			} );
		} );
	} );

	describe( 'command', () => {
		it( 'registers the mediaStyle command', () => {
			expect( editor.commands.get( 'mediaStyle' ) ).to.be.instanceOf( MediaEmbedStyleCommand );
		} );
	} );

	describe( 'conversion (data pipeline)', () => {
		describe( 'downcast — mediaStyle attribute', () => {
			for ( const [ value, className ] of [
				[ 'alignLeft', 'media-style-align-left' ],
				[ 'alignBlockLeft', 'media-style-block-align-left' ],
				[ 'alignBlockRight', 'media-style-block-align-right' ],
				[ 'alignRight', 'media-style-align-right' ]
			] ) {
				it( `produces "${ className }" on the figure for mediaStyle="${ value }"`, () => {
					_setModelData( model, `<media mediaStyle="${ value }" url="${ YOUTUBE_URL }"></media>` );

					expect( editor.getData() ).to.match(
						new RegExp( `^<figure class="media ${ className }">` )
					);
				} );
			}

			it( 'does not produce a class for mediaStyle="alignCenter" (default)', () => {
				// alignCenter is the default style — encoded by attribute-absence in normal use.
				// If something sets it explicitly, the downcast still emits no class.
				_setModelData( model, `<media mediaStyle="alignCenter" url="${ YOUTUBE_URL }"></media>` );

				expect( editor.getData() ).to.match( /^<figure class="media">/ );
			} );

			it( 'removes the old class and adds the new class when mediaStyle changes', () => {
				_setModelData( model, `<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>` );

				const mediaModel = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'mediaStyle', 'alignBlockRight', mediaModel );
				} );

				const data = editor.getData();
				expect( data ).to.match( /^<figure class="media media-style-block-align-right">/ );
				expect( data ).not.to.match( /media-style-block-align-left/ );
			} );

			it( 'removes the class when mediaStyle is cleared', () => {
				_setModelData( model, `<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>` );

				const mediaModel = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'mediaStyle', mediaModel );
				} );

				expect( editor.getData() ).to.match( /^<figure class="media">/ );
			} );

			it( 'does not write a class for an unknown mediaStyle value', () => {
				// Unknown values are silently ignored — schema doesn't constrain values, but
				// the downcast looks the value up in MEDIA_STYLE_CLASSES.
				_setModelData( model, `<media mediaStyle="bogus" url="${ YOUTUBE_URL }"></media>` );

				expect( editor.getData() ).to.match( /^<figure class="media">/ );
			} );

			it( 'does not downcast if the event was already consumed', () => {
				editor.conversion.for( 'downcast' ).add( dispatcher =>
					dispatcher.on( 'attribute:mediaStyle:media', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'attribute:mediaStyle:media' );
					}, { priority: 'high' } )
				);

				_setModelData( model, `<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>` );

				expect( editor.getData() ).not.to.match( /media-style-block-align-left/ );
			} );
		} );

		describe( 'upcast — alignment class → mediaStyle attribute', () => {
			for ( const [ className, value ] of [
				[ 'media-style-align-left', 'alignLeft' ],
				[ 'media-style-block-align-left', 'alignBlockLeft' ],
				[ 'media-style-block-align-right', 'alignBlockRight' ],
				[ 'media-style-align-right', 'alignRight' ]
			] ) {
				it( `converts ${ className } to mediaStyle="${ value }"`, () => {
					editor.setData(
						`<figure class="media ${ className }"><oembed url="${ YOUTUBE_URL }"></oembed></figure>`
					);

					const mediaModel = model.document.getRoot().getChild( 0 );

					expect( mediaModel.getAttribute( 'mediaStyle' ) ).to.equal( value );
				} );
			}

			it( 'does not set mediaStyle when no alignment class is present', () => {
				editor.setData( `<figure class="media"><oembed url="${ YOUTUBE_URL }"></oembed></figure>` );

				const mediaModel = model.document.getRoot().getChild( 0 );

				expect( mediaModel.hasAttribute( 'mediaStyle' ) ).to.be.false;
			} );

			it( 'when multiple alignment classes are present, the last one (in iteration order) wins', () => {
				// Iteration order from MEDIA_STYLE_CLASSES:
				// alignLeft, alignBlockLeft, alignBlockRight, alignRight.
				// So if both align-left and align-right are present, align-right wins.
				editor.setData(
					'<figure class="media media-style-align-left media-style-align-right">' +
						`<oembed url="${ YOUTUBE_URL }"></oembed>` +
					'</figure>'
				);

				const mediaModel = model.document.getRoot().getChild( 0 );

				expect( mediaModel.getAttribute( 'mediaStyle' ) ).to.equal( 'alignRight' );
			} );

			it( 'does not set mediaStyle on a non-media figure', () => {
				editor.model.schema.register( 'customWidget', {
					inheritAllFrom: '$blockObject',
					allowAttributes: [ 'mediaStyle' ]
				} );
				editor.conversion.elementToElement( {
					view: { name: 'figure', classes: [ 'widget' ] },
					model: 'customWidget'
				} );

				editor.setData( '<figure class="widget media-style-align-left"></figure>' );

				const widget = model.document.getRoot().getChild( 0 );

				expect( widget.name ).to.equal( 'customWidget' );
				expect( widget.hasAttribute( 'mediaStyle' ) ).to.be.false;
			} );
		} );

		describe( 'round-trip', () => {
			for ( const [ value, className ] of [
				[ 'alignLeft', 'media-style-align-left' ],
				[ 'alignBlockLeft', 'media-style-block-align-left' ],
				[ 'alignBlockRight', 'media-style-block-align-right' ],
				[ 'alignRight', 'media-style-align-right' ]
			] ) {
				it( `preserves an "${ value }" alignment through load-and-save`, () => {
					const input = `<figure class="media ${ className }"><oembed url="${ YOUTUBE_URL }"></oembed></figure>`;

					editor.setData( input );

					expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
						`<media mediaStyle="${ value }" url="${ YOUTUBE_URL }"></media>`
					);

					expect( editor.getData() ).to.equal( input );
				} );
			}
		} );
	} );

	describe( 'conversion with previewsInData: true', () => {
		let previewEditor, previewModel;

		beforeEach( async () => {
			previewEditor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing ],
				mediaEmbed: {
					previewsInData: true
				}
			} );

			previewModel = previewEditor.model;
		} );

		afterEach( async () => {
			await previewEditor.destroy();
		} );

		it( 'emits the alignment class alongside the preview HTML', () => {
			_setModelData( previewModel, `<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>` );

			const data = previewEditor.getData();

			expect( data ).to.match( /^<figure class="media media-style-block-align-left">/ );
			expect( data ).to.match( /data-oembed-url="https:\/\/youtu\.be\/foo"/ );
		} );

		it( 'upcasts an alignment class even when preview HTML is present', () => {
			previewEditor.setData(
				'<figure class="media media-style-align-right">' +
					`<div data-oembed-url="${ YOUTUBE_URL }">` +
						'<iframe src="https://www.youtube.com/embed/foo" width="1280" height="720"></iframe>' +
					'</div>' +
				'</figure>'
			);

			const mediaModel = previewModel.document.getRoot().getChild( 0 );

			expect( mediaModel.getAttribute( 'mediaStyle' ) ).to.equal( 'alignRight' );
		} );
	} );
} );
