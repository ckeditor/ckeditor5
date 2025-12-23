/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { getVisualViewportOffset } from '../../src/dom/getvisualviewportoffset.js';

describe( 'getVisualViewportOffset()', () => {
	afterEach( () => {
		sinon.restore();
	} );

	it( 'should return 0 offsets if there is no window.visualViewport', () => {
		sinon.stub( window, 'visualViewport' ).get( () => null );

		expect( getVisualViewportOffset() ).to.deep.equal( { left: 0, top: 0 } );
	} );

	it( 'should return offsets', () => {
		sinon.stub( window.visualViewport, 'offsetLeft' ).get( () => 14 );
		sinon.stub( window.visualViewport, 'offsetTop' ).get( () => 234 );

		expect( getVisualViewportOffset() ).to.deep.equal( { left: 14, top: 234 } );
	} );

	it( 'should return round offsets', () => {
		sinon.stub( window.visualViewport, 'offsetLeft' ).get( () => 14.3 );
		sinon.stub( window.visualViewport, 'offsetTop' ).get( () => 233.7 );

		expect( getVisualViewportOffset() ).to.deep.equal( { left: 14, top: 234 } );
	} );

	it( 'should not return negative offset left', () => {
		sinon.stub( window.visualViewport, 'offsetLeft' ).get( () => -14 );
		sinon.stub( window.visualViewport, 'offsetTop' ).get( () => 234 );

		expect( getVisualViewportOffset() ).to.deep.equal( { left: 0, top: 234 } );
	} );

	it( 'should not return negative offset top', () => {
		sinon.stub( window.visualViewport, 'offsetLeft' ).get( () => 14 );
		sinon.stub( window.visualViewport, 'offsetTop' ).get( () => -234 );

		expect( getVisualViewportOffset() ).to.deep.equal( { left: 14, top: 0 } );
	} );
} );
