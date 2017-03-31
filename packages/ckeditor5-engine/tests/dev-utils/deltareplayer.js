/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DeltaReplayer from '../../src/dev-utils/deltareplayer';
import Document from '../../src/model/document';

describe( 'DeltaReplayer', () => {
	describe( 'constructor()', () => {
		it( 'should be able to initialize replayer without deltas', () => {
			const fakeDocument = {};
			const stringifiedDeltas = '';
			const deltaReplayer = new DeltaReplayer( fakeDocument, '---', stringifiedDeltas );

			expect( deltaReplayer._deltasToReplay ).to.deep.equal( [] );
			expect( deltaReplayer._document ).to.deep.equal( fakeDocument );
			expect( deltaReplayer._logSeparator ).to.deep.equal( '---' );
		} );

		it( 'should be able to initialize replayer with deltas', () => {
			const doc = new Document();
			doc.createRoot( 'main' );

			const delta = {
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

			const deltaReplayer = new DeltaReplayer( doc, '---', JSON.stringify( delta ) );

			expect( deltaReplayer._deltasToReplay ).to.deep.equal( [ delta ] );
		} );
	} );
} );
