/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageresize/utils/tryparsedimensionwithunit
 */

/**
 * Parses provided string with dimension value and returns extracted numeric value and unit.
 *
 * 	* If non-string dimension is passed then `null` value is returned.
 * 	* If unit is missing then `null` is returned.
 * 	* If numeric value part of string is not a number then `null` is returned.
 *
 * Example:
 * 	`"222px"` => `{ value: 222, unit: "px" }`
 *	`"99%"` => `{ value: 99, unit: "%" }`

 * @param dimension Unsafe string with dimension.
 * @returns Parsed dimension with extracted numeric value and units.
 */
export function tryParseDimensionWithUnit( dimension: string | null | undefined ): DimensionWithUnit | null {
	if ( !dimension ) {
		return null;
	}

	const [ , rawValue, unit ] = dimension.trim().match( /([.,\d]+)(%|px)$/ ) || [];
	const parsedValue = Number.parseFloat( rawValue );

	if ( Number.isNaN( parsedValue ) ) {
		return null;
	}

	return {
		value: parsedValue,
		unit
	};
}

/**
 * Converts dimension between `px` -> `%` and `%` -> `px`.
 *
 * @param parentDimensionPx	Dimension of parent element that contains measured element.
 * @param dimension Measured element dimension.
 * @returns Casted dimension.
 */
export function tryCastDimensionsToUnit( parentDimensionPx: number, dimension: DimensionWithUnit, targetUnit: string ): DimensionWithUnit {
	// "%" -> "px" conversion
	if ( targetUnit === 'px' ) {
		return {
			value: dimension.value,
			unit: 'px'
		};
	}

	// "px" -> "%" conversion
	return {
		value: dimension.value / parentDimensionPx * 100,
		unit: '%'
	};
}

/**
 * @internal
 */
export type DimensionWithUnit = {
	value: number;
	unit: string;
};
