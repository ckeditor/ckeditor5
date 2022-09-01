/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const CODES = {
	RED: '\x1B[0;31m',
	CYAN: '\x1B[36;1m',
	GREEN: '\x1B[32m',
	YELLOW: '\x1B[33;1m',
	MAGENTA: '\x1B[35;1m',
	TERMINATE: '\x1B[0m'
};

module.exports = {
	red: string => colorWithAnsi( CODES.RED, string ),
	cyan: string => colorWithAnsi( CODES.CYAN, string ),
	green: string => colorWithAnsi( CODES.GREEN, string ),
	yellow: string => colorWithAnsi( CODES.YELLOW, string ),
	magenta: string => colorWithAnsi( CODES.MAGENTA, string )
};

/**
 * Applies ANSI color coding to the given string.
 * Color code is added at the string start and after newlines.
 * Color termination code is added at the string end and before newlines.
 *
 * @param {String} color ANSI color code to use.
 * @param {String} string string to color.
 * @returns {String}
 */
function colorWithAnsi( color, string ) {
	return string
		.replace( /(?<=^|\n)/g, color )
		.replace( /(?=$|\n)/g, CODES.TERMINATE );
}
