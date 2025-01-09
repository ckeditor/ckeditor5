/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/normalizer
 */

import type { ClipboardInputTransformationData } from 'ckeditor5/src/clipboard.js';
import type { ParseHtmlResult } from './filters/parse.js';

/**
 * Interface defining a content transformation pasted from an external editor.
 *
 * Normalizers are registered by the {@link module:paste-from-office/pastefromoffice~PasteFromOffice} plugin and run on
 * {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation inputTransformation event}.
 * They detect environment-specific quirks and transform it into a form compatible with other CKEditor features.
 */
export interface Normalizer {

	/**
	 * Must return `true` if the `htmlString` contains content which this normalizer can transform.
	 */
	isActive( htmlString: string ): boolean;

	/**
	 * Executes the normalization of a given data.
	 */
	execute( data: NormalizerData ): void;
}

export interface NormalizerData extends ClipboardInputTransformationData {
	_isTransformedWithPasteFromOffice?: boolean;
	_parsedData: ParseHtmlResult;
}
