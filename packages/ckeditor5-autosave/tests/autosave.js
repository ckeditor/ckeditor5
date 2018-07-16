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
	const sandbox = sinon.sandbox.create( { useFakeTimers: true } );
	let editor, element, autosave;

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

					// Clean autosave's state after setting data.
					autosave._flush();
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
			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			autosave._flush();
		} );
	} );

	describe( 'config', () => {
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
					const data = '<p>paragraph1</p><p>paragraph2</p>';

					editor = _editor;
					editor.setData( data );
					autosave = editor.plugins.get( Autosave );

					// Clean autosave's state after setting data.
					autosave._flush();
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

			return wait().then( () => {
				sinon.assert.calledOnce( editor.config.get( 'autosave' ).save );
			} );
		} );

		it( 'its callback and adapter callback should be called if both are provided', () => {
			editor.config.get( 'autosave' ).save.resetHistory();

			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			return wait().then( () => {
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

			return wait().then( () => {
				sinon.assert.calledWithExactly( autosave.adapter.save, editor );
				sinon.assert.calledWithExactly( editor.config.get( 'autosave' ).save, editor );
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

					// Clean autosave's state after setting data.
					autosave._flush();
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

			return wait().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );
			} );
		} );

		it( 'should throttle editor\'s change event', () => {
			const spy = sinon.spy();
			const savedStates = [];

			autosave.adapter = {
				save() {
					spy();

					savedStates.push( editor.getData() );
				}
			};

			// Leading (will fire change).
			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			return wait().then( () => {
				// Throttled (won't fire change).
				editor.model.change( writer => {
					writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
					editor.model.insertContent( new ModelText( 'bar' ), editor.model.document.selection );
				} );

				return wait();
			} ).then( () => {
				// Flushed (will fire change).
				editor.model.change( writer => {
					writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
					editor.model.insertContent( new ModelText( 'biz' ), editor.model.document.selection );
				} );

				autosave._flush();

				return wait();
			} ).then( () => {
				expect( spy.callCount ).to.equal( 2 );
				expect( savedStates ).to.deep.equal( [
					'<p>paragraph1</p><p>foo</p>',
					'<p>paragraph1</p><p>biz</p>'
				] );
			} );
		} );

		it( 'should add a pending action during the saving.', () => {
			sandbox.useFakeTimers();
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

			sinon.assert.notCalled( serverActionSpy );
			expect( pendingActions.isPending ).to.be.true;
			expect( pendingActions.first.message ).to.equal( 'Saving changes' );

			sandbox.clock.tick( 1000 );
			return Promise.resolve().then( () => Promise.resolve() ).then( () => {
				sinon.assert.calledOnce( serverActionSpy );
				expect( pendingActions.isPending ).to.be.false;
			} );
		} );

		it( 'should add a pending action during the saving #2.', () => {
			const serverActionSpy = sinon.spy();
			const pendingActions = editor.plugins.get( PendingActions );

			autosave.adapter = {
				save: serverActionSpy
			};

			expect( pendingActions.isPending ).to.be.false;

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			expect( pendingActions.isPending ).to.be.true;

			// Server action needs to wait at least a cycle.
			return wait().then( () => {
				sinon.assert.calledOnce( serverActionSpy );
				expect( pendingActions.isPending ).to.be.false;
			} );
		} );

		it( 'should handle correctly throttled save action and preserve pending action until both save actions finish', () => {
			sandbox.useFakeTimers();
			const serverActionSpy = sinon.spy();
			const pendingActions = editor.plugins.get( PendingActions );

			// Create a fake server that responses after 1000ms for the first call and after 1000ms for the second call.
			const serverActionStub = sinon.stub();
			serverActionStub.onCall( 0 ).resolves( wait( 1000 ).then( serverActionSpy ) );
			serverActionStub.onCall( 1 ).resolves( wait( 2000 ).then( serverActionSpy ) );

			autosave.adapter = {
				save: serverActionStub
			};

			expect( pendingActions.isPending ).to.be.false;

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			expect( pendingActions.isPending ).to.be.true;

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'bar' ), editor.model.document.selection );
			} );

			autosave._flush();

			expect( pendingActions.isPending ).to.be.true;

			sandbox.clock.tick( 1000 );

			return Promise.resolve().then( () => {
				expect( pendingActions.isPending ).to.be.true;
				sinon.assert.calledOnce( serverActionSpy );

				// Wait another 1000ms and a promise cycle for the second server action.
				sandbox.clock.tick( 1000 );
			} )
				.then( () => Promise.resolve() )
				.then( () => {
					expect( pendingActions.isPending ).to.be.false;
					sinon.assert.calledTwice( serverActionSpy );
				} );
		} );

		it( 'should handle correctly throttled save action and preserve pending action until both save actions finish #2', () => {
			const serverActionSpy = sinon.spy();
			const pendingActions = editor.plugins.get( PendingActions );

			autosave.adapter = {
				save: serverActionSpy
			};

			expect( pendingActions.isPending ).to.be.false;

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			expect( pendingActions.isPending ).to.be.true;

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'bar' ), editor.model.document.selection );
			} );

			expect( pendingActions.isPending ).to.be.true;

			// Server action needs to wait at least a cycle.
			return wait().then( () => {
				sinon.assert.calledOnce( serverActionSpy );
				expect( pendingActions.isPending ).to.be.true;

				autosave._flush();

				// Wait another promise cycle.
				return wait().then( () => {
					sinon.assert.calledTwice( serverActionSpy );
					expect( pendingActions.isPending ).to.be.false;
				} );
			} );
		} );

		it( 'should filter out changes in the selection', () => {
			autosave.adapter = {
				save: sandbox.spy()
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
			} );

			autosave._flush();
			sinon.assert.notCalled( autosave.adapter.save );
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

			autosave._flush();

			editor.model.change( writer => {
				writer.updateMarker( 'name', { range: range2 } );
			} );

			autosave._flush();

			sinon.assert.notCalled( autosave.adapter.save );
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

			autosave._flush();

			editor.model.change( writer => {
				writer.updateMarker( 'name', { range: range2 } );
			} );

			autosave._flush();

			sinon.assert.notCalled( autosave.adapter.save );
		} );

		it( 'should call the save method when some marker affects the data model', () => {
			autosave.adapter = {
				save: sandbox.spy()
			};

			const range = ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) );
			const range2 = ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) );

			editor.model.change( writer => {
				writer.addMarker( 'name', { usingOperation: true, affectsData: true, range } );
			} );

			autosave._flush();

			return wait().then( () => {
				editor.model.change( writer => {
					writer.updateMarker( 'name', { range: range2 } );
				} );

				autosave._flush();

				return wait().then( () => {
					sinon.assert.calledTwice( autosave.adapter.save );
				} );
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

			autosave._flush();

			return wait().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );

				editor.model.change( writer => {
					writer.updateMarker( 'name', { range: range2 } );
				} );

				autosave._flush();

				return wait().then( () => {
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

			return wait().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );
			} );
		} );

		it( 'should flush remaining calls after editor\'s destroy', () => {
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

			return wait().then( () => {
				editor.model.change( writer => {
					writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
					editor.model.insertContent( new ModelText( 'bar' ), editor.model.document.selection );
				} );

				return editor.destroy().then( () => {
					expect( spy.callCount ).to.equal( 2 );
					expect( savedStates ).to.deep.equal( [
						'<p>foo</p><p>paragraph2</p>',
						'<p>foo</p><p>bar</p>',
					] );
				} );
			} );
		} );

		it( 'should work after editor\'s destroy with long server\'s response time', () => {
			sandbox.useFakeTimers();
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
					expect( pendingActions.isPending ).to.be.true;
					sandbox.clock.tick( 1000 );
				} )
				.then( () => Promise.resolve() )
				.then( () => {
					expect( pendingActions.isPending ).to.be.false;
					sinon.assert.calledOnce( serverActionSpy );
					sinon.assert.calledOnce( serverActionStub );
				} );
		} );
	} );

	it( 'should wait on editor initialization', () => {
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
