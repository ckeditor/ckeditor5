/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import areConnectedThroughProperties from '../src/areconnectedthroughproperties.js';

describe( 'areConnectedThroughProperties()', () => {
	it( 'should return `false` if one of the value is primitive #1', () => {
		const el1 = [ 'foo' ];
		const el2 = 'foo';

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.false;
	} );

	it( 'should return `false` if one of the value is primitive #2', () => {
		const el1 = 0;
		const el2 = [ 0 ];

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.false;
	} );

	it( 'should return `false` if both of the values are primitives', () => {
		const el1 = null;
		const el2 = null;

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.false;
	} );

	it( 'should return `false` if both values are plain objects', () => {
		const el1 = {};
		const el2 = {};

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.false;
	} );

	it( 'should return `true` if both objects references to the same object', () => {
		const el1 = {};
		const el2 = el1;

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.true;
	} );

	it( 'should return `true` if both values share a common reference #1', () => {
		const foo = {};
		const el1 = { foo };
		const el2 = { foo };

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.true;
	} );

	it( 'should return `true` if both values share a common reference #2', () => {
		const foo = [];
		const el1 = [ foo ];
		const el2 = [ foo ];

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.true;
	} );

	it( 'should return `true` if the first structure is deep inside the second structure', () => {
		const el1 = {};

		const el2 = {
			foo: 1,
			bar: [ 1, 2, 3, new Map( [
				[ {}, new Set( [ 1, 2, 3 ] ) ],
				[ undefined, new Set( [
					Symbol( 'foo' ),
					null,
					{ x: [ el1 ] }
				] ) ]
			] ) ]
		};

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.true;
	} );

	it( 'should return `true` if the second structure is deep inside the first structure', () => {
		const el2 = {};

		const el1 = {
			foo: 1,
			bar: [ 1, 2, 3, new Map( [
				[ {}, new Set( [ 1, 2, 3 ] ) ],
				[ undefined, new Set( [
					Symbol( 'foo' ),
					null,
					{ x: [ el2 ] }
				] ) ]
			] ) ]
		};

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.true;
	} );

	it( 'should return `true` if both structures have a common reference', () => {
		const foo = {};

		const el1 = {
			foo: 1,
			bar: [ 1, 2, 3, new Map( [
				[ {}, new Set( [ 1, 2, 3 ] ) ],
				[ undefined, new Set( [
					Symbol( 'foo' ),
					null,
					{ x: [ foo ] }
				] ) ]
			] ) ]
		};

		const el2 = {
			foo: 1,
			bar: [ 1, 2, 3, new Map( [
				[ {}, new Set( [ 1, 2, 3 ] ) ],
				[ undefined, new Set( [
					Symbol( 'foo' ),
					null,
					{ x: [ foo ] }
				] ) ]
			] ) ]
		};

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.true;
	} );

	it( 'should return `false` if the structures is not connected #1', () => {
		const el1 = {};

		const el2 = {
			foo: 1,
			bar: [ 1, 2, 3, new Map( [
				[ {}, new Set( [ 1, 2, 3 ] ) ],
				[ undefined, new Set( [
					Symbol( 'foo' ),
					null,
					{ x: [] }
				] ) ]
			] ) ]
		};

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.false;
	} );

	it( 'should return `false` if the structures is not connected #2', () => {
		const el1 = {
			foo: 1,
			bar: [ 1, 2, 3, new Map( [
				[ {}, new Set( [ 1, 2, 3 ] ) ],
				[ undefined, new Set( [
					Symbol( 'foo' ),
					null,
					{ x: [] }
				] ) ]
			] ) ]
		};

		const el2 = {
			foo: 1,
			bar: [ 1, 2, 3, new Map( [
				[ {}, new Set( [ 1, 2, 3 ] ) ],
				[ undefined, new Set( [
					Symbol( 'foo' ),
					null,
					{ x: [] }
				] ) ]
			] ) ]
		};

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.false;
	} );

	it( 'should work well with nested objects #1', () => {
		const el1 = {};
		el1.foo = el1;

		const el2 = {};
		el2.foo = el2;

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.false;
	} );

	it( 'should work well with nested objects #2', () => {
		const el1 = {};
		el1.foo = el1;

		const el2 = {};
		el2.foo = {
			foo: el2,
			bar: el1
		};

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.true;
	} );

	it( 'should skip DOM objects', () => {
		const evt = new Event( 'click' );
		const el1 = { window, document, evt };
		const el2 = { window, document, evt };

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.false;
	} );

	it( 'should skip date and regexp objects', () => {
		const date = new Date();
		const regexp = /123/;

		const el1 = { date, regexp };
		const el2 = { date, regexp };

		expect( areConnectedThroughProperties( el1, el2 ) ).to.be.false;
	} );
} );
