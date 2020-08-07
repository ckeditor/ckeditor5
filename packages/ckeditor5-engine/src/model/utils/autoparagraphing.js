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

/**
 * Checks if the given node wrapped with a paragraph would be accepted by the schema in the given position.
 *
 * @protected
 * @param {module:engine/model/position~Position} position The position at which to check.
 * @param {module:engine/model/node~Node|String} nodeOrType The child node or child type to check.
 * @param {module:engine/model/schema~Schema} schema A schema instance used for element validation.
 */
export function isParagraphable( position, nodeOrType, schema ) {
	const context = schema.createContext( position );

	// When paragraph is allowed in this context...
	if ( !schema.checkChild( context, 'paragraph' ) ) {
		return false;
	}

	// And a node would be allowed in this paragraph...
	if ( !schema.checkChild( context.push( 'paragraph' ), nodeOrType ) ) {
		return false;
	}

	return true;
}

/**
 * Inserts a new paragraph at the given position and returns a position inside that paragraph.
 *
 * @protected
 * @param {module:engine/model/position~Position} position The position where a paragraph should be inserted.
 * @param {module:engine/model/writer~Writer} writer The model writer.
 * @returns {module:engine/model/position~Position} Position inside the created paragraph.
 */
export function wrapInParagraph( position, writer ) {
	const paragraph = writer.createElement( 'paragraph' );

	writer.insert( paragraph, position );

	return writer.createPositionAt( paragraph, 0 );
}
