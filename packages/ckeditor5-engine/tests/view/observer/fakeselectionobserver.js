/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';
import FakeSelectionObserver from '../../../src/view/observer/fakeselectionobserver';
import ViewDocument from '../../../src/view/document';
import DomEventData from '../../../src/view/observer/domeventdata';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { setData, stringify } from '../../../src/dev-utils/view';

describe( 'FakeSelectionObserver', () => {
	let observer;
	let viewDocument;
	let root;
	let domRoot;

	before( () => {
		domRoot = createElement( document, 'div', {
			contenteditable: 'true'
		} );
		document.body.appendChild( domRoot );
	} );

	after( () => {
		domRoot.parentElement.removeChild( domRoot );
	} );

	beforeEach( () => {
		viewDocument = new ViewDocument();
		root = viewDocument.createRoot( domRoot );
		observer = viewDocument.getObserver( FakeSelectionObserver );
		viewDocument.selection.setFake();
	} );

	afterEach( () => {
		viewDocument.destroy();
	} );

	it( 'should do nothing if selection is not fake', () => {
		viewDocument.selection.setFake( false );

		return checkEventPrevention( keyCodes.arrowleft, false );
	} );

	it( 'should do nothing if is disabled', () => {
		observer.disable();

		return checkEventPrevention( keyCodes.arrowleft, false );
	} );

	it( 'should prevent default for left arrow key', ( ) => {
		return checkEventPrevention( keyCodes.arrowleft );
	} );

	it( 'should prevent default for right arrow key', ( ) => {
		return checkEventPrevention( keyCodes.arrowright );
	} );

	it( 'should prevent default for up arrow key', ( ) => {
		return checkEventPrevention( keyCodes.arrowup );
	} );

	it( 'should prevent default for down arrow key', ( ) => {
		return checkEventPrevention( keyCodes.arrowdown );
	} );

	it( 'should fire selectionChange event with new selection when left arrow key is pressed', () => {
		return checkSelectionChange(
			'<container:p>foo[<strong>bar</strong>]baz</container:p>',
			keyCodes.arrowleft,
			'<container:p>foo[]<strong>bar</strong>baz</container:p>'
		);
	} );

	it( 'should fire selectionChange event with new selection when right arrow key is pressed', () => {
		return checkSelectionChange(
			'<container:p>foo[<strong>bar</strong>]baz</container:p>',
			keyCodes.arrowright,
			'<container:p>foo<strong>bar</strong>[]baz</container:p>'
		);
	} );

	it( 'should fire selectionChange event with new selection when up arrow key is pressed', () => {
		return checkSelectionChange(
			'<container:p>foo[<strong>bar</strong>]baz</container:p>',
			keyCodes.arrowup,
			'<container:p>foo[]<strong>bar</strong>baz</container:p>'
		);
	} );

	it( 'should fire selectionChange event with new selection when down arrow key is pressed', () => {
		return checkSelectionChange(
			'<container:p>foo[<strong>bar</strong>]baz</container:p>',
			keyCodes.arrowdown,
			'<container:p>foo<strong>bar</strong>[]baz</container:p>'
		);
	} );

	// Checks if preventDefault method was called by FakeSelectionObserver for specified key code.
	//
	// @param {Number} keyCode
	// @param {Boolean} shouldPrevent If set to true method checks if event was prevented.
	// @returns {Promise}
	function checkEventPrevention( keyCode, shouldPrevent = true ) {
		return new Promise( resolve => {
			const data = {
				keyCode,
				preventDefault: sinon.spy(),
			};

			viewDocument.once( 'keydown', () => {
				if ( shouldPrevent ) {
					sinon.assert.calledOnce( data.preventDefault );
				} else {
					sinon.assert.notCalled( data.preventDefault );
				}

				resolve();
			}, { priority: 'lowest' } );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, { target: document.body }, data ) );
		} );
	}

	// Checks if proper selectionChange event is fired by FakeSelectionObserver for specified key.
	//
	// @param {String} initialData
	// @param {Number} keyCode
	// @param {String} output
	// @returns {Promise}
	function checkSelectionChange( initialData, keyCode, output ) {
		return new Promise( resolve => {
			viewDocument.once( 'selectionChange', ( eventInfo, data ) => {
				expect( stringify( root.getChild( 0 ), data.newSelection, { showType: true } ) ).to.equal( output );
				resolve();
			} );

			setData( viewDocument, initialData );
			viewDocument.selection.setFake();

			const data = {
				keyCode,
				preventDefault: sinon.spy(),
			};

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, { target: document.body }, data ) );
		} );
	}
} );
