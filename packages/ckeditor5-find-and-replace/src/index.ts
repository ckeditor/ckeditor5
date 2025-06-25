/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module find-and-replace
 */

export { FindAndReplace, type FindResultType } from './findandreplace.js';
export { FindAndReplaceEditing } from './findandreplaceediting.js';
export { FindAndReplaceUI, type FindResetedEvent } from './findandreplaceui.js';
export { FindAndReplaceUtils } from './findandreplaceutils.js';
export { FindCommand, type FindAttributes } from './findcommand.js';
export { FindNextCommand } from './findnextcommand.js';
export { FindPreviousCommand } from './findpreviouscommand.js';
export { ReplaceCommand } from './replacecommand.js';
export { ReplaceAllCommand } from './replaceallcommand.js';
export { FindReplaceCommandBase } from './replacecommandbase.js';
export type { FindAndReplaceConfig } from './findandreplaceconfig.js';

export {
	FindAndReplaceFormView,
	type FindNextEvent,
	type FindNextEventData,
	type FindPreviousEvent,
	type FindEventBaseData,
	type ReplaceEvent,
	type ReplaceEventData,
	type ReplaceAllEvent
} from './ui/findandreplaceformview.js';

export {
	FindAndReplaceState,
	sortSearchResultsByMarkerPositions as _sortFindResultsByMarkerPositions,
	type FindCallback,
	type FindCallbackResultObject,
	type FindCallbackResult
} from './findandreplacestate.js';

import './augmentation.js';
