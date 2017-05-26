/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import BalloonToolbarEditorUI from '../src/balloontoolbareditorui';
import BalloonToolbarEditorUIView from '../src/balloontoolbareditoruiview';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import BalloonToolbarEditor from '../src/balloontoolbar';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ContextualToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/contextual/contextualtoolbar';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import count from '@ckeditor/ckeditor5-utils/src/count';

testUtils.createSinonSandbox();

describe( 'BalloonToolbarEditor', () => {
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
			editor = new BalloonToolbarEditor( editorElement, {
				plugins: [ Bold ],
				toolbar: [ 'Bold' ]
			} );
		} );

		it( 'pushes ContextualToolbar to the list of plugins', () => {
			expect( editor.config.get( 'plugins' ) ).to.include( ContextualToolbar );
		} );

		it( 'pipes config#toolbar to config#contextualToolbar', () => {
			expect( editor.config.get( 'contextualToolbar' ) ).to.have.members( [ 'Bold' ] );
		} );

		it( 'creates a single div editable root in the view', () => {
			expect( editor.editing.view.getRoot() ).to.have.property( 'name', 'div' );
		} );

		it( 'creates a single document root', () => {
			expect( count( editor.document.getRootNames() ) ).to.equal( 1 );
			expect( editor.document.getRoot() ).to.have.property( 'name', '$root' );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'creates the UI using BalloonToolbarEditorUI classes', () => {
			expect( editor.ui ).to.be.instanceof( BalloonToolbarEditorUI );
			expect( editor.ui.view ).to.be.instanceof( BalloonToolbarEditorUIView );
		} );
	} );

	describe( 'create()', () => {
		beforeEach( function() {
			return BalloonToolbarEditor.create( editorElement, {
				plugins: [ Paragraph, Bold ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'creates an instance which inherits from the BalloonToolbarEditor', () => {
			expect( editor ).to.be.instanceof( BalloonToolbarEditor );
		} );

		it( 'creates element–less UI view', () => {
			expect( editor.ui.view.element ).to.be.null;
		} );

		it( 'attaches editable UI as view\'s DOM root', () => {
			expect( editor.editing.view.getDomRoot() ).to.equal( editor.ui.view.editable.element );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
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

			return BalloonToolbarEditor.create( editorElement, {
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

			return BalloonToolbarEditor.create( editorElement, {
				plugins: [ EventWatcher, Paragraph, Bold ]
			} )
			.then( newEditor => {
				expect( data ).to.equal( '<p><strong>foo</strong> bar</p>' );

				editor = newEditor;
			} );
		} );

		it( 'fires uiReady once UI is ready', () => {
			let isReady;

			class EventWatcher extends Plugin {
				init() {
					this.editor.on( 'uiReady', () => {
						isReady = this.editor.ui.view.ready;
					} );
				}
			}

			return BalloonToolbarEditor.create( editorElement, {
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
			return BalloonToolbarEditor.create( editorElement, { plugins: [ Paragraph ] } )
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
} );
