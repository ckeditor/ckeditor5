/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import { createEditabilityChecker } from '../../src/ckboximageedit/utils.js';
import { ModelElement } from '@ckeditor/ckeditor5-engine';

describe( 'image edit utils', () => {
	describe( 'createEditabilityChecker()', () => {
		it( 'should return false for non-image elements', () => {
			const checker = createEditabilityChecker( undefined );

			expect( checker( new ModelElement( 'paragraph' ) ) ).toBe( false );
			expect( checker( new ModelElement( 'codeBlock' ) ) ).toBe( false );
		} );

		it( 'should return true for images in ckbox', () => {
			const checker = createEditabilityChecker( undefined );

			expect( checker( new ModelElement( 'imageInline', { ckboxImageId: 'abc' } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageBlock', { ckboxImageId: 'xyz' } ) ) ).toBe( true );
		} );

		it( 'should return false for external images by default', () => {
			const checker = createEditabilityChecker( undefined );

			expect( checker( new ModelElement( 'imageInline', { src: 'https://ckeditor.com/abc' } ) ) ).toBe( false );
			expect( checker( new ModelElement( 'imageBlock', { src: 'https://ckeditor.com/xyz' } ) ) ).toBe( false );
		} );

		it( 'should check if external images match RegExp', () => {
			const checker = createEditabilityChecker( /^ckeditor/ );

			expect( checker( new ModelElement( 'imageInline', { src: 'https://ckeditor.com/abc' } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageBlock', { src: 'https://ckeditor.com/xyz' } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageInline', { src: 'https://example.com/abc' } ) ) ).toBe( false );
			expect( checker( new ModelElement( 'imageBlock', { src: 'https://cksource.com/xyz' } ) ) ).toBe( false );
		} );

		it( 'should check if external images match one of RegExps', () => {
			const checker = createEditabilityChecker( [ /ckeditor/, /^cksource/ ] );

			expect( checker( new ModelElement( 'imageInline', { src: 'https://ckeditor.com/abc' } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageBlock', { src: 'https://ckeditor.com/xyz' } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageInline', { src: 'https://example.com/abc' } ) ) ).toBe( false );
			expect( checker( new ModelElement( 'imageBlock', { src: 'https://cksource.com/xyz' } ) ) ).toBe( true );
		} );

		it( 'should check if external images match current origin', () => {
			const origin = window.location.origin;

			const checker = createEditabilityChecker( 'origin' );

			expect( checker( new ModelElement( 'imageInline', { src: `${ origin }/abc` } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageBlock', { src: `${ origin }/xyz` } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageBlock', { src: '/path/xyz' } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageBlock', { src: 'abc' } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageBlock', { src: '../path/abc' } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageInline', { src: 'https://example.com/abc' } ) ) ).toBe( false );
			expect( checker( new ModelElement( 'imageBlock', { src: 'https://another-example.com/xyz' } ) ) ).toBe( false );
		} );

		it( 'should use the function to check external images', () => {
			const callback = vi.fn( url => url === 'https://ckeditor.com/abc' );

			const checker = createEditabilityChecker( callback );

			expect( checker( new ModelElement( 'imageInline', { src: 'https://ckeditor.com/abc' } ) ) ).toBe( true );
			expect( checker( new ModelElement( 'imageInline', { src: 'https://cksource.com/abc' } ) ) ).toBe( false );
		} );

		it( 'should return false if image has no `src` attribute', () => {
			const checker = createEditabilityChecker( () => true );

			expect( checker( new ModelElement( 'imageInline' ) ) ).toBe( false );
			expect( checker( new ModelElement( 'imageBlock' ) ) ).toBe( false );
		} );
	} );
} );
