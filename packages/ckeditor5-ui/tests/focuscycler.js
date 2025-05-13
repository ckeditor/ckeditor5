/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ViewCollection from '../src/viewcollection.js';
import View from '../src/view.js';
import FocusCycler, { isViewWithFocusCycler } from '../src/focuscycler.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { FocusTracker, wait } from '@ckeditor/ckeditor5-utils';

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
			expect( cycler.next ).to.equal( focusables.get( 1 ) );
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
			expect( cycler.previous ).to.equal( focusables.get( 1 ) );
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

	describe( 'chain()', () => {
		let rootFocusablesCollection, rootFocusTracker, rootCycler;
		let viewBFocusablesCollection, viewBFocusTracker, viewBCycler;

		beforeEach( () => {
			( {
				focusCycler: rootCycler,
				focusTracker: rootFocusTracker,
				focusables: rootFocusablesCollection
			} = getCycleTestTools() );

			( {
				focusCycler: viewBCycler,
				focusTracker: viewBFocusTracker,
				focusables: viewBFocusablesCollection
			} = getCycleTestTools() );
		} );

		it( 'should allow for continuous cycling across two focus cyclers ("forwardCycle" event handling)', async () => {
			// This test creates the following structure and starts cycling forward over children of <B>
			// to see whether the focus will exit <B> and move to <C>.
			//
			// 	<A />
			// 	<B>
			// 		<BA />             <-- start here and go forward
			// 		<BB />
			// 	</B>
			// 	<C />

			const viewBChildren = [
				focusable( { dataset: {
					id: 'BA'
				} } ),
				focusable( { dataset: {
					id: 'BB'
				} } )
			];

			const viewB = focusable( {
				children: [ ...viewBChildren ],
				dataset: {
					id: 'B'
				}
			} );

			rootFocusablesCollection.addMany( [
				focusable( { dataset: {
					id: 'A'
				} } ),
				viewB,
				focusable( { dataset: {
					id: 'C'
				} } )
			] );

			viewBFocusablesCollection.addMany( viewBChildren );
			rootCycler.chain( viewBCycler );

			// ---------------------------------------------------------------------------

			expect( rootFocusTracker.focusedElement ).to.equal( null );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );

			viewBCycler.focusFirst();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( viewB.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( viewBFocusablesCollection.first.element );

			// ---------------------------------------------------------------------------

			viewBCycler.focusNext();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( viewB.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( viewBFocusablesCollection.get( 1 ).element );

			// ---------------------------------------------------------------------------

			// This should exit the chained view and continue in the parent view.
			viewBCycler.focusNext();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( rootFocusablesCollection.get( 2 ).element );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );

			// ---------------------------------------------------------------------------

			rootCycler.focusNext();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( rootFocusablesCollection.get( 0 ).element );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );
		} );

		it( 'should allow for continuous cycling across two focus cyclers ("backwardCycle" event handling)', async () => {
			// This test creates the following structure and starts cycling backward over children of <B>
			// to see whether the focus will exit <B> and move to <A>.
			//
			// 	<A />
			// 	<B>
			// 		<BA />
			// 		<BB />             <-- start here and go backward
			// 	</B>
			// 	<C />

			const viewBChildren = [
				focusable( { dataset: {
					id: 'BA'
				} } ),
				focusable( { dataset: {
					id: 'BB'
				} } )
			];

			const viewB = focusable( {
				children: [ ...viewBChildren ],
				dataset: {
					id: 'B'
				}
			} );

			rootFocusablesCollection.addMany( [
				focusable( { dataset: {
					id: 'A'
				} } ),
				viewB,
				focusable( { dataset: {
					id: 'C'
				} } )
			] );

			viewBFocusablesCollection.addMany( viewBChildren );
			rootCycler.chain( viewBCycler );

			// ---------------------------------------------------------------------------

			expect( rootFocusTracker.focusedElement ).to.equal( null );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );

			viewBCycler.focusLast();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( viewB.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( viewBFocusablesCollection.last.element );

			// ---------------------------------------------------------------------------

			viewBCycler.focusPrevious();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( viewB.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( viewBFocusablesCollection.first.element );

			// ---------------------------------------------------------------------------

			// This should exit the chained view and continue in the parent view.
			viewBCycler.focusPrevious();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( rootFocusablesCollection.first.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );

			// ---------------------------------------------------------------------------
			rootCycler.focusPrevious();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( rootFocusablesCollection.last.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );
		} );

		it( 'should allow for cycling in deep chains with single focusable view at some levels (forward)', async () => {
			// 	<A />
			// 	<B>
			// 		<BA />
			// 			<BAA />
			// 			<BAB />
			// 		</BA>
			// 	</B>

			const {
				focusCycler: viewBACycler,
				focusTracker: viewBAFocusTracker,
				focusables: viewBAFocusablesCollection
			} = getCycleTestTools();

			const viewBAChildren = [
				focusable( { dataset: {
					id: 'BAA'
				} } ),
				focusable( { dataset: {
					id: 'BAB'
				} } )
			];

			const viewBA = focusable( {
				children: [ ...viewBAChildren ],
				dataset: {
					id: 'BA'
				}
			} );

			viewBAFocusablesCollection.addMany( viewBAChildren );

			const viewBChildren = [
				viewBA
			];

			const viewB = focusable( {
				children: [ ...viewBChildren ],
				dataset: {
					id: 'B'
				}
			} );

			viewBFocusablesCollection.addMany( viewBChildren );

			rootFocusablesCollection.addMany( [
				focusable( { dataset: {
					id: 'A'
				} } ),
				viewB
			] );

			rootCycler.chain( viewBCycler );
			viewBCycler.chain( viewBACycler );

			// ---------------------------------------------------------------------------

			expect( rootFocusTracker.focusedElement ).to.equal( null );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );
			expect( viewBAFocusTracker.focusedElement ).to.equal( null );

			// 	<A />
			// 	<B>
			// 		<BA />
			// 			<BAA />			<-- focus goes here
			// 			<BAB />
			// 		</BA>
			// 	</B>
			viewBACycler.focusFirst();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( viewB.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( viewBA.element );
			expect( viewBAFocusTracker.focusedElement ).to.equal( viewBAFocusablesCollection.first.element );

			// 	<A />
			// 	<B>
			// 		<BA />
			// 			<BAA />
			// 			<BAB />			<-- focus goes here
			// 		</BA>
			// 	</B>
			viewBACycler.focusNext();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( viewB.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( viewBA.element );
			expect( viewBAFocusTracker.focusedElement ).to.equal( viewBAFocusablesCollection.last.element );

			// This should exit the chained view and continue to <A> because there's no other view at the <B> level to focus.
			//
			// 	<A />			<-- focus goes here
			// 	<B>
			// 		<BA />
			// 			<BAA />
			// 			<BAB />
			// 		</BA>
			// 	</B>
			viewBACycler.focusNext();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( rootFocusablesCollection.first.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );
			expect( viewBAFocusTracker.focusedElement ).to.equal( null );
		} );

		it( 'should allow for cycling in deep chains with single focusable view at some levels (backward)', async () => {
			// 	<A />
			// 	<B>
			// 		<BA />
			// 			<BAA />
			// 			<BAB />
			// 		</BA>
			// 	</B>

			const {
				focusCycler: viewBACycler,
				focusTracker: viewBAFocusTracker,
				focusables: viewBAFocusablesCollection
			} = getCycleTestTools();

			const viewBAChildren = [
				focusable( { dataset: {
					id: 'BAA'
				} } ),
				focusable( { dataset: {
					id: 'BAB'
				} } )
			];

			const viewBA = focusable( {
				children: [ ...viewBAChildren ],
				dataset: {
					id: 'BA'
				}
			} );

			viewBAFocusablesCollection.addMany( viewBAChildren );

			const viewBChildren = [
				viewBA
			];

			const viewB = focusable( {
				children: [ ...viewBChildren ],
				dataset: {
					id: 'B'
				}
			} );

			viewBFocusablesCollection.addMany( viewBChildren );

			rootFocusablesCollection.addMany( [
				focusable( { dataset: {
					id: 'A'
				} } ),
				viewB
			] );

			rootCycler.chain( viewBCycler );
			viewBCycler.chain( viewBACycler );

			// ---------------------------------------------------------------------------

			expect( rootFocusTracker.focusedElement ).to.equal( null );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );
			expect( viewBAFocusTracker.focusedElement ).to.equal( null );

			// 	<A />
			// 	<B>
			// 		<BA />
			// 			<BAA />
			// 			<BAB />			<-- focus goes here
			// 		</BA>
			// 	</B>
			viewBACycler.focusLast();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( viewB.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( viewBA.element );
			expect( viewBAFocusTracker.focusedElement ).to.equal( viewBAFocusablesCollection.last.element );

			// 	<A />
			// 	<B>
			// 		<BA />
			// 			<BAA />			<-- focus goes here
			// 			<BAB />
			// 		</BA>
			// 	</B>
			viewBACycler.focusPrevious();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( viewB.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( viewBA.element );
			expect( viewBAFocusTracker.focusedElement ).to.equal( viewBAFocusablesCollection.first.element );

			// This should exit the chained view and continue to <A> because there's no other view at the <B> level to focus.
			//
			// 	<A />			<-- focus goes here
			// 	<B>
			// 		<BA />
			// 			<BAA />
			// 			<BAB />
			// 		</BA>
			// 	</B>
			viewBACycler.focusPrevious();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( rootFocusablesCollection.first.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );
			expect( viewBAFocusTracker.focusedElement ).to.equal( null );
		} );

		it( 'should work for focus cycler of views that do not contain one another (horizontal navigation)', async () => {
			// This test creates the following structure and starts cycling forward over children of <B>
			// to see whether the focus will exit <B> and move to <C>.
			//
			// 	<AA />
			// 	<AB />
			//
			// 	<BA />             <-- start here and go forward
			// 	<BB />

			rootFocusablesCollection.addMany( [
				focusable( { dataset: {
					id: 'AA'
				} } ),
				focusable( { dataset: {
					id: 'AB'
				} } )
			] );

			viewBFocusablesCollection.addMany( [
				focusable( { dataset: {
					id: 'BA'
				} } ),
				focusable( { dataset: {
					id: 'BB'
				} } )
			] );

			rootCycler.chain( viewBCycler );

			// ---------------------------------------------------------------------------

			expect( rootFocusTracker.focusedElement ).to.equal( null );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );

			viewBCycler.focusFirst();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( null );
			expect( viewBFocusTracker.focusedElement ).to.equal( viewBFocusablesCollection.first.element );

			// ---------------------------------------------------------------------------

			viewBCycler.focusNext();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( null );
			expect( viewBFocusTracker.focusedElement ).to.equal( viewBFocusablesCollection.get( 1 ).element );

			// ---------------------------------------------------------------------------

			// This should exit the chained view and continue in the parent view.
			viewBCycler.focusNext();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( rootFocusablesCollection.first.element );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );

			// ---------------------------------------------------------------------------

			rootCycler.focusNext();
			await wait( 10 );
			expect( rootFocusTracker.focusedElement ).to.equal( rootFocusablesCollection.get( 1 ).element );
			expect( viewBFocusTracker.focusedElement ).to.equal( null );
		} );
	} );

	describe( 'unchain()', () => {
		it( 'should stop listening to another focus cycler', () => {
			const { focusCycler: focusCyclerA } = getCycleTestTools();
			const { focusCycler: focusCyclerB } = getCycleTestTools();

			const spy = sinon.spy( focusCyclerA, 'stopListening' );

			focusCyclerA.unchain( focusCyclerB );

			sinon.assert.calledWithExactly( spy, focusCyclerB );
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

		it( 'should support keystroke handler filtering', () => {
			const keystrokeHandler = new KeystrokeHandler();

			cycler = new FocusCycler( {
				focusables, focusTracker, keystrokeHandler,
				actions: {
					focusPrevious: [ 'arrowup', 'arrowleft' ]
				},
				keystrokeHandlerOptions: {
					filter: evt => evt.foo
				}
			} );

			const keyEvtData = {
				keyCode: keyCodes.arrowleft,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			const spy = sinon.spy( cycler, 'focusPrevious' );

			keystrokeHandler.press( keyEvtData );

			sinon.assert.notCalled( spy );

			keyEvtData.foo = true;
			keystrokeHandler.press( keyEvtData );
			sinon.assert.calledOnce( spy );
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

	function nonFocusable( { display = 'block', isDetached = false, hiddenParent = false, children = [], dataset = {} } = {} ) {
		const view = new View();
		view.element = document.createElement( 'div' );
		view.element.setAttribute( 'focus-cycler-test-element', viewIndex++ );
		view.element.style.display = display;

		for ( const child of children ) {
			view.element.appendChild( child.element );
		}

		for ( const key in dataset ) {
			view.element.dataset[ key ] = dataset[ key ];
		}

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

		view.focus = () => {
			view.element.focus();
		};

		view.element.setAttribute( 'tabindex', -1 );

		sinon.spy( view, 'focus' );

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

	function getCycleTestTools() {
		const focusables = new ViewCollection();
		const focusTracker = new FocusTracker();

		focusables.on( 'change', ( evt, { added, removed } ) => {
			for ( const view of added ) {
				focusTracker.add( view.element );
			}

			for ( const view of removed ) {
				focusTracker.remove( view.element );
			}
		} );

		const focusCycler = new FocusCycler( {
			focusables,
			focusTracker
		} );

		return { focusCycler, focusTracker, focusables };
	}
} );

