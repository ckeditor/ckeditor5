/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import insertByPriority from '../src/insertbypriority';
import compareArrays from '../src/compareArrays';

describe( 'insertByPriority()', () => {
	let objectsWithPriority;

	beforeEach( () => {
		objectsWithPriority = [];
	} );

	it( 'should insert only object to array', () => {
		const objectA = { priority: 'normal' };

		const expectedOutput = [ objectA ];

		insertByPriority( objectsWithPriority, objectA );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'should place object with highest priority at the first index of an array', () => {
		const objectB = { priority: 'high' };
		const objectA = { priority: 'low' };

		const expectedOutput = [ objectB, objectA ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'should place object with highest priority at the first index of an array even if inserted later', () => {
		const objectA = { priority: 'high' };
		const objectB = { priority: 'low' };

		const expectedOutput = [ objectA, objectB ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'should correctly insert items by priority', () => {
		const objectA = { priority: 'high' };
		const objectB = { priority: 'lowest' };
		const objectC = { priority: 'highest' };
		const objectD = { priority: 'normal' };
		const objectE = { priority: 'low' };

		const expectedOutput = [ objectC, objectA, objectD, objectE, objectB ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );
		insertByPriority( objectsWithPriority, objectC );
		insertByPriority( objectsWithPriority, objectD );
		insertByPriority( objectsWithPriority, objectE );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'should place first inserted object at the first index of an array when there are multiple highest priority objects', () => {
		const objectA = { priority: 'highest' };
		const objectB = { priority: 'highest' };

		const expectedOutput = [ objectA, objectB ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'first inserted object of given priority should be closest to start of an array', () => {
		const objectA = { priority: 'highest' };
		const objectB = { priority: 'low' };
		const objectC = { priority: 'low' };

		const expectedOutput = [ objectA, objectB, objectC ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );
		insertByPriority( objectsWithPriority, objectC );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );

	it( 'should place object with lowest priorirty at the end of an array', () => {
		const objectA = { priority: 'highest' };
		const objectB = { priority: 'high' };
		const objectC = { priority: 'low' };

		const expectedOutput = [ objectA, objectB, objectC ];

		insertByPriority( objectsWithPriority, objectA );
		insertByPriority( objectsWithPriority, objectB );
		insertByPriority( objectsWithPriority, objectC );

		expect( compareArrays( objectsWithPriority, expectedOutput ) ).to.equal( 'same' );
	} );
} );
