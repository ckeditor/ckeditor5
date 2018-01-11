/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import BalloonEditorUI from '../src/ballooneditorui';
import BalloonEditorUIView from '../src/ballooneditoruiview';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';

import BalloonEditor from '../src/ballooneditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ContextualToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/contextual/contextualtoolbar';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'BalloonEditor', () => {
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
			editor = new BalloonEditor( editorElement, {
				plugins: [ ContextualToolbar, Bold ],
				toolbar: [ 'Bold' ]
			} );
		} );

		it( 'pushes ContextualToolbar to the list of plugins', () => {
			expect( editor.config.get( 'plugins' ) ).to.include( ContextualToolbar );
		} );

		it( 'pipes config#toolbar to config#contextualToolbar', () => {
			expect( editor.config.get( 'contextualToolbar' ) ).to.have.members( [ 'Bold' ] );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );
	} );

	describe( 'create()', () => {
		beforeEach( function() {
			return BalloonEditor
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

		it( 'creates an instance which inherits from the BalloonEditor', () => {
			expect( editor ).to.be.instanceof( BalloonEditor );
		} );

		it( 'creates element–less UI view', () => {
			expect( editor.ui.view.element ).to.be.null;
		} );

		it( 'attaches editable UI as view\'s DOM root', () => {
			expect( editor.editing.view.getDomRoot() ).to.equal( editor.ui.view.editable.element );
		} );

		it( 'creates the UI using BalloonEditorUI classes', () => {
			expect( editor.ui ).to.be.instanceof( BalloonEditorUI );
			expect( editor.ui.view ).to.be.instanceof( BalloonEditorUIView );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );

		// ckeditor/ckeditor5-editor-classic#53
		it( 'creates an instance of a BalloonEditor child class', () => {
			// Fun fact: Remove the next 3 lines and you'll get a lovely inf loop due to two
			// editor being initialized on one element.
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			document.body.appendChild( editorElement );

			class CustomBalloonEditor extends BalloonEditor {}

			return CustomBalloonEditor
				.create( editorElement, {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor ).to.be.instanceof( CustomBalloonEditor );
					expect( newEditor ).to.be.instanceof( BalloonEditor );

					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					editorElement.remove();

					return newEditor.destroy();
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

			return BalloonEditor
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

			return BalloonEditor
				.create( editorElement, {
					plugins: [ EventWatcher, Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( data ).to.equal( '<p><strong>foo</strong> bar</p>' );

					editor = newEditor;
				} );
		} );

		it( 'fires uiReady once UI is ready', () => {
			let isRendered;

			class EventWatcher extends Plugin {
				init() {
					this.editor.on( 'uiReady', () => {
						isRendered = this.editor.ui.view.isRendered;
					} );
				}
			}

			return BalloonEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( newEditor => {
					expect( isRendered ).to.be.true;

					editor = newEditor;
				} );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( function() {
			return BalloonEditor
				.create( editorElement, { plugins: [ Paragraph ] } )
				.then( newEditor => {
					editor = newEditor;

					const schema = editor.model.schema;

					schema.register( 'heading' );
					schema.extend( 'heading', { allowIn: '$root' } );
					schema.extend( '$text', { allowIn: 'heading' } );

					buildModelConverter().for( editor.data.modelToView )
						.fromElement( 'heading' )
						.toElement( 'heading' );

					buildViewConverter().for( editor.data.viewToModel )
						.fromElement( 'heading' )
						.toElement( 'heading' );

					buildModelConverter().for( editor.editing.modelToView )
						.fromElement( 'heading' )
						.toElement( 'heading-editing-representation' );
				} );
		} );

		it( 'sets the data back to the editor element', () => {
			editor.setData( '<p>a</p><heading>b</heading>' );

			return editor.destroy()
				.then( () => {
					expect( editorElement.innerHTML )
						.to.equal( '<p>a</p><heading>b</heading>' );
				} );
		} );
	} );
} );
