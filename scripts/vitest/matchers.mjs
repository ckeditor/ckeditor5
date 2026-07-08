/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// The `js-beautify` package is a CommonJS module that does not declare its named exports in a way detectable
// by Node.js, so it must be imported via the default export to work in both Node.js and Vitest environments.
import jsBeautify from 'js-beautify';

const { html_beautify: beautify } = jsBeautify;

/**
 * Custom matcher that tests whether two given strings containing markup language are equal.
 * Unlike `expect().toEqual()`, this matcher formats the markup before showing a diff.
 *
 * It can be used to test HTML strings and strings containing a serialized model.
 *
 * The matcher is registered globally for all automated tests in the `scripts/vitest/test_setup.mjs` file via the `expect.extend()` API.
 * Its types are registered in `typings/vitest.d.ts`.
 *
 * Usage:
 *
 *		// Will fail with a diff of formatted markup strings.
 *		expect(
 *			'<paragraph>foo bXXX[]r baz</paragraph>'
 *		).toEqualMarkup(
 *			'<paragraph>foo bYYY[]r baz</paragraph>'
 *		);
 *
 * Please note that if the difference in the markup concerns only whitespace characters inside tags (e.g. between attributes),
 * a diff between unformatted (rather than formatted) strings is displayed.
 *
 * @param {string} received Markup to compare.
 * @param {string} expected Markup to compare.
 * @returns {object} The matcher result.
 */
export function toEqualMarkup( received, expected ) {
	if ( received === expected ) {
		return {
			pass: true,
			message: () => 'Expected markup strings not to be equal'
		};
	}

	const receivedFormatted = formatMarkup( received );
	const expectedFormatted = formatMarkup( expected );

	// HTML beautification tool removes all redundant whitespace characters inside tags and this behavior cannot be configured.
	// Therefore, if there is no difference between formatted strings, but we know they are different, display raw (unformatted)
	// strings instead.
	const areFormattedStringsEqual = receivedFormatted === expectedFormatted;

	return {
		pass: false,
		message: () => 'Expected markup strings to be equal',
		actual: areFormattedStringsEqual ? received : receivedFormatted,
		expected: areFormattedStringsEqual ? expected : expectedFormatted
	};
}

// Renames the $text occurrences as it is not properly formatted by the beautifier - it is treated as a block.
const TEXT_TAG_PLACEHOLDER = 'span data-cke="true"';
const TEXT_TAG_PLACEHOLDER_REGEXP = new RegExp( TEXT_TAG_PLACEHOLDER, 'g' );

function formatMarkup( string ) {
	const htmlSafeString = string.replace( /\$text/g, TEXT_TAG_PLACEHOLDER );

	const beautifiedMarkup = beautify( htmlSafeString, {
		indent_size: 2,
		space_in_empty_paren: true
	} );

	return beautifiedMarkup.replace( TEXT_TAG_PLACEHOLDER_REGEXP, '$text' );
}
