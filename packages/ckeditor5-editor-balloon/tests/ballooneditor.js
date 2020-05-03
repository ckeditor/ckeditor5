/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console */

import BalloonEditorUI from '../src/ballooneditorui';
import BalloonEditorUIView from '../src/ballooneditoruiview';

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import BalloonEditor from '../src/ballooneditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import BalloonToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/balloon/balloontoolbar';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import ElementApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/elementapimixin';
import RootElement from '@ckeditor/ckeditor5-engine/src/model/rootelement';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import { removeEditorBodyOrphans } from '@ckeditor/ckeditor5-core/tests/_utils/cleanup';

describe( 'BalloonEditor', () => {
	let editor, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

		document.body.appendChild( editorElement );

		testUtils.sinon.stub( console, 'warn' ).callsFake( () => {} );
	} );

	afterEach( () => {
		editorElement.remove();
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			editor = new BalloonEditor( editorElement, {
				plugins: [ BalloonToolbar, Bold ],
				toolbar: [ 'Bold' ]
			} );
		} );

		it( 'pushes BalloonToolbar to the list of plugins', () => {
			expect( editor.config.get( 'plugins' ) ).to.include( BalloonToolbar );
		} );

		it( 'pipes config#toolbar to config#balloonToolbar', () => {
			expect( editor.config.get( 'balloonToolbar' ) ).to.have.members( [ 'Bold' ] );
		} );

		it( 'uses HTMLDataProcessor', () => {
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'has a Data Interface', () => {
			testUtils.isMixed( BalloonEditor, DataApiMixin );
		} );

		it( 'has a Element Interface', () => {
			testUtils.isMixed( BalloonEditor, ElementApiMixin );
		} );

		it( 'creates main root element', () => {
			expect( editor.model.document.getRoot( 'main' ) ).to.instanceof( RootElement );
		} );

		it( 'should have undefined the #sourceElement if editor was initialized with data', () => {
			return BalloonEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => {
					expect( newEditor.sourceElement ).to.be.undefined;

					return newEditor.destroy();
				} );
		} );

		// See: https://github.com/ckeditor/ckeditor5/issues/746
		it( 'should throw when trying to create the editor using the same source element more than once', done => {
			BalloonEditor.create( editorElement )
				.then(
					() => {
						expect.fail( 'Balloon editor should not initialize on an element already used by other instance.' );
					},
					err => {
						assertCKEditorError( err,
							/^editor-source-element-already-used/
						);
					}
				)
				.then( done )
				.catch( done );
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
			const domRoot = editor.editing.view.getDomRoot();

			expect( domRoot ).to.equal( editor.ui.view.editable.element );
		} );

		it( 'creates the UI using BalloonEditorUI classes', () => {
			expect( editor.ui ).to.be.instanceof( BalloonEditorUI );
			expect( editor.ui.view ).to.be.instanceof( BalloonEditorUIView );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );
		} );

		it( 'should not require config object', () => {
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			// Just being safe with `builtinPlugins` static property.
			class CustomBalloonEditor extends BalloonEditor {}
			CustomBalloonEditor.builtinPlugins = [ Paragraph, Bold ];

			return CustomBalloonEditor.create( editorElement )
				.then( newEditor => {
					expect( newEditor.getData() ).to.equal( '<p><strong>foo</strong> bar</p>' );

					return newEditor.destroy();
				} )
				.then( () => {
					editorElement.remove();
				} );
		} );

		it( 'allows to pass data to the constructor', () => {
			return BalloonEditor.create( '<p>Hello world!</p>', {
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				editor.destroy();
			} );
		} );

		it( 'initializes with config.initialData', () => {
			const editorElement = document.createElement( 'div' );
			editorElement.innerHTML = '<p><strong>foo</strong> bar</p>';

			return BalloonEditor.create( editorElement, {
				initialData: '<p>Hello world!</p>',
				plugins: [ Paragraph ]
			} ).then( editor => {
				expect( editor.getData() ).to.equal( '<p>Hello world!</p>' );

				return editor.destroy();
			} ).then( () => {
				editorElement.remove();
			} );
		} );

		it( 'throws if initial data is passed in Editor#create and config.initialData is also used', done => {
			BalloonEditor.create( '<p>Hello world!</p>', {
				initialData: '<p>I am evil!</p>',
				plugins: [ Paragraph ]
			} )
				.then(
					() => {
						expect.fail( 'Balloon editor should throw an error when both initial data are passed' );
					},
					err => {
						assertCKEditorError( err,
							// eslint-disable-next-line max-len
							/^editor-create-initial-data: The config\.initialData option cannot be used together with initial data passed in Editor\.create\(\)\./,
							null
						);
					}
				)
				.then( () => {
					removeEditorBodyOrphans();
				} )
				.then( done )
				.catch( done );
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

		it( 'throws an error when is initialized in textarea', done => {
			BalloonEditor.create( document.createElement( 'textarea' ) )
				.then(
					() => {
						expect.fail( 'Balloon editor should throw an error when is initialized in textarea.' );
					},
					err => {
						assertCKEditorError( err,
							/^editor-wrong-element: This type of editor cannot be initialized inside <textarea> element\./,
							null
						);
					}
				)
				.then( done )
				.catch( done );
		} );
	} );

	describe( 'create - events', () => {
		afterEach( () => {
			return editor.destroy();
		} );

		it( 'fires all events in the right order', () => {
			const fired = [];

			function spy( evt ) {
				fired.push( `${ evt.name }-${ evt.source.constructor.name.toLowerCase() }` );
			}

			class EventWatcher extends Plugin {
				init() {
					this.editor.ui.on( 'ready', spy );
					this.editor.data.on( 'ready', spy );
					this.editor.on( 'ready', spy );
				}
			}

			return BalloonEditor
				.create( editorElement, {
					plugins: [ EventWatcher ]
				} )
				.then( newEditor => {
					expect( fired ).to.deep.equal(
						[ 'ready-ballooneditorui', 'ready-datacontroller', 'ready-ballooneditor' ] );

					editor = newEditor;
				} );
		} );

		it( 'fires ready once UI is ready', () => {
			let isRendered;

			class EventWatcher extends Plugin {
				init() {
					this.editor.ui.on( 'ready', () => {
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

					editor.conversion.for( 'upcast' ).elementToElement( { model: 'heading', view: 'heading' } );
					editor.conversion.for( 'dataDowncast' ).elementToElement( { model: 'heading', view: 'heading' } );
					editor.conversion.for( 'editingDowncast' ).elementToElement( {
						model: 'heading',
						view: 'heading-editing-representation'
					} );
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

		it( 'should not throw an error if editor was initialized with the data', async () => {
			await editor.destroy();

			return BalloonEditor
				.create( '<p>Foo.</p>', {
					plugins: [ Paragraph, Bold ]
				} )
				.then( newEditor => newEditor.destroy() );
		} );
	} );

	describeMemoryUsage( () => {
		testMemoryUsage(
			'should not grow on multiple create/destroy',
			() => BalloonEditor
				.create( document.querySelector( '#mem-editor' ), {
					plugins: [ ArticlePluginSet ],
					toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
					image: {
						toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
					}
				} ) );
	} );
} );
