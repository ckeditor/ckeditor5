/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, KeyboardEvent */

import { parseKeystroke, wait } from '@ckeditor/ckeditor5-utils';

export default function testFocusCycling( {
	getView,
	getFocusablesCollection,
	actions,
	addFocusables,
	removeFocusables,
	triggerAction = defaultDispatchDomKeyboardEvent
} ) {
	for ( const action in actions ) {
		const keystroke = actions[ action ];
		const keystrokeCode = parseKeystroke( keystroke );

		test( {
			action,
			keystroke,
			keystrokeCode
		} );

		if ( addFocusables ) {
			test( {
				action,
				keystroke,
				keystrokeCode,
				modifyFocusables: addFocusables,
				description: 'after adding new items'
			} );
		}

		if ( removeFocusables ) {
			test( {
				action,
				keystroke,
				keystrokeCode,
				modifyFocusables: removeFocusables,
				description: 'after removing some items'
			} );
		}
	}

	function test( { action, keystroke, keystrokeCode, modifyFocusables, description = '' } ) {
		it( `should execute the "${ action }" action upon pressing "${ keystroke }" ${ description }`, async () => {
			if ( !getView().element ) {
				throw new Error( 'testFocusCycling() helper: Render the view before testing.' );
			}

			if ( !document.body.contains( getView().element ) ) {
				throw new Error( 'testFocusCycling() helper: The view element is not attached to the DOM.' );
			}

			const focusables = getFocusablesCollection();

			if ( !focusables.length ) {
				throw new Error(
					'testFocusCycling() helper: The collection of focusable views is empty.'
				);
			}

			if ( modifyFocusables ) {
				const focusablesCountBeforeModify = focusables.length;

				modifyFocusables();

				if ( focusablesCountBeforeModify === focusables.length ) {
					throw new Error(
						'testFocusCycling() helper: The number of focusables is the same after calling ' +
						'addFocusables() or removeFocusables().'
					);
				}
			}

			const focusSpies = Array.from( focusables ).map( view => sinon.spy( view, 'focus' ) );
			let currentView = focusables.first;
			let currentElement = currentView.element;

			focusables.first.focus();

			await wait( 10 );

			do {
				const event = triggerAction( {
					action,
					keystroke,
					keystrokeCode,
					currentElement,
					currentView
				} );

				await wait( 10 );

				if ( triggerAction === defaultDispatchDomKeyboardEvent ) {
					sinon.assert.calledOnce( event.preventDefault );
					sinon.assert.calledOnce( event.stopPropagation );
				}

				currentElement = getView().focusTracker.focusedElement;
				currentView = focusables.find( view => view.element.contains( currentElement ) );
			} while ( currentElement !== focusables.first.element );

			expect( focusSpies.map( spy => spy.called ).every( isCalled => isCalled ), 'Focus was called' ).to.be.true;

			const expectedCallCounts = new Array( focusables.length ).fill( 1 );

			// There will be a forward or backward cycle so the first spy will always be called twice.
			if ( focusables.length > 1 ) {
				expectedCallCounts[ 0 ]++;
			}

			expect( focusSpies.map( spy => spy.callCount ), 'Focus call count' ).to.deep.equal( expectedCallCounts );

			if ( action === 'focusNext' ) {
				sinon.assert.callOrder( ...focusSpies );
			} else {
				sinon.assert.callOrder( ...focusSpies.reverse() );
			}
		} );
	}
}

export function getDomKeyboardEvent( keyCode, options = { bubbles: true } ) {
	const event = new KeyboardEvent( 'keydown', {
		keyCode,
		...options
	} );

	sinon.spy( event, 'preventDefault' );
	sinon.spy( event, 'stopPropagation' );

	return event;
}

function defaultDispatchDomKeyboardEvent( {
	keystrokeCode,
	currentElement
} ) {
	const event = getDomKeyboardEvent( keystrokeCode );

	currentElement.dispatchEvent( event );

	return event;
}
