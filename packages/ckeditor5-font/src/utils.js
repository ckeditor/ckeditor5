/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/utils
 */

/**
 * Builds a proper {@link module:engine/conversion/conversion~ConverterDefinition converter definition} out of input data.
 *
 * @param {String} modelAttributeKey Key
 * @param {Array.<module:font/fontfamily~FontFamilyOption>|Array.<module:font/fontsize~FontSizeOption>} options
 * @returns {module:engine/conversion/conversion~ConverterDefinition}
 */
export function buildDefinition( modelAttributeKey, options ) {
	const definition = {
		model: {
			key: modelAttributeKey,
			values: []
		},
		view: {},
		upcastAlso: {}
	};

	for ( const option of options ) {
		definition.model.values.push( option.model );
		definition.view[ option.model ] = option.view;

		if ( option.upcastAlso ) {
			definition.upcastAlso[ option.model ] = option.upcastAlso;
		}
	}

	return definition;
}
