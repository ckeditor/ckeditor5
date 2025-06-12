/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { type ViewNode } from './node.js';
import { type TextProxy } from './textproxy.js';

/**
 * @module engine/view/item
 */

/**
 * Item is a {@link module:engine/view/node~ViewNode Node} or {@link module:engine/view/textproxy~TextProxy TextProxy}.
 */
export type ViewItem = ViewNode | TextProxy;
