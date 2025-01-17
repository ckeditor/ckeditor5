/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ArrowKeysObserver from '../../../src/view/observer/arrowkeysobserver.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

describe( 'ArrowKeysObserver', () => {
	let editor, view, viewDocument, observer;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, BlockQuoteEditing ] } );

		view = editor.editing.view;
		viewDocument = view.document;
		observer = view.getObserver( ArrowKeysObserver );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should fire arrowKey event with the same data as keydown event (arrow right)', () => {
		const spy = sinon.spy();
		const data = { keyCode: keyCodes.arrowright };

		viewDocument.on( 'arrowKey', spy );

		// Prevent other listeners (especially jump over UI element because it required DOM).
		viewDocument.on( 'arrowKey', event => event.stop() );

		viewDocument.fire( 'keydown', data );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
	} );

	it( 'should fire arrowKey event with the same data as keydown event (arrow left)', () => {
		const spy = sinon.spy();
		const data = { keyCode: keyCodes.arrowleft };

		viewDocument.on( 'arrowKey', spy );

		// Prevent other listeners (especially jump over inline filler because it required DOM).
		viewDocument.on( 'arrowKey', event => event.stop() );

		viewDocument.fire( 'keydown', data );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
	} );

	it( 'should fire arrowKey event with the same data as keydown event (arrow up)', () => {
		const spy = sinon.spy();
		const data = { keyCode: keyCodes.arrowup };

		viewDocument.on( 'arrowKey', spy );

		viewDocument.fire( 'keydown', data );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
	} );

	it( 'should fire arrowKey event with the same data as keydown event (arrow down)', () => {
		const spy = sinon.spy();
		const data = { keyCode: keyCodes.arrowdown };

		viewDocument.on( 'arrowKey', spy );

		viewDocument.fire( 'keydown', data );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
	} );

	it( 'should not fire arrowKey event on non arrow key press', () => {
		const spy = sinon.spy();
		const data = { keyCode: keyCodes.space };

		viewDocument.on( 'arrowKey', spy );

		viewDocument.fire( 'keydown', data );

		expect( spy.notCalled ).to.be.true;
	} );

	it( 'should implement empty #observe() method', () => {
		expect( () => {
			observer.observe();
		} ).to.not.throw();
	} );

	it( 'should implement empty #stopObserving() method', () => {
		expect( () => {
			observer.stopObserving();
		} ).to.not.throw();
	} );
} );
