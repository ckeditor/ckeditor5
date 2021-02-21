/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { CKEditorError } from '../../../src/utils';

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
export const defaultConfig = supportedOptions.map( option => {
	return {
		name: option
	};
} );

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
 * Checks whether alignment is the default one considering the direction
 * of the editor content.
 *
 * @param {String} alignment The name of the alignment to check.
 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
 * @returns {Boolean}
 */
export function isDefault( alignment, locale ) {
	// Right now only LTR is supported so the 'left' value is always the default one.

	if ( locale.contentLanguageDirection == 'rtl' ) {
		return alignment === 'right';
	} else {
		return alignment === 'left';
	}
}

/**
 * Brings the configuration to the common form, an array of objects.
 *
 * @param {Array.<String|Object>} configuredOptions Alignment plugin configuration.
 * @returns {Array.<Object>} Normalized object holding the configuration.
 */
export function normalizeAlignmentOptions( configuredOptions = [] ) {
	const optionNameToOptionMap = new Map( defaultConfig.map( option => [ option.name, option ] ) );

	const normalizedOptions = configuredOptions
		.map( option => {
			let optionObj;

			if ( typeof option == 'string' ) {
				optionObj = { name: option };
			} else {
				optionObj = { ...optionNameToOptionMap[ option ], ...option };
			}

			return optionObj;
		} );

	// Validate resulting config.
	normalizedOptions.forEach( ( option, index, allOptions ) => {
		const succeedingOptions = allOptions.slice( index + 1 );

		const nameAlreadyExists = succeedingOptions.some( item => item.name == option.name );

		if ( nameAlreadyExists ) {
			/**
				 * The same `name` in one of the `alignment.options` was already declared.
				 * Each `name` representing one alignment option can be set exactly once.
				 *
				 * @error alignment-config-name-already-defined
				 * @param {Object} option First option that declares given `name`.
				 * @param {Array.<String|Object>} allOptions Contents of `alignment.options`.
				 */
			throw new CKEditorError( 'alignment-config-name-already-defined', { option, allOptions } );
		}

		// The `item.className` can be undefined. We shouldn't count it as a duplicate.
		const classNameAlreadyExists = option.className &&
			succeedingOptions.some( item => item.className && item.className == option.className );

		if ( classNameAlreadyExists ) {
			/**
				 * The same `className` in one of the `alignment.options` was already declared.
				 *
				 * @error alignment-config-classname-already-defined
				 * @param {Object} option First option that declares given `className`.
				 * @param {Array.<String|Object>} allOptions Contents of `alignment.options`.
				 */
			throw new CKEditorError( 'alignment-config-classname-already-defined', { option, allOptions } );
		}
	} );

	return normalizedOptions;
}
