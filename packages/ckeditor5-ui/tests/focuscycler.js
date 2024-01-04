/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ViewCollection from '../src/viewcollection.js';
import View from '../src/view.js';
import FocusCycler, { isViewWithFocusCycler } from '../src/focuscycler.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'FocusCycler', () => {
	let focusables, focusTracker, cycler, viewIndex;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		focusables = new ViewCollection( [
			nonFocusable(),
			focusable(),
			focusable(),
			focusable(),
			nonFocusable()
		] );
		focusTracker = {
			focusedElement: null
		};
		cycler = new FocusCycler( {
			focusables,
			focusTracker
		} );
		viewIndex = 0;
	} );

	afterEach( () => {
		Array.from( document.querySelectorAll( '[focus-cycler-test-element]' ) ).forEach( element => element.remove() );
	} );

	describe( 'constructor()', () => {
		it( 'sets class properties', () => {
			expect( cycler.focusables ).to.equal( focusables );
			expect( cycler.focusTracker ).to.equal( focusTracker );
		} );
	} );

	describe( 'current()', () => {
		it( 'returns null when no view is focused', () => {
			expect( cycler.current ).to.equal( null );

			focusTracker.focusedElement = focusables.get( 2 ).element;
			expect( cycler.current ).to.equal( 2 );

			focusTracker.focusedElement = null;
			expect( cycler.current ).to.equal( null );
		} );
	} );

	describe( 'first()', () => {
		it( 'returns first focusable view', () => {
			expect( cycler.first ).to.equal( focusables.get( 1 ) );
		} );

		it( 'returns null when no focusable items', () => {
			focusables = new ViewCollection( [ nonFocusable(), nonFocusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.first ).to.be.null;
		} );

		it( 'returns null when no items', () => {
			focusables = new ViewCollection();
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.first ).to.be.null;
		} );

		it( 'should ignore items with an element detached from DOM', () => {
			focusables = new ViewCollection( [ focusable( { isDetached: true } ), focusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.first ).to.equal( focusables.get( 1 ) );
		} );

		it( 'should ignore items with display: none', () => {
			focusables = new ViewCollection( [ focusable( { display: 'none' } ), focusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.first ).to.equal( focusables.get( 1 ) );
		} );

		it( 'should ignore items with an element belonging to an invisible ancestor', () => {
			focusables = new ViewCollection( [ focusable( { hiddenParent: true } ), focusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.first ).to.equal( focusables.get( 1 ) );

			focusables.get( 0 ).element.parentNode.remove();
		} );
	} );

	describe( 'last()', () => {
		it( 'returns last focusable view', () => {
			expect( cycler.last ).to.equal( focusables.get( 3 ) );
		} );

		it( 'returns null when no focusable items', () => {
			focusables = new ViewCollection( [ nonFocusable(), nonFocusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.last ).to.be.null;
		} );

		it( 'returns null when no items', () => {
			focusables = new ViewCollection();
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.last ).to.be.null;
		} );

		it( 'should ignore items with an element detached from DOM', () => {
			focusables = new ViewCollection( [ focusable(), focusable( { isDetached: true } ) ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.last ).to.equal( focusables.get( 0 ) );
		} );

		it( 'should ignore items with display: none', () => {
			focusables = new ViewCollection( [ focusable(), focusable( { display: 'none' } ) ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.last ).to.equal( focusables.get( 0 ) );
		} );

		it( 'should ignore items with an element belonging to an invisible ancestor', () => {
			focusables = new ViewCollection( [ focusable(), focusable( { hiddenParent: true } ) ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.last ).to.equal( focusables.get( 0 ) );

			focusables.get( 1 ).element.parentNode.remove();
		} );
	} );

	describe( 'next()', () => {
		it( 'cycles to return the next focusable view', () => {
			focusTracker.focusedElement = focusables.get( 2 ).element;
			expect( cycler.next ).to.equal( focusables.get( 3 ) );

			focusTracker.focusedElement = focusables.get( 3 ).element;
			expect( cycler.next ).to.equal( focusables.get( 1 ) );

			focusTracker.focusedElement = focusables.get( 1 ).element;
			expect( cycler.next ).to.equal( focusables.get( 2 ) );
		} );

		it( 'focuses the first focusable view when no view is focused', () => {
			focusTracker.focusedElement = null;

			expect( cycler.next ).to.equal( focusables.get( 1 ) );
		} );

		it( 'returns null when no items', () => {
			focusables = new ViewCollection();
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.next ).to.be.null;
		} );

		it( 'returns null when no focusable items', () => {
			focusables = new ViewCollection( [ nonFocusable(), nonFocusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.next ).to.be.null;
		} );

		it( 'returns null if the only focusable in focusables', () => {
			focusables = new ViewCollection( [ nonFocusable(), focusable(), nonFocusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			focusTracker.focusedElement = focusables.get( 1 ).element;

			expect( cycler.first ).to.equal( focusables.get( 1 ) );
			expect( cycler.next ).to.be.null;
		} );

		it( 'should ignore items with an element detached from DOM', () => {
			const visibleFocusableA = focusable();
			const inVisibleFocusable = focusable( { isDetached: true } );
			const visibleFocusableB = focusable();

			focusables = new ViewCollection( [ visibleFocusableA, inVisibleFocusable, visibleFocusableB ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			focusTracker.focusedElement = focusables.get( 0 ).element;

			expect( cycler.first ).to.equal( focusables.get( 0 ) );
			expect( cycler.next ).to.equal( visibleFocusableB );
		} );

		it( 'should ignore items with display: none', () => {
			const visibleFocusableA = focusable();
			const inVisibleFocusable = focusable( { display: 'none' } );
			const visibleFocusableB = focusable();

			focusables = new ViewCollection( [ visibleFocusableA, inVisibleFocusable, visibleFocusableB ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			focusTracker.focusedElement = focusables.get( 0 ).element;

			expect( cycler.first ).to.equal( focusables.get( 0 ) );
			expect( cycler.next ).to.equal( visibleFocusableB );
		} );

		it( 'should ignore items with an element belonging to an invisible ancestor', () => {
			const visibleFocusableA = focusable();
			const visibleFocusableB = focusable();
			const inVisibleFocusable = focusable( { hiddenParent: true } );

			focusables = new ViewCollection( [ visibleFocusableA, inVisibleFocusable, visibleFocusableB ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			focusTracker.focusedElement = focusables.get( 0 ).element;

			expect( cycler.first ).to.equal( focusables.get( 0 ) );
			expect( cycler.next ).to.equal( visibleFocusableB );

			inVisibleFocusable.element.parentNode.remove();
		} );
	} );

	describe( 'previous()', () => {
		it( 'cycles to return the previous focusable view', () => {
			focusTracker.focusedElement = focusables.get( 1 ).element;
			expect( cycler.previous ).to.equal( focusables.get( 3 ) );

			focusTracker.focusedElement = focusables.get( 2 ).element;
			expect( cycler.previous ).to.equal( focusables.get( 1 ) );

			focusTracker.focusedElement = focusables.get( 3 ).element;
			expect( cycler.previous ).to.equal( focusables.get( 2 ) );
		} );

		it( 'focuses the last focusable view when no view is focused', () => {
			focusTracker.focusedElement = null;

			expect( cycler.previous ).to.equal( focusables.get( 3 ) );
		} );

		it( 'returns null when no items', () => {
			focusables = new ViewCollection();
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.previous ).to.be.null;
		} );

		it( 'returns null when no focusable items', () => {
			focusables = new ViewCollection( [ nonFocusable(), nonFocusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( cycler.previous ).to.be.null;
		} );

		it( 'returns null if the only focusable in focusables', () => {
			focusables = new ViewCollection( [ nonFocusable(), focusable(), nonFocusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			focusTracker.focusedElement = focusables.get( 1 ).element;

			expect( cycler.first ).to.equal( focusables.get( 1 ) );
			expect( cycler.previous ).to.be.null;
		} );

		it( 'should ignore items with an element detached from DOM', () => {
			const visibleFocusableA = focusable();
			const inVisibleFocusable = focusable( { isDetached: true } );
			const visibleFocusableB = focusable();

			focusables = new ViewCollection( [ visibleFocusableA, inVisibleFocusable, visibleFocusableB ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			focusTracker.focusedElement = focusables.get( 2 ).element;

			expect( cycler.first ).to.equal( focusables.get( 0 ) );
			expect( cycler.previous ).to.equal( visibleFocusableA );
		} );

		it( 'should ignore items with display: none', () => {
			const visibleFocusableA = focusable();
			const inVisibleFocusable = focusable( { display: 'none' } );
			const visibleFocusableB = focusable();

			focusables = new ViewCollection( [ visibleFocusableA, inVisibleFocusable, visibleFocusableB ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			focusTracker.focusedElement = focusables.get( 2 ).element;

			expect( cycler.first ).to.equal( focusables.get( 0 ) );
			expect( cycler.previous ).to.equal( visibleFocusableA );
		} );

		it( 'should ignore items with an element belonging to an invisible ancestor', () => {
			const visibleFocusableA = focusable();
			const visibleFocusableB = focusable();
			const inVisibleFocusable = focusable( { hiddenParent: true } );

			focusables = new ViewCollection( [ visibleFocusableA, inVisibleFocusable, visibleFocusableB ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			focusTracker.focusedElement = focusables.get( 2 ).element;

			expect( cycler.first ).to.equal( focusables.get( 0 ) );
			expect( cycler.next ).to.equal( visibleFocusableA );

			inVisibleFocusable.element.parentNode.remove();
		} );
	} );

	describe( 'focusFirst()', () => {
		it( 'focuses first focusable view', () => {
			cycler.focusFirst();

			sinon.assert.calledOnce( focusables.get( 1 ).focus );
		} );

		it( 'does not throw when no focusable items', () => {
			focusables = new ViewCollection( [ nonFocusable(), nonFocusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( () => {
				cycler.focusFirst();
			} ).to.not.throw();
		} );

		it( 'does not throw when no items', () => {
			focusables = new ViewCollection();
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( () => {
				cycler.focusFirst();
			} ).to.not.throw();
		} );

		it( 'ignores invisible items', () => {
			const item = focusable();

			focusables = new ViewCollection( [ nonFocusable(), focusable( { display: 'none' } ), item ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			cycler.focusFirst();
			sinon.assert.calledOnce( item.focus );
		} );
	} );

	describe( 'focusLast()', () => {
		it( 'focuses last focusable view', () => {
			cycler.focusLast();

			sinon.assert.calledOnce( focusables.get( 3 ).focus );
		} );

		it( 'does not throw when no focusable items', () => {
			focusables = new ViewCollection( [ nonFocusable(), nonFocusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( () => {
				cycler.focusLast();
			} ).to.not.throw();
		} );

		it( 'does not throw when no items', () => {
			focusables = new ViewCollection();
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( () => {
				cycler.focusLast();
			} ).to.not.throw();
		} );
	} );

	describe( 'focusNext()', () => {
		it( 'focuses next focusable view', () => {
			focusTracker.focusedElement = focusables.get( 2 ).element;
			cycler.focusNext();

			sinon.assert.calledOnce( focusables.get( 3 ).focus );
		} );

		it( 'does not throw when no focusable items', () => {
			focusables = new ViewCollection( [ nonFocusable(), nonFocusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( () => {
				cycler.focusNext();
			} ).to.not.throw();
		} );

		it( 'does not throw when no items', () => {
			focusables = new ViewCollection();
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( () => {
				cycler.focusNext();
			} ).to.not.throw();
		} );

		it( 'does not refocus if there is only one focusable item', () => {
			focusables = new ViewCollection( [ focusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );
			focusTracker.focusedElement = focusables.get( 0 ).element;

			cycler.focusNext();
			sinon.assert.notCalled( focusables.get( 0 ).focus );
		} );

		it( 'fires an event while making full cycle back to the beginning', () => {
			focusables = new ViewCollection( [ focusable(), focusable(), focusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );
			focusTracker.focusedElement = focusables.get( 2 ).element;

			const forwardCycleSpy = sinon.spy();
			const backwardCycleSpy = sinon.spy();

			cycler.on( 'forwardCycle', forwardCycleSpy );
			cycler.on( 'backwardCycle', backwardCycleSpy );

			cycler.focusNext();
			focusTracker.focusedElement = focusables.get( 0 ).element;
			cycler.focusNext();

			sinon.assert.calledOnce( forwardCycleSpy );
			sinon.assert.notCalled( backwardCycleSpy );
		} );

		it( 'fires an event that allows custom behavior once stopped on the normal priority', () => {
			focusables = new ViewCollection( [ focusable(), focusable(), focusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );
			focusTracker.focusedElement = focusables.get( 2 ).element;

			cycler.on( 'forwardCycle', evt => {
				evt.stop();
			} );

			cycler.focusNext();

			sinon.assert.notCalled( focusables.get( 0 ).focus );
		} );
	} );

	describe( 'focusPrevious()', () => {
		it( 'focuses previous focusable view', () => {
			focusTracker.focusedElement = focusables.get( 1 ).element;
			cycler.focusPrevious();

			sinon.assert.calledOnce( focusables.get( 3 ).focus );
		} );

		it( 'does not throw when no focusable items', () => {
			focusables = new ViewCollection( [ nonFocusable(), nonFocusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( () => {
				cycler.focusPrevious();
			} ).to.not.throw();
		} );

		it( 'does not throw when no items', () => {
			focusables = new ViewCollection();
			cycler = new FocusCycler( { focusables, focusTracker } );

			expect( () => {
				cycler.focusPrevious();
			} ).to.not.throw();
		} );

		it( 'does not refocus if there is only one focusable item', () => {
			focusables = new ViewCollection( [ focusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );
			focusTracker.focusedElement = focusables.get( 0 ).element;

			cycler.focusPrevious();
			sinon.assert.notCalled( focusables.get( 0 ).focus );
		} );

		it( 'fires an event while making full cycle back to the end', () => {
			focusables = new ViewCollection( [ focusable(), focusable(), focusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );
			focusTracker.focusedElement = focusables.get( 0 ).element;

			const forwardCycleSpy = sinon.spy();
			const backwardCycleSpy = sinon.spy();

			cycler.on( 'forwardCycle', forwardCycleSpy );
			cycler.on( 'backwardCycle', backwardCycleSpy );

			cycler.focusPrevious();
			focusTracker.focusedElement = focusables.get( 2 ).element;
			cycler.focusPrevious();

			sinon.assert.notCalled( forwardCycleSpy );
			sinon.assert.calledOnce( backwardCycleSpy );
		} );

		it( 'fires an event that allows custom behavior once stopped on the normal priority', () => {
			focusables = new ViewCollection( [ focusable(), focusable(), focusable() ] );
			cycler = new FocusCycler( { focusables, focusTracker } );
			focusTracker.focusedElement = focusables.get( 0 ).element;

			cycler.on( 'backwardCycle', evt => {
				evt.stop();
			} );

			cycler.focusPrevious();

			sinon.assert.notCalled( focusables.get( 2 ).focus );
		} );
	} );

	describe( 'keystrokes', () => {
		it( 'creates event listeners', () => {
			const keystrokeHandler = new KeystrokeHandler();

			cycler = new FocusCycler( {
				focusables, focusTracker, keystrokeHandler,
				actions: {
					focusPrevious: 'arrowup',
					focusNext: 'arrowdown'
				}
			} );

			const keyEvtData = {
				keyCode: keyCodes.arrowup,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			const spy1 = sinon.spy( cycler, 'focusPrevious' );
			const spy2 = sinon.spy( cycler, 'focusNext' );

			keystrokeHandler.press( keyEvtData );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
			sinon.assert.notCalled( spy2 );

			keyEvtData.keyCode = keyCodes.arrowdown;

			keystrokeHandler.press( keyEvtData );

			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledTwice( keyEvtData.preventDefault );
			sinon.assert.calledTwice( keyEvtData.stopPropagation );
			sinon.assert.calledOnce( spy2 );
		} );

		it( 'supports array keystroke syntax', () => {
			const keystrokeHandler = new KeystrokeHandler();

			cycler = new FocusCycler( {
				focusables, focusTracker, keystrokeHandler,
				actions: {
					focusPrevious: [ 'arrowup', 'arrowleft' ]
				}
			} );

			const keyEvtData = {
				keyCode: keyCodes.arrowleft,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			const spy = sinon.spy( cycler, 'focusPrevious' );

			keystrokeHandler.press( keyEvtData );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledOnce( keyEvtData.preventDefault );
			sinon.assert.calledOnce( keyEvtData.stopPropagation );
		} );
	} );

	describe( 'isViewWithFocusCycler', () => {
		it( 'should return true if the view has its own focus cycler instance', () => {
			expect( isViewWithFocusCycler( viewWithFocusCycler() ) ).to.be.true;
		} );

		it( 'should return false if the view does not have a focus cycler instance', () => {
			expect( isViewWithFocusCycler( new View() ) ).to.be.false;
		} );
	} );

	function nonFocusable( { display = 'block', isDetached = false, hiddenParent = false } = {} ) {
		const view = new View();
		view.element = document.createElement( 'div' );
		view.element.setAttribute( 'focus-cycler-test-element', viewIndex++ );
		view.element.style.display = display;

		if ( hiddenParent ) {
			const invisibleParent = document.createElement( 'div' );
			invisibleParent.style.display = 'none';
			invisibleParent.appendChild( view.element );
			document.body.appendChild( invisibleParent );
		} else if ( !isDetached ) {
			document.body.appendChild( view.element );
		}

		return view;
	}

	function focusable( ...args ) {
		const view = nonFocusable( ...args );

		view.focus = sinon.spy();

		return view;
	}

	function viewWithFocusCycler() {
		const view = new View();
		view.element = document.createElement( 'div' );

		const focusCycler = new FocusCycler( {
			focusables: new ViewCollection( [ view ] ),
			focusTracker: {
				focusedElement: null
			}
		} );

		view.focus = sinon.spy();
		view.focusCycler = focusCycler;

		return view;
	}
} );

