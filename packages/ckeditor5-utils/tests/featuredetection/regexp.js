/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import regExpFeatureDetection from '../../src/featuredetection/regexp';

describe( 'featuredetection', () => {
	describe( 'isUnicodePropertySupported', () => {
		it( 'should detect accessibility of unicode properties', () => {
			// Usage of regular expression literal cause error during build
			const testFn = () => ( new RegExp( '\\p{L}', 'u' ) ).test( 'ć' );

			if ( regExpFeatureDetection.isUnicodePropertySupported ) {
				expect( testFn() ).to.be.true;
			} else {
				expect( testFn ).to.throw();
			}
		} );
	} );
} );
