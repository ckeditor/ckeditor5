#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const postcss = require( 'postcss' );

module.exports = postcss.plugin( 'list-content-styles', function( options ) {
	const selectorStyles = options.contentRules.selector;
	const variables = options.contentRules.variables;

	return root => {
		root.walkRules( rule => {
			rule.selectors.forEach( selector => {
				if ( selector.match( ':root' ) ) {
					variables.push( {
						file: root.source.input.file,
						css: rule.toString()
					} );
				}

				if ( selector.match( '.ck-content' ) ) {
					selectorStyles.push( {
						file: root.source.input.file,
						css: rule.toString()
					} );
				}
			} );
		} );
	};
} );
