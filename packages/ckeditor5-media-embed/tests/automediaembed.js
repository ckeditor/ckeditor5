/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MediaEmbed from '../src/mediaembed.js';
import AutoMediaEmbed from '../src/automediaembed.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'AutoMediaEmbed - integration', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Typing, Paragraph, Link, Image, ImageCaption, MediaEmbed, AutoMediaEmbed ]
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

	it( 'should load Undo plugin', () => {
		expect( editor.plugins.get( Undo ) ).to.instanceOf( Undo );
	} );

	it( 'has proper name', () => {
		expect( AutoMediaEmbed.pluginName ).to.equal( 'AutoMediaEmbed' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( AutoMediaEmbed.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( AutoMediaEmbed.isPremiumPlugin ).to.be.false;
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
				'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
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

		it( 'can undo auto-embeding by pressing backspace', () => {
			const viewDocument = editor.editing.view.document;
			const deleteEvent = new DomEventData(
				viewDocument,
				{ preventDefault: sinon.spy() },
				{ direction: 'backward', unit: 'codePoint', sequence: 1 }
			);

			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
			);

			clock.tick( 100 );

			viewDocument.fire( 'delete', deleteEvent );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
			);
		} );

		it( 'works for a full URL (https + "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a full URL (https without "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="https://youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a full URL (http + "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="http://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a full URL (http without "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="http://youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a URL without protocol (with "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for a URL without protocol (without "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works fine if a media has no preview', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://twitter.com/ckeditor/status/1035181110140063749' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="https://twitter.com/ckeditor/status/1035181110140063749"></media>]'
			);
		} );

		it( 'works for URL that was pasted as a link', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<a href="https://www.youtube.com/watch?v=H08tGjXNHO4">https://www.youtube.com/watch?v=H08tGjXNHO4</a>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for URL that contains some inline styles', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<b>https://www.youtube.com/watch?v=H08tGjXNHO4</b>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for not collapsed selection inside single element', () => {
			setData( editor.model, '<paragraph>[Foo]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'works for not collapsed selection over a few elements', () => {
			setData( editor.model, '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Fo</paragraph>[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]<paragraph>r</paragraph>'
			);
		} );

		it( 'inserts media in-place (collapsed selection)', () => {
			setData( editor.model, '<paragraph>Foo []Bar</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo </paragraph>' +
				'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'inserts media in-place (non-collapsed selection)', () => {
			setData( editor.model, '<paragraph>Foo [Bar] Baz</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo </paragraph>' +
				'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]' +
				'<paragraph> Baz</paragraph>'
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

			expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4 ' +
				'<$text linkHref="https://www.youtube.com/watch?v=H08tGjXNHO4">https://www.youtube.com/watch?v=H08tGjXNHO4</$text>' +
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
			pasteHtml( editor, '<p>https://</p><p>youtube.com/watch?</p><p>v=H08tGjXNHO4</p>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://</paragraph>' +
				'<paragraph>youtube.com/watch?</paragraph>' +
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

		// s/ckeditor5/3
		it( 'should handle invalid URL with repeated characters', () => {
			const invalidURL = 'a.' + 'a'.repeat( 100000 ) + '^';

			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, invalidURL );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				`<paragraph>${ invalidURL }[]</paragraph>`
			);
		} );

		// #47
		it( 'does not transform a valid URL into a media if the element cannot be placed in the current position', () => {
			setData( editor.model, '<imageBlock src="/assets/sample.png"><caption>Foo.[]</caption></imageBlock>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<imageBlock src="/assets/sample.png"><caption>Foo.https://www.youtube.com/watch?v=H08tGjXNHO4[]</caption></imageBlock>'
			);
		} );

		it( 'replaces a URL in media if pasted a link when other media element was selected', () => {
			setData(
				editor.model,
				'[<media url="https://open.spotify.com/album/2IXlgvecaDqOeF3viUZnPI?si=ogVw7KlcQAGZKK4Jz9QzvA"></media>]'
			);

			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
			);
		} );

		it( 'inserts a new media element if pasted a link when other media element was selected in correct place', () => {
			setData(
				editor.model,
				'<paragraph>Foo. <$text linkHref="https://cksource.com">Bar</$text></paragraph>' +
				'[<media url="https://open.spotify.com/album/2IXlgvecaDqOeF3viUZnPI?si=ogVw7KlcQAGZKK4Jz9QzvA"></media>]' +
				'<paragraph>Bar.</paragraph>'
			);

			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo. <$text linkHref="https://cksource.com">Bar</$text></paragraph>' +
				'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]' +
				'<paragraph>Bar.</paragraph>'
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
					setData( newEditor.model, '<paragraph>[]</paragraph>' );
					pasteHtml( newEditor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

					clock.tick( 100 );

					expect( getData( newEditor.model ) ).to.equal(
						'<paragraph>https://www.youtube.com/watch?v=H08tGjXNHO4[]</paragraph>'
					);

					editorElement.remove();

					return newEditor.destroy();
				} );
		} );

		it( 'works for URL with %-symbols', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://youtube.com/watch?v=H08tGjXNHO4%2' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<media url="http://youtube.com/watch?v=H08tGjXNHO4%2"></media>]'
			);
		} );
	} );

	describe( 'use real timers', () => {
		const characters = Array( 10 ).fill( 1 ).map( ( x, i ) => String.fromCharCode( 65 + i ) );

		it( 'undo breaks the auto-media embed feature (undo was done before auto-media embed)', done => {
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

		// Checking whether paste+typing calls the auto-media handler once.
		it( 'pasting handler should be executed once', done => {
			const autoMediaEmbedPlugin = editor.plugins.get( AutoMediaEmbed );
			const autoMediaHandler = autoMediaEmbedPlugin._embedMediaBetweenPositions;
			let counter = 0;

			autoMediaEmbedPlugin._embedMediaBetweenPositions = function( ...args ) {
				counter += 1;

				return autoMediaHandler.apply( this, args );
			};

			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );
			simulateTyping( 'Foo. Bar.' );

			setTimeout( () => {
				autoMediaEmbedPlugin._embedMediaBetweenPositions = autoMediaHandler;

				expect( counter ).to.equal( 1 );

				done();
			}, 100 );
		} );

		it( 'typing before pasted link during collaboration should not blow up', done => {
			setData( editor.model, '<paragraph>[]</paragraph>' );

			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			for ( let i = 0; i < 10; ++i ) {
				const rootEl = editor.model.document.getRoot();

				setTimeout( () => {
					editor.model.enqueueChange( { isUndoable: false }, writer => {
						writer.insertText( characters[ i ], writer.createPositionFromPath( rootEl, [ 0, i ] ) );
					} );
				}, i * 5 );
			}

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]<paragraph>ABCDEFGHIJ</paragraph>'
				);

				done();
			}, 100 );
		} );

		it( 'typing after pasted link during collaboration should not blow up', done => {
			setData( editor.model, '<paragraph>[]</paragraph>' );

			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			for ( let i = 0; i < 10; ++i ) {
				setTimeout( () => {
					editor.model.enqueueChange( { isUndoable: false }, writer => {
						writer.insertText( characters[ i ], editor.model.document.selection.getFirstPosition() );
					} );
				}, i * 5 );
			}

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]<paragraph>ABCDEFGHIJ</paragraph>'
				);

				done();
			}, 100 );
		} );

		it( 'should insert the media element even if parent element where the URL was pasted has been deleted', done => {
			setData( editor.model, '<paragraph>Foo.</paragraph><paragraph>Bar.[]</paragraph>' );

			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			editor.model.enqueueChange( { isUndoable: false }, writer => {
				writer.remove( writer.createRangeOn( editor.model.document.getRoot().getChild( 1 ) ) );
			} );

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'<paragraph>Foo.</paragraph>[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
				);

				done();
			}, 100 );
		} );

		it( 'should insert the media element even if new element appeared above the pasted URL', done => {
			setData( editor.model, '<paragraph>Foo.</paragraph><paragraph>Bar.[]</paragraph>' );

			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			editor.model.enqueueChange( { isUndoable: false }, writer => {
				const paragraph = writer.createElement( 'paragraph' );
				writer.insert( paragraph, writer.createPositionAfter( editor.model.document.getRoot().getChild( 0 ) ) );
				writer.setSelection( paragraph, 'in' );
			} );

			for ( let i = 0; i < 10; ++i ) {
				setTimeout( () => {
					editor.model.enqueueChange( { isUndoable: false }, writer => {
						writer.insertText( characters[ i ], editor.model.document.selection.getFirstPosition() );
					} );
				}, i * 5 );
			}

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'<paragraph>Foo.</paragraph>' +
					'<paragraph>ABCDEFGHIJ</paragraph>' +
					'<paragraph>Bar.</paragraph>' +
					'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]'
				);

				done();
			}, 100 );
		} );

		it( 'should insert the media element even if new element appeared below the pasted URL', done => {
			setData( editor.model, '<paragraph>Foo.</paragraph><paragraph>Bar.[]</paragraph>' );

			pasteHtml( editor, 'https://www.youtube.com/watch?v=H08tGjXNHO4' );

			editor.model.enqueueChange( { isUndoable: false }, writer => {
				const paragraph = writer.createElement( 'paragraph' );
				writer.insert( paragraph, writer.createPositionAfter( editor.model.document.getRoot().getChild( 1 ) ) );
				writer.setSelection( paragraph, 'in' );
			} );

			for ( let i = 0; i < 10; ++i ) {
				setTimeout( () => {
					editor.model.enqueueChange( { isUndoable: false }, writer => {
						writer.insertText( characters[ i ], editor.model.document.selection.getFirstPosition() );
					} );
				}, i * 5 );
			}

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'<paragraph>Foo.</paragraph>' +
					'<paragraph>Bar.</paragraph>' +
					'[<media url="https://www.youtube.com/watch?v=H08tGjXNHO4"></media>]' +
					'<paragraph>ABCDEFGHIJ</paragraph>'
				);

				done();
			}, 100 );
		} );
	} );

	it( 'should detach LiveRange', async () => {
		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Typing, Paragraph, Link, Image, ImageCaption, Table, MediaEmbed, AutoMediaEmbed ]
		} );

		setData(
			editor.model,
			'<table>' +
				'<tableRow>' +
					'[<tableCell><paragraph>foo</paragraph></tableCell>]' +
					'[<tableCell><paragraph>bar</paragraph></tableCell>]' +
				'</tableRow>' +
			'</table>'
		);

		pasteHtml( editor, '<table><tr><td>one</td><td>two</td></tr></table>' );

		expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
			'<table>' +
				'<tableRow>' +
					'<tableCell><paragraph>one</paragraph></tableCell>' +
					'<tableCell><paragraph>two</paragraph></tableCell>' +
				'</tableRow>' +
			'</table>'
		);

		expect( () => {
			editor.setData( '' );
		} ).not.to.throw();

		await editor.destroy();
	} );

	function simulateTyping( text ) {
		// While typing, every character is an atomic change.
		text.split( '' ).forEach( character => {
			editor.execute( 'insertText', {
				text: character
			} );
		} );
	}

	function pasteHtml( editor, html ) {
		editor.editing.view.document.fire( 'paste', {
			dataTransfer: createDataTransfer( { 'text/html': html } ),
			stopPropagation() {},
			preventDefault() {}
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
