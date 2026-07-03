/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedStyleEditing } from '../../src/mediaembedstyle/mediaembedstyleediting.js';
import { MediaEmbedStyleCommand } from '../../src/mediaembedstyle/mediaembedstylecommand.js';

const YOUTUBE_URL = 'https://youtu.be/foo';

// Async factory used inside `beforeEach` to build a VirtualTestEditor with a `mediaEmbed.styles` config.
function createConfiguredEditor( styleOptions ) {
	return VirtualTestEditor.create( {
		plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedStyleEditing ],
		mediaEmbed: { styles: { options: styleOptions } }
	} );
}

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
		expect( MediaEmbedStyleEditing.pluginName ).toBe( 'MediaEmbedStyleEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedStyleEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedStyleEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should require MediaEmbedEditing', () => {
		expect( MediaEmbedStyleEditing.requires ).toContain( MediaEmbedEditing );
	} );

	describe( 'schema', () => {
		it( 'allows mediaStyle attribute on media', () => {
			expect( model.schema.checkAttribute( [ '$root', 'media' ], 'mediaStyle' ) ).toBe( true );
		} );

		it( 'marks mediaStyle as a formatting attribute', () => {
			expect( model.schema.getAttributeProperties( 'mediaStyle' ) ).toMatchObject( {
				isFormatting: true
			} );
		} );
	} );

	describe( 'command', () => {
		it( 'registers the mediaStyle command', () => {
			expect( editor.commands.get( 'mediaStyle' ) ).toBeInstanceOf( MediaEmbedStyleCommand );
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

					expect( editor.getData() ).toMatch(
						new RegExp( `^<figure class="media ${ className }">` )
					);
				} );
			}

			it( 'does not produce a class for mediaStyle="alignCenter" (default)', () => {
				// alignCenter is the default style — encoded by attribute-absence in normal use.
				// If something sets it explicitly, the downcast still emits no class.
				_setModelData( model, `<media mediaStyle="alignCenter" url="${ YOUTUBE_URL }"></media>` );

				expect( editor.getData() ).toMatch( /^<figure class="media">/ );
			} );

			it( 'removes the old class and adds the new class when mediaStyle changes', () => {
				_setModelData( model, `<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>` );

				const mediaModel = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.setAttribute( 'mediaStyle', 'alignBlockRight', mediaModel );
				} );

				const data = editor.getData();
				expect( data ).toMatch( /^<figure class="media media-style-block-align-right">/ );
				expect( data ).not.toMatch( /media-style-block-align-left/ );
			} );

			it( 'removes the class when mediaStyle is cleared', () => {
				_setModelData( model, `<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>` );

				const mediaModel = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.removeAttribute( 'mediaStyle', mediaModel );
				} );

				expect( editor.getData() ).toMatch( /^<figure class="media">/ );
			} );

			it( 'does not write a class for an unknown mediaStyle value', () => {
				// Unknown values are silently ignored — schema doesn't constrain values, but
				// the downcast looks the value up in the runtime class map built from the
				// resolved options.
				_setModelData( model, `<media mediaStyle="bogus" url="${ YOUTUBE_URL }"></media>` );

				expect( editor.getData() ).toMatch( /^<figure class="media">/ );
			} );

			it( 'does not downcast if the event was already consumed', () => {
				editor.conversion.for( 'downcast' ).add( dispatcher =>
					dispatcher.on( 'attribute:mediaStyle:media', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'attribute:mediaStyle:media' );
					}, { priority: 'high' } )
				);

				_setModelData( model, `<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>` );

				expect( editor.getData() ).not.toMatch( /media-style-block-align-left/ );
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

					expect( mediaModel.getAttribute( 'mediaStyle' ) ).toBe( value );
				} );
			}

			it( 'does not set mediaStyle when no alignment class is present', () => {
				editor.setData( `<figure class="media"><oembed url="${ YOUTUBE_URL }"></oembed></figure>` );

				const mediaModel = model.document.getRoot().getChild( 0 );

				expect( mediaModel.hasAttribute( 'mediaStyle' ) ).toBe( false );
			} );

			it( 'when multiple alignment classes are present, the last one (in iteration order) wins', () => {
				// Iteration order follows the resolved options: alignLeft, alignBlockLeft,
				// alignBlockRight, alignRight (alignCenter is the default, no class). So if
				// align-left and align-right are both present, align-right wins.
				editor.setData(
					'<figure class="media media-style-align-left media-style-align-right">' +
						`<oembed url="${ YOUTUBE_URL }"></oembed>` +
					'</figure>'
				);

				const mediaModel = model.document.getRoot().getChild( 0 );

				expect( mediaModel.getAttribute( 'mediaStyle' ) ).toBe( 'alignRight' );
			} );

			it( 'iteration order follows the configured options — reversing the config flips the winner', async () => {
				// Counterpart to the test above: with options reversed (alignRight before alignLeft),
				// alignLeft now follows alignRight in iteration, so alignLeft wins.
				const reorderedEditor = await createConfiguredEditor( [ 'alignRight', 'alignLeft' ] );

				reorderedEditor.setData(
					'<figure class="media media-style-align-left media-style-align-right">' +
						`<oembed url="${ YOUTUBE_URL }"></oembed>` +
					'</figure>'
				);

				const mediaModel = reorderedEditor.model.document.getRoot().getChild( 0 );

				expect( mediaModel.getAttribute( 'mediaStyle' ) ).toBe( 'alignLeft' );

				await reorderedEditor.destroy();
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

				expect( widget.name ).toBe( 'customWidget' );
				expect( widget.hasAttribute( 'mediaStyle' ) ).toBe( false );
			} );

			it( 'returns early when no upcast produces a model range for the figure', () => {
				// A <figure> without `class="media"` - the main media upcast doesn't claim it,
				// so `data.modelRange` is never set when our low-priority listener fires.
				editor.setData( '<figure></figure>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).not.toContain( '<media' );
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

					expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
						`<media mediaStyle="${ value }" url="${ YOUTUBE_URL }"></media>`
					);

					expect( editor.getData() ).toBe( input );
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

			expect( data ).toMatch( /^<figure class="media media-style-block-align-left">/ );
			expect( data ).toMatch( /data-oembed-url="https:\/\/youtu\.be\/foo"/ );
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

			expect( mediaModel.getAttribute( 'mediaStyle' ) ).toBe( 'alignRight' );
		} );
	} );

	describe( 'config.mediaEmbed.styles', () => {
		it( 'defaults to the canonical five-built-in list when no config is provided', () => {
			expect( editor.config.get( 'mediaEmbed.styles' ) ).toEqual( {
				options: [ 'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight' ]
			} );
		} );

		it( 'exposes the resolved normalizedStyles on the editing plugin', () => {
			const editing = editor.plugins.get( MediaEmbedStyleEditing );

			expect( editing.normalizedStyles.map( s => s.name ) ).toEqual( [
				'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight'
			] );
		} );

		describe( 'with a subset config (alignLeft, alignRight dropped)', () => {
			let subsetEditor, subsetModel;

			beforeEach( async () => {
				subsetEditor = await createConfiguredEditor( [ 'alignBlockLeft', 'alignCenter', 'alignBlockRight' ] );
				subsetModel = subsetEditor.model;
			} );

			afterEach( async () => {
				await subsetEditor.destroy();
			} );

			it( 'reflects the subset in normalizedStyles', () => {
				const editing = subsetEditor.plugins.get( MediaEmbedStyleEditing );

				expect( editing.normalizedStyles.map( s => s.name ) ).toEqual( [
					'alignBlockLeft', 'alignCenter', 'alignBlockRight'
				] );
			} );

			it( 'downcast does not write a class for a filtered-out value', () => {
				_setModelData( subsetModel, `<media mediaStyle="alignLeft" url="${ YOUTUBE_URL }"></media>` );

				expect( subsetEditor.getData() ).toMatch( /^<figure class="media">/ );
			} );

			it( 'upcast does not set the attribute for a filtered-out class', () => {
				subsetEditor.setData(
					`<figure class="media media-style-align-left"><oembed url="${ YOUTUBE_URL }"></oembed></figure>`
				);

				const mediaModel = subsetModel.document.getRoot().getChild( 0 );

				expect( mediaModel.hasAttribute( 'mediaStyle' ) ).toBe( false );
			} );

			it( 'downcast still writes the class for surviving styles', () => {
				_setModelData( subsetModel, `<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>` );

				expect( subsetEditor.getData() ).toMatch( /^<figure class="media media-style-block-align-left">/ );
			} );
		} );

		describe( 'with a custom semantical style', () => {
			let customEditor, customModel;

			beforeEach( async () => {
				customEditor = await createConfiguredEditor( [
					'alignCenter',
					{ name: 'side', title: 'Side media', icon: '<svg/>', className: 'media-style-side' }
				] );
				customModel = customEditor.model;
			} );

			afterEach( async () => {
				await customEditor.destroy();
			} );

			it( 'downcast writes the custom className for the custom style', () => {
				_setModelData( customModel, `<media mediaStyle="side" url="${ YOUTUBE_URL }"></media>` );

				expect( customEditor.getData() ).toMatch( /^<figure class="media media-style-side">/ );
			} );

			it( 'upcast reads the custom className back into the model attribute', () => {
				customEditor.setData(
					`<figure class="media media-style-side"><oembed url="${ YOUTUBE_URL }"></oembed></figure>`
				);

				const mediaModel = customModel.document.getRoot().getChild( 0 );

				expect( mediaModel.getAttribute( 'mediaStyle' ) ).toBe( 'side' );
			} );
		} );

		describe( 'invalid entries', () => {
			let warnStub;

			beforeEach( () => {
				warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			} );

			it( 'are filtered out of normalizedStyles and trigger a warning', async () => {
				const editorWithBadConfig = await createConfiguredEditor( [
					'alignCenter',
					{ name: 'incomplete' } // Missing title, icon, className → invalid.
				] );

				const editing = editorWithBadConfig.plugins.get( MediaEmbedStyleEditing );

				expect( editing.normalizedStyles.map( s => s.name ) ).toEqual( [ 'alignCenter' ] );
				expect( warnStub.mock.calls[ 0 ][ 0 ] ).toMatch( /^media-style-configuration-definition-invalid/ );

				await editorWithBadConfig.destroy();
			} );
		} );
	} );
} );
