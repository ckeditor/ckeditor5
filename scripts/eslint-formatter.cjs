/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

'use strict';

// See: https://eslint.org/docs/user-guide/formatters/#stylish.
const eslintStylishFormatter = require( 'eslint-formatter-stylish' );

const CODE_STYLE_URL = 'https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/code-style.html#ckeditor-5-custom-eslint-rules';

/**
 * Overwrite the default ESLint formatter. If CKEditor 5 related error occurred,
 * let's print a URL to the documentation where all custom rules are explained.
 *
 * @param {Array} results
 */
module.exports = async results => {
	console.log( eslintStylishFormatter( results ) );

	const hasCKEditorErrors = results.some( item => {
		if ( !Array.isArray( item.messages ) ) {
			return false;
		}

		return item.messages.some( message => {
			return message.ruleId?.startsWith( 'ckeditor5-rules' );
		} );
	} );

	if ( !hasCKEditorErrors ) {
		return;
	}

	const { default: chalk } = await import( 'chalk' );

	console.log( chalk.cyan( 'CKEditor 5 custom ESLint rules are described in the "Code style" guide in the documentation.' ) );
	console.log( chalk.underline( CODE_STYLE_URL ) );
	console.log( '' );
};
