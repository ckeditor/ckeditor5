/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import History from '/ckeditor5/engine/model/history.js';
import Delta from '/ckeditor5/engine/model/delta/delta.js';
import Operation from '/ckeditor5/engine/model/operation/operation.js';

import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'History', () => {
	let history;

	beforeEach( () => {
		history = new History();
	} );

	describe( 'constructor', () => {
		it( 'should create an empty History instance', () => {
			expect( Array.from( history.getDeltas() ).length ).to.equal( 0 );
		} );
	} );

	describe( 'addDelta', () => {
		it( 'should save delta in the history', () => {
			let delta = new Delta();
			delta.addOperation( new Operation( 0 ) );

			history.addDelta( delta );

			const deltas = Array.from( history.getDeltas() );
			expect( deltas.length ).to.equal( 1 );
			expect( deltas[ 0 ] ).to.equal( delta );
		} );

		it( 'should save each delta only once', () => {
			let delta = new Delta();
			delta.addOperation( new Operation( 0 ) );

			history.addDelta( delta );
			history.addDelta( delta );

			const deltas = Array.from( history.getDeltas() );
			expect( deltas.length ).to.equal( 1 );
			expect( deltas[ 0 ] ).to.equal( delta );
		} );

		it( 'should save multiple deltas and keep their order', () => {
			let deltas = getDeltaSet();

			for ( let delta of deltas ) {
				history.addDelta( delta );
			}

			const historyDeltas = Array.from( history.getDeltas() );
			expect( historyDeltas ).to.deep.equal( deltas );
		} );

		it( 'should skip deltas that does not have operations', () => {
			let delta = new Delta();

			history.addDelta( delta );

			expect( Array.from( history.getDeltas() ).length ).to.equal( 0 );
		} );
	} );

	describe( 'getDeltas', () => {
		let deltas;

		beforeEach( () => {
			deltas = getDeltaSet();

			for ( let delta of deltas ) {
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
			} ).to.throw( CKEditorError, /history-wrong-version/ );
		} );
	} );

	describe( 'getDelta', () => {
		beforeEach( () => {
			for ( let delta of getDeltaSet() ) {
				history.addDelta( delta );
			}
		} );

		it( 'should return delta from history that has given base version', () => {
			let delta = history.getDelta( 3 );

			expect( delta.baseVersion ).to.equal( 3 );
		} );

		it( 'should return null if delta has not been found in history', () => {
			expect( history.getDelta( -1 ) ).to.be.null;
			expect( history.getDelta( 2 ) ).to.be.null;
			expect( history.getDelta( 20 ) ).to.be.null;
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
