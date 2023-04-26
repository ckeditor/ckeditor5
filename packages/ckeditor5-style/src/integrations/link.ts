/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/integrations/link
 */

import { Plugin } from 'ckeditor5/src/core';
import type { Selectable, DocumentSelection, Range, Position, Model } from 'ckeditor5/src/engine';
import { findAttributeRange, findAttributeRangeBound } from 'ckeditor5/src/typing';

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
	 * Verifies if the given style is applicable to the provided document selection.
	 */
	private _isStyleEnabled( definition: InlineStyleDefinition, selection: DocumentSelection ): boolean {
		if ( selection.isCollapsed ) {
			return selection.hasAttribute( 'linkHref' );
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
	 * Returns true if the given style is applied to the specified document selection.
	 */
	private _isStyleActive( definition: InlineStyleDefinition, selection: DocumentSelection ): boolean {
		const attributeName = this._htmlSupport.getGhsAttributeNameForElement( definition.element );

		if ( selection.isCollapsed ) {
			if ( selection.hasAttribute( 'linkHref' ) ) {
				const ghsAttributeValue = selection.getAttribute( attributeName );

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

					return this._styleUtils.hasAllClasses( ghsAttributeValue, definition.classes );
				}
			}
		}

		return false;
	}

	/**
	 * Returns a selectable that given style should be applied to.
	 */
	private _getAffectedSelectable( definition: InlineStyleDefinition, selection: DocumentSelection ): Selectable {
		const model = this.editor.model;

		if ( selection.isCollapsed ) {
			const linkHref = selection.getAttribute( 'linkHref' );

			if ( linkHref ) {
				return findAttributeRange( selection.getFirstPosition()!, 'linkHref', linkHref, model );
			}

			return null;
		}

		const ranges: Array<Range> = [];

		for ( const range of selection.getRanges() ) {
			const expandedRange = model.createRange(
				expandAttributePosition( range.start, true, model ),
				expandAttributePosition( range.end, false, model )
			);

			for ( const item of expandedRange.getItems() ) {
				if ( item.is( '$textProxy' ) && item.hasAttribute( 'linkHref' ) ) {
					ranges.push( this.editor.model.createRangeOn( item ) );
				}
			}
		}

		return normalizeRanges( ranges );
	}
}

/**
 * Walks forward or backward (depends on the `lookBack` flag), node by node, as long as they have the same attribute value
 * and returns a position just before or after (depends on the `lookBack` flag) the last matched node.
 */
function expandAttributePosition( position: Position, lookBack: boolean, model: Model, attributeName: string = 'linkHref' ): Position {
	const referenceNode = position.textNode || ( lookBack ? position.nodeAfter : position.nodeBefore );

	if ( !referenceNode || !referenceNode.hasAttribute( attributeName ) ) {
		return position;
	}

	const attributeValue = referenceNode.getAttribute( attributeName );

	return findAttributeRangeBound( position, attributeName, attributeValue, lookBack, model );
}

/**
 * Normalizes list of ranges by joining intersecting or "touching" ranges.
 *
 * Note: It assumes that ranges are sorted.
 */
function normalizeRanges( ranges: Array<Range> ): Array<Range> {
	for ( let i = 1; i < ranges.length; i++ ) {
		const joinedRange = ranges[ i - 1 ].getJoined( ranges[ i ] );

		if ( joinedRange ) {
			// Replace the ranges on the list with the new joined range.
			ranges.splice( --i, 2, joinedRange );
		}
	}

	return ranges;
}
