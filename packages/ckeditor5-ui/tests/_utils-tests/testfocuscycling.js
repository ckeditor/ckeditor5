/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, beforeEach, afterEach } from 'vitest';

import { FocusTracker, KeystrokeHandler } from '@ckeditor/ckeditor5-utils';

import { View } from '../../src/view.js';
import { FocusCycler } from '../../src/focuscycler.js';
import { testFocusCycling, FocusableTestView } from '../_utils/testfocuscycling.js';

describe( 'testFocusCycling()', () => {
	let view;

	beforeEach( () => {
		view = new CyclingTestView();
		view.render();

		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.destroy();
		view.element.remove();
	} );

	describe( 'with the default DOM keyboard event trigger', () => {
		testFocusCycling( {
			getView: () => view,
			getFocusablesCollection: () => view.focusables,
			actions: {
				focusPrevious: 'arrowup',
				focusNext: 'arrowdown'
			},
			addFocusables: () => {
				view.addFocusable( new FocusableTestView( 'D' ) );
				view.addFocusable( new FocusableTestView( 'E' ) );
			},
			removeFocusables: () => {
				view.removeFocusable( view.focusables.last );
			},
			expectedFocusedElements: {
				focusNext: view => [
					view.focusables.get( 0 ).element,
					view.focusables.get( 1 ).element,
					view.focusables.get( 2 ).element
				],
				focusPrevious: view => [
					view.focusables.get( 0 ).element,
					view.focusables.get( 2 ).element,
					view.focusables.get( 1 ).element
				]
			}
		} );
	} );

	describe( 'with a custom triggerAction()', () => {
		testFocusCycling( {
			getView: () => view,
			getFocusablesCollection: () => view.focusables,
			actions: {
				focusPrevious: 'arrowup',
				focusNext: 'arrowdown'
			},
			triggerAction: ( { action } ) => {
				view.focusCycler[ action ]();
			}
		} );
	} );
} );

class CyclingTestView extends View {
	constructor() {
		super();

		this.focusables = this.createCollection( [
			new FocusableTestView( 'A' ),
			new FocusableTestView( 'B' ),
			new FocusableTestView( 'C' )
		] );

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.focusCycler = new FocusCycler( {
			focusables: this.focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'arrowup',
				focusNext: 'arrowdown'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			children: this.focusables
		} );
	}

	render() {
		super.render();

		for ( const focusable of this.focusables ) {
			this.focusTracker.add( focusable.element );
		}

		this.keystrokes.listenTo( this.element );
	}

	focus() {
		this.focusCycler.focusFirst();
	}

	addFocusable( focusable ) {
		this.focusables.add( focusable );
		this.focusTracker.add( focusable.element );
	}

	removeFocusable( focusable ) {
		this.focusables.remove( focusable );
		this.focusTracker.remove( focusable.element );
	}

	destroy() {
		this.focusTracker.destroy();
		this.keystrokes.destroy();

		super.destroy();
	}
}
