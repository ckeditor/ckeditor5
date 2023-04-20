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
import type { TemplateDefinition } from 'ckeditor5/src/ui';

import type { DataSchema, GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import type { StyleDefinition } from './styleconfig';
import { isObject } from 'lodash-es';

// These are intermediate element names that can't be rendered as style preview because they don't make sense standalone.
const NON_PREVIEWABLE_ELEMENT_NAMES = [
	'caption', 'colgroup', 'dd', 'dt', 'figcaption', 'legend', 'li', 'optgroup', 'option', 'rp',
	'rt', 'summary', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'
];

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
		this.decorate( 'getStylePreview' );
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
			const modelElements: Array<string> = [];
			const ghsAttributes: Array<string> = [];

			for ( const ghsDefinition of dataSchema.getDefinitionsForView( definition.element ) ) {
				const appliesToBlock = 'appliesToBlock' in ghsDefinition ? ghsDefinition.appliesToBlock : false;

				if ( ghsDefinition.isBlock || appliesToBlock ) {
					if ( typeof appliesToBlock == 'string' ) {
						modelElements.push( appliesToBlock );
					} else if ( ghsDefinition.isBlock ) {
						modelElements.push( ghsDefinition.model );
					}
				} else {
					ghsAttributes.push( ghsDefinition.model );
				}
			}

			const previewTemplate = this.getStylePreview( definition, [
				{ text: 'AaBbCcDdEeFfGgHhIiJj' }
			] );

			if ( modelElements.length ) {
				normalizedDefinitions.block.push( {
					...definition,
					previewTemplate,
					modelElements,
					isBlock: true
				} );
			} else {
				normalizedDefinitions.inline.push( {
					...definition,
					previewTemplate,
					ghsAttributes
				} );
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
		const htmlSupport: GeneralHtmlSupport = this.editor.plugins.get( 'GeneralHtmlSupport' );
		const attributeName = htmlSupport.getGhsAttributeNameForElement( definition.element );

		if ( !model.schema.checkAttribute( block, attributeName ) ) {
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
	 *
	 * @internal
	 */
	public getAffectedBlocks( definition: BlockStyleDefinition, block: Element ): Array<Element> | null {
		if ( definition.modelElements.includes( block.name ) ) {
			return [ block ];
		}

		return null;
	}

	/**
	 * Returns the `TemplateDefinition` used by styles dropdown to render style preview.
	 *
	 * @internal
	 */
	public getStylePreview( definition: StyleDefinition, children: Iterable<TemplateDefinition> ): TemplateDefinition {
		const { element, classes } = definition;

		return {
			tag: isPreviewable( element ) ? element : 'div',
			attributes: {
				class: classes
			},
			children
		};
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

/**
 * Decides whether an element should be created in the preview or a substitute `<div>` should
 * be used instead. This avoids previewing a standalone `<td>`, `<li>`, etc. without a parent.
 *
 * @param elementName Name of the element
 * @returns Boolean indicating whether the element can be rendered.
 */
function isPreviewable( elementName: string ): boolean {
	return !NON_PREVIEWABLE_ELEMENT_NAMES.includes( elementName );
}

export interface NormalizedStyleDefinitions {
	block: Array<BlockStyleDefinition>;
	inline: Array<InlineStyleDefinition>;
}

export interface BlockStyleDefinition extends StyleDefinition {
	isBlock: true;
	modelElements: Array<string>;
	previewTemplate: TemplateDefinition;
}

export interface InlineStyleDefinition extends StyleDefinition {
	ghsAttributes: Array<string>;
	previewTemplate: TemplateDefinition;
}

export type StyleUtilsIsEnabledForBlockEvent = DecoratedMethodEvent<StyleUtils, 'isStyleEnabledForBlock'>;
export type StyleUtilsIsActiveForBlockEvent = DecoratedMethodEvent<StyleUtils, 'isStyleActiveForBlock'>;
export type StyleUtilsGetAffectedBlocksEvent = DecoratedMethodEvent<StyleUtils, 'getAffectedBlocks'>;
export type StyleUtilsGetStylePreviewEvent = DecoratedMethodEvent<StyleUtils, 'getStylePreview'>;
