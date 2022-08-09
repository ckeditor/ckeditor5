/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type Node from './node';
import type TextProxy from './textproxy';

/**
 * @module engine/model/item
 */

type Item = Node | TextProxy;
export default Item;
