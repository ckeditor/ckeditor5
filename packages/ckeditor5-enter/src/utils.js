/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/utils
 */

/**
 * Returns iterator which has filtered attributes read from {@link module:engine/model/selection~Selection#getAttributes selection}.
 * Filtering is realized based on `copyOnEnter` attribute property. Read more about attribute properties
 * {@link module:engine/model/schema~Schema#setAttributeProperties here}.
 *
 * @param {module:engine/model/schema~Schema} schema
 * @param {Iterable.<*>} allAttributes iterator with attributes of current selection.
 * @returns {Iterable.<*>} filtered attributes which has `copyOnEnter` property.
 */
export function* getCopyOnEnterAttributes( schema, allAttributes ) {
	for ( const attribute of allAttributes ) {
		if ( attribute && schema.getAttributeProperties( attribute[ 0 ] ).copyOnEnter ) {
			yield attribute;
		}
	}
}
