/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import History from '/ckeditor5/engine/model/history.js';
import Delta from '/ckeditor5/engine/model/delta/delta.js';
import NoOperation from '/ckeditor5/engine/model/operation/nooperation.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'History', () => {
	let history;

	beforeEach( () => {
		history = new History();
	} );

	describe( 'constructor', () => {
		it( 'should create an empty History instance', () => {
			expect( history._deltas.length ).to.equal( 0 );
			expect( history._historyPoints.size ).to.equal( 0 );
		} );
	} );

	describe( 'addOperation', () => {
		it( 'should save delta containing passed operation in the history', () => {
			let delta = new Delta();
			let operation = new NoOperation( 0 );

			delta.addOperation( operation );
			history.addOperation( operation );

			expect( history._deltas.length ).to.equal( 1 );
			expect( history._deltas[ 0 ] ).to.equal( delta );
		} );

		it( 'should save each delta only once', () => {
			let delta = new Delta();

			delta.addOperation( new NoOperation( 0 ) );
			delta.addOperation( new NoOperation( 1 ) );
			delta.addOperation( new NoOperation( 2 ) );

			for ( let operation of delta.operations ) {
				history.addOperation( operation );
			}

			expect( history._deltas.length ).to.equal( 1 );
			expect( history._deltas[ 0 ] ).to.equal( delta );
		} );

		it( 'should save multiple deltas and keep their order', () => {
			let deltaA = new Delta();
			let deltaB = new Delta();
			let deltaC = new Delta();

			let deltas = [ deltaA, deltaB, deltaC ];

			let i = 0;

			for ( let delta of deltas ) {
				delta.addOperation( new NoOperation( i++ ) );
				delta.addOperation( new NoOperation( i++ ) );
			}

			for ( let delta of deltas ) {
				for ( let operation of delta.operations ) {
					history.addOperation( operation );
				}
			}

			expect( history._deltas.length ).to.equal( 3 );
			expect( history._deltas[ 0 ] ).to.equal( deltaA );
			expect( history._deltas[ 1 ] ).to.equal( deltaB );
			expect( history._deltas[ 2 ] ).to.equal( deltaC );
		} );
	} );

	describe( 'getTransformedDelta', () => {
		it( 'should transform given delta by deltas from history which were applied since the baseVersion of given delta', () => {
			sinon.spy( History, '_transform' );

			let deltaA = new Delta();
			deltaA.addOperation( new NoOperation( 0 ) );

			let deltaB = new Delta();
			deltaB.addOperation( new NoOperation( 1 ) );

			let deltaC = new Delta();
			deltaC.addOperation( new NoOperation( 2 ) );

			let deltaD = new Delta();
			deltaD.addOperation( new NoOperation( 3 ) );

			let deltaX = new Delta();
			deltaX.addOperation( new NoOperation( 1 ) );

			history.addOperation( deltaA.operations[ 0 ] );
			history.addOperation( deltaB.operations[ 0 ] );
			history.addOperation( deltaC.operations[ 0 ] );
			history.addOperation( deltaD.operations[ 0 ] );

			// `deltaX` bases on the same history point as `deltaB` -- so it already acknowledges `deltaA` existence.
			// It should be transformed by `deltaB` and all following deltas (`deltaC` and `deltaD`).
			history.getTransformedDelta( deltaX );

			// `deltaX` was not transformed by `deltaA`.
			expect( History._transform.calledWithExactly( deltaX, deltaA ) ).to.be.false;

			expect( History._transform.calledWithExactly( deltaX, deltaB ) ).to.be.true;
			// We can't do exact call matching because after first transformation, what we are further transforming
			// is no longer `deltaX` but a result of transforming `deltaX` and `deltaB`.
			expect( History._transform.calledWithExactly( sinon.match.instanceOf( Delta ), deltaC ) ).to.be.true;
			expect( History._transform.calledWithExactly( sinon.match.instanceOf( Delta ), deltaD ) ).to.be.true;
		} );

		it( 'should correctly set base versions if multiple deltas are result of transformation', () => {
			// Let's stub History._transform so it will always return two deltas with two operations each.
			History._transform = function() {
				let resultA = new Delta();
				resultA.addOperation( new NoOperation( 1 ) );
				resultA.addOperation( new NoOperation( 1 ) );

				let resultB = new Delta();
				resultB.addOperation( new NoOperation( 1 ) );
				resultB.addOperation( new NoOperation( 1 ) );

				return [ resultA, resultB ];
			};

			let deltaA = new Delta();
			deltaA.addOperation( new NoOperation( 0 ) );

			let deltaX = new Delta();
			deltaX.addOperation( new NoOperation( 0 ) );

			history.addOperation( deltaA.operations[ 0 ] );

			let result = history.getTransformedDelta( deltaX );

			expect( result[ 0 ].operations[ 0 ].baseVersion ).to.equal( 1 );
			expect( result[ 0 ].operations[ 1 ].baseVersion ).to.equal( 2 );
			expect( result[ 1 ].operations[ 0 ].baseVersion ).to.equal( 3 );
			expect( result[ 1 ].operations[ 1 ].baseVersion ).to.equal( 4 );
		} );

		it( 'should not transform given delta if it bases on current version of history', () => {
			let deltaA = new Delta();
			deltaA.addOperation( new NoOperation( 0 ) );

			let deltaB = new Delta();
			let opB = new NoOperation( 1 );
			deltaB.addOperation( opB );

			history.addOperation( deltaA.operations[ 0 ] );

			let result = history.getTransformedDelta( deltaB );

			expect( result.length ).to.equal( 1 );
			expect( result[ 0 ] ).to.equal( deltaB );
			expect( result[ 0 ].operations[ 0 ] ).to.equal( opB );
		} );

		it( 'should throw if given delta bases on an incorrect version of history', () => {
			let deltaA = new Delta();
			deltaA.addOperation( new NoOperation( 0 ) );
			deltaA.addOperation( new NoOperation( 1 ) );

			history.addOperation( deltaA.operations[ 0 ] );
			history.addOperation( deltaA.operations[ 1 ] );

			let deltaB = new Delta();
			// Wrong base version - should be either 0 or 2, operation can't be based on an operation that is
			// in the middle of other delta, because deltas are atomic, not dividable structures.
			deltaB.addOperation( new NoOperation( 1 ) );

			expect( () => {
				history.getTransformedDelta( deltaB );
			} ).to.throw( CKEditorError, /history-wrong-version/ );
		} );
	} );
} );
