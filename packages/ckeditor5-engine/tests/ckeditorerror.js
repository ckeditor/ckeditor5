/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'core/ckeditorerror' );

describe( 'CKEditorError', () => {
	let CKEditorError;

	before( () => {
		CKEditorError = modules[ 'core/ckeditorerror' ];
	} );

	it( 'inherits from Error', () => {
		let error = new CKEditorError( 'foo' );

		expect( error ).to.be.an.instanceOf( Error );
		expect( error ).to.be.an.instanceOf( CKEditorError );
	} );

	it( 'sets the name', () => {
		let error = new CKEditorError( 'foo' );

		expect( error ).to.have.property( 'name', 'CKEditorError' );
	} );

	it( 'sets the message', () => {
		let error = new CKEditorError( 'foo' );

		expect( error ).to.have.property( 'message', 'foo' );
		expect( error.data ).to.be.undefined;
	} );

	it( 'sets the message and data', () => {
		let data = { bar: 1 };
		let error = new CKEditorError( 'foo', data );

		expect( error ).to.have.property( 'message', 'foo {"bar":1}' );
		expect( error ).to.have.property( 'data', data );
	} );

	it( 'appends stringified data to the message', () => {
		class Foo {
			constructor() {
				this.x = 1;
			}
		}

		let data = {
			bar: 'a',
			bom: new Foo(),
			bim: document.body
		};
		let error = new CKEditorError( 'foo', data );

		expect( error ).to.have.property( 'message', 'foo {"bar":"a","bom":{"x":1},"bim":{}}' );
		expect( error ).to.have.property( 'data', data );
	} );
} );
