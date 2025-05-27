/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Returns the PostCSS plugin that allows intercepting CSS definition used in the editor's build.
 *
 * @param {Object} contentRules
 * @param {Array.<String>} contentRules.variables Variables defined as `:root`.
 * @param {Object} contentRules.atRules Definitions of behaves.
 * @param {Array.<String>} contentRules.selector CSS definitions for all selectors.
 * @returns {Object}
 */
function listContentStyles( contentRules ) {
	const { variables, atRules, selector } = contentRules;

	return {
		postcssPlugin: 'list-content-styles',
		OnceExit( root ) {
			root.walkRules( rule => {
				for ( const ruleSelector of rule.selectors ) {
					const data = {
						file: root.source.input.file,
						css: rule.toString()
					};

					if ( ruleSelector.match( ':root' ) ) {
						addDefinition( variables, data );
					}

					if ( ruleSelector.match( '.ck-content' ) ) {
						if ( rule.parent.name && rule.parent.params ) {
							const atRule = getAtRuleArray( atRules, rule.parent.name, rule.parent.params );

							addDefinition( atRule, data );
						} else {
							addDefinition( selector, data );
						}
					}
				}
			} );
		}
	};
}

listContentStyles.postcss = true;

export default listContentStyles;

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
 * Checks whether specified definition is duplicated in the collection.
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
