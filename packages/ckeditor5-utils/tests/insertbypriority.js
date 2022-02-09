/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import priorities from '../src/priorities';
import insertByPriority from '../src/insertbypriority';
import compareArrays from '../src/compareArrays';

describe( 'insertByPriority()', () => {
	let objectsWithPriority;

	beforeEach( () => {
		objectsWithPriority = [];
	} );

	it( 'should insert only object to array', () => {
		const objectA = { priority: priorities.get( 'normal' ) };

		const expectedOutput = [ objectA ];

		insertByPriority( objectsWithPriority, objectA );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'should place object with highest priority at the first index of an array', () => {
		const objectB = { priority: priorities.get( 'high' ) };
		const objectA = { priority: priorities.get( 'low' ) };

		const expectedOutput = [ objectB, objectA ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'should place object with highest priority at the first index of an array even if inserted later', () => {
		const objectA = { priority: priorities.get( 'high' ) };
		const objectB = { priority: priorities.get( 'low' ) };

		const expectedOutput = [ objectA, objectB ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'should correctly insert items by priority', () => {
		const objectA = { priority: priorities.get( 'high' ) };
		const objectB = { priority: priorities.get( 'lowest' ) };
		const objectC = { priority: priorities.get( 'highest' ) };
		const objectD = { priority: priorities.get( 'normal' ) };
		const objectE = { priority: priorities.get( 'low' ) };

		const expectedOutput = [ objectC, objectA, objectD, objectE, objectB ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );
		insertByPriority( objectsWithPriority, objectC );
		insertByPriority( objectsWithPriority, objectD );
		insertByPriority( objectsWithPriority, objectE );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'should place first inserted object at the first index of an array when there are multiple highest priority objects', () => {
		const objectA = { priority: priorities.get( 'highest' ) };
		const objectB = { priority: priorities.get( 'highest' ) };

		const expectedOutput = [ objectA, objectB ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'first inserted object of given priority should be closest to start of an array', () => {
		const objectA = { priority: priorities.get( 'highest' ) };
		const objectB = { priority: priorities.get( 'low' ) };
		const objectC = { priority: priorities.get( 'low' ) };

		const expectedOutput = [ objectA, objectB, objectC ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );
		insertByPriority( objectsWithPriority, objectC );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'should place object with lowest priorirty at the end of an array', () => {
		const objectA = { priority: priorities.get( 'highest' ) };
		const objectB = { priority: priorities.get( 'high' ) };
		const objectC = { priority: priorities.get( 'low' ) };

		const expectedOutput = [ objectA, objectB, objectC ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );
		insertByPriority( objectsWithPriority, objectC );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );
} );
