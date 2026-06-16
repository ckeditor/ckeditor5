/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addKeyboardHandlingForGrid } from '../../src/bindings/addkeyboardhandlingforgrid.js';
import { View } from '../../src/view.js';
import { ButtonView } from '../../src/button/buttonview.js';
import { KeystrokeHandler, FocusTracker, Locale, keyCodes } from '@ckeditor/ckeditor5-utils';

describe( 'addKeyboardHandlingForGrid()', () => {
	let view, keystrokes, focusTracker, gridElementsCollection;

	beforeEach( () => {
		view = new TestView();
		keystrokes = new KeystrokeHandler();
		focusTracker = new FocusTracker();

		view.render();

		gridElementsCollection = view.createCollection();

		for ( let i = 0; i < 7; i++ ) {
			const button = new ButtonView( new Locale() );

			button.render();
			gridElementsCollection.add( button );
			focusTracker.add( button.element );
		}

		addKeyboardHandlingForGrid( {
			keystrokeHandler: keystrokes,
			focusTracker,
			gridItems: gridElementsCollection,
			numberOfColumns: 3
		} );

		keystrokes.listenTo( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
		keystrokes.destroy();
		focusTracker.destroy();
	} );

	describe( 'basic arrow moves', () => {
		it( 'arrowright moves focus to the next grid item', () => {
			// before: [x][ ][ ]	after: [ ][x][ ]	key: →
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.first.element;

			const spy = vi.spyOn( gridElementsCollection.get( 1 ), 'focus' );

			pressRightArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'arrowleft moves focus to the previous grid item', () => {
			// before: [ ][x][ ]	after: [x][ ][ ]	key: ←
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 1 ).element;

			const spy = vi.spyOn( gridElementsCollection.get( 0 ), 'focus' );

			pressLeftArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'arrowdown moves focus 1 row below the grid item in the same column', () => {
			// before: [x][ ][ ]	after: [ ][ ][ ]	key: ↓
			//         [ ][ ][ ]	       [x][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.first.element;

			const spy = vi.spyOn( gridElementsCollection.get( 3 ), 'focus' );

			pressDownArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'arrowup moves focus 1 row above the grid item in the same column', () => {
			// before: [ ][ ][ ]	after: [x][ ][ ]	key: ↑
			//         [x][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 3 ).element;

			const spy = vi.spyOn( gridElementsCollection.first, 'focus' );

			pressUpArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'arrow moves at the edges', () => {
		it( 'arrowright at the last column moves focus to the beginning of the next row in the first column', () => {
			// before: [ ][ ][x]	after: [ ][ ][ ]	key: →
			//         [ ][ ][ ]	       [x][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 2 ).element;

			const spy = vi.spyOn( gridElementsCollection.get( 3 ), 'focus' );

			pressRightArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'arrowleft at the first column moves focus to the end of the previous row in the last column', () => {
			// before: [ ][ ][ ]	after: [ ][ ][x]	key: ←
			//         [x][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 3 ).element;

			const spy = vi.spyOn( gridElementsCollection.get( 2 ), 'focus' );

			pressLeftArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'arrowup at the first row moves focus to the last row in the same column', () => {
			// before: [x][ ][ ]	after: [ ][ ][ ]	key: ↑
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [x]
			focusTracker.focusedElement = gridElementsCollection.first.element;

			const spy = vi.spyOn( gridElementsCollection.get( 6 ), 'focus' );

			pressUpArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'arrowdown at the last row moves focus to the first row in the same column', () => {
			// before: [ ][ ][ ]	after: [x][ ][ ]	key: ↓
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [x]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 6 ).element;

			const spy = vi.spyOn( gridElementsCollection.first, 'focus' );

			pressDownArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'arrowup at the first row moves focus to the one before last row if here is no item in the last row for this column', () => {
			// before: [ ][x][ ]	after: [ ][ ][ ]	key: ↑
			//         [ ][ ][ ]	       [ ][x][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 1 ).element;

			const spy = vi.spyOn( gridElementsCollection.get( 4 ), 'focus' );

			pressUpArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'arrowdown at the one before last row moves focus to the first row if here is no item in the last row for this column', () => {
			// before: [ ][ ][ ]	after: [ ][x][ ]	key: ↓
			//         [ ][x][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 4 ).element;

			const spy = vi.spyOn( gridElementsCollection.get( 1 ), 'focus' );

			pressDownArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'first and last item', () => {
		it( 'arrowleft moves focus to the last grid item if the first one was focused', () => {
			// before: [x][ ][ ]	after: [ ][ ][ ]	key: ←
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [x]
			focusTracker.focusedElement = gridElementsCollection.first.element;

			const spy = vi.spyOn( gridElementsCollection.last, 'focus' );

			pressLeftArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'arrowright moves focus to the first grid item if the last one was focused', () => {
			// before: [ ][ ][ ]	after: [x][ ][ ]	key: →
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [x]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.last.element;

			const spy = vi.spyOn( gridElementsCollection.first, 'focus' );

			pressRightArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'support for the dynamic number of columns in the grid via the callback', () => {
		let view, keystrokes, focusTracker, gridElementsCollection, numberOfColumnsStub;

		beforeEach( () => {
			view = new TestView();
			keystrokes = new KeystrokeHandler();
			focusTracker = new FocusTracker();

			view.render();

			gridElementsCollection = view.createCollection();

			for ( let i = 0; i < 7; i++ ) {
				const button = new ButtonView( new Locale() );

				button.render();
				gridElementsCollection.add( button );
				focusTracker.add( button.element );
			}

			numberOfColumnsStub = vi.fn().mockReturnValue( 2 );

			addKeyboardHandlingForGrid( {
				keystrokeHandler: keystrokes,
				focusTracker,
				gridItems: gridElementsCollection,
				numberOfColumns: numberOfColumnsStub
			} );

			keystrokes.listenTo( view.element );
		} );

		afterEach( () => {
			view.element.remove();
			view.destroy();
			keystrokes.destroy();
			focusTracker.destroy();
		} );

		it( 'should navigate considering the dynamic geometry of the grid', () => {
			// before: [x][ ]   after: [ ][ ]	key sequence: [→, →, ↓]
			//         [ ][ ]          [ ][ ]
			//         [ ][ ]          [x][ ]
			//         [ ]             [ ]
			focusTracker.focusedElement = gridElementsCollection.first.element;

			const spy0 = vi.spyOn( gridElementsCollection.get( 0 ), 'focus' );
			const spy1 = vi.spyOn( gridElementsCollection.get( 1 ), 'focus' );
			const spy2 = vi.spyOn( gridElementsCollection.get( 2 ), 'focus' );
			const spy3 = vi.spyOn( gridElementsCollection.get( 3 ), 'focus' );
			const spy4 = vi.spyOn( gridElementsCollection.get( 4 ), 'focus' );

			pressRightArrow( keystrokes );
			expect( spy1 ).toHaveBeenCalledOnce();
			focusTracker.focusedElement = gridElementsCollection.get( 1 ).element;

			pressRightArrow( keystrokes );
			expect( spy2 ).toHaveBeenCalledOnce();
			focusTracker.focusedElement = gridElementsCollection.get( 2 ).element;

			pressDownArrow( keystrokes );
			expect( spy4 ).toHaveBeenCalledOnce();
			focusTracker.focusedElement = gridElementsCollection.get( 4 ).element;

			// Let's simulate a responsive grid changing its geometry.
			numberOfColumnsStub.mockReturnValue( 3 );

			// before: [ ][ ][ ]   after: [x][ ][ ]	key sequence: [←, ↑]
			//         [ ][x][ ]          [ ][ ][ ]
			//         [ ]                [ ]
			pressLeftArrow( keystrokes );
			expect( spy3 ).toHaveBeenCalledOnce();
			focusTracker.focusedElement = gridElementsCollection.get( 3 ).element;

			pressUpArrow( keystrokes );
			expect( spy0 ).toHaveBeenCalledOnce();
			focusTracker.focusedElement = gridElementsCollection.get( 0 ).element;
		} );
	} );

	describe( 'arrows moves in rtl', () => {
		beforeEach( () => {
			view = new TestView( );
			keystrokes = new KeystrokeHandler();
			focusTracker = new FocusTracker();

			view.render();

			gridElementsCollection = view.createCollection();

			for ( let i = 0; i < 7; i++ ) {
				const button = new ButtonView( new Locale() );

				button.render();
				gridElementsCollection.add( button );
				focusTracker.add( button.element );
			}

			addKeyboardHandlingForGrid( {
				keystrokeHandler: keystrokes,
				focusTracker,
				gridItems: gridElementsCollection,
				numberOfColumns: 3,
				uiLanguageDirection: 'rtl'
			} );

			keystrokes.listenTo( view.element );
		} );

		afterEach( () => {
			view.element.remove();
			view.destroy();
			keystrokes.destroy();
			focusTracker.destroy();
		} );

		it( 'swap arrowleft with arrowright', () => {
			// before: [ ][x][ ]	after: [ ][ ][x]	key: ←
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 1 ).element;

			const spy = vi.spyOn( gridElementsCollection.get( 2 ), 'focus' );

			pressLeftArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'swap arrowright with arrowleft', () => {
			// before: [ ][x][ ]	after: [x][ ][ ]	key: ←
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 1 ).element;

			const spy = vi.spyOn( gridElementsCollection.get( 0 ), 'focus' );

			pressRightArrow( keystrokes );
			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	class TestView extends View {
		constructor( ...args ) {
			super( ...args );

			this.setTemplate( {
				tag: 'div'
			} );
		}
	}
} );

function pressRightArrow( keystrokes ) {
	const keyEvtData = {
		keyCode: keyCodes.arrowright,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	};

	keystrokes.press( keyEvtData );
}

function pressLeftArrow( keystrokes ) {
	const keyEvtData = {
		keyCode: keyCodes.arrowleft,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	};

	keystrokes.press( keyEvtData );
}

function pressUpArrow( keystrokes ) {
	const keyEvtData = {
		keyCode: keyCodes.arrowup,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	};

	keystrokes.press( keyEvtData );
}

function pressDownArrow( keystrokes ) {
	const keyEvtData = {
		keyCode: keyCodes.arrowdown,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	};

	keystrokes.press( keyEvtData );
}
