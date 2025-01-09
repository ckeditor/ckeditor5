/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module style/integrations/list
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { Element } from 'ckeditor5/src/engine.js';
import type { ListType, ListUtils } from '@ckeditor/ckeditor5-list';
import type { TemplateDefinition } from 'ckeditor5/src/ui.js';

import type { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import StyleUtils, {
	type BlockStyleDefinition,
	type StyleUtilsGetAffectedBlocksEvent,
	type StyleUtilsIsActiveForBlockEvent,
	type StyleUtilsIsEnabledForBlockEvent,
	type StyleUtilsGetStylePreviewEvent
} from '../styleutils.js';

import type { StyleDefinition } from '../styleconfig.js';

export default class ListStyleSupport extends Plugin {
	private _listUtils!: ListUtils;
	private _styleUtils!: StyleUtils;
	private _htmlSupport!: GeneralHtmlSupport;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListStyleSupport' as const;
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
	public static get requires() {
		return [ StyleUtils, 'GeneralHtmlSupport' ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'ListEditing' ) ) {
			return;
		}

		this._styleUtils = editor.plugins.get( StyleUtils );
		this._listUtils = this.editor.plugins.get( 'ListUtils' );
		this._htmlSupport = this.editor.plugins.get( 'GeneralHtmlSupport' );

		this.listenTo<StyleUtilsIsEnabledForBlockEvent>( this._styleUtils, 'isStyleEnabledForBlock', ( evt, [ definition, block ] ) => {
			if ( this._isStyleEnabledForBlock( definition, block ) ) {
				evt.return = true;
				evt.stop();
			}
		}, { priority: 'high' } );

		this.listenTo<StyleUtilsIsActiveForBlockEvent>( this._styleUtils, 'isStyleActiveForBlock', ( evt, [ definition, block ] ) => {
			if ( this._isStyleActiveForBlock( definition, block ) ) {
				evt.return = true;
				evt.stop();
			}
		}, { priority: 'high' } );

		this.listenTo<StyleUtilsGetAffectedBlocksEvent>( this._styleUtils, 'getAffectedBlocks', ( evt, [ definition, block ] ) => {
			const blocks = this._getAffectedBlocks( definition, block );

			if ( blocks ) {
				evt.return = blocks;
				evt.stop();
			}
		}, { priority: 'high' } );

		this.listenTo<StyleUtilsGetStylePreviewEvent>( this._styleUtils, 'getStylePreview', ( evt, [ definition, children ] ) => {
			const templateDefinition = this._getStylePreview( definition, children );

			if ( templateDefinition ) {
				evt.return = templateDefinition;
				evt.stop();
			}
		}, { priority: 'high' } );
	}

	/**
	 * Verifies if the given style is applicable to the provided block element.
	 */
	private _isStyleEnabledForBlock( definition: BlockStyleDefinition, block: Element ): boolean {
		const model = this.editor.model;

		if ( ![ 'ol', 'ul', 'li' ].includes( definition.element ) ) {
			return false;
		}

		if ( !this._listUtils.isListItemBlock( block ) ) {
			return false;
		}

		const attributeName = this._htmlSupport.getGhsAttributeNameForElement( definition.element );

		if ( definition.element == 'ol' || definition.element == 'ul' ) {
			if ( !model.schema.checkAttribute( block, attributeName ) ) {
				return false;
			}

			const isNumbered = this._listUtils.isNumberedListType( block.getAttribute( 'listType' ) as ListType );
			const viewElementName = isNumbered ? 'ol' : 'ul';

			return definition.element == viewElementName;
		} else {
			return model.schema.checkAttribute( block, attributeName );
		}
	}

	/**
	 * Returns true if the given style is applied to the specified block element.
	 */
	private _isStyleActiveForBlock( definition: BlockStyleDefinition, block: Element ): boolean {
		const attributeName = this._htmlSupport.getGhsAttributeNameForElement( definition.element );
		const ghsAttributeValue = block.getAttribute( attributeName );

		return this._styleUtils.hasAllClasses( ghsAttributeValue, definition.classes );
	}

	/**
	 * Returns an array of block elements that style should be applied to.
	 */
	private _getAffectedBlocks( definition: BlockStyleDefinition, block: Element ): Array<Element> | null {
		if ( !this._isStyleEnabledForBlock( definition, block ) ) {
			return null;
		}

		if ( definition.element == 'li' ) {
			return this._listUtils.expandListBlocksToCompleteItems( block, { withNested: false } );
		} else {
			return this._listUtils.expandListBlocksToCompleteList( block );
		}
	}

	/**
	 * Returns a view template definition for the style preview.
	 */
	private _getStylePreview( definition: StyleDefinition, children: Iterable<TemplateDefinition> ): TemplateDefinition | null {
		const { element, classes } = definition;

		if ( element == 'ol' || element == 'ul' ) {
			return {
				tag: element,
				attributes: {
					class: classes
				},
				children: [
					{
						tag: 'li',
						children
					}
				]
			};
		} else if ( element == 'li' ) {
			return {
				tag: 'ol',
				children: [
					{
						tag: element,
						attributes: {
							class: classes
						},
						children
					}
				]
			};
		}

		return null;
	}
}
