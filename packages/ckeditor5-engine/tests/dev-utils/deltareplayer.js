/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DeltaReplayer from '../../src/dev-utils/deltareplayer';
import Model from '../../src/model/model';

describe( 'DeltaReplayer', () => {
	describe( 'constructor()', () => {
		it( 'should be able to initialize replayer without deltas', () => {
			const model = getModel();
			const stringifiedDeltas = '';
			const deltaReplayer = new DeltaReplayer( model, '---', stringifiedDeltas );

			expect( deltaReplayer.getDeltasToReplay() ).to.deep.equal( [] );
		} );

		it( 'should be able to initialize replayer with deltas', () => {
			const model = getModel();
			const delta = getFirstDelta();

			const deltaReplayer = new DeltaReplayer( model, '---', JSON.stringify( delta ) );

			expect( deltaReplayer.getDeltasToReplay() ).to.deep.equal( [ delta ] );
		} );
	} );

	describe( 'applyNextDelta()', () => {
		it( 'should remove first delta from stack', () => {
			const model = getModel();
			const delta = getFirstDelta();

			const deltaReplayer = new DeltaReplayer( model, '---', JSON.stringify( delta ) );

			return deltaReplayer.applyNextDelta().then( isFinished => {
				expect( deltaReplayer.getDeltasToReplay() ).to.deep.equal( [] );
				expect( isFinished ).to.equal( false );
			} );
		} );

		it( 'should apply first delta on the document', () => {
			const model = getModel();
			const delta = getFirstDelta();

			const deltaReplayer = new DeltaReplayer( model, '---', JSON.stringify( delta ) );

			return deltaReplayer.applyNextDelta().then( () => {
				expect( Array.from( model.document.getRoot().getChildren() ).length ).to.equal( 1 );
			} );
		} );

		it( 'should resolve with true if 0 deltas are provided', () => {
			const model = getModel();
			const deltaReplayer = new DeltaReplayer( model, '---', '' );

			return deltaReplayer.applyNextDelta().then( isFinished => {
				expect( isFinished ).to.equal( true );
			} );
		} );
	} );

	describe( 'applyAllDeltas()', () => {
		it( 'should apply all deltas on the document', () => {
			const model = getModel();

			const stringifiedDeltas = [ getFirstDelta(), getSecondDelta() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const deltaReplayer = new DeltaReplayer( model, '---', stringifiedDeltas );

			return deltaReplayer.applyAllDeltas().then( () => {
				expect( Array.from( model.document.getRoot().getChildren() ).length ).to.equal( 2 );
				expect( deltaReplayer.getDeltasToReplay().length ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'applyDeltas()', () => {
		it( 'should apply certain number of deltas on the document', () => {
			const model = getModel();

			const stringifiedDeltas = [ getFirstDelta(), getSecondDelta() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const deltaReplayer = new DeltaReplayer( model, '---', stringifiedDeltas );

			return deltaReplayer.applyDeltas( 1 ).then( () => {
				expect( Array.from( model.document.getRoot().getChildren() ).length ).to.equal( 1 );
				expect( deltaReplayer.getDeltasToReplay().length ).to.equal( 1 );
			} );
		} );

		it( 'should not throw an error if the number of deltas is lower than number of expected deltas to replay', () => {
			const model = getModel();

			const stringifiedDeltas = [ getFirstDelta(), getSecondDelta() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const deltaReplayer = new DeltaReplayer( model, '---', stringifiedDeltas );

			return deltaReplayer.applyDeltas( 3 ).then( () => {
				expect( Array.from( model.document.getRoot().getChildren() ).length ).to.equal( 2 );
				expect( deltaReplayer.getDeltasToReplay().length ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'play()', () => {
		it( 'should play deltas with time interval', () => {
			const model = getModel();

			const stringifiedDeltas = [ getFirstDelta(), getSecondDelta() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const deltaReplayer = new DeltaReplayer( model, '---', stringifiedDeltas );

			return deltaReplayer.play( 0 ).then( () => {
				expect( deltaReplayer.getDeltasToReplay().length ).to.equal( 0 );
			} );
		} );

		it( 'should work with default time interval', () => {
			const model = getModel();

			const deltaReplayer = new DeltaReplayer( model, '---', '' );

			return deltaReplayer.play();
		} );

		it( 'should correctly handle errors coming from the engine', () => {
			const model = getModel();

			const invalidDelta = getSecondDelta();
			invalidDelta.operations[ 0 ].baseVersion = 3;

			const stringifiedDeltas = [ getFirstDelta(), invalidDelta ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const deltaReplayer = new DeltaReplayer( model, '---', stringifiedDeltas );

			return deltaReplayer.play( 1 )
				.then( () => {
					throw new Error( 'It should throw an error' );
				}, err => {
					expect( err.message ).to.match( /^model-document-applyOperation-wrong-version:/ );
				} );
		} );
	} );
} );

function getModel() {
	const model = new Model();

	model.document.createRoot();

	return model;
}

function getFirstDelta() {
	return {
		operations: [ {
			baseVersion: 0,
			position: {
				root: 'main',
				path: [ 0 ]
			},
			nodes: [ {
				name: 'heading1',
				children: [ {
					data: 'The great world of open Web standards'
				} ]
			} ],
			__className: 'engine.model.operation.InsertOperation'
		} ],
		__className: 'engine.model.delta.InsertDelta'
	};
}

function getSecondDelta() {
	return {
		operations: [ {
			baseVersion: 1,
			position: {
				root: 'main',
				path: [ 1 ]
			},
			nodes: [ {
				name: 'heading2',
				children: [ {
					data: 'The great world of open Web standards'
				} ]
			} ],
			__className: 'engine.model.operation.InsertOperation'
		} ],
		__className: 'engine.model.delta.InsertDelta'
	};
}
