/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office
 */

export { PasteFromOffice } from './pastefromoffice.js';
export type { Normalizer, NormalizerData } from './normalizer.js';
export { MSWordNormalizer } from './normalizers/mswordnormalizer.js';
export { parseHtml } from './filters/parse.js';

import './augmentation.js';
