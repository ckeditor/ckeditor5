/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const stylelint = require( 'stylelint' );

const { report, ruleMessages } = stylelint.utils;

const ruleName = 'ckeditor5-plugin/enforce-license';
const messages = ruleMessages( ruleName, {
	missing: () => 'This file does not start with a license header.',
	incorrect: () => 'Incorrectly formatted license header.'
} );

module.exports.ruleName = ruleName;
module.exports.messages = messages;

module.exports = stylelint.createPlugin( ruleName, function ruleFunction( primaryOption, secondaryOptionObject ) {
	return function lint( root, result ) {
		const firstNode = root.nodes[ 0 ];

		if ( firstNode.type !== 'comment' ) {
			report( {
				ruleName,
				result,
				message: messages.missing(),
				node: firstNode
			} );

			return;
		}

		const rawFileContent = root.source.input.css;
		const expectedHeader = secondaryOptionObject.headerLines.join( '\n' );

		if ( !rawFileContent.startsWith( expectedHeader ) ) {
			report( {
				ruleName,
				result,
				message: messages.incorrect(),
				node: firstNode
			} );
		}
	}; } );

