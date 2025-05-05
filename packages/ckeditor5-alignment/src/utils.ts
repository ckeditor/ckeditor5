/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { CKEditorError, logWarning, type Locale } from 'ckeditor5/src/utils.js';
import type { AlignmentFormat, SupportedOption } from './alignmentconfig.js';

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
export const supportedOptions: ReadonlyArray<SupportedOption> = [ 'left', 'right', 'center', 'justify' ];

/**
 * Checks whether the passed option is supported by {@link module:alignment/alignmentediting~AlignmentEditing}.
 *
 * @param option The option value to check.
 */
export function isSupported( option: string ): boolean {
	return ( supportedOptions as Array<string> ).includes( option );
}

/**
 * Checks whether alignment is the default one considering the direction
 * of the editor content.
 *
 * @param alignment The name of the alignment to check.
 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
 */
export function isDefault( alignment: string, locale: Locale ): boolean {
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
 * @param configuredOptions Alignment plugin configuration.
 * @returns Normalized object holding the configuration.
 */
export function normalizeAlignmentOptions( configuredOptions: Array<string | AlignmentFormat> ): Array<AlignmentFormat> {
	const normalizedOptions = configuredOptions
		.map( option => {
			let result;

			if ( typeof option == 'string' ) {
				result = { name: option };
			} else {
				result = option;
			}

			return result as AlignmentFormat;
		} )
		// Remove all unknown options.
		.filter( option => {
			const isNameValid = supportedOptions.includes( option.name );

			if ( !isNameValid ) {
				/**
				 * The `name` in one of the `alignment.options` is not recognized.
				 * The available options are: `'left'`, `'right'`, `'center'` and `'justify'`.
				 *
				 * @error alignment-config-name-not-recognized
				 * @param {object} option Options with unknown value of the `name` property.
				 */
				logWarning( 'alignment-config-name-not-recognized', { option } );
			}

			return isNameValid;
		} );

	const classNameCount = normalizedOptions.filter( option => Boolean( option.className ) ).length;

	// We either use classes for all styling options or for none.
	if ( classNameCount && classNameCount < normalizedOptions.length ) {
		/**
		 * The `className` property has to be defined for all options once at least one option declares `className`.
		 *
		 * @error alignment-config-classnames-are-missing
		 * @param {object} configuredOptions Contents of `alignment.options`.
		 */
		throw new CKEditorError( 'alignment-config-classnames-are-missing', { configuredOptions } );
	}

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
			 * @param {object} option First option that declares given `name`.
			 * @param {object} configuredOptions Contents of `alignment.options`.
			 */
			throw new CKEditorError( 'alignment-config-name-already-defined', { option, configuredOptions } );
		}

		// The `className` property is present. Check for duplicates then.
		if ( option.className ) {
			const classNameAlreadyExists = succeedingOptions.some( item => item.className == option.className );

			if ( classNameAlreadyExists ) {
				/**
				 * The same `className` in one of the `alignment.options` was already declared.
				 *
				 * @error alignment-config-classname-already-defined
				 * @param {object} option First option that declares given `className`.
				 * @param {object} configuredOptions
				 * Contents of `alignment.options`.
				 */
				throw new CKEditorError( 'alignment-config-classname-already-defined', { option, configuredOptions } );
			}
		}
	} );

	return normalizedOptions;
}
