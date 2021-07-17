/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontsize/utils
 */

import { CKEditorError } from 'ckeditor5/src/utils';

/**
 * Normalizes and translates the {@link module:font/fontsize~FontSizeConfig#options configuration options}
 * to the {@link module:font/fontsize~FontSizeOption} format.
 *
 * @param {Array.<String|Number|Object>} configuredOptions An array of options taken from the configuration.
 * @returns {Array.<module:font/fontsize~FontSizeOption>}
 */
export function normalizeOptions( configuredOptions ) {
	// Convert options to objects.
	return configuredOptions
		.map( item => getOptionDefinition( item ) )
		// Filter out undefined values that `getOptionDefinition` might return.
		.filter( option => !!option );
}

// Default named presets map. Always create a new instance of the preset object in order to avoid modifying references.
const namedPresets = {
	get sizeDefault() {
		return {
			title: 'Default',
			model: 'sizeDefault',
			view: {
				name: 'span',
				classes: '',
				priority: 7
			}
		};
	},
	get size10() {
		return {
			title: 'Size 10',
			model: 'size10',
			view: {
				name: 'span',
				classes: 'text-size-10',
				priority: 7
			}
		};
	},
	get size14() {
		return {
			title: 'Size 14',
			model: 'size14',
			view: {
				name: 'span',
				classes: 'text-size-14',
				priority: 7
			}
		};
	},
	get size16() {
		return {
			title: 'Size 16',
			model: 'size16',
			view: {
				name: 'span',
				classes: 'text-size-16',
				priority: 7
			}
		};
	},
	get size18() {
		return {
			title: 'Size 18',
			model: 'size18',
			view: {
				name: 'span',
				classes: 'text-size-18',
				priority: 7
			}
		};
	},
	get size20() {
		return {
			title: 'Size 20',
			model: 'size20',
			view: {
				name: 'span',
				classes: 'text-size-20',
				priority: 7
			}
		};
	},
	get size24() {
		return {
			title: 'Size 24',
			model: 'size24',
			view: {
				name: 'span',
				classes: 'text-size-24',
				priority: 7
			}
		};
	},
	get size26() {
		return {
			title: 'Size 26',
			model: 'size26',
			view: {
				name: 'span',
				classes: 'text-size-26',
				priority: 7
			}
		};
	},
	get size28() {
		return {
			title: 'Size 28',
			model: 'size28',
			view: {
				name: 'span',
				classes: 'text-size-28',
				priority: 7
			}
		};
	},
	get size30() {
		return {
			title: 'Size 30',
			model: 'size30',
			view: {
				name: 'span',
				classes: 'text-size-30',
				priority: 7
			}
		};
	},
	get size32() {
		return {
			title: 'Size 32',
			model: 'size32',
			view: {
				name: 'span',
				classes: 'text-size-32',
				priority: 7
			}
		};
	},
	get size36() {
		return {
			title: 'Size 36',
			model: 'size36',
			view: {
				name: 'span',
				classes: 'text-size-36',
				priority: 7
			}
		};
	},
	get size42() {
		return {
			title: 'Size 42',
			model: 'size42',
			view: {
				name: 'span',
				classes: 'text-size-42',
				priority: 7
			}
		};
	},
	get size46() {
		return {
			title: 'Size 46',
			model: 'size46',
			view: {
				name: 'span',
				classes: 'text-size-46',
				priority: 7
			}
		};
	},
	get size48() {
		return {
			title: 'Size 48',
			model: 'size48',
			view: {
				name: 'span',
				classes: 'text-size-48',
				priority: 7
			}
		};
	},
	get size52() {
		return {
			title: 'Size 52',
			model: 'size52',
			view: {
				name: 'span',
				classes: 'text-size-52',
				priority: 7
			}
		};
	},
	get size56() {
		return {
			title: 'Size 56',
			model: 'size56',
			view: {
				name: 'span',
				classes: 'text-size-56',
				priority: 7
			}
		};
	},
	get size60() {
		return {
			title: 'Size 60',
			model: 'size60',
			view: {
				name: 'span',
				classes: 'text-size-60',
				priority: 7
			}
		};
	},
	get size72() {
		return {
			title: 'Size 72',
			model: 'size72',
			view: {
				name: 'span',
				classes: 'text-size-72',
				priority: 7
			}
		};
	}
};

// Returns an option definition either from preset or creates one from number shortcut.
// If object is passed then this method will return it without alternating it. Returns undefined for item than cannot be parsed.
//
// @param {String|Number|Object} item
// @returns {undefined|module:font/fontsize~FontSizeOption}
function getOptionDefinition( option ) {
	// Check whether passed option is a full item definition provided by user in configuration.
	if ( isFullItemDefinition( option ) ) {
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
		return;
	}

	// Return font size definition from size value.
	return generatePixelPreset( option );
}

// Creates a predefined preset for pixel size.
//
// @param {Number} definition Font size in pixels.
// @returns {module:font/fontsize~FontSizeOption}
function generatePixelPreset( definition ) {
	// Extend a short (numeric value) definition.
	if ( typeof definition === 'number' || typeof definition === 'string' ) {
		definition = {
			title: String( definition ),
			model: `${ parseFloat( definition ) }px`
		};
	}

	definition.view = {
		name: 'span',
		styles: {
			'font-size': definition.model
		}
	};

	return attachPriority( definition );
}

// Adds the priority to the view element definition if missing. It's required due to ckeditor/ckeditor5#2291
//
// @param {Object} definition
// @param {Object} definition.title
// @param {Object} definition.model
// @param {Object} definition.view
// @returns {Object}
function attachPriority( definition ) {
	if ( !definition.view.priority ) {
		definition.view.priority = 7;
	}

	return definition;
}

// Returns a prepared preset definition. If passed an object, a name of preset should be defined as `model` value.
//
// @param {String|Object} definition
// @param {String} definition.model A preset name.
// @returns {Object|undefined}
function findPreset( definition ) {
	return namedPresets[ definition ] || namedPresets[ definition.model ];
}

// We treat `definition` as completed if it is an object that contains `title`, `model` and `view` values.
//
// @param {Object} definition
// @param {String} definition.title
// @param {String} definition.model
// @param {Object} definition.view
// @returns {Boolean}
function isFullItemDefinition( definition ) {
	return typeof definition === 'object' && definition.title && definition.model && definition.view;
}

// We treat `definition` as numerical if it is a number, number-like (string) or an object with the `title` key.
//
// @param {Object|Number|String} definition
// @param {Object} definition.title
// @returns {Boolean}
function isNumericalDefinition( definition ) {
	let numberValue;

	if ( typeof definition === 'object' ) {
		if ( !definition.model ) {
			/**
			 * Provided value as an option for {@link module:font/fontsize~FontSize} seems to invalid.
			 *
			 * See valid examples described in the {@link module:font/fontsize~FontSizeConfig#options plugin configuration}.
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
