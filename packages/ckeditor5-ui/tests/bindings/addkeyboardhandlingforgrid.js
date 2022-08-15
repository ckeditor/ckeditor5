/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import addKeyboardHandlingForGrid from '../../src/bindings/addkeyboardhandlingforgrid';
import View from '../../src/view';
import ButtonView from '../../src/button/buttonview';
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

			const spy = sinon.spy( gridElementsCollection.get( 1 ), 'focus' );

			pressRightArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );

		it( 'arrowleft moves focus to the previous grid item', () => {
			// before: [ ][x][ ]	after: [x][ ][ ]	key: ←
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 1 ).element;

			const spy = sinon.spy( gridElementsCollection.get( 0 ), 'focus' );

			pressLeftArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );

		it( 'arrowdown moves focus 1 row below the grid item in the same column', () => {
			// before: [x][ ][ ]	after: [ ][ ][ ]	key: ↓
			//         [ ][ ][ ]	       [x][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.first.element;

			const spy = sinon.spy( gridElementsCollection.get( 3 ), 'focus' );

			pressDownArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );

		it( 'arrowup moves focus 1 row above the grid item in the same column', () => {
			// before: [ ][ ][ ]	after: [x][ ][ ]	key: ↑
			//         [x][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 3 ).element;

			const spy = sinon.spy( gridElementsCollection.first, 'focus' );

			pressUpArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'arrow moves at the edges', () => {
		it( 'arrowright at the last column moves focus to the beginning of the next row in the first column', () => {
			// before: [ ][ ][x]	after: [ ][ ][ ]	key: →
			//         [ ][ ][ ]	       [x][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 2 ).element;

			const spy = sinon.spy( gridElementsCollection.get( 3 ), 'focus' );

			pressRightArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );

		it( 'arrowleft at the first column moves focus to the end of the previous row in the last column', () => {
			// before: [ ][ ][ ]	after: [ ][ ][x]	key: ←
			//         [x][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 3 ).element;

			const spy = sinon.spy( gridElementsCollection.get( 2 ), 'focus' );

			pressLeftArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );

		it( 'arrowup at the first row moves focus to the last row in the same column', () => {
			// before: [x][ ][ ]	after: [ ][ ][ ]	key: ↑
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [x]
			focusTracker.focusedElement = gridElementsCollection.first.element;

			const spy = sinon.spy( gridElementsCollection.get( 6 ), 'focus' );

			pressUpArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );

		it( 'arrowdown at the last row moves focus to the first row in the same column', () => {
			// before: [ ][ ][ ]	after: [x][ ][ ]	key: ↓
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [x]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 6 ).element;

			const spy = sinon.spy( gridElementsCollection.first, 'focus' );

			pressDownArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );

		it( 'arrowup at the first row moves focus to the one before last row if here is no item in the last row for this column', () => {
			// before: [ ][x][ ]	after: [ ][ ][ ]	key: ↑
			//         [ ][ ][ ]	       [ ][x][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 1 ).element;

			const spy = sinon.spy( gridElementsCollection.get( 4 ), 'focus' );

			pressUpArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );

		it( 'arrowdown at the one before last row moves focus to the first row if here is no item in the last row for this column', () => {
			// before: [ ][ ][ ]	after: [ ][x][ ]	key: ↓
			//         [ ][x][ ]	       [ ][ ][ ]
			//         [ ]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.get( 4 ).element;

			const spy = sinon.spy( gridElementsCollection.get( 1 ), 'focus' );

			pressDownArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'first and last item', () => {
		it( 'arrowleft moves focus to the last grid item if the first one was focused', () => {
			// before: [x][ ][ ]	after: [ ][ ][ ]	key: ←
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [ ]      	       [x]
			focusTracker.focusedElement = gridElementsCollection.first.element;

			const spy = sinon.spy( gridElementsCollection.last, 'focus' );

			pressLeftArrow( keystrokes );
			sinon.assert.calledOnce( spy );
		} );

		it( 'arrowright moves focus to the first grid item if the last one was focused', () => {
			// before: [ ][ ][ ]	after: [x][ ][ ]	key: →
			//         [ ][ ][ ]	       [ ][ ][ ]
			//         [x]      	       [ ]
			focusTracker.focusedElement = gridElementsCollection.last.element;

			const spy = sinon.spy( gridElementsCollection.first, 'focus' );

			pressRightArrow( keystrokes );
			sinon.assert.calledOnce( spy );
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
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	};

	keystrokes.press( keyEvtData );
}

function pressLeftArrow( keystrokes ) {
	const keyEvtData = {
		keyCode: keyCodes.arrowleft,
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	};

	keystrokes.press( keyEvtData );
}

function pressUpArrow( keystrokes ) {
	const keyEvtData = {
		keyCode: keyCodes.arrowup,
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	};

	keystrokes.press( keyEvtData );
}

function pressDownArrow( keystrokes ) {
	const keyEvtData = {
		keyCode: keyCodes.arrowdown,
		preventDefault: sinon.spy(),
		stopPropagation: sinon.spy()
	};

	keystrokes.press( keyEvtData );
}
