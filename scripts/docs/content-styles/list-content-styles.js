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
			for ( const selector of rule.selectors ) {
				const data = {
					file: root.source.input.file,
					css: rule.toString()
				};

				if ( selector.match( ':root' ) ) {
					addDefinition( variables, data );
				}

				if ( selector.match( '.ck-content' ) ) {
					if ( rule.parent.name && rule.parent.params ) {
						const atRule = getAtRuleArray( options.contentRules.atRules, rule.parent.name, rule.parent.params );

						addDefinition( atRule, data );
					} else {
						addDefinition( selectorStyles, data );
					}
				}
			}
		} );
	};
} );

/**
 * @param {Object} collection
 * @param {String} name Name of an `at-rule`.
 * @param {String} params Parameters that describes the `at-rule`.
 * @returns {Array}
 */
function getAtRuleArray( collection, name, params ) {
	const definition = `${ name } ${ params }`;

	if ( !collection[ definition ] ) {
		collection[ definition ] = [];
	}

	return collection[ definition ];
}

/**
 * Checks whether specified definition is duplicated in the colletion.
 *
 * @param {Array.<StyleStructure>} collection
 * @param {StyleStructure} def
 * @returns {Boolean}
 */
function isDuplicatedDefinition( collection, def ) {
	for ( const item of collection ) {
		if ( item.file === def.file && item.css === def.css ) {
			return true;
		}
	}

	return false;
}

/**
 * Adds definition to the collection if it does not exist in the collection.
 *
 * @param {Array.<StyleStructure>} collection
 * @param {StyleStructure} def
 */
function addDefinition( collection, def ) {
	if ( !isDuplicatedDefinition( collection, def ) ) {
		collection.push( def );
	}
}

/**
 * @typedef {Object} StyleStructure
 * @property {String} file An absolute path to the file where a definition is defined.
 * @property {String} css Definition.
 */
