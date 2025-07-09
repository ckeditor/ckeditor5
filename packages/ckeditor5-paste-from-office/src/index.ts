/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office
 */

export { PasteFromOffice } from './pastefromoffice.js';
export type { PasteFromOfficeNormalizer, PasteFromOfficeNormalizerData } from './normalizer.js';
export { PasteFromOfficeMSWordNormalizer } from './normalizers/mswordnormalizer.js';
export { parsePasteOfficeHtml, type PasteOfficeHtmlParseResult } from './filters/parse.js';

export { transformBookmarks as _transformPasteOfficeBookmarks } from './filters/bookmark.js';
export { transformBlockBrsToParagraphs as _transformPasteOfficeBlockBrsToParagraphs } from './filters/br.js';
export {
	replaceImagesSourceWithBase64 as _replacePasteOfficeImagesSourceWithBase64,
	_convertHexToBase64
} from './filters/image.js';
export {
	transformListItemLikeElementsIntoLists as _transformPasteOfficeListItemLikeElementsIntoLists,
	unwrapParagraphInListItem as _unwrapPasteOfficeParagraphInListItem
} from './filters/list.js';
export { removeBoldWrapper as _removePasteOfficeBoldWrapper } from './filters/removeboldwrapper.js';
export { removeGoogleSheetsTag as _removePasteGoogleOfficeSheetsTag } from './filters/removegooglesheetstag.js';
export { removeInvalidTableWidth as _removePasteOfficeInvalidTableWidths } from './filters/removeinvalidtablewidth.js';
export { removeMSAttributes as _removePasteMSOfficeAttributes } from './filters/removemsattributes.js';
export { removeStyleBlock as _removePasteOfficeStyleBlock } from './filters/removestyleblock.js';
export { removeXmlns as _removePasteOfficeXmlnsAttributes } from './filters/removexmlns.js';
export {
	normalizeSpacing as _normalizePasteOfficeSpacing,
	normalizeSpacerunSpans as _normalizePasteOfficeSpaceRunSpans
} from './filters/space.js';
export { transformTables as _transformPasteOfficeTables } from './filters/table.js';
export {
	convertCssLengthToPx as _convertPasteOfficeCssLengthToPx,
	isPx as _isPasteOfficePxValue,
	toPx as _toPasteOfficePxValue
} from './filters/utils.js';
export { GoogleDocsNormalizer as PasteFromOfficeGoogleDocsNormalizer } from './normalizers/googledocsnormalizer.js';
export { GoogleSheetsNormalizer as PasteFromOfficeGoogleSheetsNormalizer } from './normalizers/googlesheetsnormalizer.js';

import './augmentation.js';
