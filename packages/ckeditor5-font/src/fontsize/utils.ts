/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontsize/utils
 */

import { CKEditorError } from 'ckeditor5/src/utils.js';
import { type FontSizeOption } from '../fontconfig.js';

/**
 * Normalizes and translates the {@link module:font/fontconfig~FontSizeConfig#options configuration options}
 * to the {@link module:font/fontconfig~FontSizeOption} format.
 *
 * @param configuredOptions An array of options taken from the configuration.
 */
export function normalizeOptions( configuredOptions: Array<string | number | FontSizeOption> ): Array<FontSizeOption> {
	// Convert options to objects.
	return configuredOptions
		.map( item => getOptionDefinition( item ) )
		// Filter out undefined values that `getOptionDefinition` might return.
		.filter( ( option ): option is FontSizeOption => option !== undefined );
}

// Default named presets map. Always create a new instance of the preset object in order to avoid modifying references.
const namedPresets: Record<string, FontSizeOption> = {
	get tiny(): FontSizeOption {
		return {
			title: 'Tiny',
			model: 'tiny',
			view: {
				name: 'span',
				classes: 'text-tiny',
				priority: 7
			}
		};
	},
	get small(): FontSizeOption {
		return {
			title: 'Small',
			model: 'small',
			view: {
				name: 'span',
				classes: 'text-small',
				priority: 7
			}
		};
	},
	get big(): FontSizeOption {
		return {
			title: 'Big',
			model: 'big',
			view: {
				name: 'span',
				classes: 'text-big',
				priority: 7
			}
		};
	},
	get huge(): FontSizeOption {
		return {
			title: 'Huge',
			model: 'huge',
			view: {
				name: 'span',
				classes: 'text-huge',
				priority: 7
			}
		};
	}
};

/**
 * Returns an option definition either from preset or creates one from number shortcut.
 * If object is passed then this method will return it without alternating it. Returns undefined for item than cannot be parsed.
 */
function getOptionDefinition( option: string | number | FontSizeOption ): FontSizeOption | undefined {
	if ( typeof option === 'number' ) {
		option = String( option );
	}

	// Check whether passed option is a full item definition provided by user in configuration.
	if ( typeof option === 'object' && isFullItemDefinition( option ) ) {
		return attachPriority( option );
	}

	const preset = findPreset( option );

	// Item is a named preset.
	if ( preset ) {
		return attachPriority( preset );
	}

	// 'Default' font size. It will be used to remove the fontSize attribute.
	if ( option === 'default' ) {
		return {
			model: undefined,
			title: 'Default'
		};
	}

	// At this stage we probably have numerical value to generate a preset so parse it's value.
	// Discard any faulty values.
	if ( isNumericalDefinition( option ) ) {
		return undefined;
	}

	// Return font size definition from size value.
	return generatePixelPreset( option );
}

/**
 * Creates a predefined preset for pixel size.
 * @param definition Font size in pixels.
 * @returns
 */
function generatePixelPreset( definition: string | FontSizeOption ): FontSizeOption {
	// Extend a short (numeric value) definition.
	if ( typeof definition === 'string' ) {
		definition = {
			title: definition,
			model: `${ parseFloat( definition ) }px`
		};
	}

	definition.view = {
		name: 'span',
		styles: {
			'font-size': definition.model!
		}
	};

	return attachPriority( definition );
}

/**
 * Adds the priority to the view element definition if missing. It's required due to ckeditor/ckeditor5#2291
 */
function attachPriority( definition: FontSizeOption ): FontSizeOption {
	if ( definition.view && typeof definition.view !== 'string' && !definition.view.priority ) {
		definition.view!.priority = 7;
	}

	return definition;
}

/**
 * Returns a prepared preset definition. If passed an object, a name of preset should be defined as `model` value.
 *
 * @param definition.model A preset name.
 */
function findPreset( definition: string | { model?: string } ): FontSizeOption | undefined {
	return typeof definition === 'string' ? namedPresets[ definition ] : namedPresets[ definition.model! ];
}

/**
 * We treat `definition` as completed if it is an object that contains `title`, `model` and `view` values.
 */
function isFullItemDefinition( definition: Record<string, any> ): boolean {
	return definition.title && definition.model && definition.view;
}

function isNumericalDefinition( definition: string | FontSizeOption ): boolean {
	let numberValue;

	if ( typeof definition === 'object' ) {
		if ( !definition.model ) {
			/**
			 * Provided value as an option for {@link module:font/fontsize~FontSize} seems to invalid.
			 *
			 * See valid examples described in the {@link module:font/fontconfig~FontSizeConfig#options plugin configuration}.
			 *
			 * @error font-size-invalid-definition
			 */
			throw new CKEditorError( 'font-size-invalid-definition', null, definition );
		} else {
			numberValue = parseFloat( definition.model );
		}
	} else {
		numberValue = parseFloat( definition );
	}

	return isNaN( numberValue );
}
