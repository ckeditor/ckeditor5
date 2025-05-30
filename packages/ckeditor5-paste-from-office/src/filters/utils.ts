/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/utils
 */

/**
 * Normalizes CSS length value to 'px'.
 *
 * @internal
 */
export function convertCssLengthToPx( value: string ): string {
	const numericValue = parseFloat( value );

	if ( value.endsWith( 'pt' ) ) {
		// 1pt = 1in / 72
		return toPx( numericValue * 96 / 72 );
	}
	else if ( value.endsWith( 'pc' ) ) {
		// 1pc = 12pt = 1in / 6.
		return toPx( numericValue * 12 * 96 / 72 );
	}
	else if ( value.endsWith( 'in' ) ) {
		// 1in = 2.54cm = 96px
		return toPx( numericValue * 96 );
	}
	else if ( value.endsWith( 'cm' ) ) {
		// 1cm = 96px / 2.54
		return toPx( numericValue * 96 / 2.54 );
	}
	else if ( value.endsWith( 'mm' ) ) {
		// 1mm = 1cm / 10
		return toPx( numericValue / 10 * 96 / 2.54 );
	}

	return value;
}

/**
 * Returns true for value with 'px' unit.
 *
 * @internal
 */
export function isPx( value?: string ): value is string {
	return value !== undefined && value.endsWith( 'px' );
}

/**
 * Returns a rounded 'px' value.
 *
 * @internal
 */
export function toPx( value: number ): string {
	return Math.round( value ) + 'px';
}
