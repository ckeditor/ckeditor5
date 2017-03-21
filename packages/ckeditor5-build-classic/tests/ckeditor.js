/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditor from '../ckeditor';
import BaseClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ClipboardPlugin from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImageCaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import EnterPlugin from '@ckeditor/ckeditor5-enter/src/enter';
import TypingPlugin from '@ckeditor/ckeditor5-typing/src/typing';
import UndoPlugin from '@ckeditor/ckeditor5-undo/src/undo';

describe( 'ClassicEditor', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'create()', () => {
		beforeEach( function () {
			return ClassicEditor.create( editorElement )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should load all its dependencies', () => {
			expect( editor.plugins.get( ParagraphPlugin ) ).to.be.instanceOf( ParagraphPlugin );
			expect( editor.plugins.get( BoldPlugin ) ).to.be.instanceOf( BoldPlugin );
			expect( editor.plugins.get( HeadingPlugin ) ).to.be.instanceOf( HeadingPlugin );
			expect( editor.plugins.get( ImagePlugin ) ).to.be.instanceOf( ImagePlugin );
			expect( editor.plugins.get( ImageCaptionPlugin ) ).to.be.instanceOf( ImageCaptionPlugin );
			expect( editor.plugins.get( ImageStylePlugin ) ).to.be.instanceOf( ImageStylePlugin );
			expect( editor.plugins.get( ImageToolbarPlugin ) ).to.be.instanceOf( ImageToolbarPlugin );
			expect( editor.plugins.get( ItalicPlugin ) ).to.be.instanceOf( ItalicPlugin );
			expect( editor.plugins.get( LinkPlugin ) ).to.be.instanceOf( LinkPlugin );
			expect( editor.plugins.get( ListPlugin ) ).to.be.instanceOf( ListPlugin );
			expect( editor.plugins.get( ClipboardPlugin ) ).to.be.instanceOf( ClipboardPlugin );
			expect( editor.plugins.get( EnterPlugin ) ).to.be.instanceOf( EnterPlugin );
			expect( editor.plugins.get( TypingPlugin ) ).to.be.instanceOf( TypingPlugin );
			expect( editor.plugins.get( UndoPlugin ) ).to.be.instanceOf( UndoPlugin );
		} );

		it( 'creates an instance which inherits from the ClassicEditor', () => {
			expect( editor ).to.be.instanceof( ClassicEditor );
			expect( editor ).to.be.instanceof( BaseClassicEditor );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( function () {
			return ClassicEditor.create( editorElement )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'sets the data back to the editor element', () => {
			editor.setData( '<p>foo</p>' );

			return editor.destroy()
				.then( () => {
					expect( editorElement.innerHTML ).to.equal( '<p>foo</p>' );
				} );
		} );

		it( 'restores the editor element', () => {
			expect( editor.element.style.display ).to.equal( 'none' );

			return editor.destroy()
				.then( () => {
					expect( editor.element.style.display ).to.equal( '' );
				} );
		} );
	} );
} );
