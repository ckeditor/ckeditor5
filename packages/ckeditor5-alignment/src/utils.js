/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/utils
 */

/**
 * The list of supported alignment options:
 *
 * * `'left'`,
 * * `'right'`,
 * * `'center'`,
 * * `'justify'`
 */
export const supportedOptions = [ 'left', 'right', 'center', 'justify' ];

/**
 * Checks whether the passed option is supported by {@link module:alignment/alignmentediting~AlignmentEditing}.
 *
 * @param {String} option The option value to check.
 * @returns {Boolean}
 */
export function isSupported( option ) {
	return supportedOptions.includes( option );
}

/**
 * Checks whether alignment is the default one.
 *
 * @param {String} alignment Name of alignment to check.
 * @returns {Boolean}
 */
export function isDefault( alignment ) {
	// Right now only LTR is supported so 'left' value is always the default one.
	return alignment === 'left';
}
