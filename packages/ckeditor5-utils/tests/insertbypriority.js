/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import insertToPriorityArray from '../src/inserttopriorityarray.js';

describe( 'insertToPriorityArray()', () => {
	let objectsWithPriority;

	beforeEach( () => {
		objectsWithPriority = [];
	} );

	it( 'should insert only object to array', () => {
		const objectA = { priority: 'normal' };

		const expectedOutput = [ objectA ];

		insertToPriorityArray( objectsWithPriority, objectA );

		expect( objectsWithPriority ).to.deep.equal( expectedOutput );
	} );

	it( 'should place object with highest priority at the first index of an array', () => {
		const objectA = { priority: 'high' };
		const objectB = { priority: 'low' };

		const expectedOutput = [ objectA, objectB ];

		insertToPriorityArray( objectsWithPriority, objectA );
		insertToPriorityArray( objectsWithPriority, objectB );

		expect( objectsWithPriority ).to.deep.equal( expectedOutput );
	} );

	it( 'should place object with highest priority at the first index of an array even if inserted later', () => {
		const objectA = { priority: 'high' };
		const objectB = { priority: 'low' };

		const expectedOutput = [ objectA, objectB ];

		insertToPriorityArray( objectsWithPriority, objectA );
		insertToPriorityArray( objectsWithPriority, objectB );

		expect( objectsWithPriority ).to.deep.equal( expectedOutput );
	} );

	it( 'should correctly insert items by priority', () => {
		const objectA = { priority: 'high' };
		const objectB = { priority: 'lowest' };
		const objectC = { priority: 'highest' };
		const objectD = { priority: 'normal' };
		const objectE = { priority: 'low' };

		const expectedOutput = [ objectC, objectA, objectD, objectE, objectB ];

		insertToPriorityArray( objectsWithPriority, objectA );
		insertToPriorityArray( objectsWithPriority, objectB );
		insertToPriorityArray( objectsWithPriority, objectC );
		insertToPriorityArray( objectsWithPriority, objectD );
		insertToPriorityArray( objectsWithPriority, objectE );

		expect( objectsWithPriority ).to.deep.equal( expectedOutput );
	} );

	it( 'should place first inserted object at the first index of an array when there are multiple highest priority objects', () => {
		const objectA = { priority: 'highest' };
		const objectB = { priority: 'highest' };

		const expectedOutput = [ objectA, objectB ];

		insertToPriorityArray( objectsWithPriority, objectA );
		insertToPriorityArray( objectsWithPriority, objectB );

		expect( objectsWithPriority ).to.deep.equal( expectedOutput );
	} );

	it( 'first inserted object of given priority should be closest to start of an array', () => {
		const objectA = { priority: 'highest' };
		const objectB = { priority: 'low' };
		const objectC = { priority: 'low' };

		const expectedOutput = [ objectA, objectB, objectC ];

		insertToPriorityArray( objectsWithPriority, objectA );
		insertToPriorityArray( objectsWithPriority, objectB );
		insertToPriorityArray( objectsWithPriority, objectC );

		expect( objectsWithPriority ).to.deep.equal( expectedOutput );
	} );

	it( 'should place object with lowest priorirty at the end of an array', () => {
		const objectA = { priority: 'highest' };
		const objectB = { priority: 'high' };
		const objectC = { priority: 'low' };

		const expectedOutput = [ objectA, objectB, objectC ];

		insertToPriorityArray( objectsWithPriority, objectA );
		insertToPriorityArray( objectsWithPriority, objectB );
		insertToPriorityArray( objectsWithPriority, objectC );

		expect( objectsWithPriority ).to.deep.equal( expectedOutput );
	} );
} );
