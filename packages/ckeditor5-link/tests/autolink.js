/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Input from '@ckeditor/ckeditor5-typing/src/input';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import LinkEditing from '../src/linkediting';
import AutoLink from '../src/autolink';

describe( 'AutoLink', () => {
	let editor;

	it( 'should be named', () => {
		expect( AutoLink.pluginName ).to.equal( 'AutoLink' );
	} );

	it( 'should be loaded without Enter & ShiftEnter features', async () => {
		const editor = await ModelTestEditor.create( {
			plugins: [ Paragraph, Input, LinkEditing, AutoLink ]
		} );

		await editor.destroy();
	} );

	describe( 'auto link behavior', () => {
		let model;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( {
				plugins: [ Paragraph, Input, Enter, ShiftEnter, LinkEditing, AutoLink ]
			} );

			model = editor.model;

			setData( model, '<paragraph>[]</paragraph>' );
		} );

		it( 'does nothing on typing normal text', () => {
			simulateTyping( 'Cupcake ipsum dolor. Sit amet caramels. Pie jelly-o lemon drops fruitcake.' );

			expect( getData( model ) ).to.equal(
				'<paragraph>Cupcake ipsum dolor. Sit amet caramels. Pie jelly-o lemon drops fruitcake.[]</paragraph>'
			);
		} );

		it( 'does not add linkHref attribute to a text link while typing', () => {
			simulateTyping( 'https://www.cksource.com' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com[]</paragraph>'
			);
		} );

		it( 'adds linkHref attribute to a text link after space', () => {
			simulateTyping( 'https://www.cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph><$text linkHref="https://www.cksource.com">https://www.cksource.com</$text> []</paragraph>'
			);
		} );

		it( 'does not add linkHref attribute if linkHref is not allowed', () => {
			model.schema.addAttributeCheck( () => false ); // Disable all attributes.

			simulateTyping( 'https://www.cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com []</paragraph>'
			);
		} );

		it( 'does not add linkHref attribute if plugin is force-disabled (on space)', () => {
			editor.plugins.get( 'AutoLink' ).forceDisabled( 'test' );

			simulateTyping( 'https://www.cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com []</paragraph>'
			);
		} );

		it( 'does not add linkHref attribute if plugin is force-disabled (on enter)', () => {
			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );
			editor.plugins.get( 'AutoLink' ).forceDisabled( 'test' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com</paragraph>' +
				'<paragraph>[]</paragraph>'
			);
		} );

		it( 'does not add linkHref attribute if plugin is force-disabled (on shift enter)', () => {
			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );
			editor.plugins.get( 'AutoLink' ).forceDisabled( 'test' );

			editor.execute( 'shiftEnter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com<softBreak></softBreak>[]</paragraph>'
			);
		} );

		it( 'adds linkHref attribute to a text link after space (inside paragraph)', () => {
			setData( model, '<paragraph>Foo Bar [] Baz</paragraph>' );

			simulateTyping( 'https://www.cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph>Foo Bar <$text linkHref="https://www.cksource.com">https://www.cksource.com</$text> [] Baz</paragraph>'
			);
		} );

		it( 'adds linkHref attribute to a text link on shift enter', () => {
			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );

			editor.execute( 'shiftEnter' );

			// TODO: should test with selection but master has a bug. See: https://github.com/ckeditor/ckeditor5/issues/7459.
			expect( getData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>' +
				'<$text linkHref="https://www.cksource.com">https://www.cksource.com</$text>' +
				'<softBreak></softBreak>' +
				'</paragraph>'
			);
		} );

		it( 'does not add linkHref attribute to a text link after double soft break', () => {
			setData( model, '<paragraph>https://www.cksource.com<softBreak></softBreak>[]</paragraph>' );

			editor.execute( 'shiftEnter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com<softBreak></softBreak><softBreak></softBreak>[]</paragraph>'
			);
		} );

		it( 'adds linkHref attribute to a text link on enter', () => {
			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>' +
				'<$text linkHref="https://www.cksource.com">https://www.cksource.com</$text>' +
				'</paragraph>' +
				'<paragraph>[]</paragraph>'
			);
		} );

		it( 'adds "mailto:" to link of detected email addresses', () => {
			simulateTyping( 'newsletter@cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph><$text linkHref="mailto:newsletter@cksource.com">newsletter@cksource.com</$text> []</paragraph>'
			);
		} );

		// Some examples came from https://mathiasbynens.be/demo/url-regex.
		describe( 'supported URL', () => {
			const supportedURLs = [
				'http://cksource.com',
				'https://cksource.com',
				'https://cksource.com:8080',
				'http://www.cksource.com',
				'hTtP://WwW.cKsOuRcE.cOm',
				'www.cksource.com',
				'http://foo.bar.cksource.com',
				'http://www.cksource.com/some/path/index.html#abc',
				'http://www.cksource.com/some/path/index.html?foo=bar',
				'http://www.cksource.com/some/path/index.html?foo=bar#abc',
				'http://www.cksource.com:8080/some/path/index.html?foo=bar#abc',
				'http://www.cksource.com/some/path/index.html#abc?foo=bar',
				'ftp://cksource.com',
				'http://cksource.com/foo_bar',
				'http://cksource.com/foo_bar/',
				'http://cksource.com/foo_bar_(wikipedia)',
				'http://cksource.com/foo_bar_(wikipedia)_(again)',
				'http://www.cksource.com/wpstyle/?p=364',
				'http://www.cksource.com/wpstyle/?bar=baz&inga=42&quux',
				'http://userid:password@example.com:8080' +
				'http://userid:password@example.com:8080/' +
				'http://userid@cksource.com' +
				'http://userid@cksource.com/' +
				'http://userid@cksource.com:8080' +
				'http://userid@cksource.com:8080/' +
				'http://userid:password@cksource.com' +
				'http://userid:password@cksource.com/' +
				'http://🥳df.ws/123',
				'http://🥳.ws/富',
				'http://🥳.ws',
				'http://🥳.ws/',
				'http://cksource.com/blah_(wikipedia)#cite-1',
				'http://cksource.com/blah_(wikipedia)_blah#cite-1',
				'http://cksource.com/unicode_(🥳)_in_parens',
				'http://cksource.com/(something)?after=parens',
				'http://🥳.cksource.com/',
				'http://code.cksource.com/woot/#&product=browser',
				'http://j.mp',
				'ftp://cksource.com/baz',
				'http://cksource.com/?q=Test%20URL-encoded%20stuff',
				'http://مثال.إختبار',
				'http://例子.测试',
				'http://उदाहरण.परीक्षा',
				'http://1337.net',
				'http://a.b-c.de'
			];

			for ( const supportedURL of supportedURLs ) {
				it( `should detect "${ supportedURL }" as a valid URL`, () => {
					simulateTyping( supportedURL + ' ' );

					expect( getData( model ) ).to.equal(
						`<paragraph><$text linkHref="${ supportedURL }">${ supportedURL }</$text> []</paragraph>` );
				} );
			}
		} );

		describe( 'invalid or supported URL', () => {
			// Some examples came from https://mathiasbynens.be/demo/url-regex.
			const unsupportedOrInvalid = [
				'http://',
				'http://.',
				'http://..',
				'http://../',
				'http://🥳',
				'http://?',
				'http://??',
				'http://??/',
				'http://#',
				'http://##',
				'http://##/',
				'//',
				'//a',
				'///a',
				'///',
				'http:///a',
				'rdar://1234',
				'h://test',
				':// foo bar',
				'ftps://foo.bar/',
				'http://-error-.invalid/',
				'http://localhost',
				'http:/cksource.com',
				'cksource.com',
				'ww.cksource.com'
			];

			for ( const unsupportedURL of unsupportedOrInvalid ) {
				it( `should not detect "${ unsupportedURL }" as a valid URL`, () => {
					simulateTyping( unsupportedURL + ' ' );

					expect( getData( model ) ).to.equal(
						`<paragraph>${ unsupportedURL } []</paragraph>` );
				} );
			}
		} );
	} );

	describe( 'Undo integration', () => {
		let model;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( {
				plugins: [ Paragraph, Input, Enter, ShiftEnter, LinkEditing, AutoLink, UndoEditing ]
			} );

			model = editor.model;

			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );
		} );

		it( 'should undo auto-linking (after space)', () => {
			simulateTyping( ' ' );

			editor.commands.execute( 'undo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com []</paragraph>'
			);
		} );

		it( 'should undo auto-linking (after <softBreak>)', () => {
			editor.execute( 'shiftEnter' );

			editor.commands.execute( 'undo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com<softBreak></softBreak>[]</paragraph>'
			);
		} );

		it( 'should undo auto-linking (after enter)', () => {
			editor.execute( 'enter' );

			editor.commands.execute( 'undo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com</paragraph>' +
				'<paragraph>[]</paragraph>'
			);
		} );
	} );

	describe( 'Code blocks integration', () => {
		let model;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( {
				plugins: [ Paragraph, Input, Enter, ShiftEnter, LinkEditing, AutoLink, CodeBlockEditing ]
			} );

			model = editor.model;
		} );

		it( 'should be disabled inside code blocks (on space)', () => {
			setData( model, '<codeBlock language="plaintext">some [] code</codeBlock>' );

			const plugin = editor.plugins.get( 'AutoLink' );

			simulateTyping( 'www.cksource.com' );

			expect( plugin.isEnabled ).to.be.false;
			expect( getData( model, { withoutSelection: true } ) )
				.to.equal( '<codeBlock language="plaintext">some www.cksource.com code</codeBlock>' );
		} );

		it( 'should be disabled inside code blocks (on enter)', () => {
			setData( model, '<codeBlock language="plaintext">some www.cksource.com[] code</codeBlock>' );

			const plugin = editor.plugins.get( 'AutoLink' );

			editor.execute( 'enter' );

			expect( plugin.isEnabled ).to.be.false;
			expect( getData( model, { withoutSelection: true } ) ).to.equal(
				'<codeBlock language="plaintext">some www.cksource.com</codeBlock>' +
				'<codeBlock language="plaintext"> code</codeBlock>'
			);
		} );

		it( 'should be disabled inside code blocks (on shift-enter)', () => {
			setData( model, '<codeBlock language="plaintext">some www.cksource.com[] code</codeBlock>' );

			const plugin = editor.plugins.get( 'AutoLink' );

			editor.execute( 'shiftEnter' );

			expect( plugin.isEnabled ).to.be.false;
			expect( getData( model, { withoutSelection: true } ) ).to.equal(
				'<codeBlock language="plaintext">some www.cksource.com<softBreak></softBreak> code</codeBlock>'
			);
		} );
	} );

	function simulateTyping( text ) {
		const letters = text.split( '' );

		for ( const letter of letters ) {
			editor.execute( 'input', { text: letter } );
		}
	}
} );
