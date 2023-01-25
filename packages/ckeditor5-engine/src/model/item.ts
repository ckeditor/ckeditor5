/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type Node from './node';
import type TextProxy from './textproxy';

/**
 * @module engine/model/item
 */

/**
 * Item is a {@link module:engine/model/node~Node} or {@link module:engine/model/textproxy~TextProxy}.
 */
type Item = Node | TextProxy;
export default Item;
