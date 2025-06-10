/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module find-and-replace
 */

export { FindAndReplace } from './findandreplace.js';
export { FindAndReplaceEditing } from './findandreplaceediting.js';
export { FindAndReplaceUI } from './findandreplaceui.js';
export { FindAndReplaceUtils } from './findandreplaceutils.js';
export { FindCommand } from './findcommand.js';
export { FindNextCommand } from './findnextcommand.js';
export { FindPreviousCommand } from './findpreviouscommand.js';
export { ReplaceCommand } from './replacecommand.js';
export { ReplaceAllCommand } from './replaceallcommand.js';
export type { FindAndReplaceConfig } from './findandreplaceconfig.js';

export { sortSearchResultsByMarkerPositions as _sortFindResultsByMarkerPositions } from './findandreplacestate.js';

import './augmentation.js';
