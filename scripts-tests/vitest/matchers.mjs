/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { toEqualMarkup } from '../../scripts/vitest/matchers.mjs';

describe( 'toEqualMarkup matcher', () => {
	beforeAll( () => {
		expect.extend( { toEqualMarkup } );
	} );

	it( 'should be a function', () => {
		expect( toEqualMarkup ).toBeInstanceOf( Function );
	} );

	it( 'should not throw for equal markups', () => {
		expect( function() {
			expect(
				'<paragraph>foo bXXX[]r baz</paragraph>'
			).toEqualMarkup(
				'<paragraph>foo bXXX[]r baz</paragraph>'
			);
		} ).to.not.throw();
	} );

	it( 'should throw an assertion error for unequal markups', () => {
		expect( function() {
			expect(
				'<paragraph>foo bXXX[]r baz</paragraph>'
			).toEqualMarkup(
				'<paragraph>foo bYYY[]r baz</paragraph>'
			);
		} ).to.throw( 'Expected markup strings to be equal' );
	} );

	it( 'should support the negated form for unequal markups', () => {
		expect( function() {
			expect(
				'<paragraph>foo bXXX[]r baz</paragraph>'
			).not.toEqualMarkup(
				'<paragraph>foo bYYY[]r baz</paragraph>'
			);
		} ).to.not.throw();
	} );

	it( 'should throw an assertion error for the negated form and equal markups', () => {
		expect( function() {
			expect(
				'<paragraph>foo bXXX[]r baz</paragraph>'
			).not.toEqualMarkup(
				'<paragraph>foo bXXX[]r baz</paragraph>'
			);
		} ).to.throw( 'Expected markup strings not to be equal' );
	} );

	it( 'should format the received markup', () => {
		const result = toEqualMarkup(
			'<div><p><span>foo</span></p></div>',
			'bar'
		);

		expect( result.pass ).toEqual( false );
		expect( result.actual ).toEqual(
			'<div>\n' +
			'  <p><span>foo</span></p>\n' +
			'</div>'
		);
	} );

	it( 'should format the expected markup', () => {
		const result = toEqualMarkup(
			'foo',
			'<div><p><span>foo</span></p></div>'
		);

		expect( result.pass ).toEqual( false );
		expect( result.expected ).toEqual(
			'<div>\n' +
			'  <p><span>foo</span></p>\n' +
			'</div>'
		);
	} );

	it( 'should format model text node with attributes as inline', () => {
		const result = toEqualMarkup(
			'foo',
			'<paragraph><$text bold="true">foo</$text></paragraph>'
		);

		expect( result.pass ).toEqual( false );
		expect( result.expected ).toEqual(
			'<paragraph><$text bold="true">foo</$text></paragraph>'
		);
	} );

	it( 'should format nested model structure properly', () => {
		const result = toEqualMarkup(
			'foo',
			'<blockQuote>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<paragraph><$text bold="true">foo</$text></paragraph>' +
						'</tableCell>' +
						'<tableCell>' +
							'<paragraph><$text bold="true">bar</$text></paragraph>' +
							'<paragraph><$text bold="true">baz</$text></paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>' +
			'</blockQuote>'
		);

		expect( result.pass ).toEqual( false );
		expect( result.expected ).toEqual(
			'<blockQuote>\n' +
			'  <table>\n' +
			'    <tableRow>\n' +
			'      <tableCell>\n' +
			'        <paragraph><$text bold="true">foo</$text></paragraph>\n' +
			'      </tableCell>\n' +
			'      <tableCell>\n' +
			'        <paragraph><$text bold="true">bar</$text></paragraph>\n' +
			'        <paragraph><$text bold="true">baz</$text></paragraph>\n' +
			'      </tableCell>\n' +
			'    </tableRow>\n' +
			'  </table>\n' +
			'</blockQuote>'
		);
	} );

	it( 'should not format strings if beautifier returns equal markups after formatting', () => {
		const result = toEqualMarkup(
			'<div><p><span>foo</span></p></div>',
			'<div><p><span>foo</span></p></div >'
		);

		expect( result.pass ).toEqual( false );
		expect( result.actual ).toEqual( '<div><p><span>foo</span></p></div>' );
		expect( result.expected ).toEqual( '<div><p><span>foo</span></p></div >' );
	} );
} );
