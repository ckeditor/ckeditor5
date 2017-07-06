/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import History from '../../src/model/history';
import Delta from '../../src/model/delta/delta';
import Operation from '../../src/model/operation/operation';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

describe( 'History', () => {
	let history;

	beforeEach( () => {
		history = new History();
	} );

	describe( 'constructor()', () => {
		it( 'should create an empty History instance', () => {
			expect( Array.from( history.getDeltas() ).length ).to.equal( 0 );
		} );
	} );

	describe( 'addDelta', () => {
		it( 'should save delta in the history', () => {
			const delta = new Delta();
			delta.addOperation( new Operation( 0 ) );

			history.addDelta( delta );

			const deltas = Array.from( history.getDeltas() );
			expect( deltas.length ).to.equal( 1 );
			expect( deltas[ 0 ] ).to.equal( delta );
		} );

		it( 'should save each delta only once', () => {
			const delta = new Delta();
			delta.addOperation( new Operation( 0 ) );

			history.addDelta( delta );
			history.addDelta( delta );

			const deltas = Array.from( history.getDeltas() );
			expect( deltas.length ).to.equal( 1 );
			expect( deltas[ 0 ] ).to.equal( delta );
		} );

		it( 'should save multiple deltas and keep their order', () => {
			const deltas = getDeltaSet();

			for ( const delta of deltas ) {
				history.addDelta( delta );
			}

			const historyDeltas = Array.from( history.getDeltas() );
			expect( historyDeltas ).to.deep.equal( deltas );
		} );

		it( 'should skip deltas that does not have operations', () => {
			const delta = new Delta();

			history.addDelta( delta );

			expect( Array.from( history.getDeltas() ).length ).to.equal( 0 );
		} );
	} );

	describe( 'getDelta', () => {
		it( 'should return delta with given base version', () => {
			const delta = getDelta( 0 );
			history.addDelta( delta );

			const historyDelta = history.getDelta( 0 );
			expect( historyDelta ).to.equal( delta );
		} );

		it( 'should return null if delta has not been found in history', () => {
			expect( history.getDelta( -1 ) ).to.be.null;
			expect( history.getDelta( 2 ) ).to.be.null;
			expect( history.getDelta( 20 ) ).to.be.null;
		} );
	} );

	describe( 'getDeltas', () => {
		let deltas;

		beforeEach( () => {
			deltas = getDeltaSet();

			for ( const delta of deltas ) {
				history.addDelta( delta );
			}
		} );

		it( 'should return only history deltas from given base version', () => {
			const historyDeltas = Array.from( history.getDeltas( 3 ) );
			expect( historyDeltas ).to.deep.equal( deltas.slice( 1 ) );
		} );

		it( 'should return only history deltas to given base version', () => {
			const historyDeltas = Array.from( history.getDeltas( 3, 6 ) );
			expect( historyDeltas ).to.deep.equal( deltas.slice( 1, 2 ) );
		} );

		it( 'should return empty (finished) iterator if given history point is too high or negative', () => {
			expect( Array.from( history.getDeltas( 20 ) ).length ).to.equal( 0 );
			expect( Array.from( history.getDeltas( -1 ) ).length ).to.equal( 0 );
		} );

		it( 'should throw if given history point is "inside" delta', () => {
			expect( () => {
				Array.from( history.getDeltas( 2 ) );
			} ).to.throw( CKEditorError, /model-history-wrong-version/ );
		} );
	} );

	describe( 'isUndoingDelta', () => {
		let undoing, undone;

		beforeEach( () => {
			undoing = new Delta();
			undone = new Delta();

			history.addDelta( undone );
			history.addDelta( undoing );

			history.setDeltaAsUndone( undone, undoing );
		} );

		it( 'should return true if delta is an undoing delta', () => {
			expect( history.isUndoingDelta( undoing ) ).to.be.true;
		} );

		it( 'should return false if delta is not an undoing delta', () => {
			const delta = new Delta();

			expect( history.isUndoingDelta( undone ) ).to.be.false;
			expect( history.isUndoingDelta( delta ) ).to.be.false;
		} );
	} );

	describe( 'isUndoneDelta', () => {
		let undoing, undone;

		beforeEach( () => {
			undoing = new Delta();
			undone = new Delta();

			history.addDelta( undone );
			history.addDelta( undoing );

			history.setDeltaAsUndone( undone, undoing );
		} );

		it( 'should return true if delta has been set as undone', () => {
			expect( history.isUndoneDelta( undone ) ).to.be.true;
		} );

		it( 'should return false if delta has not been set as undone', () => {
			const delta = new Delta();

			expect( history.isUndoneDelta( undoing ) ).to.be.false;
			expect( history.isUndoneDelta( delta ) ).to.be.false;
		} );
	} );

	describe( 'getUndoneDelta', () => {
		let undoing, undone;

		beforeEach( () => {
			undoing = new Delta();
			undone = new Delta();

			history.addDelta( undone );
			history.addDelta( undoing );

			history.setDeltaAsUndone( undone, undoing );
		} );

		it( 'should return undone delta basing on undoing delta', () => {
			expect( history.getUndoneDelta( undoing ) ).to.equal( undone );
		} );

		it( 'should return undefined if given delta is not an undoing delta', () => {
			const delta = new Delta();

			expect( history.getUndoneDelta( undone ) ).to.be.undefined;
			expect( history.getUndoneDelta( delta ) ).to.be.undefined;
		} );
	} );
} );

function getDeltaSet() {
	const deltas = [];

	deltas.push( getDelta( 0 ) );
	deltas.push( getDelta( 3 ) );
	deltas.push( getDelta( 6 ) );

	return deltas;
}

function getDelta( baseVersion ) {
	const delta = new Delta();

	for ( let i = 0; i < 3; i++ ) {
		delta.addOperation( new Operation( i + baseVersion ) );
	}

	return delta;
}
