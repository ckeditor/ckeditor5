/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global setTimeout */

import MediaEmbed from '../src/mediaembed';
import AutoMediaEmbed from '../src/automediaembed';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'AutoMediaEmbed - integration', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ MediaEmbed, AutoMediaEmbed, Link, List, Bold ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should load Clipboard plugin', () => {
		expect( editor.plugins.get( Clipboard ) ).to.instanceOf( Clipboard );
	} );

	it( 'has proper name', () => {
		expect( AutoMediaEmbed.pluginName ).to.equal( 'AutoMediaEmbed' );
	} );

	describe( 'use fake timers', () => {
		let clock;

		beforeEach( () => {
			clock = sinon.useFakeTimers();
		} );

		afterEach( () => {
			clock.restore();
		} );

		it( 'replaces pasted text with media element after 100ms', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
			);

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'can undo auto-embeding', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
			);

			clock.tick( 100 );

			editor.commands.execute( 'undo' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
			);
		} );

		it( 'works for a full URL (https + "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a full URL (https without "wwww" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="https://youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a full URL (http + "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="http://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a full URL (http without "wwww" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="http://youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a URL without protocol (with "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a URL without protocol (without "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works fine if a media has no preview', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://twitter.com/ckeditor/status/1035181110140063749' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="https://twitter.com/ckeditor/status/1035181110140063749"></media>]'
			);
		} );

		it( 'works for URL that was pasted as a link', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<a href="https://www.youtube.com/watch?v=H08tGjXNHO4">https://www.youtube.com/watch?v=H08tGjXNHO4</a>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for URL that contains some inline styles', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<b>https://www.youtube.com/watch?v=H08tGjXNHO4</b>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for not collapsed selection inside single element', () => {
			setData( editor.model, '<paragraph>[Foo]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph></paragraph>[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for not collapsed selection over a few elements', () => {
			setData( editor.model, '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>For</paragraph>[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'does nothing if a URL is invalid', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://youtube.com' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://youtube.com[]</paragraph>'
			);
		} );

		it( 'does nothing if pasted two links as text', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4 https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4 https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
			);
		} );

		it( 'does nothing if pasted text contains a valid URL', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'Foo bar https://www.youtube.com/watch?v=H08tGjXNHO4 bar foo.' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo bar https://www.youtube.com/watch?v=H08tGjXNHO4 bar foo.[]</paragraph>'
			);
		} );

		it( 'does nothing if pasted more than single node', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor,
				'https://www.youtube.com/watch?v=H08tGjXNHO4 ' +
				'<a href="https://www.youtube.com/watch?v=H08tGjXNHO4">https://www.youtube.com/watch?v=H08tGjXNHO4</a>'
			);

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4 ' +
				'<$text linkHref="https://www.youtube.com/watch?v=H08tGjXNHO4">https://www.youtube.com/watch?v=H08tGjXNHO4[]</$text>' +
				'</paragraph>'
			);
		} );

		it( 'does nothing if pasted a paragraph with the url', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<p>https://www.youtube.com/watch?v=H08tGjXNHO4</p>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
			);
		} );

		it( 'does nothing if pasted a block of content that looks like a URL', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<ul><li>https://</li><li>youtube.com/watch?</li></ul><p>v=H08tGjXNHO4</p>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">https://</listItem>' +
				'<listItem listIndent="0" listType="bulleted">youtube.com/watch?</listItem>' +
				'<paragraph>v=H08tGjXNHO4[]</paragraph>'
			);
		} );

		it( 'does nothing if a URL is invalid (space inside URL)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'youtube.com/watch?v=H08tGjXNHO4&amp;param=foo bar' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>youtube.com/watch?v=H08tGjXNHO4&param=foo bar[]</paragraph>'
			);
		} );

		it( 'does nothing if URL match to media but it was removed', () => {
			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ MediaEmbed, AutoMediaEmbed, Paragraph ],
					mediaEmbed: {
						removeProviders: [ 'youtube' ]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					setData( editor.model, '<paragraph>[]</paragraph>' );
					pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

					clock.tick( 100 );

					expect( getData( editor.model ) ).to.equal(
						'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
					);

					editorElement.remove();

					return editor.destroy();
				} );
		} );
	} );

	describe( 'real timers', () => {
		it( 'undo breaks the auto-media embed feature', done => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
			);

			setTimeout( () => {
				editor.commands.execute( 'undo' );

				expect( getData( editor.model ) ).to.equal(
					'<paragraph>[]</paragraph>'
				);

				done();
			} );
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
