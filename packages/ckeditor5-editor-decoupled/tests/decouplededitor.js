/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DecoupledEditorUI from '../src/decouplededitorui';
import DecoupledEditorUIView from '../src/decouplededitoruiview';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import DecoupledEditor from '../src/decouplededitor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'DecoupledEditor', () => {
	let editor, editorData;

	beforeEach( () => {
		editorData = '<p><strong>foo</strong> bar</p>';
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			editor = new DecoupledEditor();
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'has a Data Interface', () => {
			testUtils.isMixed( DecoupledEditor, DataApiMixin );
		} );

		it( 'creates main root element', () => {
			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );
		} );

		describe( 'ui', () => {
			it( 'is created', () => {
				expect( editor.ui ).to.be.instanceof( DecoupledEditorUI );
				expect( editor.ui.view ).to.be.instanceof( DecoupledEditorUIView );
			} );
		} );
	} );

	describe( 'create()', () => {
		beforeEach( () => {
			return DecoupledEditor
				.create( editorData, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'creates an instance which inherits from the DecoupledEditor', () => {
			expect( editor ).to.be.instanceof( DecoupledEditor );
		} );

		it( 'loads the initial data', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );

		// #53
		it( 'creates an instance of a DecoupledEditor child class', () => {
			class CustomDecoupledEditor extends DecoupledEditor {}

			return CustomDecoupledEditor
				.create( editorData, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor ).to.be.instanceof( CustomDecoupledEditor );
					expect( newEditor ).to.be.instanceof( DecoupledEditor );

					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy();
				} );
		} );

		// https://github.com/ckeditor/ckeditor5-editor-decoupled/issues/3
		it( 'initializes the data controller', () => {
			let dataInitSpy;

			class DataInitAssertPlugin extends Plugin {
				constructor( editor ) {
					super();

					this.editor = editor;
				}

				init() {
					dataInitSpy = sinon.spy( this.editor.data, 'init' );
				}
			}

			return DecoupledEditor
				.create( editorData, {
					plugins: [ Paragraph, Bold, DataInitAssertPlugin ]
				} )
				.then( newEditor => {
					sinon.assert.calledOnce( dataInitSpy );

					return newEditor.destroy();
				} );
		} );

		describe( 'ui', () => {
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

			return DecoupledEditor
				.create( editorData, {
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

			return DecoupledEditor
				.create( editorData, {
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

			return DecoupledEditor
				.create( editorData, {
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
			return DecoupledEditor
				.create( editorData, { plugins: [ Paragraph ] } )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'destroys the UI', () => {
			const spy = sinon.spy( editor.ui, 'destroy' );

			return editor.destroy()
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );
	} );
} );
