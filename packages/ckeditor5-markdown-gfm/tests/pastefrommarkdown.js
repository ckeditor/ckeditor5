/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Markdown from '../src/markdown';
import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import DocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';

describe( 'PasteFromMarkdown', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ClipboardPipeline, Markdown, Paragraph, Bold, Italic, Undo ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should paste as markdown when type is text/plain', () => {
		setData( editor.model, '<paragraph>[]</paragraph>' );
		pasteText( editor, 'foo **bar** [baz](https://ckeditor.com).' );

		expect( getData( editor.model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text> baz.[]</paragraph>' );
	} );

	it( 'should not paste as markdown if type is text/html', () => {
		setData( editor.model, '<paragraph>[]</paragraph>' );
		pasteHtml( editor, 'foo **bar** [baz](https://ckeditor.com).' );

		expect( getData( editor.model ) ).to.equal( '<paragraph>foo **bar** [baz](https://ckeditor.com).[]</paragraph>' );
	} );

	it( 'should not paste as markdown if shift key pressed', () => {
		setData( editor.model, '<paragraph>[]</paragraph>' );
		pressShiftKey( editor );
		pasteText( editor, 'foo **bar** [baz](https://ckeditor.com).' );

		expect( getData( editor.model ) ).to.equal( '<paragraph>foo **bar** [baz](https://ckeditor.com).[]</paragraph>' );
	} );

	it( 'should paste as markdown and remove it on undo', () => {
		setData( editor.model, '<paragraph>[]</paragraph>' );
		pasteText( editor, 'foo **bar** [baz](https://ckeditor.com).' );

		expect( getData( editor.model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text> baz.[]</paragraph>' );

		editor.commands.execute( 'undo' );

		expect( getData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );
	} );

	it( 'inserts markdown in-place (non-collapsed selection)', () => {
		setData( editor.model, '<paragraph>[should override]</paragraph>' );
		pasteText( editor, 'foo **bar** [baz](https://ckeditor.com).' );

		expect( getData( editor.model ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text> baz.[]</paragraph>' );
	} );

	it( 'inserts markdown in-place (collapsed selection)', () => {
		setData( editor.model, '<paragraph>Foo []Bar</paragraph>' );
		pasteText( editor, 'foo **bar** [baz](https://ckeditor.com).' );

		expect( getData( editor.model ) ).to.equal(
			'<paragraph>Foo foo <$text bold="true">bar</$text> baz.[]Bar</paragraph>'
		);
	} );

	it( 'should call toView function once on markdown paste', () => {
		const toViewStub = sinon.stub().returns( new DocumentFragment() );

		editor.data.processor.toView = toViewStub;
		setData( editor.model, '<paragraph>[]</paragraph>' );
		pasteText( editor, 'foo **bar** [baz](https://ckeditor.com).' );

		expect( toViewStub.callCount ).to.equal( 1 );
	} );

	it( 'should not call toView function html paste', () => {
		const toViewStub = sinon.stub().returns( new DocumentFragment() );

		editor.data.processor.toView = toViewStub;
		setData( editor.model, '<paragraph>[]</paragraph>' );
		pasteHtml( editor, 'foo **bar** [baz](https://ckeditor.com).' );

		expect( toViewStub.callCount ).to.equal( 0 );
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
