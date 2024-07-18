/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, KeyboardEvent */

import { isVisible, parseKeystroke, wait } from '@ckeditor/ckeditor5-utils';
import { View } from '../../src/index.js';

export default function testFocusCycling( {
	getView,
	getFocusablesCollection,
	actions,
	addFocusables,
	removeFocusables,
	expectedFocusedElements,
	triggerAction = defaultDispatchDomKeyboardEvent
} ) {
	for ( const action in actions ) {
		const keystroke = actions[ action ];
		const keystrokeCode = parseKeystroke( keystroke );

		test( {
			action,
			keystroke,
			keystrokeCode,
			expectedFocusedElements
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

	function test( { action, keystroke, keystrokeCode, modifyFocusables, expectedFocusedElements, description = '' } ) {
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

				await modifyFocusables();

				if ( focusablesCountBeforeModify === focusables.length ) {
					throw new Error(
						'testFocusCycling() helper: The number of focusables is the same after calling ' +
						'addFocusables() or removeFocusables().'
					);
				}
			}

			const visibleFocusables = Array.from( focusables ).filter( view => isVisible( view.element ) );
			const focusSpies = visibleFocusables.map( view => sinon.spy( view, 'focus' ) );

			getView().focusCycler.focusFirst();

			await wait( 10 );

			let currentView = focusables.get( getView().focusCycler.current );
			let currentElement = document.activeElement;
			const visitedElements = [];

			while ( !visitedElements.includes( currentElement ) ) {
				visitedElements.push( currentElement );

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

				currentElement = document.activeElement;
				currentView = visibleFocusables.find( view => view.element.contains( currentElement ) );
			}

			if ( expectedFocusedElements ) {
				const expectedElements = expectedFocusedElements[ action ]( getView() );

				expect( visitedElements, 'Elements visited by focus' ).to.have.ordered.members( expectedElements );
			}

			expect( focusSpies.map( spy => spy.called ).every( isCalled => isCalled ), 'Focus was called' ).to.be.true;

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

export class FocusableTestView extends View {
	constructor( text = 'test' ) {
		super();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				tabindex: -1
			},
			children: [
				{
					text
				}
			]
		} );
	}

	focus() {
		this.element.focus();
	}
}

function defaultDispatchDomKeyboardEvent( {
	keystrokeCode,
	currentElement
} ) {
	const event = getDomKeyboardEvent( keystrokeCode );

	currentElement.dispatchEvent( event );

	return event;
}
