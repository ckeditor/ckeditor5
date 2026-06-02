/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedResizeEditing } from '../../src/mediaembedresize/mediaembedresizeediting.js';
import { MediaEmbedStyleEditing } from '../../src/mediaembedstyle/mediaembedstyleediting.js';

const YOUTUBE_URL = 'https://youtu.be/foo';
const VIMEO_URL = 'https://vimeo.com/1234';

describe( 'MediaEmbedStyle integration', () => {
	describe( 'with MediaEmbedResize', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing, MediaEmbedStyleEditing ]
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'preserves both alignment and resize on the same figure', () => {
			_setModelData( model,
				`<media mediaStyle="alignBlockLeft" resizedWidth="50%" url="${ YOUTUBE_URL }"></media>`
			);

			const data = editor.getData();

			expect( data ).to.match( /media_resized/ );
			expect( data ).to.match( /media-style-block-align-left/ );
			expect( data ).to.match( /style="width:50%;"/ );
		} );

		it( 'preserves a wrap alignment alongside resize', () => {
			_setModelData( model,
				`<media mediaStyle="alignLeft" resizedWidth="40%" url="${ YOUTUBE_URL }"></media>`
			);

			const data = editor.getData();

			expect( data ).to.match( /media-style-align-left/ );
			expect( data ).to.match( /media_resized/ );
			expect( data ).to.match( /style="width:40%;"/ );
		} );

		it( 'emits no alignment class for the default style (alignCenter), even when resized', () => {
			_setModelData( model, `<media resizedWidth="50%" url="${ YOUTUBE_URL }"></media>` );

			const data = editor.getData();

			expect( data ).to.match( /media_resized/ );
			expect( data ).to.match( /style="width:50%;"/ );
			expect( data ).not.to.match( /media-style-/ );
		} );

		it( 'preserves alignment when URL changes between resizable providers', () => {
			_setModelData( model,
				`<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>`
			);

			const mediaModel = model.document.getRoot().getChild( 0 );

			model.change( writer => writer.setAttribute( 'url', VIMEO_URL, mediaModel ) );

			expect( mediaModel.getAttribute( 'mediaStyle' ) ).to.equal( 'alignBlockLeft' );
			expect( editor.getData() ).to.match( /media-style-block-align-left/ );
		} );
	} );

	describe( 'standalone (without MediaEmbedResize)', () => {
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

		for ( const [ value, className ] of [
			[ 'alignLeft', 'media-style-align-left' ],
			[ 'alignBlockLeft', 'media-style-block-align-left' ],
			[ 'alignBlockRight', 'media-style-block-align-right' ],
			[ 'alignRight', 'media-style-align-right' ]
		] ) {
			it( `applies ${ value } correctly without MediaEmbedResize loaded`, () => {
				_setModelData( model, `<media mediaStyle="${ value }" url="${ YOUTUBE_URL }"></media>` );

				expect( editor.getData() ).to.match( new RegExp( className ) );
			} );
		}

		it( 'emits no media_resized class (resize plugin absent)', () => {
			_setModelData( model, `<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>` );

			const data = editor.getData();

			expect( data ).to.match( /media-style-block-align-left/ );
			expect( data ).not.to.match( /media_resized/ );
		} );
	} );

	describe( 'semantic data output (previewsInData: false)', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing, MediaEmbedStyleEditing ],
				mediaEmbed: {
					previewsInData: false
				}
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'emits the alignment class on the <figure> with <oembed> inner element', () => {
			_setModelData( model, `<media mediaStyle="alignBlockLeft" url="${ YOUTUBE_URL }"></media>` );

			const data = editor.getData();

			expect( data ).to.match( /^<figure class="media media-style-block-align-left">/ );
			expect( data ).to.match( /<oembed url="https:\/\/youtu\.be\/foo">/ );
		} );

		it( 'emits both alignment class and resize style on the <figure>', () => {
			_setModelData( model,
				`<media mediaStyle="alignLeft" resizedWidth="50%" url="${ YOUTUBE_URL }"></media>`
			);

			const data = editor.getData();

			expect( data ).to.match( /media_resized/ );
			expect( data ).to.match( /media-style-align-left/ );
			expect( data ).to.match( /style="width:50%;"/ );
			expect( data ).to.match( /<oembed url=/ );
		} );

		it( 'preserves a resized + aligned figure through semantic round-trip', () => {
			const input =
				'<figure class="media media_resized media-style-align-left" style="width:50%;">' +
					`<oembed url="${ YOUTUBE_URL }"></oembed>` +
				'</figure>';

			editor.setData( input );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				`<media mediaStyle="alignLeft" resizedWidth="50%" url="${ YOUTUBE_URL }"></media>`
			);

			const output = editor.getData();
			expect( output ).to.match( /media_resized/ );
			expect( output ).to.match( /media-style-align-left/ );
			expect( output ).to.match( /style="width:50%;"/ );
			expect( output ).to.match( /<oembed url="https:\/\/youtu\.be\/foo">/ );
		} );
	} );
} );
