/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global setTimeout */

import Image from '../src/image';
import AutoImage from '../src/autoimage';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Table from '@ckeditor/ckeditor5-table/src/table';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'AutoImage - integration', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image, AutoImage, Link, List, Bold, Typing, Image, ImageCaption ]
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
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png[]</paragraph>'
			);

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'can undo auto-embeding', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png[]</paragraph>'
			);

			clock.tick( 100 );

			editor.commands.execute( 'undo' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png[]</paragraph>'
			);
		} );

		it( 'works for a full URL (https + "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://www.ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="https://www.ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'works for a full URL (https without "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'works for a full URL (http + "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://www.ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="http://www.ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'works for a full URL (http without "wwww" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'http://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="http://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'works for a URL without protocol (with "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'www.ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="www.ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'works for a URL without protocol (without "www" sub-domain)', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'works for URL that was pasted as a link', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<a href="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png">' +
				'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png</a>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'works for URL that contains some inline styles', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<b>https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png</b>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'works for not collapsed selection inside single element', () => {
			setData( editor.model, '<paragraph>[Foo]</paragraph>' );
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'works for not collapsed selection over a few elements', () => {
			setData( editor.model, '<paragraph>Fo[o</paragraph><paragraph>Ba]r</paragraph>' );
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Fo</paragraph>' +
				'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]' +
				'<paragraph>r</paragraph>'
			);
		} );

		it( 'inserts image in-place (collapsed selection)', () => {
			setData( editor.model, '<paragraph>Foo []Bar</paragraph>' );
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo </paragraph>' +
				'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'inserts image in-place (non-collapsed selection)', () => {
			setData( editor.model, '<paragraph>Foo [Bar] Baz</paragraph>' );
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo </paragraph>' +
				'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]' +
				'<paragraph> Baz</paragraph>'
			);
		} );

		it( 'does nothing if a URL is invalid', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://ckeditor.com' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://ckeditor.com[]</paragraph>'
			);
		} );

		it( 'does nothing if pasted two links as text', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png ' +
				'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png ' +
				'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png[]</paragraph>'
			);
		} );

		it( 'does nothing if pasted text contains a valid URL', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'Foo bar https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png bar foo.' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo bar https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png bar foo.[]</paragraph>'
			);
		} );

		it( 'does nothing if pasted more than single node', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor,
				'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png ' +
				'<a href="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png">' +
				'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png</a>'
			);

			clock.tick( 100 );

			expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png ' +
				'<$text linkHref="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png">' +
				'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png</$text>' +
				'</paragraph>'
			);
		} );

		it( 'does nothing if pasted a paragraph with the url', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<p>https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png</p>' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png[]</paragraph>'
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
			pasteHtml( editor, 'https://ckeditor.com/docs/ckeditor5/latest/assets/img/malta.jpg&amp;param=foo bar' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://ckeditor.com/docs/ckeditor5/latest/assets/img/malta.jpg&param=foo bar[]</paragraph>'
			);
		} );

		// #47
		it( 'does not transform a valid URL into a image if the element cannot be placed in the current position', () => {
			setData( editor.model, '<image src="/assets/sample.png"><caption>Foo.[]</caption></image>' );
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<image src="/assets/sample.png"><caption>' +
				'Foo.https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png[]' +
				'</caption></image>'
			);
		} );

		it( 'replaces a URL in image if pasted a link when other image element was selected', () => {
			setData(
				editor.model,
				'[<image src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/malta.jpg"><caption></caption></image>]'
			);

			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );

		it( 'inserts a new image element if pasted a link when other image element was selected in correct place', () => {
			setData(
				editor.model,
				'<paragraph>Foo. <$text linkHref="https://cksource.com">Bar</$text></paragraph>' +
				'[<image src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/malta.jpg"><caption></caption></image>]' +
				'<paragraph><$text bold="true">Bar</$text>.</paragraph>'
			);

			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>Foo. <$text linkHref="https://cksource.com">Bar</$text></paragraph>' +
				'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]' +
				'<paragraph><$text bold="true">Bar</$text>.</paragraph>'
			);
		} );

		it( 'works for URL with %-symbols', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header%20Fckeditor-5-d7348daebf.png' );

			clock.tick( 100 );

			expect( getData( editor.model ) ).to.equal(
				'[<image src="https://ckeditor.com/assets/images/header%20Fckeditor-5-d7348daebf.png"><caption></caption></image>]'
			);
		} );
	} );

	describe( 'use real timers', () => {
		const characters = Array( 10 ).fill( 1 ).map( ( x, i ) => String.fromCharCode( 65 + i ) );

		it( 'undo breaks the auto-image feature (undo was done before auto-image)', done => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png[]</paragraph>'
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
			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );
			simulateTyping( 'Foo. Bar.' );

			setTimeout( () => {
				AutoImagePlugin._embedImageBetweenPositions = autoImageHandler;

				expect( counter ).to.equal( 1 );

				done();
			}, 100 );
		} );

		it( 'typing before pasted link during collaboration should not blow up', done => {
			setData( editor.model, '<paragraph>[]</paragraph>' );

			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

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
					'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]' +
					'<paragraph>ABCDEFGHIJ</paragraph>'
				);

				done();
			}, 100 );
		} );

		it( 'typing after pasted link during collaboration should not blow up', done => {
			setData( editor.model, '<paragraph>[]</paragraph>' );

			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			for ( let i = 0; i < 10; ++i ) {
				setTimeout( () => {
					editor.model.enqueueChange( 'transparent', writer => {
						writer.insertText( characters[ i ], editor.model.document.selection.getFirstPosition() );
					} );
				}, i * 5 );
			}

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]' +
					'<paragraph>ABCDEFGHIJ</paragraph>'
				);

				done();
			}, 100 );
		} );

		it( 'should insert the image element even if parent element where the URL was pasted has been deleted', done => {
			setData( editor.model, '<paragraph>Foo.</paragraph><paragraph>Bar.[]</paragraph>' );

			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

			editor.model.enqueueChange( 'transparent', writer => {
				writer.remove( writer.createRangeOn( editor.model.document.getRoot().getChild( 1 ) ) );
			} );

			setTimeout( () => {
				expect( getData( editor.model ) ).to.equal(
					'<paragraph>Foo.</paragraph>' +
					'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
				);

				done();
			}, 100 );
		} );

		it( 'should insert the image element even if new element appeared above the pasted URL', done => {
			setData( editor.model, '<paragraph>Foo.</paragraph><paragraph>Bar.[]</paragraph>' );

			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

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
					'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]'
				);

				done();
			}, 100 );
		} );

		it( 'should insert the image element even if new element appeared below the pasted URL', done => {
			setData( editor.model, '<paragraph>Foo.</paragraph><paragraph>Bar.[]</paragraph>' );

			pasteHtml( editor, 'https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png' );

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
					'[<image src="https://ckeditor.com/assets/images/header/ckeditor-5-d7348daebf.png"><caption></caption></image>]' +
					'<paragraph>ABCDEFGHIJ</paragraph>'
				);

				done();
			}, 100 );
		} );
	} );

	it( 'should detach LiveRange', async () => {
		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Image, AutoImage, Link, List, Bold, Typing, Image, ImageCaption, Table ]
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
