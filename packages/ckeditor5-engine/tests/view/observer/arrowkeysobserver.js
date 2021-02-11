/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ArrowKeysObserver from '../../../src/view/observer/arrowkeysobserver';
import { setData as setModelData } from '../../../src/dev-utils/model';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'ArrowKeysObserver', () => {
	let editor, model, view, viewDocument, observer;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph ] } );

		model = editor.model;
		view = editor.editing.view;
		viewDocument = view.document;
		observer = view.getObserver( ArrowKeysObserver );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should define eventType', () => {
		expect( observer.eventType ).to.equal( 'keydown' );
	} );

	it( 'should define firedEventType', () => {
		expect( observer.firedEventType ).to.equal( 'arrowkey' );
	} );

	describe( '#_translateEvent()', () => {
		it( 'should fire arrowkey event with the same data as keydown event (arrow right)', () => {
			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowright };

			viewDocument.on( 'arrowkey', spy, { context: '$root' } );

			// Prevent other listeners (especially jump over UI element because it required DOM).
			viewDocument.on( 'keydown', event => event.stop() );

			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
		} );

		it( 'should fire arrowkey event with the same data as keydown event (arrow left)', () => {
			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowleft };

			viewDocument.on( 'arrowkey', spy, { context: '$root' } );

			// Prevent other listeners (especially jump over inline filler because it required DOM).
			viewDocument.on( 'keydown', event => event.stop() );

			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
		} );

		it( 'should fire arrowkey event with the same data as keydown event (arrow up)', () => {
			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowup };

			viewDocument.on( 'arrowkey', spy, { context: '$root' } );

			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
		} );

		it( 'should fire arrowkey event with the same data as keydown event (arrow down)', () => {
			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowdown };

			viewDocument.on( 'arrowkey', spy, { context: '$root' } );

			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
		} );

		it( 'should not fire arrowkey event on non arrow key press', () => {
			const spy = sinon.spy();
			const data = { keyCode: keyCodes.delete };

			viewDocument.on( 'arrowkey', spy, { context: '$root' } );

			viewDocument.fire( 'keydown', data );

			expect( spy.notCalled ).to.be.true;
		} );
	} );

	describe( '#_addEventListener()', () => {
		it( 'should allow providing multiple context in one listener binding', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowdown };

			viewDocument.on( 'arrowkey', spy, { context: [ '$text', 'p' ] } );

			viewDocument.fire( 'keydown', data );

			expect( spy.calledTwice ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
			expect( spy.args[ 1 ][ 1 ] ).to.equal( data );
		} );

		it( 'should reuse existing context', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const data = { keyCode: keyCodes.arrowdown };

			viewDocument.on( 'arrowkey', spy1, { context: 'p' } );
			viewDocument.on( 'arrowkey', spy2, { context: 'p' } );

			viewDocument.fire( 'keydown', data );

			expect( spy1.calledOnce ).to.be.true;
			expect( spy1.args[ 0 ][ 1 ] ).to.equal( data );
			expect( spy2.calledOnce ).to.be.true;
			expect( spy2.args[ 0 ][ 1 ] ).to.equal( data );
		} );
	} );

	describe( '#_removeEventListener()', () => {
	} );
} );
