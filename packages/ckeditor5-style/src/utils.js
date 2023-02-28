/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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
 * @returns {Object} An object with normalized style definitions grouped into `block` and `inline` categories (arrays).
 */
export function normalizeConfig( dataSchema, styleDefinitions = [] ) {
	const normalizedDefinitions = {
		block: [],
		inline: []
	};

	for ( const definition of styleDefinitions ) {
		const modelElements = [];
		const ghsAttributes = [];

		for ( const ghsDefinition of dataSchema.getDefinitionsForView( definition.element ) ) {
			if ( ghsDefinition.isBlock ) {
				modelElements.push( ghsDefinition.model );
			} else {
				ghsAttributes.push( ghsDefinition.model );
			}
		}

		if ( modelElements.length ) {
			normalizedDefinitions.block.push( { ...definition, modelElements, isBlock: true } );
		} else {
			normalizedDefinitions.inline.push( { ...definition, ghsAttributes } );
		}
	}
	return normalizedDefinitions;
}
