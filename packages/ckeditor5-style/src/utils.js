/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/utils
 */

/**
 * Normalizes {@link module:style/style~StyleConfig#definitions} in the configuration of the styles feature.
 * The structure of normalized styles looks as follows:
 *
 *		{
 *			block: [
 *				<module:style/style~StyleDefinition>,
 *				<module:style/style~StyleDefinition>,
 *				...
 *			],
 *			inline: [
 *				<module:style/style~StyleDefinition>,
 *				<module:style/style~StyleDefinition>,
 *				...
 *			]
 *		}
 *
 * @protected
 * @param {module:html-support/dataschema~DataSchema} dataSchema
 * @param {Array.<module:style/style~StyleDefinition>} styleDefinitions
 * @returns {Object} And object with normalized style definitions grouped into `block` and `inline` categories (arrays).
 */
export function normalizeConfig( dataSchema, styleDefinitions = [] ) {
	const normalizedDefinitions = {
		block: [],
		inline: []
	};

	// Use DataSchema here. But to do that, elements must be enabled in GHS first.
	for ( const definition of styleDefinitions ) {
		if ( definition.element === 'span' ) {
			normalizedDefinitions.inline.push( definition );
		} else {
			normalizedDefinitions.block.push( definition );
		}
	}
	return normalizedDefinitions;
}
