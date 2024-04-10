/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageresize/utils/tryparsedimensionwithunit
 */
export type DimensionWithUnit = {
	value: number;
	unit: string;
};

/**
 * Parses provided string with dimension value and returns extracted numeric value and unit.
 *
 * 	* If non-string dimension is passed then `null` value is returned.
 * 	* If unit is missing then `null` is returned.
 * 	* If numeric value part of string is not a number then `null` is returned.
 *
 * Example:
 * 	"222px" => { value: 222, unit: "px" }
 *	"99%" => { value: 99, unit: "%" }

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
