/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';
import PasteFromMarkdownExperimental from '../src/pastefrommarkdownexperimental.js';

describe( 'PasteFromMarkdownExperimental', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ClipboardPipeline, PasteFromMarkdownExperimental, Paragraph, Bold, Italic, Undo ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( PasteFromMarkdownExperimental.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( PasteFromMarkdownExperimental.isPremiumPlugin ).to.be.false;
	} );

	describe( 'text/plain', () => {
		it( 'should convert to HTML the pasted markdown content', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteText( editor, 'foo **bar** [baz](https://ckeditor.com).' );

			expect( getData( editor.model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text> baz.[]</paragraph>' );
		} );

		it( 'should paste as plain text when pasting with the Shift key pressed', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pressShiftKey( editor );
			pasteText( editor, 'foo **bar** [baz](https://ckeditor.com).' );

			expect( getData( editor.model ) ).to.equal( '<paragraph>foo **bar** [baz](https://ckeditor.com).[]</paragraph>' );
		} );
	} );
	describe( 'text/html', () => {
		it( 'should paste one level nested HTML as markdown if type is text/html', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<span>foo **bar** [baz](https://ckeditor.com).</span>' );

			expect( getData( editor.model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text> baz.[]</paragraph>' );
		} );

		it( 'should not paste two level nested HTML as markdown if type is text/html', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<span><span>foo **bar** [baz](https://ckeditor.com).</span></span>' );

			expect( getData( editor.model ) ).to.equal( '<paragraph>foo **bar** [baz](https://ckeditor.com).[]</paragraph>' );
		} );

		it( 'should paste single level HTML list as markdown if type is text/html', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml(
				editor,
				'<span>foo **bar** [baz](https://ckeditor.com).</span><span>foo **bar** [baz](https://ckeditor.com).</span>'
			);

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>foo <$text bold="true">bar</$text> baz.foo <$text bold="true">bar</$text> baz.[]</paragraph>'
			);
		} );

		it( 'should remove "br" tags in a HTML list', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<span>foo **bar**</span><br><span>foo **bar**</span>' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph>foo <$text bold="true">bar</$text>foo <$text bold="true">bar[]</$text></paragraph>'
			);
		} );

		it( 'should not parse as markdown if first level formatting tags detected', () => {
			setData( editor.model, '<paragraph>[]</paragraph>' );
			pasteHtml( editor, '<b>foo **bar**</b><br><span>foo **bar**</span>' );

			expect( getData( editor.model ) ).to.equal(
				'<paragraph><$text bold="true">foo **bar**</$text>foo **bar**[]</paragraph>'
			);
		} );

		// TODO add Chrome, Firefox, Safari, Edge clipboard examples.
		describe( 'Mac', () => {
			it( 'should parse correctly Mac type clipboard', () => {
				setData( editor.model, '<paragraph>[]</paragraph>' );
				pasteHtml( editor, '<meta charset="utf8"><span>foo **bar** [baz](https://ckeditor.com).</span>' );

				expect( getData( editor.model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text> baz.[]</paragraph>' );
			} );
		} );

		describe( 'Windows', () => {
			it( 'should parse correctly Windows type clipboard', () => {
				setData( editor.model, '<paragraph>[]</paragraph>' );
				pasteHtml( editor,
					'<html>' +
						'<body>' +
							'<!--StartFragment-->' +
								'<code class="notranslate">' +
									'foo **bar** [baz](https://ckeditor.com).' +
								'</code>' +
							'<!--EndFragment-->' +
						'</body>' +
					'</html>'
				);

				expect( getData( editor.model ).trim() ).to.equal( '<paragraph>foo <$text bold="true">bar</$text> baz.[]</paragraph>' );
			} );
		} );

		describe( 'Linux', () => {
			it( 'should parse correctly Linux type clipboard', () => {
				setData( editor.model, '<paragraph>[]</paragraph>' );
				pasteHtml( editor, '<span class="notranslate">foo **bar** [baz](https://ckeditor.com).</span>' );

				expect( getData( editor.model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text> baz.[]</paragraph>' );
			} );
		} );
	} );

	function pressShiftKey( editor ) {
		editor.editing.view.document.fire( 'keydown', {
			keyCode: keyCodes.shift,
			shiftKey: true,
			preventDefault: () => {},
			domTarget: global.document.body
		} );
	}

	function pasteHtml( editor, html ) {
		editor.editing.view.document.fire( 'paste', {
			dataTransfer: createDataTransfer( { 'text/html': html } ),
			stopPropagation() {},
			preventDefault() {}
		} );
	}

	function pasteText( editor, text ) {
		editor.editing.view.document.fire( 'paste', {
			dataTransfer: createDataTransfer( { 'text/plain': text } ),
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
