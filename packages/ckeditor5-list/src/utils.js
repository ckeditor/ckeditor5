/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Utilities used in modules from {@link module:list/list list} package.
 *
 * @module list/utils
 */

/**
 * For given {@link module:engine/model/position~Position position}, returns the closest ancestor of that position which is a
 * `listItem` element.
 *
 * @param {module:engine/model/position~Position} position Position which ancestor should be check looking for `listItem` element.
 * @returns {module:engine/model/element~Element|null} Element with `listItem` name that is a closest ancestor of given `position`, or
 * `null` if neither of `position` ancestors is a `listItem`.
 */
export function getClosestListItem( position ) {
	return Array.from( position.getAncestors() ).find( ( parent ) => parent.name == 'listItem' ) || null;
}
