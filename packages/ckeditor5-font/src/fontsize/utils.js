/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontsize/utils
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

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
	get tiny() {
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
	get small() {
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
	get big() {
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
	get huge() {
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
