/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/utils/getselectedimagewidthinunits
 */
import { Rect } from 'ckeditor5/src/utils.js';

import { calculateHostWidth } from 'ckeditor5/src/widget.js';
import type { Editor } from 'ckeditor5/src/core.js';

import { tryParseDimensionWithUnit, type DimensionWithUnit } from './tryparseimensionwithunit.js';

/**
 * Returns image width in specified units.
 *
 * 	* If image is not selected or command is disabled then `null` will be returned.
 * 	* If image is not fully loaded (and it is impossible to determine its natural size) then `null` will be returned.
 *	* If `targetUnit` percentage is passed then it will return width percentage of image related to its accessors.
 *
 * @param targetUnit Unit in which dimension will be returned.
 * @returns Parsed dimension with unit.
 */
export function getSelectedImageWidthInUnits( editor: Editor, targetUnit: string ): DimensionWithUnit | null {
	const { editing } = editor;

	const imageUtils = editor.plugins.get( 'ImageUtils' );
	const imageModelElement = imageUtils.getClosestSelectedImageElement( editor.model.document.selection );

	if ( !imageModelElement ) {
		return null;
	}

	const parsedWidth = tryParseDimensionWithUnit(
		imageModelElement.getAttribute( 'resizedWidth' ) as string || null
	);

	if ( !parsedWidth ) {
		return null;
	}

	if ( parsedWidth.unit === targetUnit ) {
		return parsedWidth;
	}

	const imageViewElement = editing.mapper.toViewElement( imageModelElement );
	const imageDOMElement = editing.view.domConverter.mapViewToDom( imageViewElement! )!;

	const imageHolderWidth = new Rect( imageDOMElement ).width;
	const imageParentWidth = calculateHostWidth( imageDOMElement );

	// "%" -> "px" conversion
	if ( targetUnit === 'px' ) {
		return {
			value: ( imageHolderWidth / imageParentWidth ) * parsedWidth.value,
			unit: 'px'
		};
	}

	// "px" -> "%" conversion
	return {
		value: imageHolderWidth / imageParentWidth * 100,
		unit: '%'
	};
}
