/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ViewCollection from '../src/viewcollection';
import View from '../src/view';
import FocusCycler from '../src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'FocusCycler', () => {
	let focusables, focusTracker, cycler;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( global.window, 'getComputedStyle' );
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

			focusables = new ViewCollection( [ nonFocusable(), focusable( true ), item ] );
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
					focusPrevious: [ 'arrowup', 'arrowleft' ],
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
} );

function nonFocusable( isHidden ) {
	const view = new View();
	view.element = Math.random();

	global.window.getComputedStyle
		.withArgs( view.element )
		.returns( {
			display: isHidden ? 'none' : 'block'
		} );

	return view;
}

function focusable( isHidden ) {
	const view = nonFocusable( isHidden );

	view.focus = sinon.spy();

	return view;
}
