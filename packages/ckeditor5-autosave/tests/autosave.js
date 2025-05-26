/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Autosave from '../src/autosave.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions.js';

describe( 'Autosave', () => {
	let editor, element, autosave;

	beforeEach( () => {
		sinon.useFakeTimers( { now: Date.now() } );
	} );

	afterEach( () => {
		sinon.restore();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Autosave.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Autosave.isPremiumPlugin ).to.be.false;
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
					writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
					editor.model.insertContent( writer.createText( 'foo' ) );
				} );

				sinon.clock.tick( 1000 );
			} ).to.not.throw();
		} );

		it( 'should start with the `synchronized` state', () => {
			expect( autosave.state ).to.equal( 'synchronized' );
		} );
	} );

	describe( 'config.autosave.save', () => {
		let spy;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			spy = sinon.spy();

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ],
					autosave: {
						save: spy
					},
					initialData: '<p>Foo</p>'
				} )
				.then( _editor => {
					editor = _editor;

					autosave = editor.plugins.get( Autosave );
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should not call autosave callback while editor is being initialized', () => {
			sinon.clock.tick( 1000 );

			return Promise.resolve().then( () => {
				expect( spy.called ).to.be.false;
			} );
		} );

		it( 'should enable providing callback via the config', () => {
			editor.config.get( 'autosave' ).save.resetHistory();

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			sinon.clock.tick( 1000 );

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
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			sinon.clock.tick( 1000 );

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
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			sinon.clock.tick( 1000 );

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
						writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
						editor.model.insertContent( writer.createText( 'foo' ) );
					} );

					sinon.clock.tick( 499 );

					return Promise.resolve().then( () => {
						sinon.assert.notCalled( editor.config.get( 'autosave' ).save );

						sinon.clock.tick( 1 );

						return Promise.resolve();
					} ).then( () => {
						// Callback should be called exactly after 500ms.
						sinon.assert.calledOnce( editor.config.get( 'autosave' ).save );
					} );
				} );
		} );

		it( 'should be default to 1000', () => {
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

					const data = '<p>paragraph1</p><p>paragraph2</p>';
					editor.setData( data );

					editor.model.change( writer => {
						writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
						editor.model.insertContent( writer.createText( 'foo' ) );
					} );

					sinon.clock.tick( 999 );

					return Promise.resolve().then( () => {
						sinon.assert.notCalled( editor.config.get( 'autosave' ).save );

						sinon.clock.tick( 1 );

						return Promise.resolve();
					} ).then( () => {
						// Callback should be called exactly after 1000ms by default.
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
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			sinon.clock.tick( 1000 );

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
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			sinon.clock.tick( 1000 );

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( writer.createText( 'bar' ) );
			} );

			sinon.clock.tick( 1000 );

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( writer.createText( 'biz' ) );
			} );

			sinon.assert.notCalled( spy );

			sinon.clock.tick( 1000 );

			return Promise.resolve().then( () => {
				sinon.assert.calledOnce( spy );
				expect( savedStates ).to.deep.equal( [
					'<p>paragraph1</p><p>biz</p>'
				] );
			} );
		} );

		it( 'should add a pending action after a change and wait on the server response', () => {
			const pendingActions = editor.plugins.get( PendingActions );
			const serverActionSpy = sinon.spy();
			const serverActionStub = sinon.stub();
			serverActionStub.callsFake( () => wait( 1000 ).then( serverActionSpy ) );

			autosave.adapter = {
				save: serverActionStub
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			sinon.assert.notCalled( serverActionSpy );
			expect( pendingActions.hasAny ).to.be.true;
			expect( pendingActions.first.message ).to.equal( 'Saving changes' );

			sinon.clock.tick( 1000 );

			sinon.assert.notCalled( serverActionSpy );
			expect( pendingActions.hasAny ).to.be.true;
			expect( pendingActions.first.message ).to.equal( 'Saving changes' );

			return Promise.resolve().then( () => {
				sinon.clock.tick( 1000 );

				return runPromiseCycles().then( () => {
					sinon.assert.calledOnce( serverActionSpy );
					expect( pendingActions.hasAny ).to.be.false;
				} );
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
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			expect( pendingActions.hasAny ).to.be.true;

			sinon.clock.tick( 1000 );

			return runPromiseCycles().then( () => {
				sinon.assert.calledOnce( serverActionSpy );
				expect( pendingActions.hasAny ).to.be.false;
			} );
		} );

		it( 'should be in correct states during the saving', () => {
			const pendingActions = editor.plugins.get( PendingActions );
			const serverActionSpy = sinon.spy();
			const serverActionStub = sinon.stub();
			serverActionStub.callsFake( () => wait( 1000 ).then( serverActionSpy ) );

			autosave.adapter = {
				save: serverActionStub
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			sinon.assert.notCalled( serverActionSpy );
			expect( pendingActions.hasAny ).to.be.true;
			expect( pendingActions.first.message ).to.equal( 'Saving changes' );

			sinon.clock.tick( 1000 );
			expect( autosave.state ).to.equal( 'saving' );

			return Promise.resolve().then( () => {
				// Add new change before the response from the server.

				editor.model.change( writer => {
					writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
					editor.model.insertContent( writer.createText( 'foo' ) );
				} );

				sinon.clock.tick( 1000 );

				return runPromiseCycles();
			} ).then( () => {
				// Now there should come the first server response.
				expect( autosave.state ).to.equal( 'waiting' );
				expect( pendingActions.hasAny ).to.be.true;
				sinon.assert.calledOnce( serverActionSpy );

				sinon.clock.tick( 1000 );

				return runPromiseCycles();
			} ).then( () => {
				expect( autosave.state ).to.equal( 'saving' );
				expect( pendingActions.hasAny ).to.be.true;
				sinon.assert.calledOnce( serverActionSpy );

				// Wait for the second server response.
				sinon.clock.tick( 1000 );

				return runPromiseCycles();
			} ).then( () => {
				expect( pendingActions.hasAny ).to.be.false;
				expect( autosave.state ).to.equal( 'synchronized' );
				sinon.assert.calledTwice( serverActionSpy );
			} );
		} );

		it( 'should filter out selection changes', () => {
			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
			} );

			sinon.clock.tick( 1000 );

			return runPromiseCycles().then( () => {
				sinon.assert.notCalled( autosave.adapter.save );
			} );
		} );

		it( 'should filter out markers that does not affect the data', () => {
			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
				writer.addMarker( 'name', { usingOperation: true, range } );
			} );

			sinon.clock.tick( 1000 );

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) );
				writer.updateMarker( 'name', { range } );
			} );

			sinon.clock.tick( 1000 );

			return runPromiseCycles().then( () => {
				sinon.assert.notCalled( autosave.adapter.save );
			} );
		} );

		it( 'should filter out markers that does not affect the data #2', () => {
			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
				writer.addMarker( 'name', { usingOperation: false, range } );
			} );

			sinon.clock.tick( 1000 );

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) );
				writer.updateMarker( 'name', { range } );
			} );

			sinon.clock.tick( 1000 );

			return runPromiseCycles().then( () => {
				sinon.assert.notCalled( autosave.adapter.save );
			} );
		} );

		it( 'should call the save method when some marker affects the data', () => {
			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
				writer.addMarker( 'name', { usingOperation: true, affectsData: true, range } );
			} );

			sinon.clock.tick( 1000 );

			return runPromiseCycles().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );
			} );
		} );

		it( 'should call the save method when some marker affects the data #2', () => {
			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
				writer.addMarker( 'name', { usingOperation: false, affectsData: true, range } );
			} );

			sinon.clock.tick( 1000 );

			return runPromiseCycles().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );

				editor.model.change( writer => {
					const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) );
					writer.updateMarker( 'name', { range } );
				} );

				sinon.clock.tick( 1000 );

				return runPromiseCycles().then( () => {
					sinon.assert.calledTwice( autosave.adapter.save );
				} );
			} );
		} );

		it( 'should call the save method when some marker affects the data #3', () => {
			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				const range = writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );
				writer.addMarker( 'marker-not-affecting-data', { usingOperation: false, affectsData: true, range } );
				writer.addMarker( 'marker-affecting-data', { usingOperation: false, affectsData: false, range } );
			} );

			sinon.clock.tick( 1000 );

			return runPromiseCycles().then( () => {
				sinon.assert.calledOnce( autosave.adapter.save );
			} );
		} );

		it( 'should flush remaining call after editor\'s destroy', () => {
			const spy = sinon.spy();
			const savedStates = [];

			autosave.adapter = {
				save() {
					spy();

					savedStates.push( editor.getData() );
				}
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 1 ) ) );
				editor.model.insertContent( writer.createText( 'bar' ) );
			} );

			sinon.assert.notCalled( spy );

			return editor.destroy().then( () => {
				sinon.assert.calledOnce( spy );
				expect( savedStates ).to.deep.equal( [
					'<p>foo</p><p>bar</p>'
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
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			return editor.destroy()
				.then( () => {
					expect( pendingActions.hasAny ).to.be.true;
					sinon.clock.tick( 1000 );
				} )
				.then( runPromiseCycles )
				.then( () => {
					expect( pendingActions.hasAny ).to.be.false;
					sinon.assert.calledOnce( serverActionSpy );
					sinon.assert.calledOnce( serverActionStub );
				} );
		} );

		it( 'should handle a situation when the save callback throws an error', () => {
			const pendingActions = editor.plugins.get( PendingActions );
			const successServerActionSpy = sinon.spy();
			const serverActionStub = sinon.stub();

			serverActionStub.onFirstCall()
				.rejects( new Error( 'foo' ) );

			serverActionStub.onSecondCall()
				.callsFake( successServerActionSpy );

			autosave.adapter = {
				save: serverActionStub
			};

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			return editor.destroy()
				.then( () => {
					expect( pendingActions.hasAny ).to.be.true;
				} )
				.then( runPromiseCycles )
				.then( () => {
					expect( pendingActions.hasAny ).to.be.true;
					sinon.assert.calledOnce( serverActionStub );
					sinon.assert.notCalled( successServerActionSpy );
				} )
				.then( () => sinon.clock.tick( 1000 ) )
				.then( runPromiseCycles )
				.then( () => {
					expect( pendingActions.hasAny ).to.be.false;
					sinon.assert.calledTwice( serverActionStub );
					sinon.assert.calledOnce( successServerActionSpy );
				} );
		} );

		it( 'should ignore non-local changes', () => {
			autosave.adapter = {
				save: sinon.spy()
			};

			editor.model.enqueueChange( { isLocal: false }, writer => {
				writer.insertElement( 'paragraph', null, editor.model.document.getRoot(), 0 );
			} );

			sinon.clock.tick( 2000 );

			return runPromiseCycles().then( () => {
				sinon.assert.notCalled( autosave.adapter.save );
			} );
		} );
	} );

	describe( 'save()', () => {
		let spy;

		beforeEach( () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			spy = sinon.spy();

			return ClassicTestEditor
				.create( element, {
					plugins: [ Autosave, Paragraph ],
					autosave: {
						save: async () => {
							await wait( 100 );

							spy();
						}
					},
					initialData: '<p>Foo</p>'
				} )
				.then( _editor => {
					editor = _editor;
					autosave = editor.plugins.get( Autosave );
				} );
		} );

		afterEach( () => {
			document.body.removeChild( element );

			return editor.destroy();
		} );

		it( 'should call autosave callback and return a promise resolved when the callback is finished', async () => {
			const promise = autosave.save();

			// Wait for autosave's inner promise delayer. After this callback has been called.
			await runPromiseCycles();

			// "Wait" for the callback to finish.
			sinon.clock.tick( 100 );

			// Wait for autosave callback promise to resolve.
			await promise;

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should use one autosave call and one promise if called multiple times', async () => {
			const promise = autosave.save();
			const promiseB = autosave.save();
			const promiseC = autosave.save();

			expect( promiseB ).to.equal( promise );
			expect( promiseC ).to.equal( promise );

			// Wait for autosave's inner promise delayer. After this callback has been called.
			await runPromiseCycles();

			// "Wait" for the callback to finish.
			sinon.clock.tick( 100 );

			// Wait for autosave callback promise to resolve.
			await promise;

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should use two autosave calls and one promise if called another time after model changed', async () => {
			const promise = autosave.save();

			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			const promiseB = autosave.save();

			expect( promise ).to.equal( promiseB );

			// Wait for autosave's inner promise delayer. After this callback has been called.
			await runPromiseCycles();

			// "Wait" for the first callback to finish.
			sinon.clock.tick( 100 );

			// Wait for autosave callback promise to resolve.
			await runPromiseCycles();

			expect( spy.calledOnce ).to.be.true;

			// "Wait" for the second callback to finish.
			sinon.clock.tick( 100 );

			// Wait for autosave callback promise to resolve.
			await promise;

			expect( spy.calledTwice ).to.be.true;
		} );

		it( 'should cancel delayed autosave callback', async () => {
			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			autosave.save();

			// Wait for autosave's inner promise delayer.
			await runPromiseCycles();

			// "Wait" for the `save()` callback to finish.
			sinon.clock.tick( 100 );

			// Wait for autosave callback promise to resolve.
			await runPromiseCycles();

			// "Wait" for the debounce to finish.
			sinon.clock.tick( 2000 );

			// Wait for autosave's inner promise delayer.
			await runPromiseCycles();

			// "Wait" for the autosave callback to finish.
			sinon.clock.tick( 100 );

			// Wait for autosave callback promise to resolve.
			await runPromiseCycles();

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should return a promise resolved when the autosave for save() call is finished (another callback in progress)', async () => {
			editor.model.change( writer => {
				writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			// "Wait" for the debounce to finish.
			sinon.clock.tick( 2000 );

			// Wait for autosave's inner promise delayer.
			await runPromiseCycles();

			editor.model.change( writer => {
				editor.model.insertContent( writer.createText( 'foo' ) );
			} );

			// Call `save()` before earlier callback finishes.
			const promise = autosave.save();

			expect( spy.called ).to.be.false;

			// "Wait" for the callback to finish.
			sinon.clock.tick( 100 );

			// Wait for autosave callback promise to resolve.
			await runPromiseCycles();

			// First callback (debounced) has finished.
			expect( spy.calledOnce ).to.be.true;

			// "Wait" for the second callback to finish.
			sinon.clock.tick( 100 );

			await promise;

			// First callback has finished.
			expect( spy.calledTwice ).to.be.true;
		} );
	} );

	it( 'should run callbacks until the editor is in the ready state', () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = null;

		class AsyncPlugin {
			constructor( editor ) {
				this.editor = editor;
			}

			init() {
				this.editor.data.once( 'ready', () => {
					const editor = this.editor;

					editor.model.change( writer => {
						writer.setSelection( writer.createRangeIn( editor.model.document.getRoot().getChild( 0 ) ) );
						editor.model.insertContent( writer.createText( 'bar' ) );
					} );

					sinon.clock.tick( 10 );
				} );
			}
		}

		return ClassicTestEditor
			.create( element, {
				plugins: [ Autosave, Paragraph, AsyncPlugin ],
				autosave: {
					save: sinon.spy(),
					waitingTime: 5
				}
			} )
			.then( _editor => {
				editor = _editor;
				const spy = editor.config.get( 'autosave' ).save;

				expect( editor.getData() ).to.equal( '<p>bar</p>' );
				sinon.assert.notCalled( spy );
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
