/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { type ModelNode } from './node.js';
import { type ModelTextProxy } from './textproxy.js';

/**
 * @module engine/model/item
 */

/**
 * Item is a {@link module:engine/model/node~ModelNode} or {@link module:engine/model/textproxy~ModelTextProxy}.
 */
export type ModelItem = ModelNode | ModelTextProxy;
