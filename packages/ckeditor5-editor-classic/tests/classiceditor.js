/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditorUI from '../src/classiceditorui';
import ClassicEditorUIView from '../src/classiceditoruiview';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import ClassicEditor from '../src/classiceditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

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

	describe( 'constructor()', () => {
		beforeEach( () => {
			editor = new ClassicEditor( editorElement );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		describe( 'ui', () => {
			it( 'creates the UI using BoxedEditorUI classes', () => {
				expect( editor.ui ).to.be.instanceof( ClassicEditorUI );
				expect( editor.ui.view ).to.be.instanceof( ClassicEditorUIView );
			} );
		} );
	} );

	describe( 'create()', () => {
		beforeEach( () => {
			return ClassicEditor
				.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'creates an instance which inherits from the ClassicEditor', () => {
			expect( editor ).to.be.instanceof( ClassicEditor );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );

		// #53
		it( 'creates an instance of a ClassicEditor child class', () => {
			class CustomClassicEditor extends ClassicEditor {}

			return CustomClassicEditor
				.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor ).to.be.instanceof( CustomClassicEditor );
					expect( newEditor ).to.be.instanceof( ClassicEditor );

					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy();
				} );
		} );

		describe( 'ui', () => {
			it( 'inserts editor UI next to editor element', () => {
				expect( editor.ui.view.element.previousSibling ).to.equal( editorElement );
			} );

			it( 'attaches editable UI as view\'s DOM root', () => {
				expect( editor.editing.view.getDomRoot() ).to.equal( editor.ui.view.editable.element );
			} );
		} );
	} );

	describe( 'create - events', () => {
		afterEach( () => {
			return editor.destroy();
		} );

		it( 'fires all events in the right order', () => {
			const fired = [];

			function spy( evt ) {
				fired.push( evt.name );
			}

			class EventWatcher extends Plugin {
				init() {
					this.editor.on( 'pluginsReady', spy );
					this.editor.on( 'uiReady', spy );
					this.editor.on( 'dataReady', spy );
					this.editor.on( 'ready', spy );
				}
			}

			return ClassicEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( newEditor => {
					expect( fired ).to.deep.equal( [ 'pluginsReady', 'uiReady', 'dataReady', 'ready' ] );

					editor = newEditor;
				} );
		} );

		it( 'fires dataReady once data is loaded', () => {
			let data;

			class EventWatcher extends Plugin {
				init() {
					this.editor.on( 'dataReady', () => {
						data = this.editor.getData();
					} );
				}
			}

			return ClassicEditor
				.create( editorElement, {
					plugins: [ EventWatcher, Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( data ).to.equal( '<p><strong>foo</strong> bar</p>' );

					editor = newEditor;
				} );
		} );

		it( 'fires uiReady once UI is rendered', () => {
			let isReady;

			class EventWatcher extends Plugin {
				init() {
					this.editor.on( 'uiReady', () => {
						isReady = this.editor.ui.view.isRendered;
					} );
				}
			}

			return ClassicEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( newEditor => {
					expect( isReady ).to.be.true;

					editor = newEditor;
				} );
		} );
	} );

	describe( 'destroy', () => {
		beforeEach( function() {
			return ClassicEditor
				.create( editorElement, { plugins: [ Paragraph ] } )
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
