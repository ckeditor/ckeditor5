/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/resizeimagecommand
 */

import { Command } from 'ckeditor5/src/core.js';
import { calculateHostWidth } from 'ckeditor5/src/widget.js';

import type ImageUtils from '../imageutils.js';
import { tryParseDimensionWithUnit, type DimensionWithUnit } from './utils/tryparseimensionwithunit.js';

/**
 * The resize image command. Currently, it only supports the width attribute.
 */
export default class ResizeImageCommand extends Command {
	/**
	 * Desired image width and height.
	 */
	declare public value: null | {
		width: string | null;
		height: string | null;
	};

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const element = imageUtils.getClosestSelectedImageElement( editor.model.document.selection );

		this.isEnabled = !!element;

		if ( !element || !element.hasAttribute( 'resizedWidth' ) ) {
			this.value = null;
		} else {
			this.value = {
				width: element.getAttribute( 'resizedWidth' ) as string,
				height: null
			};
		}
	}

	/**
	 * Executes the command.
	 *
	 * ```ts
	 * // Sets the width to 50%:
	 * editor.execute( 'resizeImage', { width: '50%' } );
	 *
	 * // Removes the width attribute:
	 * editor.execute( 'resizeImage', { width: null } );
	 * ```
	 *
	 * @param options
	 * @param options.width The new width of the image.
	 * @fires execute
	 */
	public override execute( options: { width: string | null } ): void {
		const editor = this.editor;
		const model = editor.model;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const imageElement = imageUtils.getClosestSelectedImageElement( model.document.selection );

		this.value = {
			width: options.width,
			height: null
		};

		if ( imageElement ) {
			model.change( writer => {
				writer.setAttribute( 'resizedWidth', options.width, imageElement );
				writer.removeAttribute( 'resizedHeight', imageElement );
				imageUtils.setImageNaturalSizeAttributes( imageElement );
			} );
		}
	}

	/**
	 * Returns image width in specified units.
	 *
	 * 	* If image is not selected or command is disabled then `null` will be returned.
	 * 	* If image is not fully loaded (and it is impossible to determine its natural size) then `null` will be returned.
	 *  * If `targetUnit` percentage is passed then it will return width percentage of image related to its accessors.
	 *
	 * @param targetUnit Unit in which dimension will be returned.
	 * @returns Parsed dimension with unit.
	 */
	public getSelectedImageWidthInUnits( targetUnit: string ): DimensionWithUnit | null {
		const { editor, isEnabled, value } = this;
		const { editing } = editor;
		const imageUtils = editor.plugins.get( 'ImageUtils' );

		if ( !isEnabled || !value ) {
			return null;
		}

		const parsedWidth = tryParseDimensionWithUnit( value.width );

		if ( !parsedWidth ) {
			return null;
		}

		if ( parsedWidth.unit === targetUnit ) {
			return parsedWidth;
		}

		const imageModelElement = imageUtils.getClosestSelectedImageElement( editor.model.document.selection )!;
		const imageViewElement = editing.mapper.toViewElement( imageModelElement );
		const imageDOMElement = editing.view.domConverter.mapViewToDom( imageViewElement! )!;

		const imageHolderWidth = imageDOMElement.getBoundingClientRect().width;
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
			value: parsedWidth.value / imageParentWidth * 100,
			unit: '%'
		};
	}
}
