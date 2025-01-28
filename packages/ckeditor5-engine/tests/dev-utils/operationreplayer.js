/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import OperationReplayer from '../../src/dev-utils/operationreplayer.js';
import Model from '../../src/model/model.js';

describe( 'OperationReplayer', () => {
	describe( 'constructor()', () => {
		it( 'should be able to initialize replayer without operations', () => {
			const model = getModel();
			const stringifiedOperations = '';
			const operationReplayer = new OperationReplayer( model, '---', stringifiedOperations );

			expect( operationReplayer.getOperationsToReplay() ).to.deep.equal( [] );
		} );

		it( 'should be able to initialize replayer with operations', () => {
			const model = getModel();
			const operation = getFirstOperation();

			const operationReplayer = new OperationReplayer( model, '---', JSON.stringify( operation ) );

			expect( operationReplayer.getOperationsToReplay() ).to.deep.equal( [ operation ] );
		} );
	} );

	describe( 'applyNextOperation()', () => {
		it( 'should remove first operation from stack', () => {
			const model = getModel();
			const operation = getFirstOperation();

			const operationReplayer = new OperationReplayer( model, '---', JSON.stringify( operation ) );

			return operationReplayer.applyNextOperation().then( isFinished => {
				expect( operationReplayer.getOperationsToReplay() ).to.deep.equal( [] );
				expect( isFinished ).to.equal( false );
			} );
		} );

		it( 'should apply first operation on the document', () => {
			const model = getModel();
			const operation = getFirstOperation();

			const operationReplayer = new OperationReplayer( model, '---', JSON.stringify( operation ) );

			return operationReplayer.applyNextOperation().then( () => {
				expect( Array.from( model.document.getRoot().getChildren() ).length ).to.equal( 1 );
			} );
		} );

		it( 'should resolve with true if 0 operations are provided', () => {
			const model = getModel();
			const operationReplayer = new OperationReplayer( model, '---', '' );

			return operationReplayer.applyNextOperation().then( isFinished => {
				expect( isFinished ).to.equal( true );
			} );
		} );
	} );

	describe( 'applyAllOperations()', () => {
		it( 'should apply all operations on the document', () => {
			const model = getModel();

			const stringifiedOperations = [ getFirstOperation(), getSecondOperation() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const operationReplayer = new OperationReplayer( model, '---', stringifiedOperations );

			return operationReplayer.applyAllOperations().then( () => {
				expect( Array.from( model.document.getRoot().getChildren() ).length ).to.equal( 2 );
				expect( operationReplayer.getOperationsToReplay().length ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'applyOperations()', () => {
		it( 'should apply certain number of operations on the document', () => {
			const model = getModel();

			const stringifiedOperations = [ getFirstOperation(), getSecondOperation() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const operationReplayer = new OperationReplayer( model, '---', stringifiedOperations );

			return operationReplayer.applyOperations( 1 ).then( () => {
				expect( Array.from( model.document.getRoot().getChildren() ).length ).to.equal( 1 );
				expect( operationReplayer.getOperationsToReplay().length ).to.equal( 1 );
			} );
		} );

		it( 'should not throw an error if the number of operations is lower than number of expected operations to replay', () => {
			const model = getModel();

			const stringifiedOperations = [ getFirstOperation(), getSecondOperation() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const operationReplayer = new OperationReplayer( model, '---', stringifiedOperations );

			return operationReplayer.applyOperations( 3 ).then( () => {
				expect( Array.from( model.document.getRoot().getChildren() ).length ).to.equal( 2 );
				expect( operationReplayer.getOperationsToReplay().length ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'play()', () => {
		it( 'should play operations with time interval', () => {
			const model = getModel();

			const stringifiedOperations = [ getFirstOperation(), getSecondOperation() ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const operationReplayer = new OperationReplayer( model, '---', stringifiedOperations );

			return operationReplayer.play( 0 ).then( () => {
				expect( operationReplayer.getOperationsToReplay().length ).to.equal( 0 );
			} );
		} );

		it( 'should work with default time interval', () => {
			const model = getModel();

			const operationReplayer = new OperationReplayer( model, '---', '' );

			return operationReplayer.play();
		} );

		it( 'should correctly handle errors coming from the engine', () => {
			const model = getModel();

			const invalidOperation = getSecondOperation();
			invalidOperation.baseVersion = 3;

			const stringifiedOperations = [ getFirstOperation(), invalidOperation ]
				.map( d => JSON.stringify( d ) )
				.join( '---' );

			const operationReplayer = new OperationReplayer( model, '---', stringifiedOperations );

			return operationReplayer.play( 1 )
				.then( () => {
					throw new Error( 'It should throw an error' );
				}, err => {
					expect( err.message ).to.match( /model-document-history-addoperation-incorrect-version/ );
				} );
		} );
	} );
} );

function getModel() {
	const model = new Model();

	model.document.createRoot();

	return model;
}

function getFirstOperation() {
	return {
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
		__className: 'InsertOperation'
	};
}

function getSecondOperation() {
	return {
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
		__className: 'InsertOperation'
	};
}
