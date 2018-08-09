/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, window */

import ModelText from '@ckeditor/ckeditor5-engine/src/model/text';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Autosave from '../src/autosave';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';

describe( 'Autosave', () => {
	/** @type {(typeof import 'sinon')} */
	const sandbox = sinon.sandbox;

	let editor;

	let element;

	/** @type {Autosave} */
	let autosave;

	beforeEach( () => {
		sandbox.useFakeTimers( { now: Date.now() } );
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	it( 'should have static pluginName property', () => {
		expect( Autosave.pluginName ).to.equal( 'Autosave' );
	} );

	describe( 'initialization', () => {
		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ]
				} )
				.then( _editor => {
					const data = '<p>paragraph1</p><p>paragraph2</p>';

					editor = _editor;
					editor.setData( data );
					autosave = editor.plugins.get( Autosave );
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should initialize adapter with an undefined value', () => {
			expect( autosave.adapter ).to.be.undefined;
		} );

		it( 'should allow plugin to work without defined adapter and without its config', () => {
			expect( () => {
				editor.model.change( writer => {
					writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
					editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
				} );

				sandbox.clock.tick( 2000 );
			} ).to.not.throw();
		} );
	} );

	describe( 'config.autosave.save', () => {
		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ],
					autosave: {
						save: sinon.spy()
					}
				} )
				.then( _editor => {
					editor = _editor;

					autosave = editor.plugins.get( Autosave );
					// editor.listenTo( autosave, 'change:state', ( e, ...data ) => console.log( data ) );

					const data = '<p>paragraph1</p><p>paragraph2</p>';
					editor.setData( data );
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should enable providing callback via the config', () => {
			editor.config.get( 'autosave' ).save.resetHistory();

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			sandbox.clock.tick( 2000 );

			return Promise.resolve().then( () => {
				sinon.assert.calledOnce( editor.config.get( 'autosave' ).save );
			} );
		} );

		it( 'config callback and adapter callback should be called if both are provided', () => {
			editor.config.get( 'autosave' ).save.resetHistory();

			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			sandbox.clock.tick( 2000 );

			return Promise.resolve().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );
				sinon.assert.calledOnce( editor.config.get( 'autosave' ).save );
			} );
		} );

		it( 'config callback and adapter callback should be called with the editor as an argument', () => {
			editor.config.get( 'autosave' ).save.resetHistory();

			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			sandbox.clock.tick( 2000 );

			return Promise.resolve().then( () => {
				sinon.assert.calledWithExactly( autosave.adapter.save, editor );
				sinon.assert.calledWithExactly( editor.config.get( 'autosave' ).save, editor );
			} );
		} );
	} );

	describe( 'config.autosave.waitingTime', () => {
		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should specify the time of waiting on the next use action before saving', () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ],
					autosave: {
						save: sinon.spy(),
						waitingTime: 500
					}
				} )
				.then( _editor => {
					editor = _editor;

					const data = '<p>paragraph1</p><p>paragraph2</p>';
					editor.setData( data );

					editor.model.change( writer => {
						writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
						editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
					} );

					sandbox.clock.tick( 500 );

					return Promise.resolve().then( () => {
						sinon.assert.calledOnce( editor.config.get( 'autosave' ).save );
					} );
				} );
		} );
	} );

	describe( 'autosaving', () => {
		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ]
				} )
				.then( _editor => {
					const data = '<p>paragraph1</p><p>paragraph2</p>';

					editor = _editor;
					editor.setData( data );
					autosave = editor.plugins.get( Autosave );
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should run adapter\'s save method when the editor\'s change event is fired', () => {
			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			sandbox.clock.tick( 2000 );

			return Promise.resolve().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );
			} );
		} );

		it( 'should debounce editor\'s change event', () => {
			const spy = sinon.spy();
			const savedStates = [];

			autosave.adapter = {
				save() {
					spy();

					savedStates.push( editor.getData() );
				}
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			sandbox.clock.tick( 1000 );

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( new ModelText( 'bar' ), editor.model.document.selection );
			} );

			sandbox.clock.tick( 1000 );

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( new ModelText( 'biz' ), editor.model.document.selection );
			} );

			sinon.assert.notCalled( spy );

			sandbox.clock.tick( 2000 );

			return Promise.resolve().then( () => {
				sinon.assert.calledOnce( spy );
				expect( savedStates ).to.deep.equal( [
					'<p>paragraph1</p><p>biz</p>'
				] );
			} );
		} );

		it( 'should add a pending action during the saving.', () => {
			const pendingActions = editor.plugins.get( PendingActions );
			const serverActionSpy = sinon.spy();
			const serverActionStub = sinon.stub();
			serverActionStub.callsFake( () => wait( 1000 ).then( serverActionSpy ) );

			autosave.adapter = {
				save: serverActionStub
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			sinon.assert.notCalled( serverActionSpy );
			expect( pendingActions.hasAny ).to.be.true;
			expect( pendingActions.first.message ).to.equal( 'Saving changes' );

			sandbox.clock.tick( 2000 );

			sinon.assert.notCalled( serverActionSpy );
			expect( pendingActions.hasAny ).to.be.true;
			expect( pendingActions.first.message ).to.equal( 'Saving changes' );

			return Promise.resolve().then( () => {
				sandbox.clock.tick( 1000 );

				return runPromiseCycles().then( () => {
					sinon.assert.calledOnce( serverActionSpy );
					expect( pendingActions.hasAny ).to.be.false;
				} );
			} );
		} );

		// Integration test.
		it( 'should add a pending action during the saving #2.', () => {
			const pendingActions = editor.plugins.get( PendingActions );
			const serverActionSpy = sinon.spy();
			const serverActionStub = sinon.stub();
			serverActionStub.callsFake( () => wait( 1000 ).then( serverActionSpy ) );

			autosave.adapter = {
				save: serverActionStub
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			sinon.assert.notCalled( serverActionSpy );
			expect( pendingActions.hasAny ).to.be.true;
			expect( pendingActions.first.message ).to.equal( 'Saving changes' );

			sandbox.clock.tick( 2000 );
			expect( autosave.state ).to.equal( 'saving' );

			return Promise.resolve().then( () => {
				// Add new change before the response from the server.

				editor.model.change( writer => {
					writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
					editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
				} );

				sandbox.clock.tick( 1000 );

				return runPromiseCycles();
			} ).then( () => {
				// Now there should come the first server response.
				expect( autosave.state ).to.equal( 'waiting' );
				expect( pendingActions.hasAny ).to.be.true;
				sinon.assert.calledOnce( serverActionSpy );

				sandbox.clock.tick( 2000 );

				return runPromiseCycles();
			} ).then( () => {
				expect( autosave.state ).to.equal( 'saving' );
				expect( pendingActions.hasAny ).to.be.true;
				sinon.assert.calledOnce( serverActionSpy );

				// Wait for the second server response.
				sandbox.clock.tick( 1000 );

				return runPromiseCycles();
			} ).then( () => {
				expect( pendingActions.hasAny ).to.be.false;
				expect( autosave.state ).to.equal( 'synchronized' );
				sinon.assert.calledTwice( serverActionSpy );
			} );
		} );

		it( 'should add a pending action during the saving #2.', () => {
			const serverActionSpy = sinon.spy();
			const pendingActions = editor.plugins.get( PendingActions );

			autosave.adapter = {
				save: serverActionSpy
			};

			expect( pendingActions.hasAny ).to.be.false;

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			expect( pendingActions.hasAny ).to.be.true;

			sandbox.clock.tick( 2000 );

			return runPromiseCycles().then( () => {
				sinon.assert.calledOnce( serverActionSpy );
				expect( pendingActions.hasAny ).to.be.false;
			} );
		} );

		it( 'should filter out changes in the selection', () => {
			autosave.adapter = {
				save: sandbox.spy()
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
			} );

			sandbox.clock.tick( 2000 );

			return runPromiseCycles().then( () => {
				sinon.assert.notCalled( autosave.adapter.save );
			} );
		} );

		it( 'should filter out markers that does not affect the data model', () => {
			autosave.adapter = {
				save: sandbox.spy()
			};

			const range = ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) );
			const range2 = ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) );

			editor.model.change( writer => {
				writer.addMarker( 'name', { usingOperation: true, range } );
			} );

			sandbox.clock.tick( 2000 );

			editor.model.change( writer => {
				writer.updateMarker( 'name', { range: range2 } );
			} );

			sandbox.clock.tick( 2000 );

			return runPromiseCycles().then( () => {
				sinon.assert.notCalled( autosave.adapter.save );
			} );
		} );

		it( 'should filter out markers that does not affect the data model #2', () => {
			autosave.adapter = {
				save: sandbox.spy()
			};

			const range = ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) );
			const range2 = ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) );

			editor.model.change( writer => {
				writer.addMarker( 'name', { usingOperation: false, range } );
			} );

			sandbox.clock.tick( 2000 );

			editor.model.change( writer => {
				writer.updateMarker( 'name', { range: range2 } );
			} );

			sandbox.clock.tick( 2000 );

			return runPromiseCycles().then( () => {
				sinon.assert.notCalled( autosave.adapter.save );
			} );
		} );

		it( 'should call the save method when some marker affects the data model', () => {
			autosave.adapter = {
				save: sandbox.spy()
			};

			const range = ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) );

			editor.model.change( writer => {
				writer.addMarker( 'name', { usingOperation: true, affectsData: true, range } );
			} );

			sandbox.clock.tick( 2000 );

			return runPromiseCycles().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );
			} );
		} );

		it( 'should call the save method when some marker affects the data model #2', () => {
			autosave.adapter = {
				save: sandbox.spy()
			};

			const range = ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) );
			const range2 = ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) );

			editor.model.change( writer => {
				writer.addMarker( 'name', { usingOperation: false, affectsData: true, range } );
			} );

			sandbox.clock.tick( 2000 );

			return runPromiseCycles().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );

				editor.model.change( writer => {
					writer.updateMarker( 'name', { range: range2 } );
				} );

				sandbox.clock.tick( 2000 );

				return runPromiseCycles().then( () => {
					sinon.assert.calledTwice( autosave.adapter.save );
				} );
			} );
		} );

		it( 'should call the save method when some marker affects the data model #3', () => {
			autosave.adapter = {
				save: sandbox.spy()
			};

			const range = ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) );

			editor.model.change( writer => {
				writer.addMarker( 'marker-not-affecting-data', { usingOperation: false, affectsData: true, range } );
				writer.addMarker( 'marker-affecting-data', { usingOperation: false, affectsData: false, range } );
			} );

			sandbox.clock.tick( 2000 );

			return runPromiseCycles().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );
			} );
		} );

		it( 'should flush remaining call after editor\'s destroy', () => {
			const spy = sandbox.spy();
			const savedStates = [];

			autosave.adapter = {
				save() {
					spy();

					savedStates.push( editor.getData() );
				}
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( new ModelText( 'bar' ), editor.model.document.selection );
			} );

			sinon.assert.notCalled( spy );

			return editor.destroy().then( () => {
				sinon.assert.calledOnce( spy );
				expect( savedStates ).to.deep.equal( [
					'<p>foo</p><p>bar</p>',
				] );
			} );
		} );

		it( 'should work after editor\'s destroy with long server\'s response time', () => {
			const pendingActions = editor.plugins.get( PendingActions );
			const serverActionSpy = sinon.spy();
			const serverActionStub = sinon.stub();
			serverActionStub.onCall( 0 ).resolves( wait( 1000 ).then( serverActionSpy ) );

			autosave.adapter = {
				save: serverActionStub
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			return editor.destroy()
				.then( () => {
					expect( pendingActions.hasAny ).to.be.true;
					sandbox.clock.tick( 1000 );
				} )
				.then( () => Promise.resolve() )
				.then( () => {
					expect( pendingActions.hasAny ).to.be.false;
					sinon.assert.calledOnce( serverActionSpy );
					sinon.assert.calledOnce( serverActionStub );
				} );
		} );
	} );

	it( 'should wait on the editor initialization', () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = null;

		class AsyncPlugin {
			constructor( editor ) {
				this.editor = editor;
			}

			init() {
				this.editor.once( 'ready', () => {
					const editor = this.editor;

					editor.model.change( writer => {
						writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
						editor.model.insertContent( new ModelText( 'bar' ), editor.model.document.selection );
					} );

					sandbox.clock.tick( 2000 );
				} );

				return Promise.resolve().then( () => Promise.resolve() );
			}
		}

		return ClassicTestEditor
			.create( element, {
				plugins: [ Autosave, Paragraph, AsyncPlugin ],
				autosave: {
					save: sinon.spy( () => {
						expect( editor ).to.not.be.null;
					} )
				}
			} )
			.then( _editor => {
				editor = _editor;
				autosave = editor.plugins.get( Autosave );
				const spy = editor.config.get( 'autosave' ).save;

				expect( editor.getData() ).to.equal( '<p>bar</p>' );
				sinon.assert.calledOnce( spy );
			} )
			.then( () => {
				document.body.removeChild( element );

				return editor.destroy();
			} );
	} );
} );

function wait( time ) {
	return new Promise( res => {
		window.setTimeout( res, time );
	} );
}

function runPromiseCycles() {
	return Promise.resolve()
		.then( () => Promise.resolve() )
		.then( () => Promise.resolve() )
		.then( () => Promise.resolve() )
		.then( () => Promise.resolve() );
}
