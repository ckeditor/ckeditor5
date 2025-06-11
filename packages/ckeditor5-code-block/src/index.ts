/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module code-block
 */

export { CodeBlock } from './codeblock.js';
export { CodeBlockEditing } from './codeblockediting.js';
export { CodeBlockUI } from './codeblockui.js';
export { CodeBlockCommand } from './codeblockcommand.js';
export { IndentCodeBlockCommand } from './indentcodeblockcommand.js';
export { OutdentCodeBlockCommand } from './outdentcodeblockcommand.js';
export type { CodeBlockConfig } from './codeblockconfig.js';

export {
	modelToViewCodeBlockInsertion as _modelToViewCodeBlockInsertion,
	modelToDataViewSoftBreakInsertion as _modelToDataViewCodeBlockSoftBreakInsertion,
	dataViewToModelCodeBlockInsertion as _dataViewToModelCodeBlockInsertion,
	dataViewToModelTextNewlinesInsertion as _dataViewToModelCodeBlockTextNewlinesInsertion,
	dataViewToModelOrphanNodeConsumer as _dataViewToModelCodeBlockOrphanNodeConsumer
} from './converters.js';

export {
	getNormalizedAndLocalizedLanguageDefinitions as _getNormalizedAndLocalizedCodeBlockLanguageDefinitions,
	getPropertyAssociation as _getCodeBlockPropertyAssociation,
	getLeadingWhiteSpaces as _getCodeBlockLeadingWhiteSpaces,
	rawSnippetTextToViewDocumentFragment as _rawCodeBlockSnippetTextToViewDocumentFragment,
	getIndentOutdentPositions as _getCodeBlockIndentOutdentPositions,
	isModelSelectionInCodeBlock as _isModelSelectionInCodeBlock,
	canBeCodeBlock as _canBeCodeBlock,
	getCodeBlockAriaAnnouncement as _getCodeBlockAriaAnnouncement,
	getTextNodeAtLineStart as _getCodeBlockTextNodeAtLineStart
} from './utils.js';

import './augmentation.js';
