/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Test fixture for the module re-exports validator.
 *
 * @publicApi
 */

import ParsingDefault from './default-export.js';
import { ParsingFeature, parsingHelper as parsingAlias, type ParsingType } from './named-exports.js';
import type { ParsingChild } from './references.js';
// @ts-expect-error -- The imported package does not exist. The fixture is only parsed by Babel, never compiled.
import * as parsingNamespace from 'external-package';

export const parsingValues = [ ParsingDefault, ParsingFeature, parsingAlias, parsingNamespace ];

export type ParsingCombined = ParsingType | ParsingChild;
