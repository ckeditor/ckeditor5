/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/utils
 */

/**
 * Gets a name under which we should check this node in the schema.
 *
 * @param {module:engine/model/node~Node} node The node.
 * @returns {String} node name.
 */
export function getNodeSchemaName( node ) {
	if ( node.is( 'text' ) ) {
		return '$text';
	}

	return node.name;
}

/**
 * Removes disallowed by schema attributes from given nodes.
 *
 * @param {module:engine/model/node~Node|Array<module:engine/model/node~Node>} nodes List of nodes or a single node to filter.
 * @param {module:engine/model/schema~SchemaPath} schemaPath
 * @param {module:engine/model/schema~Schema} schema
 */
export function removeDisallowedAttributes( nodes, schemaPath, schema ) {
	if ( !Array.isArray( nodes ) ) {
		nodes = [ nodes ];
	}

	for ( const node of nodes ) {
		for ( const attribute of node.getAttributeKeys() ) {
			if ( !schema.check( { name: getNodeSchemaName( node ), attributes: attribute, inside: schemaPath } ) ) {
				node.removeAttribute( attribute );
			}
		}
	}
}
