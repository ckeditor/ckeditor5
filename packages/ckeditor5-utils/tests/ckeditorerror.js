/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { default as CKEditorError, DOCUMENTATION_URL } from '../src/ckeditorerror';

describe( 'CKEditorError', () => {
	it( 'inherits from Error', () => {
		const error = new CKEditorError( 'foo' );

		expect( error ).to.be.an.instanceOf( Error );
		expect( error ).to.be.an.instanceOf( CKEditorError );
	} );

	it( 'sets the name', () => {
		const error = new CKEditorError( 'foo' );

		expect( error ).to.have.property( 'name', 'CKEditorError' );
	} );

	it( 'sets the message', () => {
		const error = new CKEditorError( 'foo' );

		expect( error ).to.have.property( 'message', 'foo' );
		expect( error.data ).to.be.undefined;
	} );

	it( 'sets the message and data', () => {
		const data = { bar: 1 };
		const error = new CKEditorError( 'foo', data );

		expect( error ).to.have.property( 'message', 'foo {"bar":1}' );
		expect( error ).to.have.property( 'data', data );
	} );

	it( 'appends stringified data to the message', () => {
		class Foo {
			constructor() {
				this.x = 1;
			}
		}

		const data = {
			bar: 'a',
			bom: new Foo(),
			bim: 10
		};
		const error = new CKEditorError( 'foo', data );

		expect( error ).to.have.property( 'message', 'foo {"bar":"a","bom":{"x":1},"bim":10}' );
		expect( error ).to.have.property( 'data', data );
	} );

	it( 'contains a link which leads to the documentation', () => {
		const error = new CKEditorError( 'model-schema-no-item: Specified item cannot be found.' );

		const errorMessage = 'model-schema-no-item: Specified item cannot be found. ' +
			`Read more: ${ DOCUMENTATION_URL }#model-schema-no-item\n`;

		expect( error ).to.have.property( 'message', errorMessage );
	} );

	it( 'link to documentation is added before the additional data message', () => {
		const error = new CKEditorError( 'model-schema-no-item: Specified item cannot be found.', { foo: 1, bar: 2 } );

		const errorMessage = 'model-schema-no-item: Specified item cannot be found. ' +
			`Read more: ${ DOCUMENTATION_URL }#model-schema-no-item\n ` +
			'{"foo":1,"bar":2}';

		expect( error ).to.have.property( 'message', errorMessage );
	} );

	describe( 'isCKEditorError', () => {
		it( 'checks if error is an instance of CKEditorError', () => {
			const ckeditorError = new CKEditorError( 'foo' );
			const regularError = new Error( 'foo' );

			expect( CKEditorError.isCKEditorError( ckeditorError ) ).to.be.true;
			expect( CKEditorError.isCKEditorError( regularError ) ).to.be.false;
		} );
	} );
} );
