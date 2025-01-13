/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module style/styleutils
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { Element, MatcherObjectPattern, DocumentSelection, Selectable } from 'ckeditor5/src/engine.js';
import type { DecoratedMethodEvent } from 'ckeditor5/src/utils.js';
import type { TemplateDefinition } from 'ckeditor5/src/ui.js';

import type { DataFilter, DataSchema, GeneralHtmlSupport, DataSchemaBlockElementDefinition } from '@ckeditor/ckeditor5-html-support';

import type { StyleDefinition } from './styleconfig.js';
import { isObject } from 'es-toolkit/compat';

// These are intermediate element names that can't be rendered as style preview because they don't make sense standalone.
const NON_PREVIEWABLE_ELEMENT_NAMES = [
	'caption', 'colgroup', 'dd', 'dt', 'figcaption', 'legend', 'li', 'optgroup', 'option', 'rp',
	'rt', 'summary', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'
];

export default class StyleUtils extends Plugin {
	private _htmlSupport!: GeneralHtmlSupport;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'StyleUtils' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.decorate( 'isStyleEnabledForBlock' );
		this.decorate( 'isStyleActiveForBlock' );
		this.decorate( 'getAffectedBlocks' );

		this.decorate( 'isStyleEnabledForInlineSelection' );
		this.decorate( 'isStyleActiveForInlineSelection' );
		this.decorate( 'getAffectedInlineSelectable' );

		this.decorate( 'getStylePreview' );
		this.decorate( 'configureGHSDataFilter' );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this._htmlSupport = this.editor.plugins.get( 'GeneralHtmlSupport' );
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
						const ghsBlockDefinition: DataSchemaBlockElementDefinition = ghsDefinition;

						modelElements.push( ghsDefinition.model );

						if ( ghsBlockDefinition.paragraphLikeModel ) {
							modelElements.push( ghsBlockDefinition.paragraphLikeModel );
						}
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
	 * Verifies if the given style is applicable to the provided block element.
	 *
	 * @internal
	 */
	public isStyleEnabledForBlock( definition: BlockStyleDefinition, block: Element ): boolean {
		const model = this.editor.model;
		const attributeName = this._htmlSupport.getGhsAttributeNameForElement( definition.element );

		if ( !model.schema.checkAttribute( block, attributeName ) ) {
			return false;
		}

		return definition.modelElements.includes( block.name );
	}

	/**
	 * Returns true if the given style is applied to the specified block element.
	 *
	 * @internal
	 */
	public isStyleActiveForBlock( definition: BlockStyleDefinition, block: Element ): boolean {
		const attributeName = this._htmlSupport.getGhsAttributeNameForElement( definition.element );
		const ghsAttributeValue = block.getAttribute( attributeName );

		return this.hasAllClasses( ghsAttributeValue, definition.classes );
	}

	/**
	 * Returns an array of block elements that style should be applied to.
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
	 * Verifies if the given style is applicable to the provided document selection.
	 *
	 * @internal
	 */
	public isStyleEnabledForInlineSelection( definition: InlineStyleDefinition, selection: DocumentSelection ): boolean {
		const model = this.editor.model;

		for ( const ghsAttributeName of definition.ghsAttributes ) {
			if ( model.schema.checkAttributeInSelection( selection, ghsAttributeName ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns true if the given style is applied to the specified document selection.
	 *
	 * @internal
	 */
	public isStyleActiveForInlineSelection( definition: InlineStyleDefinition, selection: DocumentSelection ): boolean {
		for ( const ghsAttributeName of definition.ghsAttributes ) {
			const ghsAttributeValue = this._getValueFromFirstAllowedNode( selection, ghsAttributeName );

			if ( this.hasAllClasses( ghsAttributeValue, definition.classes ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns a selectable that given style should be applied to.
	 *
	 * @internal
	 */
	public getAffectedInlineSelectable( definition: InlineStyleDefinition, selection: DocumentSelection ): Selectable {
		return selection;
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

	/**
	 * This is where the styles feature configures the GHS feature. This method translates normalized
	 * {@link module:style/styleconfig~StyleDefinition style definitions} to
	 * {@link module:engine/view/matcher~MatcherObjectPattern matcher patterns} and feeds them to the GHS
	 * {@link module:html-support/datafilter~DataFilter} plugin.
	 *
	 * @internal
	 */
	public configureGHSDataFilter( { block, inline }: NormalizedStyleDefinitions ): void {
		const ghsDataFilter: DataFilter = this.editor.plugins.get( 'DataFilter' );

		ghsDataFilter.loadAllowedConfig( block.map( normalizedStyleDefinitionToMatcherPattern ) );
		ghsDataFilter.loadAllowedConfig( inline.map( normalizedStyleDefinitionToMatcherPattern ) );
	}

	/**
	 * Checks the attribute value of the first node in the selection that allows the attribute.
	 * For the collapsed selection, returns the selection attribute.
	 *
	 * @param selection The document selection.
	 * @param attributeName Name of the GHS attribute.
	 * @returns The attribute value.
	 */
	private _getValueFromFirstAllowedNode( selection: DocumentSelection, attributeName: string ): unknown | null {
		const model = this.editor.model;
		const schema = model.schema;

		if ( selection.isCollapsed ) {
			return selection.getAttribute( attributeName );
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				if ( schema.checkAttribute( item, attributeName ) ) {
					return item.getAttribute( attributeName );
				}
			}
		}

		return null;
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

/**
 * Translates a normalized style definition to a view matcher pattern.
 */
function normalizedStyleDefinitionToMatcherPattern( { element, classes }: StyleDefinition ): MatcherObjectPattern {
	return {
		name: element,
		classes
	};
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

export type NormalizedStyleDefinition = BlockStyleDefinition | InlineStyleDefinition;

export type StyleUtilsIsEnabledForBlockEvent = DecoratedMethodEvent<StyleUtils, 'isStyleEnabledForBlock'>;
export type StyleUtilsIsActiveForBlockEvent = DecoratedMethodEvent<StyleUtils, 'isStyleActiveForBlock'>;
export type StyleUtilsGetAffectedBlocksEvent = DecoratedMethodEvent<StyleUtils, 'getAffectedBlocks'>;

export type StyleUtilsIsStyleEnabledForInlineSelectionEvent = DecoratedMethodEvent<StyleUtils, 'isStyleEnabledForInlineSelection'>;
export type StyleUtilsIsStyleActiveForInlineSelectionEvent = DecoratedMethodEvent<StyleUtils, 'isStyleActiveForInlineSelection'>;
export type StyleUtilsGetAffectedInlineSelectableEvent = DecoratedMethodEvent<StyleUtils, 'getAffectedInlineSelectable'>;

export type StyleUtilsGetStylePreviewEvent = DecoratedMethodEvent<StyleUtils, 'getStylePreview'>;
export type StyleUtilsConfigureGHSDataFilterEvent = DecoratedMethodEvent<StyleUtils, 'configureGHSDataFilter'>;
