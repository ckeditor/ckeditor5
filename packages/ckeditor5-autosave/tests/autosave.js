/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
 */

/* globals document, window */

import ModelText from '@ckeditor/ckeditor5-engine/src/model/text';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Autosave from '../src/autosave';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';

describe( 'Autosave', () => {
	const sandbox = sinon.sandbox.create();
	let editor, element, autosave;

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
				autosave._throttledSave.cancel();
			} );
	} );

	afterEach( () => {
		document.body.removeChild( element );
		sandbox.restore();

		return editor.destroy();
	} );

	it( 'should have static pluginName property', () => {
		expect( Autosave.pluginName ).to.equal( 'Autosave' );
	} );

	describe( 'initialization', () => {
		it( 'should initialize provider with an undefined value', () => {
			expect( autosave.provider ).to.be.undefined;
		} );

		it( 'should allow plugin to work without any defined provider', () => {
			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			// Go to the next cycle to because synchronization of CS documentVersion is async.
			return Promise.resolve().then( () => {
				autosave._flush();
			} );
		} );
	} );

	describe( 'autosaving', () => {
		it( 'should run provider\'s save method when the editor\'s change event is fired', () => {
			autosave.provider = {
				save: sinon.spy()
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			// Go to the next cycle to because synchronization of CS documentVersion is async.
			return Promise.resolve()
				.then( () => autosave._flush() )
				.then( () => {
					sinon.assert.calledOnce( autosave.provider.save );
				} );
		} );

		it( 'should throttle editor\'s change event', () => {
			const spy = sinon.spy();
			const savedStates = [];

			autosave.provider = {
				save() {
					spy();

					savedStates.push( editor.getData() );
				}
			};

			// Leading (will fire change).
			const change1 = () => {
				editor.model.change( writer => {
					writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
					editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
				} );
			};

			const change2 = () => {
				// Throttled (won't fire change).
				editor.model.change( writer => {
					writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
					editor.model.insertContent( new ModelText( 'bar' ), editor.model.document.selection );
				} );
			};

			const change3 = () => {
				// Flushed (will fire change).
				editor.model.change( writer => {
					writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 1 ) ) );
					editor.model.insertContent( new ModelText( 'biz' ), editor.model.document.selection );
				} );
			};

			// Provider.save is done asynchronously, so all changes are run in different cycles.
			return Promise.resolve()
				.then( () => change1() )
				.then( () => change2() )
				.then( () => change3() )
				.then( () => autosave._flush() )
				.then( () => {
					expect( spy.callCount ).to.equal( 2 );
					expect( savedStates ).to.deep.equal( [
						'<p>paragraph1</p><p>foo</p>',
						'<p>paragraph1</p><p>biz</p>'
					] );
				} );
		} );

		it( 'should add a pending action during the saving.', () => {
			const wait5msSpy = sinon.spy();
			const pendingActions = editor.plugins.get( PendingActions );

			autosave.provider = {
				save() {
					return wait5ms()
						.then( wait5msSpy );
				}
			};

			editor.model.change( writer => {
				writer.setSelection( ModelRange.createIn( editor.model.document.getRoot().getChild( 0 ) ) );
				editor.model.insertContent( new ModelText( 'foo' ), editor.model.document.selection );
			} );

			// Go to the next cycle to because synchronization of CS documentVersion is async.
			return Promise.resolve()
				.then( () => autosave._flush() )
				.then( () => {
					sinon.assert.notCalled( wait5msSpy );
					expect( pendingActions.isPending ).to.be.true;
					expect( pendingActions.first.message ).to.equal( 'Saving in progress.' );
				} )
				.then( wait5ms )
				.then( () => {
					sinon.assert.calledOnce( wait5msSpy );
					expect( pendingActions.isPending ).to.be.false;
				} );
		} );
	} );

	function wait5ms() {
		return new Promise( res => {
			window.setTimeout( res, 5 );
		} );
	}
} );
