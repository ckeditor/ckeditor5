/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/utils/autoparagraphing
 */

/**
 * Fixes all empty roots.
 *
 * @protected
 * @param {module:engine/model/writer~Writer} writer The model writer.
 * @returns {Boolean} `true` if any change has been applied, `false` otherwise.
 */
export function autoParagraphEmptyRoots( writer ) {
	const { schema, document } = writer.model;

	for ( const rootName of document.getRootNames() ) {
		const root = document.getRoot( rootName );

		if ( root.isEmpty && !schema.checkChild( root, '$text' ) ) {
			// If paragraph element is allowed in the root, create paragraph element.
			if ( schema.checkChild( root, 'paragraph' ) ) {
				writer.insertElement( 'paragraph', root );

				// Other roots will get fixed in the next post-fixer round. Those will be triggered
				// in the same batch no matter if this method was triggered by the post-fixing or not
				// (the above insertElement call will trigger the post-fixers).
				return true;
			}
		}
	}

	return false;
}
