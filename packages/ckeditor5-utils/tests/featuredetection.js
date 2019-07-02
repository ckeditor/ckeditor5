/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import featureDetection from '../src/featuredetection';

describe( 'featuredetection', () => {
	describe( 'isUnicodePropertySupported', () => {
		it( 'should detect accessibility of unicode properties', () => {
			const testFn = () => ( new RegExp( '\\p{L}', 'u' ) ).test( 'ć' );

			if ( featureDetection.isUnicodePropertySupported ) {
				expect( testFn() ).to.be.true;
			} else {
				expect( testFn ).to.throw();
			}
		} );
	} );
} );
