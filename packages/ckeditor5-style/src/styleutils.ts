/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/styleutils
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import type { Element } from 'ckeditor5/src/engine';
import type { DecoratedMethodEvent } from 'ckeditor5/src/utils';
import type { DataSchema, GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import type { StyleDefinition } from './styleconfig';
import { isObject } from 'lodash-es';

export default class StyleUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'StyleUtils' {
		return 'StyleUtils';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.decorate( 'isStyleEnabledForBlock' );
		this.decorate( 'isStyleActiveForBlock' );
		this.decorate( 'getAffectedBlocks' );
	}

	/**
	 * Normalizes {@link module:style/styleconfig~StyleConfig#definitions} in the configuration of the styles feature.
	 * The structure of normalized styles looks as follows:
	 *
	 * ```ts
	 * {
	 * 	block: [
	 * 		<module:style/style~StyleDefinition>,
	 * 		<module:style/style~StyleDefinition>,
	 * 		...
	 * 	],
	 * 	inline: [
	 * 		<module:style/style~StyleDefinition>,
	 * 		<module:style/style~StyleDefinition>,
	 * 		...
	 * 	]
	 * }
	 * ```
	 *
	 * @returns An object with normalized style definitions grouped into `block` and `inline` categories (arrays).
	 */
	public normalizeConfig(
		dataSchema: DataSchema,
		styleDefinitions: Array<StyleDefinition> = []
	): NormalizedStyleDefinitions {
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

	/**
	 * TODO
	 * @internal
	 */
	public isStyleEnabledForBlock( definition: BlockStyleDefinition, block: Element ): boolean {
		const model = this.editor.model;

		if ( !model.schema.checkAttribute( block, 'htmlAttributes' ) ) {
			return false;
		}

		return definition.modelElements.includes( block.name );
	}

	/**
	 * TODO
	 * @internal
	 */
	public isStyleActiveForBlock( definition: BlockStyleDefinition, block: Element ): boolean {
		const htmlSupport: GeneralHtmlSupport = this.editor.plugins.get( 'GeneralHtmlSupport' );
		const attributeName = htmlSupport.getGhsAttributeNameForElement( definition.element );
		const ghsAttributeValue = block.getAttribute( attributeName );

		return this.hasAllClasses( ghsAttributeValue, definition.classes );
	}

	/**
	 * TODO
	 */
	public getAffectedBlocks( definition: BlockStyleDefinition, block: Element ): Iterable<Element> | null {
		if ( definition.modelElements.includes( block.name ) ) {
			return [ block ];
		}

		return null;
	}

	/**
	 * Verifies if all classes are present in the given GHS attribute.
	 *
	 * @internal
	 */
	public hasAllClasses( ghsAttributeValue: unknown, classes: Array<string> ): boolean {
		return isObject( ghsAttributeValue ) &&
			hasClassesProperty( ghsAttributeValue ) &&
			classes.every( className => ghsAttributeValue.classes.includes( className ) );
	}
}

/**
 * Checks if given object has `classes` property which is an array.
 *
 * @param obj Object to check.
 */
function hasClassesProperty<T extends { classes?: Array<unknown> }>( obj: T ): obj is T & { classes: Array<unknown> } {
	return Boolean( obj.classes ) && Array.isArray( obj.classes );
}

export interface NormalizedStyleDefinitions {
	block: Array<BlockStyleDefinition>;
	inline: Array<InlineStyleDefinition>;
}

export interface BlockStyleDefinition extends StyleDefinition {
	isBlock: true;
	modelElements: Array<string>;
}

export interface InlineStyleDefinition extends StyleDefinition {
	ghsAttributes: Array<string>;
}

export type StyleUtilsIsEnabledForBlockEvent = DecoratedMethodEvent<StyleUtils, 'isStyleEnabledForBlock'>;
export type StyleUtilsIsActiveForBlockEvent = DecoratedMethodEvent<StyleUtils, 'isStyleActiveForBlock'>;
export type StyleUtilsGetAffectedBlocksEvent = DecoratedMethodEvent<StyleUtils, 'getAffectedBlocks'>;
