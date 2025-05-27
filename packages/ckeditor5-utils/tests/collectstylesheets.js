/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import collectStylesheets from '../src/collectstylesheets.js';

describe( 'collectStylesheets', () => {
	let styleSheetsMock;

	beforeEach( () => {
		styleSheetsMock = [
			{
				ownerNode: {
					hasAttribute: name => name === 'data-cke'
				},
				cssRules: [
					{ cssText: ':root { --variable1: white; }' },
					{ cssText: '.ck-content { color: black }' },
					{ cssText: '.some-styles { color: red }' }
				]
			},
			{
				ownerNode: {
					hasAttribute: name => name === 'data-cke'
				},
				cssRules: [
					{ cssText: ':root { --variable2: blue; }' },
					{ cssText: '.ck-content { background: white }' }
				]
			},
			{
				ownerNode: {
					hasAttribute: () => false
				},
				cssRules: [
					{ cssText: 'h2 { color: black }' }
				]
			}
		];

		sinon.stub( document, 'styleSheets' ).get( () => styleSheetsMock );
	} );

	afterEach( () => {
		sinon.restore();
	} );

	it( 'should not return any styles if no paths to stylesheets provided', async () => {
		expect( await collectStylesheets( undefined ) ).to.equal( '' );
	} );

	it( 'should log into the console when ".ck-content" styles are missing', async () => {
		styleSheetsMock = [ {
			ownerNode: {
				hasAttribute: name => name === 'data-cke'
			},
			cssRules: [
				{ cssText: ':root { --variable: white; }' }
			]
		} ];

		const consoleSpy = sinon.stub( console, 'warn' );

		await collectStylesheets( [ 'EDITOR_STYLES' ] );

		sinon.assert.calledOnce( consoleSpy );
	} );

	it( 'should get ".ck-content" styles when "EDITOR_STYLES" token is provided', async () => {
		const consoleSpy = sinon.stub( console, 'warn' );

		const styles = await collectStylesheets( [ './foo.css', 'EDITOR_STYLES' ] );

		sinon.assert.notCalled( consoleSpy );

		expect( styles.length > 0 ).to.be.true;
		expect( styles.indexOf( '.ck-content' ) !== -1 ).to.be.true;
	} );

	it( 'should get styles from multiple stylesheets with data-cke attribute', async () => {
		const styles = await collectStylesheets( [ 'EDITOR_STYLES' ] );

		expect( styles ).to.include( ':root { --variable1: white; }' );
		expect( styles ).to.include( ':root { --variable2: blue; }' );
		expect( styles ).to.include( '.ck-content { color: black }' );
		expect( styles ).to.include( '.ck-content { background: white }' );
	} );

	it( 'should collect all :root styles from stylesheets with data-cke attribute', async () => {
		const styles = await collectStylesheets( [ 'EDITOR_STYLES' ] );

		expect( styles ).to.include( '--variable1: white' );
		expect( styles ).to.include( '--variable2: blue' );
	} );

	it( 'should fetch stylesheets from the provided paths and return concat result', async () => {
		sinon
			.stub( window, 'fetch' )
			.onFirstCall().resolves( new Response( '.foo { color: green; }' ) )
			.onSecondCall().resolves( new Response( '.bar { color: red; }' ) );

		const styles = await collectStylesheets( [ './foo.css', './bar.css' ] );

		expect( styles ).to.equal( '.foo { color: green; } .bar { color: red; }' );
	} );
} );
