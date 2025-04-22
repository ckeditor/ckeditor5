/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import CodeBlockEditing from '@ckeditor/ckeditor5-code-block/src/codeblockediting.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Input from '@ckeditor/ckeditor5-typing/src/input.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import LinkEditing from '../src/linkediting.js';
import AutoLink from '../src/autolink.js';

describe( 'AutoLink', () => {
	let editor;

	it( 'should be named', () => {
		expect( AutoLink.pluginName ).to.equal( 'AutoLink' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( AutoLink.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( AutoLink.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded without Enter & ShiftEnter features', async () => {
		const editor = await ModelTestEditor.create( {
			plugins: [ Paragraph, Input, LinkEditing, AutoLink ]
		} );

		await editor.destroy();
	} );

	describe( 'autolink on paste behavior', () => {
		testUtils.createSinonSandbox();
		let model, viewDocument;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, ClipboardPipeline, LinkEditing, AutoLink ]
			} );

			// VirtualTestEditor has no DOM, so this method must be stubbed for all tests.
			// Otherwise it will throw as it accesses the DOM to do its job.
			sinon.stub( editor.editing.view, 'scrollToTheSelection' );

			model = editor.model;
			viewDocument = editor.editing.view.document;
		} );

		describe( 'pasting on selected text', () => {
			beforeEach( () => setData( model, '<paragraph>some [selected] text</paragraph>' ) );

			it( 'paste link', () => {
				pasteText( 'http://hello.com' );
				expect( getData( model ) ).to.equal(
					'<paragraph>some [<$text linkHref="http://hello.com">selected</$text>] text</paragraph>'
				);
			} );

			it( 'paste text including a link', () => {
				pasteText( ' http://hello.com' );
				expect( getData( model ) ).to.equal(
					'<paragraph>some  http://hello.com[] text</paragraph>'
				);
			} );

			it( 'paste not a link', () => {
				pasteText( 'hello' );
				expect( getData( model ) ).to.equal(
					'<paragraph>some hello[] text</paragraph>'
				);
			} );

			it( 'paste a HTML link', () => {
				pasteData( {
					'text/plain': 'http://hello.com',
					'text/html': '<a href="http://hello.com">http://hello.com</a>'
				} );
				expect( getData( model ) ).to.equal(
					'<paragraph>some [<$text linkHref="http://hello.com">selected</$text>] text</paragraph>'
				);
			} );

			it( 'paste a HTML link without a protocol', () => {
				pasteData( {
					'text/plain': 'hello.com',
					'text/html': '<a href="http://hello.com">hello.com</a>'
				} );
				expect( getData( model ) ).to.equal(
					'<paragraph>some <$text linkHref="http://hello.com">hello.com</$text>[] text</paragraph>'
				);
			} );

			it( 'paste HTML with no plain text', () => {
				pasteData( {
					'text/html': '<span style="font-color: blue">http://hello.com</span>'
				} );
				expect( getData( model ) ).to.equal(
					'<paragraph>some http://hello.com[] text</paragraph>'
				);
			} );

			it( 'should omit the `drop` clipboard method', () => {
				pasteText( 'http://hello.com', 'drop' );
				expect( getData( model ) ).to.equal(
					'<paragraph>some http://hello.com[] text</paragraph>'
				);
			} );
		} );

		describe( 'pasting on collapsed selection', () => {
			beforeEach( () => setData( model, '<paragraph>some [] text</paragraph>' ) );

			it( 'paste link', () => {
				pasteText( 'http://hello.com' );
				expect( getData( model ) ).to.equal(
					'<paragraph>some http://hello.com[] text</paragraph>'
				);
			} );
		} );

		describe( 'pasting with multiple selection', () => {
			beforeEach( () => {
				setData( model, '<paragraph>some text</paragraph>' );
				const paragraph = model.document.getRoot().getChild( 0 );
				const firstRange = editor.model.createRange(
					editor.model.createPositionAt( paragraph, 0 ),
					editor.model.createPositionAt( paragraph, 4 )
				);
				const secondRange = editor.model.createRange(
					editor.model.createPositionAt( paragraph, 5 ),
					editor.model.createPositionAt( paragraph, 9 )
				);

				model.change( writer => {
					writer.setSelection( [ firstRange, secondRange ] );
				} );
			} );

			it( 'paste link', () => {
				pasteText( 'http://hello.com' );
				// Default behaviour: overwrites the first selection
				expect( getData( model ) ).to.equal(
					'<paragraph>http://hello.com[] text</paragraph>'
				);
			} );
		} );

		describe( 'pasting on a link', () => {
			it( 'paste with entire link selected', () => {
				setData( model, '<paragraph>some [<$text linkHref="http://hello.com">selected</$text>] text</paragraph>' );
				pasteText( 'http://world.com' );
				expect( getData( model ) ).to.equal(
					'<paragraph>some [<$text linkHref="http://world.com">selected</$text>] text</paragraph>'
				);
			} );

			it( 'paste with partially selected link updates and selects the entire link', () => {
				setData( model, '<paragraph><$text linkHref="http://hello.com">some [selected] text</$text></paragraph>' );
				pasteText( 'http://world.com' );
				expect( getData( model ) ).to.equal(
					'<paragraph>[<$text linkHref="http://world.com">some selected text</$text>]</paragraph>'
				);
			} );

			it( 'paste with selection overlapping the start of the link extends the link', () => {
				setData( model, '<paragraph>[some <$text linkHref="http://hello.com">selected] text</$text></paragraph>' );
				pasteText( 'http://world.com' );
				expect( getData( model ) ).to.equal(
					'<paragraph>[<$text linkHref="http://world.com">some selected text</$text>]</paragraph>'
				);
			} );

			it( 'paste with selection overlapping the end of the link extends the link', () => {
				setData( model, '<paragraph><$text linkHref="http://hello.com">some [selected</$text> text]</paragraph>' );
				pasteText( 'http://world.com' );
				expect( getData( model ) ).to.equal(
					'<paragraph>[<$text linkHref="http://world.com">some selected text</$text>]</paragraph>'
				);
			} );

			it( 'paste with two partially selected links overwrites both', () => {
				setData( model,
					`<paragraph>
						<$text linkHref="http://one.com">here [are</$text>
						<$text linkHref="http://two.com">two] links</$text>
					</paragraph>`
				);
				pasteText( 'http://world.com' );
				expect( getData( model ) ).to.equal(
					'<paragraph>[<$text linkHref="http://world.com">here are two links</$text>]</paragraph>'
				);
			} );
		} );

		function pasteText( text, method = 'paste' ) {
			pasteData( {
				'text/plain': text
			}, method );
		}

		function pasteData( data, method = 'paste' ) {
			const dataTransferMock = createDataTransfer( data );
			viewDocument.fire( method, {
				dataTransfer: dataTransferMock,
				preventDefault() {},
				stopPropagation() {}
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

		it( 'does not add linkHref attribute on enter when the link is selected', () => {
			setData( model, '<paragraph>[https://www.cksource.com]</paragraph>' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>[]</paragraph>'
			);
		} );

		it( 'does not add linkHref attribute on enter when the whole paragraph containing the link is selected', () => {
			setData( model, '<paragraph>[This feature also works with e-mail addresses: https://www.cksource.com]</paragraph>' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>[]</paragraph>'
			);
		} );

		it( 'adds linkHref attribute on enter when the link (containing www) is partially selected (end)' +
			'and the remaining fragment is a proper URL', () => {
			setData( model, '<paragraph>https://www.foo.ba[r.com]</paragraph>' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph><$text linkHref="https://www.foo.ba">https://www.foo.ba</$text></paragraph><paragraph>[]</paragraph>'
			);
		} );

		it( 'does not add a linkHref attribute for links with www subdomain only, pressing enter with part of its end selected', () => {
			// https://github.com/ckeditor/ckeditor5/issues/8050.
			setData( model, '<paragraph>https://www.ckso[urce.com]</paragraph>' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.ckso</paragraph><paragraph>[]</paragraph>'
			);
		} );

		it( 'does not add linkHref attribute on enter when the link (that does not contain www) is partially selected (end)', () => {
			setData( model, '<paragraph>https://ckso[urce.com]</paragraph>' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://ckso</paragraph><paragraph>[]</paragraph>'
			);
		} );

		it( 'does not add linkHref attribute on enter when the link is partially selected (beginning)', () => {
			setData( model, '<paragraph>[https://www.ckso]urce.com</paragraph>' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph></paragraph><paragraph>[]urce.com</paragraph>'
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

		// https://github.com/ckeditor/ckeditor5/issues/15862
		it( 'adds linkHref to a text link inside an inline limit element on enter', () => {
			editor.model.schema.register( 'limit', {
				isLimit: true,
				allowIn: '$block',
				allowChildren: '$text'
			} );
			editor.conversion.elementToElement( {
				model: 'limit',
				view: {
					name: 'span',
					classes: 'limit'
				}
			} );

			setData( model,
				'<paragraph>outer text' +
				'<limit>inner text https://www.cksource.com[] inner text</limit>' +
				'outer text</paragraph>'
			);

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>outer text' +
				'<limit>inner text <$text linkHref="https://www.cksource.com">https://www.cksource.com[]</$text> inner text</limit>' +
				'outer text</paragraph>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5/issues/15862
		it( 'adds linkHref to a text link inside a block limit element on enter', () => {
			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );

			editor.model.schema.extend( 'paragraph', {
				isLimit: true
			} );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>' +
				'<$text linkHref="https://www.cksource.com">https://www.cksource.com[]</$text>' +
				'</paragraph>'
			);
		} );

		it( 'adds "mailto:" to link of detected email addresses', () => {
			simulateTyping( 'newsletter@cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph><$text linkHref="mailto:newsletter@cksource.com">newsletter@cksource.com</$text> []</paragraph>'
			);
		} );

		it( 'adds default protocol to link of detected www addresses', () => {
			editor.config.set( 'link.defaultProtocol', 'http://' );
			simulateTyping( 'www.cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph><$text linkHref="http://www.cksource.com">www.cksource.com</$text> []</paragraph>'
			);
		} );

		it( 'does not autolink address without protocol (defaultProtocol is not set or not valid)', () => {
			editor.config.set( 'link.defaultProtocol', '' );
			simulateTyping( 'www.cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph>www.cksource.com []</paragraph>'
			);
		} );

		it( 'does not autolink if link is already created', () => {
			setData( model, '<paragraph><$text linkHref="http://www.cksource.com">http://www.cksource.com</$text>[]</paragraph>' );

			const plugin = editor.plugins.get( 'AutoLink' );
			const spy = sinon.spy( plugin, '_persistAutoLink' );

			editor.execute( 'enter' );

			sinon.assert.notCalled( spy );
		} );

		for ( const punctuation of '!.:,;?' ) {
			it( `does not include "${ punctuation }" at the end of the link after space`, () => {
				simulateTyping( `https://www.cksource.com${ punctuation } ` );

				expect( getData( model ) ).to.equal(
					`<paragraph><$text linkHref="https://www.cksource.com">https://www.cksource.com</$text>${ punctuation } []</paragraph>`
				);
			} );
		}

		// Some examples came from https://mathiasbynens.be/demo/url-regex.
		describe( 'supported URL', () => {
			const supportedURLs = [
				'http://cksource.com',
				'https://cksource.com',
				'https://cksource.com:8080',
				'http://www.cksource.com',
				'hTtP://WwW.cKsOuRcE.cOm',
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
				'http://ww.mp',
				'http://wwww.mp',
				'ftp://cksource.com/baz',
				'http://cksource.com/?q=Test%20URL-encoded%20stuff',
				'http://مثال.إختبار',
				'http://例子.测试',
				'http://उदाहरण.परीक्षा',
				'http://1337.net',
				'http://a.b-c.de',
				'http://127.0.0.1:8080/ckeditor5/latest/features/link.html',
				'http://192.168.43.58/ckeditor5/latest/features/link.html',
				'http://83.127.13.40',
				'http://userid@83.127.13.40',
				'http://localhost',
				'http://localhost:8080'
			];

			for ( const supportedURL of supportedURLs ) {
				it( `should detect "${ supportedURL }" as a valid URL`, () => {
					simulateTyping( supportedURL + ' ' );

					expect( getData( model ) ).to.equal(
						`<paragraph><$text linkHref="${ supportedURL }">${ supportedURL }</$text> []</paragraph>` );
				} );
			}
		} );

		describe( 'invalid or unsupported URL', () => {
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
				'http:/cksource.com',
				'http://www.cksource', // https://github.com/ckeditor/ckeditor5/issues/8050.
				'cksource.com',
				'ww.cksource.com',
				'www.cksource'
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

		it( 'should undo auto-linking by pressing backspace', () => {
			const viewDocument = editor.editing.view.document;
			const deleteEvent = new DomEventData(
				viewDocument,
				{ preventDefault: sinon.spy() },
				{ direction: 'backward', unit: 'codePoint', sequence: 1 }
			);

			simulateTyping( ' ' );

			viewDocument.fire( 'delete', deleteEvent );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com []</paragraph>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5/issues/12447
		it( 'should not undo auto-linking by pressing backspace after any other change has been made', () => {
			const viewDocument = editor.editing.view.document;
			const deleteEvent = new DomEventData(
				viewDocument,
				{ preventDefault: sinon.spy() },
				{ direction: 'backward', unit: 'codePoint', sequence: 1 }
			);

			simulateTyping( ' abc' );

			viewDocument.fire( 'delete', deleteEvent );
			viewDocument.fire( 'delete', deleteEvent );
			viewDocument.fire( 'delete', deleteEvent );
			viewDocument.fire( 'delete', deleteEvent );
			viewDocument.fire( 'delete', deleteEvent );

			expect( getData( model ) ).to.equal(
				'<paragraph><$text linkHref="https://www.cksource.com">https://www.cksource.co</$text>[]</paragraph>'
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
			editor.execute( 'insertText', { text: letter } );
		}
	}
} );
