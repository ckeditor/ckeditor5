/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../../src/model/model';
import Element from '../../../src/model/element';
import Text from '../../../src/model/text';

import RenameDelta from '../../../src/model/delta/renamedelta';

describe( 'RenameDelta', () => {
	let renameDelta, model, doc, root;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		root = doc.createRoot();
		renameDelta = new RenameDelta();
	} );

	describe( 'constructor()', () => {
		it( 'should create rename delta with no operations added', () => {
			expect( renameDelta.operations.length ).to.equal( 0 );
		} );
	} );

	describe( 'type', () => {
		it( 'should be equal to rename', () => {
			expect( renameDelta.type ).to.equal( 'rename' );
		} );
	} );

	describe( 'getReversed', () => {
		it( 'should return instance of RenameDelta', () => {
			const reversed = renameDelta.getReversed();

			expect( reversed ).to.be.instanceof( RenameDelta );
		} );

		it( 'should return correct RenameDelta', () => {
			root.appendChildren( new Element( 'p', null, new Text( 'abc' ) ) );

			model.change( writer => {
				writer.rename( root.getChild( 0 ), 'h' );

				const reversed = writer.batch.deltas[ 0 ].getReversed();

				reversed.operations.forEach( operation => {
					model.applyOperation( operation );
				} );

				expect( root.maxOffset ).to.equal( 1 );
				expect( root.getChild( 0 ) ).to.have.property( 'name', 'p' );
			} );
		} );
	} );

	it( 'should provide proper className', () => {
		expect( RenameDelta.className ).to.equal( 'engine.model.delta.RenameDelta' );
	} );
} );
