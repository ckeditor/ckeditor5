/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import Title from '../src/title';
import Heading from '../src/heading';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'Title', () => {
	let element, editor, model;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor.create( element, {
			plugins: [ Title, Heading, BlockQuote, Clipboard, Image, ImageUpload, Enter, Undo ]
		} ).then( _editor => {
			editor = _editor;
			model = editor.model;
		} );
	} );

	afterEach( () => {
		return editor.destroy().then( () => element.remove() );
	} );

	it( 'should requires Paragraph plugin', () => {
		expect( Title.requires ).to.have.members( [ Paragraph ] );
	} );

	it( 'should have plugin name property', () => {
		expect( Title.pluginName ).to.equal( 'Title' );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.isRegistered( 'title' ) ).to.equal( true );
		expect( model.schema.isRegistered( 'title-content' ) ).to.equal( true );

		expect( model.schema.checkChild( 'title', '$text' ) ).to.equal( false );
		expect( model.schema.checkChild( 'title', 'paragraph' ) ).to.equal( false );
		expect( model.schema.checkChild( 'title', 'title-content' ) ).to.equal( true );
		expect( model.schema.checkChild( '$root', 'title-content' ) ).to.equal( false );
		expect( model.schema.checkChild( 'blockQuote', 'title-content' ) ).to.equal( false );
		expect( model.schema.checkChild( 'title-content', '$text' ) ).to.equal( true );
		expect( model.schema.checkChild( 'title-content', 'paragraph' ) ).to.equal( false );
		expect( model.schema.checkChild( 'title-content', 'blockQuote' ) ).to.equal( false );
		expect( model.schema.checkChild( '$root', 'title' ) ).to.equal( true );
		expect( model.schema.checkChild( 'blockQuote', 'title' ) ).to.equal( false );
		expect( model.schema.checkChild( 'paragraph', 'title' ) ).to.equal( false );

		model.schema.extend( '$text', { allowAttributes: [ 'bold', 'foo' ] } );

		expect( model.schema.checkAttribute( [ 'title-content', '$text' ], 'bold' ) ).to.equal( false );
		expect( model.schema.checkAttribute( [ 'paragraph', '$text' ], 'bold' ) ).to.equal( true );

		expect( model.schema.checkAttribute( [ 'title-content', '$text' ], 'foo' ) ).to.equal( false );
		expect( model.schema.checkAttribute( [ 'paragraph', '$text' ], 'foo' ) ).to.equal( true );
	} );

	it( 'should convert title to h1', () => {
		setData( model,
			'<title><title-content>Foo</title-content></title>' +
			'<paragraph>Bar</paragraph>'
		);

		expect( editor.getData() ).to.equal( '<h1>Foo</h1><p>Bar</p>' );
	} );

	describe( 'model post-fixing', () => {
		it( 'should set title and content elements', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should create a content element when only title has been set', () => {
			setData( model, '<title><title-content>Foo</title-content></title>' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph></paragraph>'
			);
		} );

		it( 'should create a title and content elements when are missing', () => {
			setData( model, '' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]</title-content></title>' +
				'<paragraph></paragraph>'
			);
		} );

		it( 'should change heading1 element to title when is set as a first root child', () => {
			setData( model,
				'<heading1>Foo</heading1>' +
				'<heading1>Bar</heading1>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<heading1>Bar</heading1>'
			);
		} );

		it( 'should change paragraph element to title when is set as a first root child', () => {
			setData( model,
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Bar</paragraph>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should have list of title-like elements', () => {
			expect( Array.from( Title.titleLikeElements ) ).to.have.members( [
				'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6'
			] );
		} );

		it( 'should change paragraph element to title when is set as a first root child', () => {
			setData( model,
				'<paragraph>Foo</paragraph>' +
				'<paragraph>Bar</paragraph>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should change title element to a paragraph when is not a first root child #1', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<title><title-content>Bar</title-content></title>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should change title element to a paragraph when is not a first root child #2', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>' +
				'<title><title-content>Biz</title-content></title>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>' +
				'<paragraph>Biz</paragraph>'
			);
		} );

		it( 'should move element after a title element when is not allowed to be a title', () => {
			setData( model,
				'<blockQuote><paragraph>Foo</paragraph></blockQuote>' +
				'<title><title-content>Bar</title-content></title>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Bar</title-content></title>' +
				'<blockQuote><paragraph>Foo</paragraph></blockQuote>'
			);
		} );

		it( 'should create a missing title element before an element that cannot to be a title element', () => {
			setData( model, '<blockQuote><paragraph>Foo</paragraph></blockQuote>' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]</title-content></title>' +
				'<blockQuote><paragraph>Foo</paragraph></blockQuote>'
			);
		} );

		it( 'should clear element from attributes when changing to title element', () => {
			model.schema.extend( '$text', { allowAttributes: 'bold' } );

			setData( model,
				'<paragraph>F<$text bold="true">o</$text>o</paragraph>' +
				'<paragraph>B<$text bold="true">a</$text>r</paragraph>'
			);

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>B<$text bold="true">a</$text>r</paragraph>'
			);
		} );
	} );

	describe( 'prevent extra paragraphing', () => {
		it( 'should remove the extra paragraph when pasting to the editor with body placeholder', () => {
			setData( model, '<title><title-content>[]</title-content></title>' );

			const dataTransferMock = {
				getData: type => {
					if ( type === 'text/html' ) {
						return '<h1>Title</h1><p>Body</p>';
					}
				},
				types: [],
				files: []
			};

			editor.editing.view.document.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( getData( model ) ).to.equal(
				'<title><title-content>Title</title-content></title>' +
				'<paragraph>Body[]</paragraph>'
			);
		} );

		it( 'should not remove the extra paragraph when pasting to the editor with directly created body element', () => {
			setData( model,
				'<title><title-content>[]</title-content></title>' +
				'<paragraph></paragraph>'
			);

			const dataTransferMock = {
				getData: type => {
					if ( type === 'text/html' ) {
						return '<h1>Title</h1><p>Body</p>';
					}
				},
				types: [],
				files: []
			};

			editor.editing.view.document.fire( 'paste', {
				dataTransfer: dataTransferMock,
				preventDefault() {}
			} );

			expect( getData( model ) ).to.equal(
				'<title><title-content>Title</title-content></title>' +
				'<paragraph>Body[]</paragraph>' +
				'<paragraph></paragraph>'
			);
		} );

		it( 'should remove the extra paragraph when pressing enter in the title', () => {
			setData( model, '<title><title-content>fo[]o</title-content></title>' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>fo</title-content></title>' +
				'<paragraph>[]o</paragraph>'
			);
		} );

		it( 'should not remove the extra paragraph when pressing enter in the title when body is created directly', () => {
			setData( model,
				'<title><title-content>fo[]o</title-content></title>' +
				'<paragraph></paragraph>'
			);

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>fo</title-content></title>' +
				'<paragraph>[]o</paragraph>' +
				'<paragraph></paragraph>'
			);
		} );
	} );

	describe( 'setTitle()', () => {
		it( 'should set new content of a title element', () => {
			setData( model,
				'<title><title-content></title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			editor.plugins.get( 'Title' ).setTitle( 'Biz' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Biz</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should replace old content of a title element', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			editor.plugins.get( 'Title' ).setTitle( 'Biz' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Biz</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should clear content of a title element', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			editor.plugins.get( 'Title' ).setTitle( '' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should properly handle HTML element', () => {
			setData( model,
				'<title><title-content></title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			editor.plugins.get( 'Title' ).setTitle( '<p>Foo</p>' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should properly handle multiple HTML elements', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			editor.plugins.get( 'Title' ).setTitle( '<p>Foo</p><p>bar</p>' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foobar</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should do nothing when setting empty content to the empty title', () => {
			setData( model,
				'<title><title-content></title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			editor.plugins.get( 'Title' ).setTitle( '' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);
		} );
	} );

	describe( 'getTitle()', () => {
		it( 'should return content of a title element', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			expect( editor.plugins.get( 'Title' ).getTitle() ).to.equal( 'Foo' );
		} );

		it( 'should return content of an empty title element', () => {
			setData( model,
				'<title><title-content></title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			expect( editor.plugins.get( 'Title' ).getTitle() ).to.equal( '' );
		} );
	} );

	describe( 'setBody()', () => {
		it( 'should set new content to body', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			editor.plugins.get( 'Title' ).setBody( 'Biz' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph>Biz</paragraph>'
			);
		} );

		it( 'should set empty content to body', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			editor.plugins.get( 'Title' ).setBody( '' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<paragraph></paragraph>'
			);
		} );

		it( 'should set html content to body', () => {
			setData( model,
				'<title><title-content>Foo</title-content>' +
				'</title><paragraph>Bar</paragraph>'
			);

			editor.plugins.get( 'Title' ).setBody( '<blockQuote>Bar</blockQuote><p>Biz</p>' );

			expect( getData( model ) ).to.equal(
				'<title><title-content>[]Foo</title-content></title>' +
				'<blockQuote><paragraph>Bar</paragraph></blockQuote>' +
				'<paragraph>Biz</paragraph>'
			);
		} );
	} );

	describe( 'getBody()', () => {
		it( 'should return all data except the title element', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>' +
				'<paragraph>Biz</paragraph>'
			);

			expect( editor.plugins.get( 'Title' ).getBody() ).to.equal( '<p>Bar</p><p>Biz</p>' );
		} );

		it( 'should return empty paragraph when body is empty', () => {
			setData( model, '<title><title-content>Foo</title-content></title>' );

			expect( editor.plugins.get( 'Title' ).getBody() ).to.equal( '<p>&nbsp;</p>' );
		} );
	} );

	describe( 'placeholders', () => {
		let viewRoot;

		beforeEach( () => {
			viewRoot = editor.editing.view.document.getRoot();
		} );

		it( 'should attach placeholder placeholder to title and body', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>'
			);

			const title = viewRoot.getChild( 0 );
			const body = viewRoot.getChild( 1 );

			expect( title.getAttribute( 'data-placeholder' ) ).to.equal( 'Title' );
			expect( body.getAttribute( 'data-placeholder' ) ).to.equal( 'Body' );

			expect( title.hasClass( 'ck-placeholder' ) ).to.equal( false );
			expect( body.hasClass( 'ck-placeholder' ) ).to.equal( false );
		} );

		it( 'should show placeholder in empty title and body', () => {
			setData( model,
				'<title><title-content></title-content></title>' +
				'<paragraph></paragraph>'
			);

			const title = viewRoot.getChild( 0 );
			const body = viewRoot.getChild( 1 );

			expect( title.getAttribute( 'data-placeholder' ) ).to.equal( 'Title' );
			expect( body.getAttribute( 'data-placeholder' ) ).to.equal( 'Body' );

			expect( title.hasClass( 'ck-placeholder' ) ).to.equal( true );
			expect( body.hasClass( 'ck-placeholder' ) ).to.equal( true );
		} );

		it( 'should hide placeholder from body with more than one child elements', () => {
			setData( editor.model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph></paragraph>' +
				'<paragraph></paragraph>'
			);

			const body = viewRoot.getChild( 1 );

			expect( body.getAttribute( 'data-placeholder' ) ).to.equal( 'Body' );
			expect( body.hasClass( 'ck-placeholder' ) ).to.equal( false );
		} );

		it( 'should hide placeholder from body with element other than paragraph', () => {
			setData( editor.model,
				'<title><title-content>Foo</title-content></title>' +
				'<heading1></heading1>'
			);

			const body = viewRoot.getChild( 1 );

			expect( body.hasAttribute( 'data-placeholder' ) ).to.equal( true );
			expect( body.hasClass( 'ck-placeholder' ) ).to.equal( false );
		} );

		it( 'should hide placeholder when title element become not empty', () => {
			setData( model,
				'<title><title-content></title-content></title>' +
				'<paragraph>[]</paragraph>'
			);

			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.equal( true );

			model.change( writer => {
				writer.appendText( 'Bar', null, model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( viewRoot.getChild( 0 ).hasClass( 'ck-placeholder' ) ).to.equal( false );
		} );

		it( 'should hide placeholder when body element become not empty', () => {
			setData( model,
				'<title><title-content>Foo</title-content></title>' +
				'<paragraph></paragraph>'
			);

			expect( viewRoot.getChild( 1 ).hasClass( 'ck-placeholder' ) ).to.equal( true );

			model.change( writer => {
				writer.appendText( 'Bar', null, model.document.getRoot().getChild( 1 ) );
			} );

			expect( viewRoot.getChild( 1 ).hasClass( 'ck-placeholder' ) ).to.equal( false );
		} );

		it( 'should properly map the body placeholder in DOM when undoing', () => {
			const viewRoot = editor.editing.view.document.getRoot();
			const domConverter = editor.editing.view.domConverter;
			let bodyDomElement;

			setData( editor.model,
				'<title><title-content>[Foo</title-content></title>' +
				'<paragraph>Bar</paragraph>' +
				'<paragraph>Baz]</paragraph>'
			);
			editor.model.deleteContent( editor.model.document.selection );

			bodyDomElement = domConverter.mapViewToDom( viewRoot.getChild( 1 ) );

			expect( bodyDomElement.dataset.placeholder ).to.equal( 'Body' );
			expect( bodyDomElement.classList.contains( 'ck-placeholder' ) ).to.be.true;

			editor.execute( 'undo' );

			bodyDomElement = domConverter.mapViewToDom( viewRoot.getChild( 1 ) );

			expect( bodyDomElement.dataset.placeholder ).to.equal( 'Body' );
			expect( bodyDomElement.classList.contains( 'ck-placeholder' ) ).to.be.false;
		} );

		it( 'should use placeholder defined through EditorConfig as a Body placeholder', () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor.create( element, {
				plugins: [ Title ],
				placeholder: 'Custom editor placeholder'
			} ).then( editor => {
				const viewRoot = editor.editing.view.document.getRoot();
				const title = viewRoot.getChild( 0 );
				const body = viewRoot.getChild( 1 );

				expect( title.getAttribute( 'data-placeholder' ) ).to.equal( 'Title' );
				expect( title.hasClass( 'ck-placeholder' ) ).to.equal( true );

				expect( body.getAttribute( 'data-placeholder' ) ).to.equal( 'Custom editor placeholder' );
				expect( body.hasClass( 'ck-placeholder' ) ).to.equal( true );

				return editor.destroy().then( () => element.remove() );
			} );
		} );
	} );

	describe( 'Tab press handling', () => {
		it( 'should handle tab key when the selection is at the beginning of the title', () => {
			setData( model,
				'<title><title-content>[]foo</title-content></title>' +
				'<paragraph>bar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab );

			editor.keystrokes.press( eventData );

			sinon.assert.calledOnce( eventData.preventDefault );
			sinon.assert.calledOnce( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[]bar</paragraph>'
			);
		} );

		it( 'should handle tab key when the selection is at the end of the title', () => {
			setData( model,
				'<title><title-content>foo[]</title-content></title>' +
				'<paragraph>bar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab );

			editor.keystrokes.press( eventData );

			sinon.assert.calledOnce( eventData.preventDefault );
			sinon.assert.calledOnce( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[]bar</paragraph>'
			);
		} );

		it( 'should not handle tab key when the selection is in the title and body', () => {
			setData( model,
				'<title><title-content>fo[o</title-content></title>' +
				'<paragraph>b]ar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab );

			editor.keystrokes.press( eventData );

			sinon.assert.notCalled( eventData.preventDefault );
			sinon.assert.notCalled( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>fo[o</title-content></title>' +
				'<paragraph>b]ar</paragraph>'
			);
		} );

		it( 'should not handle tab key when the selection is in the body', () => {
			setData( model,
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[]bar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab );

			editor.keystrokes.press( eventData );

			sinon.assert.notCalled( eventData.preventDefault );
			sinon.assert.notCalled( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[]bar</paragraph>'
			);
		} );
	} );

	describe( 'Shift + Tab press handling', () => {
		it( 'should handle shift + tab keys when the selection is at the beginning of the body', () => {
			setData( model,
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[]bar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab, { shiftKey: true } );

			editor.keystrokes.press( eventData );

			sinon.assert.calledOnce( eventData.preventDefault );
			sinon.assert.calledOnce( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>[]foo</title-content></title>' +
				'<paragraph>bar</paragraph>'
			);
		} );

		it( 'should not handle shift + tab keys when the selection is not at the beginning of the body', () => {
			setData( model,
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>b[]ar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab, { shiftKey: true } );

			editor.keystrokes.press( eventData );

			sinon.assert.notCalled( eventData.preventDefault );
			sinon.assert.notCalled( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>b[]ar</paragraph>'
			);
		} );

		it( 'should not handle shift + tab keys when the selection is not collapsed', () => {
			setData( model,
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[b]ar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab, { shiftKey: true } );

			editor.keystrokes.press( eventData );

			sinon.assert.notCalled( eventData.preventDefault );
			sinon.assert.notCalled( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>foo</title-content></title>' +
				'<paragraph>[b]ar</paragraph>'
			);
		} );

		it( 'should not handle shift + tab keys when the selection is in the title', () => {
			setData( model,
				'<title><title-content>[]foo</title-content></title>' +
				'<paragraph>bar</paragraph>'
			);

			const eventData = getEventData( keyCodes.tab, { shiftKey: true } );

			editor.keystrokes.press( eventData );

			sinon.assert.notCalled( eventData.preventDefault );
			sinon.assert.notCalled( eventData.stopPropagation );
			expect( getData( model ) ).to.equal(
				'<title><title-content>[]foo</title-content></title>' +
				'<paragraph>bar</paragraph>'
			);
		} );
	} );
} );

function getEventData( keyCode, { shiftKey = false } = {} ) {
	return {
		keyCode,
		shiftKey,
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	};
}
