/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable ckeditor5-rules/ckeditor-error-message */

/* global console */

import { default as CKEditorError, DOCUMENTATION_URL, logError, logWarning } from '../src/ckeditorerror';
import { expectToThrowCKEditorError } from './_utils/utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

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

		expect( error ).to.have.property( 'message' ).that.matches( /^foo/ );
		expect( error.data ).to.be.undefined;
	} );

	it( 'sets the message and data', () => {
		const data = { bar: 1 };
		const error = new CKEditorError( 'foo', null, data );

		expect( error ).to.have.property(
			'message',
			`foo {"bar":1}\nRead more: ${ DOCUMENTATION_URL }#error-foo`
		);
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

		expect( error ).to.have.property(
			'message',
			`foo {"bar":"a","bom":{"x":1},"bim":10}\nRead more: ${ DOCUMENTATION_URL }#error-foo`
		);
		expect( error ).to.have.property( 'data', data );
	} );

	it( 'appends stringified data to the message if stringified object contains circular references', () => {
		const data = { foo: 'bar' };

		data.bar = data;

		const error = new CKEditorError( 'foo', null, data );

		expect( error ).to.have.property(
			'message',
			`foo {"foo":"bar","bar":"[object Object]"}\nRead more: ${ DOCUMENTATION_URL }#error-foo`
		);
		expect( error ).to.have.property( 'data', data );
	} );

	it( 'appends stringified data to the message if stringified object contains multiple exact same circular references', () => {
		const data = { foo: 'bar' };

		data.bar = [ data, data ];

		const error = new CKEditorError( 'foo', null, data );

		expect( error ).to.have.property(
			'message',
			`foo {"foo":"bar","bar":["[object Object]","[object Object]"]}\nRead more: ${ DOCUMENTATION_URL }#error-foo`
		);
		expect( error ).to.have.property( 'data', data );
	} );

	it( 'contains a link which leads to the documentation', () => {
		const error = new CKEditorError( 'model-schema-no-item', null );

		const errorMessage = `model-schema-no-item\nRead more: ${ DOCUMENTATION_URL }#error-model-schema-no-item`;

		expect( error ).to.have.property( 'message', errorMessage );
	} );

	it( 'link to documentation is added after the additional data message', () => {
		const error = new CKEditorError( 'model-schema-no-item', null, { foo: 1, bar: 2 } );

		const errorMessage = `model-schema-no-item {"foo":1,"bar":2}\nRead more: ${ DOCUMENTATION_URL }#error-model-schema-no-item`;

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

	describe( 'logWarning()', () => {
		beforeEach( () => {
			testUtils.sinon.stub( console, 'warn' );
		} );

		afterEach( () => {
			console.warn.restore();
		} );

		it( 'should log warning with data and link to the documentation', () => {
			logWarning( 'foo', { name: 'foo' } );

			sinon.assert.calledOnce( console.warn );
			sinon.assert.calledWithExactly( console.warn,
				sinon.match( 'foo' ),
				{ name: 'foo' },
				`\nRead more: ${ DOCUMENTATION_URL }#error-foo`
			);
		} );

		it( 'should log warning without data and with a link to the documentation', () => {
			logWarning( 'foo' );

			sinon.assert.calledOnce( console.warn );
			sinon.assert.calledWithExactly( console.warn,
				sinon.match( 'foo' ),
				`\nRead more: ${ DOCUMENTATION_URL }#error-foo`
			);
		} );
	} );

	describe( 'logError()', () => {
		beforeEach( () => {
			testUtils.sinon.stub( console, 'error' );
		} );

		afterEach( () => {
			console.error.restore();
		} );

		it( 'should log error with data and link to the documentation', () => {
			logError( 'foo', { name: 'foo' } );

			sinon.assert.calledOnce( console.error );
			sinon.assert.calledWithExactly( console.error,
				sinon.match( 'foo' ),
				{ name: 'foo' },
				`\nRead more: ${ DOCUMENTATION_URL }#error-foo`
			);
		} );

		it( 'should log error without data and with a link to the documentation', () => {
			logError( 'foo' );

			sinon.assert.calledOnce( console.error );
			sinon.assert.calledWithExactly( console.error,
				sinon.match( 'foo' ),
				`\nRead more: ${ DOCUMENTATION_URL }#error-foo`
			);
		} );
	} );
} );
