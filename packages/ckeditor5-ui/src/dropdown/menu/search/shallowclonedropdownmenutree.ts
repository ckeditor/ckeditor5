/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/shallowclonedropdownmenutree
 */

import { cloneDeepWith } from 'lodash-es';

import type { DeepReadonly } from '@ckeditor/ckeditor5-core';
import type { DropdownMenusViewsTreeNode } from './tree/dropdownsearchtreetypings.js';

import View from '../../../view.js';

/**
 * Creates a shallow clone of the dropdown menu tree, excluding instances of the View class.
 *
 * ```ts
 * const tree = createTreeFromDropdownMenuView( menuView );
 * const clonedTree = shallowCloneDropdownMenuTree( tree );
 *
 * // It clones whole tree structure but not the View instances.
 * expect( tree ).not.to.be.deep.equal( clonedTree );
 *
 * // `View` reference is the same.
 * expect( tree.children[ 0 ].menu ).to.be.instanceOf( View );
 * expect( clonedTree.children[ 0 ].menu ).to.be.equal( tree.children[ 0 ].menu );)
 * ```
 *
 * @param tree The dropdown menu tree to clone.
 * @returns The shallow clone of the dropdown menu tree.
 */
export function shallowCloneDropdownMenuTree( tree: DeepReadonly<DropdownMenusViewsTreeNode> ): DropdownMenusViewsTreeNode {
	return cloneDeepWith( tree, ( element ): any => {
		if ( typeof element === 'object' && element instanceof View ) {
			return element;
		}
	} );
}
