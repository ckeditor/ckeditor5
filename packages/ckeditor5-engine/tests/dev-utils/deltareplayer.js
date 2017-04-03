/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console */

import DeltaReplayer from '../../src/dev-utils/deltareplayer';
import Document from '../../src/model/document';

describe( 'DeltaReplayer', () => {
	const sandbox = sinon.sandbox.create();
	let stubs;

	beforeEach( () => {
		stubs = {
			consoleWarn: sandbox.stub( console, 'warn' ),
		};
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'constructor()', () => {
		it( 'should be able to initialize replayer without deltas', () => {
			const doc = getDocument();
			const stringifiedDeltas = '';
			const deltaReplayer = new DeltaReplayer( doc, '---', stringifiedDeltas );

			expect( deltaReplayer.getDeltasToReplay() ).to.deep.equal( [] );
		} );

		it( 'should be able to initialize replayer with deltas', () => {
			const doc = getDocument();
			const delta = getFirstDelta();

			const deltaReplayer = new DeltaReplayer( doc, '---', JSON.stringify( delta ) );

			expect( deltaReplayer.getDeltasToReplay() ).to.deep.equal( [ delta ] );
		} );
	} );

	describe( 'applyNextDelta()', () => {
		it( 'should remove first delta from stack', () => {
			const doc = getDocument();
			const delta = getFirstDelta();

			const deltaReplayer = new DeltaReplayer( doc, '---', JSON.stringify( delta ) );

			return deltaReplayer.applyNextDelta().then( () => {
				expect( deltaReplayer.getDeltasToReplay() ).to.deep.equal( [] );
			} );
		} );

		it( 'should apply first delta on the document', () => {
			const doc = getDocument();
			const delta = getFirstDelta();

			const deltaReplayer = new DeltaReplayer( doc, '---', JSON.stringify( delta ) );

			return deltaReplayer.applyNextDelta().then( () => {
				expect( Array.from( doc.getRoot().getChildren() ).length ).to.equal( 1 );
			} );
		} );

		it( 'should throw an error if 0 deltas are provided', () => {
			const doc = getDocument();
			const deltaReplayer = new DeltaReplayer( doc, '---', '' );

			return deltaReplayer.applyNextDelta().then( () => {
				throw new Error( 'This should throw an error' );
			}, ( err ) => {
				expect( err instanceof Error ).to.equal( true );
				expect( err.message ).to.equal( 'No deltas to replay' );
			} );
		} );
	} );

	describe( 'applyAllDeltas', () => {
		it( 'should apply all deltas on the document', () => {
			const doc = getDocument();

			const stringifiedDeltas = [ getFirstDelta(), getSecondDelta() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const deltaReplayer = new DeltaReplayer( doc, '---', stringifiedDeltas );

			return deltaReplayer.applyAllDeltas().then( () => {
				expect( Array.from( doc.getRoot().getChildren() ).length ).to.equal( 2 );
				expect( deltaReplayer.getDeltasToReplay().length ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'applyDeltas', () => {
		it( 'should apply certain number of deltas on the document', () => {
			const doc = getDocument();

			const stringifiedDeltas = [ getFirstDelta(), getSecondDelta() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const deltaReplayer = new DeltaReplayer( doc, '---', stringifiedDeltas );

			return deltaReplayer.applyDeltas( 1 ).then( () => {
				expect( Array.from( doc.getRoot().getChildren() ).length ).to.equal( 1 );
				expect( deltaReplayer.getDeltasToReplay().length ).to.equal( 1 );
			} );
		} );

		it( 'should not throw an error if the number of deltas is lower than number of expected deltas to replay', () => {
			const doc = getDocument();

			const stringifiedDeltas = [ getFirstDelta(), getSecondDelta() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const deltaReplayer = new DeltaReplayer( doc, '---', stringifiedDeltas );

			return deltaReplayer.applyDeltas( 3 ).then( () => {
				expect( Array.from( doc.getRoot().getChildren() ).length ).to.equal( 2 );
				expect( deltaReplayer.getDeltasToReplay().length ).to.equal( 0 );
				sinon.assert.calledWithExactly( stubs.consoleWarn, new Error( 'No deltas to replay' ) );
			} );
		} );
	} );

	describe( 'play', () => {
		it( 'should play deltas with time interval', () => {
			const doc = getDocument();

			const stringifiedDeltas = [ getFirstDelta(), getSecondDelta() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const deltaReplayer = new DeltaReplayer( doc, '---', stringifiedDeltas );

			return deltaReplayer.play( 0 ).then( () => {
				expect( deltaReplayer.getDeltasToReplay().length ).to.equal( 0 );
			} );
		} );

		it( 'should work with default time interval', () => {
			const doc = getDocument();

			const deltaReplayer = new DeltaReplayer( doc, '---', '' );

			return deltaReplayer.play();
		} );
	} );
} );

function getDocument() {
	const doc = new Document();
	doc.createRoot( 'main' );

	return doc;
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
