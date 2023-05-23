/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/integrations/documentlist
 */

import { Plugin } from 'ckeditor5/src/core';
import type { Element } from 'ckeditor5/src/engine';
import type { DocumentListUtils } from '@ckeditor/ckeditor5-list';
import type { TemplateDefinition } from 'ckeditor5/src/ui';

import type { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import StyleUtils, {
	type BlockStyleDefinition,
	type StyleUtilsGetAffectedBlocksEvent,
	type StyleUtilsIsActiveForBlockEvent,
	type StyleUtilsIsEnabledForBlockEvent,
	type StyleUtilsGetStylePreviewEvent
} from '../styleutils';

import type { StyleDefinition } from '../styleconfig';

export default class DocumentListStyleSupport extends Plugin {
	private _documentListUtils!: DocumentListUtils;
	private _styleUtils!: StyleUtils;
	private _htmlSupport!: GeneralHtmlSupport;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'DocumentListStyleSupport' {
		return 'DocumentListStyleSupport';
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

		if ( !editor.plugins.has( 'DocumentListEditing' ) ) {
			return;
		}

		this._styleUtils = editor.plugins.get( StyleUtils );
		this._documentListUtils = this.editor.plugins.get( 'DocumentListUtils' );
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

		if ( !this._documentListUtils.isListItemBlock( block ) ) {
			return false;
		}

		const attributeName = this._htmlSupport.getGhsAttributeNameForElement( definition.element );

		if ( definition.element == 'ol' || definition.element == 'ul' ) {
			if ( !model.schema.checkAttribute( block, attributeName ) ) {
				return false;
			}

			const viewElementName = block.getAttribute( 'listType' ) == 'numbered' ? 'ol' : 'ul';

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
			return this._documentListUtils.expandListBlocksToCompleteItems( block, { withNested: false } );
		} else {
			return this._documentListUtils.expandListBlocksToCompleteList( block );
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
