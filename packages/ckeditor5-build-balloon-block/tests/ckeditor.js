/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import BalloonEditor from '../src/ckeditor';
import BaseBalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory';

describe( 'BalloonEditor build', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

		document.body.appendChild( editorElement );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'build', () => {
		it( 'contains plugins', () => {
			expect( BalloonEditor.builtinPlugins ).to.not.be.empty;
		} );

		it( 'contains config', () => {
			expect( BalloonEditor.defaultConfig.toolbar ).to.not.be.empty;
		} );

		it( 'contains block toolbar config', () => {
			expect( BalloonEditor.defaultConfig.blockToolbar ).to.not.be.empty;
		} );
	} );

	describe( 'create()', () => {
		beforeEach( () => {
			return BalloonEditor.create( editorElement )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'creates an instance which inherits from the BalloonEditor', () => {
			expect( editor ).to.be.instanceof( BalloonEditor );
			expect( editor ).to.be.instanceof( BaseBalloonEditor );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( () => {
			return BalloonEditor.create( editorElement )
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
	} );

	describe( 'plugins', () => {
		beforeEach( () => {
			return BalloonEditor.create( editorElement )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'block toolbar works', () => {
			expect( editor.plugins.get( 'BlockToolbar' ) ).to.be.an( 'object' );
		} );

		it( 'paragraph works', () => {
			const data = '<p>Some text inside a paragraph.</p>';

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'basic-styles work', () => {
			const data = [
				'<p>',
				'<strong>Test:strong</strong>',
				'<i>Test:i</i>',
				'</p>'
			].join( '' );

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'block-quote works', () => {
			const data = '<blockquote><p>Quote</p></blockquote>';

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'heading works', () => {
			const data = [
				'<h2>Heading 1.</h2>',
				'<h3>Heading 1.1</h3>',
				'<h4>Heading 1.1.1</h4>',
				'<h4>Heading 1.1.2</h4>',
				'<h3>Heading 1.2</h3>',
				'<h4>Heading 1.2.1</h4>',
				'<h2>Heading 2</h2>'
			].join( '' );

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'image works', () => {
			const data = '<figure class="image"><img src="/assets/sample.png"></figure>';

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'list works', () => {
			const data = [
				'<ul>',
				'<li>Item 1.</li>',
				'<li>Item 2.</li>',
				'</ul>',
				'<ol>',
				'<li>Item 1.</li>',
				'<li>Item 2.</li>',
				'</ol>'
			].join( '' );

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'link works', () => {
			const data = '<p><a href="//ckeditor.com">CKEditor.com</a></p>';

			editor.setData( data );
			expect( editor.getData() ).to.equal( data );
		} );
	} );

	describeMemoryUsage( () => {
		testMemoryUsage(
			'should not grow on multiple create/destroy',
			() => BalloonEditor.create( document.querySelector( '#mem-editor' ) ) );
	} );
} );
