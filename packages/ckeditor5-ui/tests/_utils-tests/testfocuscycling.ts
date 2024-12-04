/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, KeyboardEvent */

import { isVisible, parseKeystroke, wait } from '@ckeditor/ckeditor5-utils';
import { View, type ViewCollection } from '../../src/index.js';
import type { FocusableView, FocusCyclerActions, ViewWithFocusCycler } from '../../src/focuscycler.js';
import sinon from 'sinon';

/**
 * Automates testing of focus cycling in a view with a focus cycler. It runs a test per each configured action.
 *
 * When `addFocusables()` or `removeFocusables()` are provided, additional tests are run to check how the focus cycling
 * works when the collection of focusable views is modified.
 */
export default function testFocusCycling( {
	getView,
	getFocusablesCollection,
	actions,
	addFocusables,
	removeFocusables,
	expectedFocusedElements,
	triggerAction = defaultDispatchDomKeyboardEvent
}: TestFocusCyclingOptions ): void {
	let action: keyof typeof actions;

	for ( action in actions ) {
		const keystroke = actions[ action ] as string;
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
				description: ' after adding new items'
			} );
		}

		if ( removeFocusables ) {
			test( {
				action,
				keystroke,
				keystrokeCode,
				modifyFocusables: removeFocusables,
				description: ' after removing some items'
			} );
		}
	}

	function test( {
		action,
		keystroke,
		keystrokeCode,
		modifyFocusables,
		expectedFocusedElements,
		description = ''
	}: {
		action: keyof FocusCyclerActions;
		keystroke: string;
		keystrokeCode: number;
		modifyFocusables?: () => void;
		expectedFocusedElements?: TestFocusCyclingOptions[ 'expectedFocusedElements' ];
		description?: string;
	} ) {
		it( `should execute the "${ action }" action upon pressing "${ keystroke }"${ description }`, async () => {
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

			let currentView = focusables.get( getView().focusCycler.current! )!;
			let currentElement = document.activeElement as HTMLElement;
			const visitedElements: Array<HTMLElement> = [];

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

				if ( event ) {
					sinon.assert.calledOnce( event.preventDefault as sinon.SinonSpy );
					sinon.assert.calledOnce( event.stopPropagation as sinon.SinonSpy );
				}

				currentElement = document.activeElement as HTMLElement;
				currentView = visibleFocusables.find( view => view.element!.contains( currentElement ) )!;
			}

			if ( expectedFocusedElements ) {
				const expectedElements = expectedFocusedElements[ action ]!( getView() );

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

export function getDomKeyboardEvent( keyCode: number, options = { bubbles: true } ): KeyboardEvent {
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

	public focus(): void {
		this.element!.focus();
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

type TestFocusCyclingOptions = {

	/**
	 * The view with the focus cycler that gets tested.
	 */
	getView: () => ViewWithFocusCycler;

	/**
	 * The collection of focusable views that the focus cycler should cycle through.
	 */
	getFocusablesCollection: () => ViewCollection<FocusableView>;

	/**
	 * The focus cycler actions that should be tested.
	 */
	actions: FocusCyclerActions;

	/**
	 * When specified, this callback should extends the collection of focusable views.
	 * This will result with additional test being run that checks what happens when new focusables are added.
	 */
	addFocusables?: () => void;

	/**
	 * When specified, this callback should remove from the collection of focusable views.
	 * This will result with additional test being run that checks what happens when new focusables are removed.
	 */
	removeFocusables?: () => void;

	/**
	 * An optional expected array of DOM elements (ordered) visited by the focus for each action.
	 *
	 * Note: Assertion works only for simple test (without `addFocusables()` or `removeFocusables()`).
	 */
	expectedFocusedElements?: {
		[ key in keyof FocusCyclerActions]: ( view: FocusableView ) => Array<HTMLElement>
	};

	/**
	 * An optional callback that should move the focus upon a specific action. This is useful for focus cycler
	 * configurations that do not come with a configured actions set but are nudged manually, for instance by
	 * calling `FocusCycler#focusNext()` or `focusPrevious()`.
	 */
	triggerAction?: ( data: {
		action: keyof FocusCyclerActions;
		currentView: View;
		keystroke: string;
		keystrokeCode: number;
		currentElement: HTMLElement;
	} ) => KeyboardEvent | undefined;
};
