/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { type StyleDefinition } from './styleconfig';

/**
 * @module style/utils
 */

/**
 * Normalizes {@link module:style/styleconfig~StyleConfig#definitions} in the configuration of the styles feature.
 * The structure of normalized styles looks as follows:
 *
 * ```ts
 * {
 *   block: [
 *     <module:style/styleconfig~StyleDefinition>,
 *     <module:style/styleconfig~StyleDefinition>,
 *     ...
 *   ],
 *   inline: [
 *     <module:style/styleconfig~StyleDefinition>,
 *     <module:style/styleconfig~StyleDefinition>,
 *     ...
 *   ]
 * }
 * ```
 *
 * @param {module:html-support/dataschema~DataSchema} dataSchema
 * @param styleDefinitions
 * @returns An object with normalized style definitions grouped into `block` and `inline` categories (arrays).
 */
export function normalizeConfig( dataSchema: any, styleDefinitions: Array<StyleDefinition> = [] ): NormalizedStyleDefinitions {
	// TODO: Update `dataSchema` when GHS module is migrated to TypeScript
	const normalizedDefinitions: NormalizedStyleDefinitions = {
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

export interface NormalizedStyleDefinitions {
	block: Array<BlockStyleDefinition>;
	inline: Array<InlineStyleDefinition>;
}

export interface BlockStyleDefinition extends StyleDefinition {
	isBlock: true;
	modelElements: any; // TODO
}

export interface InlineStyleDefinition extends StyleDefinition {
	ghsAttributes: any; // TODO
}
