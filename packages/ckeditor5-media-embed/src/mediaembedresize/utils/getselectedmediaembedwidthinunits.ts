/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedresize/utils/getselectedmediaembedwidthinunits
 */

import { Rect, _tryCastDimensionsToUnit, _tryParseDimensionWithUnit, type _DimensionWithUnit } from '@ckeditor/ckeditor5-utils';
import { calculateResizeHostAncestorWidth } from '@ckeditor/ckeditor5-widget';
import type { Editor } from '@ckeditor/ckeditor5-core';

import { getSelectedMediaEmbedEditorNodes } from './getselectedmediaembededitornodes.js';

/**
 * Returns media embed width in specified units after resize.
 *
 * 	* If no media embed is selected or command is disabled, `null` will be returned.
 *	* If `targetUnit` percentage is passed then it will return width percentage relative to its ancestor.
 *
 * @param editor Editor instance.
 * @param targetUnit Unit in which dimension will be returned.
 * @returns Parsed media embed width after resize (with unit).
 * @internal
 */
export function getSelectedMediaEmbedWidthInUnits( editor: Editor, targetUnit: string ): _DimensionWithUnit | null {
	const mediaNodes = getSelectedMediaEmbedEditorNodes( editor );

	if ( !mediaNodes ) {
		return null;
	}

	const parsedResizedWidth = _tryParseDimensionWithUnit(
		mediaNodes.model.getAttribute( 'resizedWidth' ) as string || null
	);

	if ( !parsedResizedWidth ) {
		return null;
	}

	if ( parsedResizedWidth.unit === targetUnit ) {
		return parsedResizedWidth;
	}

	const mediaParentWidthPx = calculateResizeHostAncestorWidth( mediaNodes.dom );
	const mediaHolderDimension = {
		unit: 'px',
		value: new Rect( mediaNodes.dom ).width
	};

	return _tryCastDimensionsToUnit( mediaParentWidthPx, mediaHolderDimension, targetUnit );
}
