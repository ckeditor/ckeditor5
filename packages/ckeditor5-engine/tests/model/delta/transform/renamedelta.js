/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import transformations from '../../../../src/model/delta/basic-transformations'; // eslint-disable-line no-unused-vars
import deltaTransform from '../../../../src/model/delta/transform';
const transform = deltaTransform.transform;

import Element from '../../../../src/model/element';
import Position from '../../../../src/model/position';

import RenameDelta from '../../../../src/model/delta/renamedelta';
import RenameOperation from '../../../../src/model/operation/renameoperation';

import {
	getFilledDocument,
	expectDelta,
	getSplitDelta
} from '../../../../tests/model/delta/transform/_utils/utils';

describe( 'transform', () => {
	let doc, root, baseVersion;

	beforeEach( () => {
		doc = getFilledDocument();
		root = doc.getRoot();
		baseVersion = doc.version;
	} );

	describe( 'RenameDelta by', () => {
		describe( 'SplitDelta', () => {
			it( 'split element is renamed', () => {
				const renameDelta = new RenameDelta();
				renameDelta.addOperation( new RenameOperation(
					new Position( root, [ 3, 3 ] ),
					'p',
					'li',
					baseVersion
				) );

				const splitPosition = new Position( root, [ 3, 3, 3 ] );
				const splitDelta = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );

				const transformed = transform( renameDelta, splitDelta );

				baseVersion = splitDelta.length;

				expect( transformed.length ).to.equal( 2 );

				expectDelta( transformed[ 0 ], {
					type: RenameDelta,
					operations: [
						{
							type: RenameOperation,
							oldName: 'p',
							newName: 'li',
							position: new Position( root, [ 3, 3 ] )
						}
					]
				} );

				expectDelta( transformed[ 1 ], {
					type: RenameDelta,
					operations: [
						{
							type: RenameOperation,
							oldName: 'p',
							newName: 'li',
							position: new Position( root, [ 3, 4 ] )
						}
					]
				} );
			} );

			it( 'split element is different than renamed element', () => {
				const renameDelta = new RenameDelta();
				renameDelta.addOperation( new RenameOperation(
					new Position( root, [ 3, 3 ] ),
					'p',
					'li',
					baseVersion
				) );

				const splitPosition = new Position( root, [ 3, 2, 1 ] );
				const splitDelta = getSplitDelta( splitPosition, new Element( 'p' ), 9, baseVersion );

				const transformed = transform( renameDelta, splitDelta );

				baseVersion = splitDelta.length;

				expect( transformed.length ).to.equal( 1 );

				expectDelta( transformed[ 0 ], {
					type: RenameDelta,
					operations: [
						{
							type: RenameOperation,
							oldName: 'p',
							newName: 'li',
							position: new Position( root, [ 3, 4 ] )
						}
					]
				} );
			} );
		} );
	} );
} );
