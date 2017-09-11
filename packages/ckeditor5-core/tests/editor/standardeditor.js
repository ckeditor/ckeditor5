/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import Editor from '../../src/editor/editor';
import StandardEditor from '../../src/editor/standardeditor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import EditingController from '@ckeditor/ckeditor5-engine/src/controller/editingcontroller';
import EditingKeystrokeHandler from '../../src/editingkeystrokehandler';
import Plugin from '../../src/plugin';

describe( 'StandardEditor', () => {
	let editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	describe( 'constructor()', () => {
		it( 'sets all properties', () => {
			const editor = new StandardEditor( editorElement, { foo: 1 } );

			expect( editor ).to.have.property( 'element', editorElement );
			expect( editor.editing ).to.be.instanceof( EditingController );
			expect( editor.keystrokes ).to.be.instanceof( EditingKeystrokeHandler );
		} );

		it( 'should bind editing.view#isReadOnly to the editor', () => {
			const editor = new StandardEditor( editorElement, { foo: 1 } );

			editor.isReadOnly = false;

			expect( editor.editing.view.isReadOnly ).to.false;

			editor.isReadOnly = true;

			expect( editor.editing.view.isReadOnly ).to.true;
		} );

		it( 'activates #keystrokes', () => {
			const spy = sinon.spy( EditingKeystrokeHandler.prototype, 'listenTo' );
			const editor = new StandardEditor( editorElement, { foo: 1 } );

			sinon.assert.calledWith( spy, editor.editing.view );
		} );

		it( 'sets config', () => {
			const editor = new StandardEditor( editorElement, { foo: 1 } );

			expect( editor.config.get( 'foo' ) ).to.equal( 1 );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'returns a Promise', () => {
			const editor = new StandardEditor( editorElement, { foo: 1 } );

			expect( editor.destroy() ).to.be.an.instanceof( Promise );
		} );

		it( 'destroys the #keystrokes', () => {
			const editor = new StandardEditor( editorElement, { foo: 1 } );
			const spy = sinon.spy( editor.keystrokes, 'destroy' );

			sinon.assert.notCalled( spy );

			return editor.destroy()
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );

		it( 'destroys the #editing', () => {
			const editor = new StandardEditor( editorElement, { foo: 1 } );
			const spy = sinon.spy( editor.editing, 'destroy' );

			sinon.assert.notCalled( spy );

			return editor.destroy()
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );

		it( 'destroys the parent', () => {
			const editor = new StandardEditor( editorElement, { foo: 1 } );
			const spy = sinon.spy( Editor.prototype, 'destroy' );

			sinon.assert.notCalled( spy );

			return editor.destroy()
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );
	} );

	describe( 'create()', () => {
		it( 'initializes editor with plugins and config', () => {
			class PluginFoo extends Plugin {}

			return StandardEditor.create( editorElement, { foo: 1, plugins: [ PluginFoo ] } )
				.then( editor => {
					expect( editor ).to.be.instanceof( StandardEditor );

					expect( editor.config.get( 'foo' ) ).to.equal( 1 );
					expect( editor ).to.have.property( 'element', editorElement );

					expect( editor.plugins.get( PluginFoo ) ).to.be.instanceof( PluginFoo );
				} );
		} );

		it( 'fires all events in the right order', () => {
			const fired = [];

			function spy( evt ) {
				fired.push( evt.name );
			}

			class EventWatcher extends Plugin {
				init() {
					this.editor.on( 'pluginsReady', spy );
					this.editor.on( 'dataReady', spy );
					this.editor.on( 'ready', spy );
				}
			}

			return StandardEditor.create( editorElement, { plugins: [ EventWatcher ] } )
				.then( () => {
					expect( fired ).to.deep.equal( [ 'pluginsReady', 'dataReady', 'ready' ] );
				} );
		} );
	} );

	describe( 'setData()', () => {
		let editor;

		beforeEach( () => {
			return StandardEditor.create( editorElement )
				.then( newEditor => {
					editor = newEditor;

					editor.data.processor = new HtmlDataProcessor();

					editor.document.schema.allow( { name: '$text', inside: '$root' } );
				} );
		} );

		it( 'should set data of the first root', () => {
			editor.document.createRoot();
			editor.document.createRoot( '$root', 'secondRoot' );

			editor.editing.createRoot( 'div' );
			editor.editing.createRoot( 'div', 'secondRoot' );

			editor.setData( 'foo' );

			expect( getData( editor.document, { rootName: 'main', withoutSelection: true } ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'getData()', () => {
		let editor;

		beforeEach( () => {
			return StandardEditor.create( editorElement )
				.then( newEditor => {
					editor = newEditor;

					editor.data.processor = new HtmlDataProcessor();

					editor.document.schema.allow( { name: '$text', inside: '$root' } );
				} );
		} );

		it( 'should get data of the first root', () => {
			editor.document.createRoot();
			editor.document.createRoot( '$root', 'secondRoot' );

			editor.editing.createRoot( 'div' );
			editor.editing.createRoot( 'div', 'secondRoot' );

			setData( editor.document, 'foo' );

			expect( editor.getData() ).to.equal( 'foo' );
		} );
	} );

	describe( 'updateEditorElement()', () => {
		it( 'sets data to editor element', () => {
			const editor = new StandardEditor( editorElement );

			editor.data.get = () => '<p>foo</p>';

			editor.updateEditorElement();

			expect( editorElement.innerHTML ).to.equal( '<p>foo</p>' );
		} );
	} );

	describe( 'loadDataFromEditorElement()', () => {
		it( 'sets data to editor element', () => {
			const editor = new StandardEditor( editorElement );

			sinon.stub( editor.data, 'set' );
			editorElement.innerHTML = '<p>foo</p>';

			editor.loadDataFromEditorElement();

			expect( editor.data.set.calledWithExactly( '<p>foo</p>' ) ).to.be.true;
		} );
	} );

	describe( 'attaching to a form', () => {
		let editor, form, textarea, submitStub;

		beforeEach( () => {
			form = document.createElement( 'form' );
			textarea = document.createElement( 'textarea' );
			form.appendChild( textarea );
			document.body.appendChild( form );
			submitStub = sinon.stub( form, 'submit' );
		} );

		afterEach( () => {
			submitStub.restore();
			form.remove();
		} );

		it( 'should update editor element contents after calling submit() method', () => {
			return createEditor( textarea )
				.then( editor => {
					expect( textarea.value ).to.equal( '' );

					// Submit method is replaced by our implementation.
					expect( form.submit ).to.not.equal( submitStub );
					form.submit();

					expect( textarea.value ).to.equal( '<p>foo</p>' );
					sinon.assert.calledOnce( submitStub );

					// Check if original function was called in correct context.
					expect( submitStub.firstCall.thisValue ).to.equal( form );

					return editor.destroy();
				} );
		} );

		it( 'should update editor element contents after "submit" event', () => {
			return createEditor( textarea )
				.then( editor => {
					expect( textarea.value ).to.equal( '' );

					form.dispatchEvent( new Event( 'submit' ) );

					expect( textarea.value ).to.equal( '<p>foo</p>' );

					return editor.destroy();
				} );
		} );

		it( 'should not update element in form which is not a textarea', () => {
			const element = document.createElement( 'div' );
			form.appendChild( element );

			return createEditor( element )
				.then( editor => {
					expect( textarea.value ).to.equal( '' );

					// Submit method is not replaced by our implementation.
					expect( form.submit ).to.equal( submitStub );
					form.submit();

					expect( textarea.value ).to.equal( '' );

					return editor.destroy();
				} )
				.then( () => {
					element.remove();
				} );
		} );

		it( 'should not update textarea which is outside a form', () => {
			const textarea = document.createElement( 'textarea' );
			document.body.appendChild( textarea );

			return createEditor( textarea )
				.then( editor => {
					expect( textarea.value ).to.equal( '' );

					// Submit method is not replaced by our implementation.
					expect( form.submit ).to.equal( submitStub );
					form.submit();

					expect( textarea.value ).to.equal( '' );

					return editor.destroy();
				} )
				.then( () => {
					textarea.remove();
				} );
		} );

		it( 'should not update element after destroying the editor - form.submit()', () => {
			return createEditor( textarea )
				.then( editor => editor.destroy() )
				.then( () => {
					expect( textarea.value ).to.equal( '' );

					// Submit method is no longer replaced by our implementation.
					expect( form.submit ).to.equal( submitStub );
					form.submit();

					expect( textarea.value ).to.equal( '' );
				} );
		} );

		it( 'should not update element after destroying the editor - "submit" event', () => {
			return createEditor( textarea )
				.then( editor => editor.destroy() )
				.then( () => {
					expect( textarea.value ).to.equal( '' );

					form.dispatchEvent( new Event( 'submit' ) );

					expect( textarea.value ).to.equal( '' );
				} );
		} );

		it( 'should not replace submit() method when one of the elements in form has "submit" name', () => {
			const input = document.createElement( 'input' );
			input.setAttribute( 'name', 'submit' );
			form.appendChild( input );

			return createEditor( textarea )
				.then( () => {
					expect( form.submit ).to.equal( input );
					expect( textarea.value ).to.equal( '' );

					form.dispatchEvent( new Event( 'submit' ) );

					expect( textarea.value ).to.equal( '<p>foo</p>' );

					return editor.destroy();
				} )
				.then( () => {
					expect( form.submit ).to.equal( input );
					input.remove();
				} );
		} );

		function createEditor( element ) {
			return StandardEditor.create( element )
				.then( newEditor => {
					editor = newEditor;
					editor.data.get = () => '<p>foo</p>';

					return editor;
				} );
		}
	} );
} );
