/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import MediaEmbed from '../src/mediaembed';
import MediaEmbedEditing from '../src/mediaembedediting';
import MediaEmbedUI from '../src/mediaembedui';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'MediaEmbed', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ MediaEmbed, Paragraph, Link, Bold ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( MediaEmbed ) ).to.instanceOf( MediaEmbed );
	} );

	it( 'should load MediaEmbedEditing plugin', () => {
		expect( editor.plugins.get( MediaEmbedEditing ) ).to.instanceOf( MediaEmbedEditing );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).to.instanceOf( Widget );
	} );

	it( 'should load Clipboard plugin', () => {
		expect( editor.plugins.get( Clipboard ) ).to.instanceOf( Clipboard );
	} );

	it( 'should load MediaEmbedUI plugin', () => {
		expect( editor.plugins.get( MediaEmbedUI ) ).to.instanceOf( MediaEmbedUI );
	} );

	it( 'has proper name', () => {
		expect( MediaEmbed.pluginName ).to.equal( 'MediaEmbed' );
	} );

	describe( 'auto-media embed', () => {
		it( 'works for a full URL (https + "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a full URL (https without "wwww" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="https://youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a full URL (http + "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://www.youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="http://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a full URL (http without "wwww" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="http://youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a URL without protocol (with "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'www.youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a URL without protocol (without "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works fine if a media has no preview', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://twitter.com/ckeditor/status/1035181110140063749' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="https://twitter.com/ckeditor/status/1035181110140063749"></media>]'
			);
		} );

		it( 'does nothing if a URL is invalid', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://youtube.com' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://youtube.com[]</paragraph>'
			);
		} );

		it( 'does nothing if pasted two links as text', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4 https://www.youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4 https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
			);
		} );

		it( 'does nothing if pasted link', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<a href="https://www.youtube.com/watch?v=H08tGjXNHO4">https://www.youtube.com/watch?v=H08tGjXNHO4</a>' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="https://www.youtube.com/watch?v=H08tGjXNHO4">https://www.youtube.com/watch?v=H08tGjXNHO4[]</$text>' +
				'</paragraph>'
			);
		} );

		it( 'does nothing if node contains a valid URL but it is not a text', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<b>https://www.youtube.com/watch?v=H08tGjXNHO4</b>' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>' +
					'<$text bold="true">https://www.youtube.com/watch?v=H08tGjXNHO4[]</$text>' +
				'</paragraph>'
			);
		} );

		it( 'does nothing if pasted more than single node', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor,
				'https://www.youtube.com/watch?v=H08tGjXNHO4 ' +
				'<a href="https://www.youtube.com/watch?v=H08tGjXNHO4">https://www.youtube.com/watch?v=H08tGjXNHO4</a>'
			);

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4 ' +
					'<$text linkHref="https://www.youtube.com/watch?v=H08tGjXNHO4">https://www.youtube.com/watch?v=H08tGjXNHO4[]</$text>' +
				'</paragraph>'
			);
		} );

		it( 'does nothing if a URL is invalid (space inside URL)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'youtube.com/watch?v=H08tGjXNHO4&amp;param=foo bar' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>youtube.com/watch?v=H08tGjXNHO4&param=foo bar[]</paragraph>'
			);
		} );

		it( 'does nothing if URL match to media but it was removed', () => {
			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ MediaEmbed, Paragraph ],
					mediaEmbed: {
						removeProviders: [ 'youtube' ]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					setData( editor.model, '<paragraph>[]</paragraph>' );
					pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

					expect( getData( editor.model ) ).to.equal(
						'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
					);

					editorElement.remove();

					return editor.destroy();
				} );
		} );

		function pasteHtml( editor, html ) {
			editor.editing.view.document.fire( 'paste', {
				dataTransfer: createDataTransfer( { 'text/html': html } ),
				preventDefault() {
				}
			} );
		}

		function createDataTransfer( data ) {
			return {
				getData( type ) {
					return data[ type ];
				}
			};
		}
	} );
} );
