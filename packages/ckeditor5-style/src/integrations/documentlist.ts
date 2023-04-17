/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin } from 'ckeditor5/src/core';
import type { Element } from 'ckeditor5/src/engine';
import type { DocumentListUtils } from '@ckeditor/ckeditor5-list';

import StyleUtils, {
	type BlockStyleDefinition,
	type StyleUtilsGetAffectedBlocksEvent,
	type StyleUtilsIsActiveForBlockEvent,
	type StyleUtilsIsEnabledForBlockEvent
} from '../styleutils';
import type { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

/**
 * @module style/integrations/documentliststylesupport
 */

export default class DocumentListStyleSupport extends Plugin {
	private _documentListUtils!: DocumentListUtils;
	private _styleUtils!: StyleUtils;

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
		return [ StyleUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'DocumentList' ) ) {
			return;
		}

		this._styleUtils = editor.plugins.get( StyleUtils );
		this._documentListUtils = this.editor.plugins.get( 'DocumentListUtils' );

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
	}

	/**
	 * TODO
	 */
	private _isStyleEnabledForBlock( definition: BlockStyleDefinition, block: Element ): boolean {
		const model = this.editor.model;

		if ( ![ 'ol', 'ul', 'li' ].includes( definition.element ) ) {
			return false;
		}

		if ( !this._documentListUtils.isListItemBlock( block ) ) {
			return false;
		}

		if ( definition.element == 'ol' || definition.element == 'ul' ) {
			if ( !model.schema.checkAttribute( block, 'htmlListAttributes' ) ) {
				return false;
			}

			const viewElementName = block.getAttribute( 'listType' ) == 'numbered' ? 'ol' : 'ul';

			return definition.element == viewElementName;
		} else {
			return model.schema.checkAttribute( block, 'htmlLiAttributes' );
		}
	}

	/**
	 * TODO
	 */
	private _isStyleActiveForBlock( definition: BlockStyleDefinition, block: Element ): boolean {
		const htmlSupport: GeneralHtmlSupport = this.editor.plugins.get( 'GeneralHtmlSupport' );

		const attributeName = htmlSupport.getGhsAttributeNameForElement( definition.element );
		const ghsAttributeValue = block.getAttribute( attributeName );

		return this._styleUtils.hasAllClasses( ghsAttributeValue, definition.classes );
	}

	/**
	 * TODO
	 */
	private _getAffectedBlocks( definition: BlockStyleDefinition, block: Element ): Iterable<Element> | null {
		if ( !this._isStyleEnabledForBlock( definition, block ) ) {
			return null;
		}

		if ( definition.element == 'li' ) {
			return this._documentListUtils.expandListBlocksToCompleteItems( block, { withNested: false } );
		} else {
			return this._documentListUtils.expandListBlocksToCompleteList( block );
		}
	}
}
