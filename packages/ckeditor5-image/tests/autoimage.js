/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global setTimeout */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Table from '@ckeditor/ckeditor5-table/src/table';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Image from '../src/image';
import ImageCaption from '../src/imagecaption';
import AutoImage from '../src/autoimage';

describe( 'AutoImage - integration', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Typing, Paragraph, Link, Image, ImageCaption, AutoImage ]
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
		expect( AutoImage.pluginName ).to.equal( 'AutoImage' );
	} );

	describe( 'use fake timers', () => {
		let clock;

		beforeEach( () => {
			clock = sinon.useFakeTimers();
		} );

		afterEach( () => {
			clock.restore();
		} );

		it( 'replaces pasted text with image element after 100ms', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://example.com/image.png' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>http://example.com/image.png[]</paragraph>'
			);

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="http://example.com/image.png"><caption></caption></image>]'
			);
		} );

		it( 'can undo auto-embeding', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://example.com/image.png' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>http://example.com/image.png[]</paragraph>'
			);

			clock.tick( 100 );

			editor.commands.execute( 'undo' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>http://example.com/image.png[]</paragraph>'
			);
		} );

		describe( 'supported URL', () => {
			const supportedURLs = [
				'example.com/image.png',
				'www.example.com/image.png',
				'https://www.example.com/image.png',
				'https://example.com/image.png',
				'http://www.example.com/image.png',
				'http://example.com/image.png',
				'http://example.com/image.jpg',
				'http://example.com/image.jpeg',
				'http://example.com/image.gif',
				'http://example.com/image.ico',
				'http://example.com/image.JPG',
				'http://example.com%20Fimage.png',
				'http://example.com/image.png?foo=bar',
				'http://example.com/image.png#foo'
			];

			for ( const supportedURL of supportedURLs ) {
				it( `should detect "${ supportedURL }" as a valid URL`, () => {
					setData( editor.model, '<paragraph>[]</paragraph>' );
					pasteHtml( editor, supportedURL );

					clock.tick( 100 );

					expect( getData( editor.model ) ).to.equal(
						`[<image src="${ supportedURL }"><caption></caption></image>]`
					);
				} );
			}
		} );

		describe( 'unsupported URL', () => {
			const unsupportedOrInvalid = [
				'http://www.example.com',
				'https://example.com',
				'http://www.example.com/image.svg',
				'http://www.example.com/image.webp',
				'http://www.example.com/image.mp3',
				'http://www.example.com/image.exe',
				'http://www.example.com/image.txt',
				'http://example.com/image.png http://example.com/image.png',
				'Foo bar http://example.com/image.png bar foo.',
				'https://example.com/im age.png'
			];

			for ( const unsupportedURL of unsupportedOrInvalid ) {
				it( `should not detect "${ unsupportedURL }" as a valid URL`, () => {
					setData( editor.model, '<paragraph>[]</paragraph>' );
					pasteHtml( editor, unsupportedURL );

					clock.tick( 100 );

					expect( getData( editor.model ) ).to.equal(
						`<paragraph>${ unsupportedURL }[]</paragraph>`
					);
				} );
			}
		} );

		it( 'works for URL that was pasted as a link', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<a href="http://example.com/image.png">' +
				'http://example.com/image.png</a>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="http://example.com/image.png"><caption></caption></image>]'
			);
		} );

		it( 'works for URL that contains some inline styles', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<b>http://example.com/image.png</b>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="http://example.com/image.png"><caption></caption></image>]'
			);
		} );

		it( 'works for not collapsed selection inside single element', () => {
			setData( editor.model, '<paragraph>[Foo]</paragraph>' );
			pasteHtml( editor, 'http://example.com/image.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="http://example.com/image.png"><caption></caption></image>]'
			);
		} );

		it( 'works for not collapsed selection over a few elements', () => {
			setData( editor.model, '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph>' );
			pasteHtml( editor, 'http://example.com/image.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Fo</paragraph>' +
				'[<image src="http://example.com/image.png"><caption></caption></image>]' +
				'<paragraph>r</paragraph>'
			);
		} );

		it( 'inserts image in-place (collapsed selection)', () => {
			setData( editor.model, '<paragraph>Foo []Bar</paragraph>' );
			pasteHtml( editor, 'http://example.com/image.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo </paragraph>' +
				'[<image src="http://example.com/image.png"><caption></caption></image>]' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'inserts image in-place (non-collapsed selection)', () => {
			setData( editor.model, '<paragraph>Foo [Bar] Baz</paragraph>' );
			pasteHtml( editor, 'http://example.com/image.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo </paragraph>' +
				'[<image src="http://example.com/image.png"><caption></caption></image>]' +
				'<paragraph> Baz</paragraph>'
			);
		} );

		it( 'does nothing if pasted more than single node', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor,
				'http://example.com/image.png ' +
				'<a href="http://example.com/image.png">' +
				'http://example.com/image.png</a>'
			);

			clock.tick( 100 );

			expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>http://example.com/image.png ' +
				'<$text linkHref="http://example.com/image.png">' +
				'http://example.com/image.png</$text>' +
				'</paragraph>'
			);
		} );

		it( 'does nothing if pasted a paragraph with the url', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<p>http://example.com/image.png</p>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>http://example.com/image.png[]</paragraph>'
			);
		} );

		it( 'does nothing if pasted a block of content that looks like a URL', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<p>https://</p><p>example.com/image</p><p>.png</p>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://</paragraph><paragraph>example.com/image</paragraph><paragraph>.png[]</paragraph>'
			);
		} );

		// #47
		it( 'does not transform a valid URL into a image if the element cannot be placed in the current position', () => {
			setData( editor.model, '<image src="/assets/sample.png"><caption>Foo.[]</caption></image>' );
			pasteHtml( editor, 'http://example.com/image.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<image src="/assets/sample.png"><caption>' +
				'Foo.http://example.com/image.png[]' +
				'</caption></image>'
			);
		} );

		it( 'replaces a URL in image if pasted a link when other image element was selected', () => {
			setData(
				editor.model,
				'[<image src="http://example.com/image.png"><caption></caption></image>]'
			);

			pasteHtml( editor, 'http://example.com/image2.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="http://example.com/image2.png"><caption></caption></image>]'
			);
		} );

		it( 'inserts a new image element if pasted a link when other image element was selected in correct place', () => {
			setData(
				editor.model,
				'<paragraph>Foo. <$text linkHref="https://cksource.com">Bar</$text></paragraph>' +
				'[<image src="http://example.com/image.png"><caption></caption></image>]' +
				'<paragraph><$text>Bar</$text>.</paragraph>'
			);

			pasteHtml( editor, 'http://example.com/image2.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo. <$text linkHref="https://cksource.com">Bar</$text></paragraph>' +
				'[<image src="http://example.com/image2.png"><caption></caption></image>]' +
				'<paragraph>Bar.</paragraph>'
			);
		} );
	} );

	describe( 'use real timers', () => {
		const characters = Array( 10 ).fill( 1 ).map( ( x, i ) => String.fromCharCode( 65 + i ) );

		it( 'undo breaks the auto-image feature (undo was done before auto-image)', done => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://example.com/image.png' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>http://example.com/image.png[]</paragraph>'
			);

			setTimeout( () => {
				editor.commands.execute( 'undo' );

				expect( getData( editor.model ) ).to.equal(
					'<paragraph>[]</paragraph>'
				);

				done();
			} );
		} );

		// Checking whether paste+typing calls the auto-image handler once.
		it( 'pasting handler should be executed once', done => {
			const AutoImagePlugin = editor.plugins.get( AutoImage );
			const autoImageHandler = AutoImagePlugin._embedImageBetweenPositions;
			let counter = 0;

			AutoImagePlugin._embedImageBetweenPositions = function( ...args ) {
				counter += 1;

				return autoImageHandler.apply( this, args );
			};

			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://example.com/image.png' );
			simulateTyping( 'Foo. Bar.' );

			setTimeout( () => {
				AutoImagePlugin._embedImageBetweenPositions = autoImageHandler;

				expect( counter ).to.equal( 1 );

				done();
			}, 100 );
		} );

		it( 'typing before pasted link during collaboration should not blow up', done => {
			setData( editor.model, '<paragraph>[]</paragraph>' );

			pasteHtml( editor, 'http://example.com/image.png' );

			for ( let i = 0; i < 10; ++i ) {
				const rootEl = editor.model.document.getRoot();

				setTimeout( () => {
					editor.model.enqueueChange( 'transparent', writer => {
						writer.insertText( characters[ i ], writer.createPositionFromPath( rootEl, [ 0, i ] ) );
					} );
				}, i * 5 );
			}

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'[<image src="http://example.com/image.png"><caption></caption></image>]' +
					'<paragraph>ABCDEFGHIJ</paragraph>'
				);

				done();
			}, 100 );
		} );

		it( 'typing after pasted link during collaboration should not blow up', done => {
			setData( editor.model, '<paragraph>[]</paragraph>' );

			pasteHtml( editor, 'http://example.com/image.png' );

			for ( let i = 0; i < 10; ++i ) {
				setTimeout( () => {
					editor.model.enqueueChange( 'transparent', writer => {
						writer.insertText( characters[ i ], editor.model.document.selection.getFirstPosition() );
					} );
				}, i * 5 );
			}

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'[<image src="http://example.com/image.png"><caption></caption></image>]' +
					'<paragraph>ABCDEFGHIJ</paragraph>'
				);

				done();
			}, 100 );
		} );

		it( 'should insert the image element even if parent element where the URL was pasted has been deleted', done => {
			setData( editor.model, '<paragraph>Foo.</paragraph><paragraph>Bar.[]</paragraph>' );

			pasteHtml( editor, 'http://example.com/image.png' );

			editor.model.enqueueChange( 'transparent', writer => {
				writer.remove( writer.createRangeOn( editor.model.document.getRoot().getChild( 1 ) ) );
			} );

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'<paragraph>Foo.</paragraph>' +
					'[<image src="http://example.com/image.png"><caption></caption></image>]'
				);

				done();
			}, 100 );
		} );

		it( 'should insert the image element even if new element appeared above the pasted URL', done => {
			setData( editor.model, '<paragraph>Foo.</paragraph><paragraph>Bar.[]</paragraph>' );

			pasteHtml( editor, 'http://example.com/image.png' );

			editor.model.enqueueChange( 'transparent', writer => {
				const paragraph = writer.createElement( 'paragraph' );
				writer.insert( paragraph, writer.createPositionAfter( editor.model.document.getRoot().getChild( 0 ) ) );
				writer.setSelection( paragraph, 'in' );
			} );

			for ( let i = 0; i < 10; ++i ) {
				setTimeout( () => {
					editor.model.enqueueChange( 'transparent', writer => {
						writer.insertText( characters[ i ], editor.model.document.selection.getFirstPosition() );
					} );
				}, i * 5 );
			}

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'<paragraph>Foo.</paragraph>' +
					'<paragraph>ABCDEFGHIJ</paragraph>' +
					'<paragraph>Bar.</paragraph>' +
					'[<image src="http://example.com/image.png"><caption></caption></image>]'
				);

				done();
			}, 100 );
		} );

		it( 'should insert the image element even if new element appeared below the pasted URL', done => {
			setData( editor.model, '<paragraph>Foo.</paragraph><paragraph>Bar.[]</paragraph>' );

			pasteHtml( editor, 'http://example.com/image.png' );

			editor.model.enqueueChange( 'transparent', writer => {
				const paragraph = writer.createElement( 'paragraph' );
				writer.insert( paragraph, writer.createPositionAfter( editor.model.document.getRoot().getChild( 1 ) ) );
				writer.setSelection( paragraph, 'in' );
			} );

			for ( let i = 0; i < 10; ++i ) {
				setTimeout( () => {
					editor.model.enqueueChange( 'transparent', writer => {
						writer.insertText( characters[ i ], editor.model.document.selection.getFirstPosition() );
					} );
				}, i * 5 );
			}

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'<paragraph>Foo.</paragraph>' +
					'<paragraph>Bar.</paragraph>' +
					'[<image src="http://example.com/image.png"><caption></caption></image>]' +
					'<paragraph>ABCDEFGHIJ</paragraph>'
				);

				done();
			}, 100 );
		} );
	} );

	it( 'should detach LiveRange', async () => {
		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Typing, Paragraph, Link, Image, ImageCaption, Table, AutoImage ]
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
			editor.execute( 'input', {
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
