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

export { transformBookmarks as _transformPastedOfficeBookmarks } from './filters/bookmark.js';
export { transformBlockBrsToParagraphs as _transformPastedOfficeBlockBrsToParagraphs } from './filters/br.js';
export {
	replaceImagesSourceWithBase64 as _replacePastedOfficeImagesSourceWithBase64,
	_convertHexToBase64
} from './filters/image.js';
export {
	transformListItemLikeElementsIntoLists as _transformPastedOfficeListItemLikeElementsIntoLists,
	unwrapParagraphInListItem as _unwrapPastedOfficeParagraphInListItem
} from './filters/list.js';
export { removeBoldWrapper as _removeOfficeBoldWrapper } from './filters/removeboldwrapper.js';
export { removeGoogleSheetsTag as _removePastedGoogleOfficeSheetsTag } from './filters/removegooglesheetstag.js';
export { removeInvalidTableWidth as _removePastedOfficeInvalidTableWidths } from './filters/removeinvalidtablewidth.js';
export { removeMSAttributes as _removePastedMSOfficeAttributes } from './filters/removemsattributes.js';
export { removeStyleBlock as _removePastedOfficeStyleBlock } from './filters/removestyleblock.js';
export { removeXmlns as _removePastedOfficeXmlnsAttributes } from './filters/removexmlns.js';
export {
	normalizeSpacing as _normalizePastedOfficeSpacing,
	normalizeSpacerunSpans as _normalizePastedOfficeSpaceRunSpans
} from './filters/space.js';
export { transformTables as _transformPastedOfficeTables } from './filters/table.js';
export {
	convertCssLengthToPx as _convertPastedOfficeCssLengthToPx,
	isPx as _isPastedOfficePxValue,
	toPx as _toPastedOfficePxValue
} from './filters/utils.js';
export { GoogleDocsNormalizer as PasteFromOfficeGoogleDocsNormalizer } from './normalizers/googledocsnormalizer.js';
export { GoogleSheetsNormalizer as PasteFromOfficeGoogleSheetsNormalizer } from './normalizers/googlesheetsnormalizer.js';

import './augmentation.js';
