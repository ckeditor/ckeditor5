/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/integrations/link
 */

import { Plugin } from 'ckeditor5/src/core';
import type { Selectable, DocumentSelection } from 'ckeditor5/src/engine';
import { findAttributeRange } from 'ckeditor5/src/typing';

import type { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import StyleUtils, {
	type InlineStyleDefinition,
	type StyleUtilsGetAffectedInlineSelectableEvent,
	type StyleUtilsIsStyleEnabledForInlineSelectionEvent,
	type StyleUtilsIsStyleActiveForInlineSelectionEvent
} from '../styleutils';

export default class LinkStyleSupport extends Plugin {
	private _styleUtils!: StyleUtils;
	private _htmlSupport!: GeneralHtmlSupport;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'LinkStyleSupport' {
		return 'LinkStyleSupport';
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

		if ( !editor.plugins.has( 'LinkEditing' ) ) {
			return;
		}

		this._styleUtils = editor.plugins.get( StyleUtils );
		this._htmlSupport = this.editor.plugins.get( 'GeneralHtmlSupport' );

		this.listenTo<StyleUtilsIsStyleEnabledForInlineSelectionEvent>(
			this._styleUtils,
			'isStyleEnabledForInlineSelection',
			( evt, [ definition, selection ] ) => {
				if ( definition.element == 'a' ) {
					evt.return = this._isStyleEnabled( definition, selection );
					evt.stop();
				}
			},
			{ priority: 'high' }
		);

		this.listenTo<StyleUtilsIsStyleActiveForInlineSelectionEvent>(
			this._styleUtils,
			'isStyleActiveForInlineSelection',
			( evt, [ definition, selection ] ) => {
				if ( definition.element == 'a' ) {
					evt.return = this._isStyleActive( definition, selection );
					evt.stop();
				}
			},
			{ priority: 'high' }
		);

		this.listenTo<StyleUtilsGetAffectedInlineSelectableEvent>(
			this._styleUtils,
			'getAffectedInlineSelectable',
			( evt, [ definition, selection ] ) => {
				if ( definition.element != 'a' ) {
					return;
				}

				const selectable = this._getAffectedSelectable( definition, selection );

				if ( selectable ) {
					evt.return = selectable;
					evt.stop();
				}
			},
			{ priority: 'high' }
		);
	}

	/**
	 * TODO
	 */
	private _isStyleEnabled( definition: InlineStyleDefinition, selection: DocumentSelection ): boolean {
		if ( selection.isCollapsed ) {
			const item = selection.getFirstPosition()!.textNode;

			return !!item && item.hasAttribute( 'linkHref' );
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				if ( item.is( '$textProxy' ) && item.hasAttribute( 'linkHref' ) ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * TODO
	 */
	private _isStyleActive( definition: InlineStyleDefinition, selection: DocumentSelection ): boolean {
		const attributeName = this._htmlSupport.getGhsAttributeNameForElement( definition.element );

		if ( selection.isCollapsed ) {
			const item = selection.getFirstPosition()!.textNode;

			if ( item && item.hasAttribute( attributeName ) ) {
				const ghsAttributeValue = item.getAttribute( attributeName );

				if ( this._styleUtils.hasAllClasses( ghsAttributeValue, definition.classes ) ) {
					return true;
				}
			}

			return false;
		}

		for ( const range of selection.getRanges() ) {
			for ( const item of range.getItems() ) {
				if ( item.is( '$textProxy' ) && item.hasAttribute( 'linkHref' ) ) {
					const ghsAttributeValue = item.getAttribute( attributeName );

					if ( this._styleUtils.hasAllClasses( ghsAttributeValue, definition.classes ) ) {
						return true;
					}
				}
			}
		}

		return false;
	}

	/**
	 * TODO
	 */
	private _getAffectedSelectable( definition: InlineStyleDefinition, selection: DocumentSelection ): Selectable {
		// TODO apply only to links
		return findAttributeRange( selection.getFirstPosition()!, 'linkHref', selection.getAttribute( 'linkHref' ), this.editor.model );
	}
}
