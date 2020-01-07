/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { default as CKEditorError, DOCUMENTATION_URL } from '../src/ckeditorerror';
import { expectToThrowCKEditorError } from './_utils/utils';

describe( 'CKEditorError', () => {
	it( 'inherits from Error', () => {
		const error = new CKEditorError( 'foo', null );

		expect( error ).to.be.an.instanceOf( Error );
		expect( error ).to.be.an.instanceOf( CKEditorError );
	} );

	it( 'sets the name', () => {
		const error = new CKEditorError( 'foo', null );

		expect( error ).to.have.property( 'name', 'CKEditorError' );
	} );

	it( 'sets the message', () => {
		const error = new CKEditorError( 'foo', null );

		expect( error ).to.have.property( 'message', 'foo' );
		expect( error.data ).to.be.undefined;
	} );

	it( 'sets the message and data', () => {
		const data = { bar: 1 };
		const error = new CKEditorError( 'foo', null, data );

		expect( error ).to.have.property( 'message', 'foo {"bar":1}' );
		expect( error ).to.have.property( 'data', data );
	} );

	it( 'sets the context of the error', () => {
		const data = { bar: 1 };
		const editor = {};
		const error = new CKEditorError( 'foo', editor, data );

		expect( error.context ).to.equal( editor );
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
		const error = new CKEditorError( 'foo', null, data );

		expect( error ).to.have.property( 'message', 'foo {"bar":"a","bom":{"x":1},"bim":10}' );
		expect( error ).to.have.property( 'data', data );
	} );

	it( 'contains a link which leads to the documentation', () => {
		const error = new CKEditorError( 'model-schema-no-item: Specified item cannot be found.', null );

		const errorMessage = 'model-schema-no-item: Specified item cannot be found. ' +
			`Read more: ${ DOCUMENTATION_URL }#error-model-schema-no-item\n`;

		expect( error ).to.have.property( 'message', errorMessage );
	} );

	it( 'link to documentation is added before the additional data message', () => {
		const error = new CKEditorError( 'model-schema-no-item: Specified item cannot be found.', null, { foo: 1, bar: 2 } );

		const errorMessage = 'model-schema-no-item: Specified item cannot be found. ' +
			`Read more: ${ DOCUMENTATION_URL }#error-model-schema-no-item\n ` +
			'{"foo":1,"bar":2}';

		expect( error ).to.have.property( 'message', errorMessage );
	} );

	describe( 'is()', () => {
		it( 'checks if error is an instance of CKEditorError', () => {
			const ckeditorError = new CKEditorError( 'foo', null );
			const regularError = new Error( 'foo' );

			expect( ( !!ckeditorError.is && ckeditorError.is( 'CKEditorError' ) ) ).to.be.true;
			expect( ( !!regularError.is && regularError.is( 'CKEditorError' ) ) ).to.be.false;
		} );
	} );

	describe( 'static rethrowUnexpectedError()', () => {
		it( 'should rethrow the original CKEditorError as it is', () => {
			const ckeditorError = new CKEditorError( 'foo', null );

			expectToThrowCKEditorError( () => {
				CKEditorError.rethrowUnexpectedError( ckeditorError, {} );
			}, /foo/, null );
		} );

		it( 'should rethrow an unexpected error wrapped in CKEditorError', () => {
			const error = new Error( 'foo' );
			error.stack = 'bar';
			const context = {};

			expectToThrowCKEditorError( () => {
				CKEditorError.rethrowUnexpectedError( error, context );
			}, /foo/, context );
		} );
	} );
} );
