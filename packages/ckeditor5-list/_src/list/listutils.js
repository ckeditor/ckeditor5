/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/list/listutils
 */

import { Plugin } from 'ckeditor5/src/core';
import {
	getListTypeFromListStyleType,
	getSelectedListItems,
	getSiblingNodes
} from './utils';

/**
 * A set of helpers related to document lists.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ListUtils';
	}

	/**
	 * Checks whether the given list-style-type is supported by numbered or bulleted list.
	 *
	 * @param {String} listStyleType
	 * @returns {'bulleted'|'numbered'|null}
	 */
	getListTypeFromListStyleType( listStyleType ) {
		return getListTypeFromListStyleType( listStyleType );
	}

	/**
	 * Returns an array with all `listItem` elements in the model selection.
	 *
	 * It returns all the items even if only a part of the list is selected, including items that belong to nested lists.
	 * If no list is selected, it returns an empty array.
	 * The order of the elements is not specified.
	 *
	 * @param {module:engine/model/model~Model} model
	 * @returns {Array.<module:engine/model/element~Element>}
	 */
	getSelectedListItems( model ) {
		return getSelectedListItems( model );
	}

	/**
	 * Returns an array with all `listItem` elements that represent the same list.
	 *
	 * It means that values of `listIndent`, `listType`, `listStyle`, `listReversed` and `listStart` for all items are equal.
	 *
	 * Additionally, if the `position` is inside a list item, that list item will be returned as well.
	 *
	 * @param {module:engine/model/position~Position} position Starting position.
	 * @param {'forward'|'backward'} direction Walking direction.
	 * @returns {Array.<module:engine/model/element~Element>}
	 */
	getSiblingNodes( position, direction ) {
		return getSiblingNodes( position, direction );
	}
}
