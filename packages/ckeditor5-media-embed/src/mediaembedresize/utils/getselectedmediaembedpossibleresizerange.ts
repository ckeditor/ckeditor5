/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedresize/utils/getselectedmediaembedpossibleresizerange
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import { calculateResizeHostAncestorWidth } from '@ckeditor/ckeditor5-widget';
import { _tryCastDimensionsToUnit, _tryParseDimensionWithUnit } from '@ckeditor/ckeditor5-utils';

import { getSelectedMediaEmbedEditorNodes } from './getselectedmediaembededitornodes.js';

/**
 * Returns the min and max resize values for the selected media embed in the specified unit.
 *
 * @param editor Editor instance.
 * @param targetUnit Unit in which dimension will be returned.
 * @returns Possible resize range in numeric form.
 * @internal
 */
export function getSelectedMediaEmbedPossibleResizeRange( editor: Editor, targetUnit: string ): PossibleResizeMediaEmbedRange | null {
	const mediaNodes = getSelectedMediaEmbedEditorNodes( editor );

	if ( !mediaNodes ) {
		return null;
	}

	const mediaParentWidthPx = calculateResizeHostAncestorWidth( mediaNodes.dom );
	const minimumMediaWidth = _tryParseDimensionWithUnit( window.getComputedStyle( mediaNodes.dom ).minWidth ) || {
		value: 1,
		unit: 'px'
	};

	const lower = Math.max( 0.1, _tryCastDimensionsToUnit( mediaParentWidthPx, minimumMediaWidth, targetUnit ).value );
	const upper = targetUnit === 'px' ? mediaParentWidthPx : 100;

	return {
		unit: targetUnit,
		lower,
		upper
	};
}

/**
 * @internal
 */
export type PossibleResizeMediaEmbedRange = {
	unit: string;
	lower: number;
	upper: number;
};
