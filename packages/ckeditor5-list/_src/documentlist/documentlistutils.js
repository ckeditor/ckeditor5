/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistutils
 */

import { Plugin } from 'ckeditor5/src/core';
import { expandListBlocksToCompleteList, isFirstBlockOfListItem, isListItemBlock } from './utils/model';

/**
 * A set of helpers related to document lists.
 *
 * @extends module:core/plugin~Plugin
 */
export default class DocumentListUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DocumentListUtils';
	}

	/**
	 * Expands the given list of selected blocks to include all the items of the lists they're in.
	 *
	 * @param {module:engine/model/element~Element|Array.<module:engine/model/element~Element>} blocks The list of selected blocks.
	 * @returns {Array.<module:engine/model/element~Element>}
	 */
	expandListBlocksToCompleteList( blocks ) {
		return expandListBlocksToCompleteList( blocks );
	}

	/**
	 * Check if the given block is the first in the list item.
	 *
	 * @param {module:engine/model/element~Element} listBlock The list block element.
	 * @returns {Boolean}
	 */
	isFirstBlockOfListItem( listBlock ) {
		return isFirstBlockOfListItem( listBlock );
	}

	/**
	 * Returns true if the given model node is a list item block.
	 *
	 * @param {module:engine/model/node~Node} node A model node.
	 * @returns {Boolean}
	 */
	isListItemBlock( node ) {
		return isListItemBlock( node );
	}
}
