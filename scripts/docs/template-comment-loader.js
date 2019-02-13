/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

/*
 * Matches `// @if param // someCode` and evaluates the `option.param`.
 * If the param is evaluated to true, then uncomments the code.
 *
 * Note: Use this only for conditional imports. Otherwise use the webpack define plugin.
 */
module.exports = function templateCommentLoader( source, map ) {
	source = source.replace( /\/\/ @if (!?[\w]+) \/\/(.+)/g, ( match, option, body ) => {
		// this.query comes from the webpack loader config.
		// Missing param in webpack loader config.
		if ( !( option in this.query ) ) {
			return match;
		}

		const optionValue = this.query[ option ];

		// Do nothing when the option is falsy.
		if ( !optionValue ) {
			return match;
		}

		// Replace the option in body with evaluated value.
		body = body.replace( new RegExp( option, 'g' ), this.query[ option ] );

		// Uncomment the following code otherwise.
		return `/* @if ${ option } */ ${ body }`;
	} );

	this.callback( null, source, map );
};
