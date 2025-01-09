/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageresize/utils/getselectedimagewidthinunits
 */

import { Rect } from 'ckeditor5/src/utils.js';

import { calculateResizeHostAncestorWidth } from 'ckeditor5/src/widget.js';
import type { Editor } from 'ckeditor5/src/core.js';

import { tryCastDimensionsToUnit, tryParseDimensionWithUnit, type DimensionWithUnit } from './tryparsedimensionwithunit.js';
import { getSelectedImageEditorNodes } from './getselectedimageeditornodes.js';

/**
 * Returns image width in specified units. It is width of image after resize.
 *
 * 	* If image is not selected or command is disabled then `null` will be returned.
 * 	* If image is not fully loaded (and it is impossible to determine its natural size) then `null` will be returned.
 *	* If `targetUnit` percentage is passed then it will return width percentage of image related to its accessors.
 *
 * @param editor Editor instance.
 * @param targetUnit Unit in which dimension will be returned.
 * @returns Parsed image width after resize (with unit).
 */
export function getSelectedImageWidthInUnits( editor: Editor, targetUnit: string ): DimensionWithUnit | null {
	const imageNodes = getSelectedImageEditorNodes( editor );

	if ( !imageNodes ) {
		return null;
	}

	const parsedResizedWidth = tryParseDimensionWithUnit(
		imageNodes.model.getAttribute( 'resizedWidth' ) as string || null
	);

	if ( !parsedResizedWidth ) {
		return null;
	}

	if ( parsedResizedWidth.unit === targetUnit ) {
		return parsedResizedWidth;
	}

	const imageParentWidthPx = calculateResizeHostAncestorWidth( imageNodes.dom );
	const imageHolderDimension = {
		unit: 'px',
		value: new Rect( imageNodes.dom ).width
	};

	return tryCastDimensionsToUnit( imageParentWidthPx, imageHolderDimension, targetUnit );
}
