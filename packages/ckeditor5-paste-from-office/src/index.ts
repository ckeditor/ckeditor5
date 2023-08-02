/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office
 */

export { default as PasteFromOffice } from './pastefromoffice';
export { Normalizer, type NormalizerData } from './normalizer';
export { default as MSWordNormalizer } from './normalizers/mswordnormalizer';
export { parseHtml } from './filters/parse';

import './augmentation';
