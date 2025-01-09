/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageresize/utils/getselectedimagepossibleresizerange
 */

import type { Editor } from 'ckeditor5/src/core.js';

import { calculateResizeHostAncestorWidth } from 'ckeditor5/src/widget.js';
import { getSelectedImageEditorNodes } from './getselectedimageeditornodes.js';
import { tryCastDimensionsToUnit, tryParseDimensionWithUnit } from './tryparsedimensionwithunit.js';

/**
 * Returns min and max value of resize image in specified unit.
 *
 * @param editor Editor instance.
 * @param targetUnit Unit in which dimension will be returned.
 * @returns Possible resize range in numeric form.
 */
export function getSelectedImagePossibleResizeRange( editor: Editor, targetUnit: string ): PossibleResizeImageRange | null {
	const imageNodes = getSelectedImageEditorNodes( editor );

	if ( !imageNodes ) {
		return null;
	}

	const imageParentWidthPx = calculateResizeHostAncestorWidth( imageNodes.dom );
	const minimumImageWidth = tryParseDimensionWithUnit( window.getComputedStyle( imageNodes.dom ).minWidth ) || {
		value: 1,
		unit: 'px'
	};

	const lower = Math.max( 0.1, tryCastDimensionsToUnit( imageParentWidthPx, minimumImageWidth, targetUnit ).value );
	const upper = targetUnit === 'px' ? imageParentWidthPx : 100;

	return {
		unit: targetUnit,
		lower,
		upper
	};
}

/**
 * @internal
 */
export type PossibleResizeImageRange = {
	unit: string;
	lower: number;
	upper: number;
};
