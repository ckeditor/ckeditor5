/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'treemodel/delta/delta',
	'treemodel/delta/register',
	'treemodel/operation/insertoperation',
	'treemodel/nodelist'
], ( Delta, register, InsertOperation, NodeList ) => {
	/**
	 * To provide specific OT behavior and better collisions solving, the {@link treeModel.Batch#insert} method
	 * uses the `InsertTextDelta` class which inherits from the `Delta` class and may overwrite some methods.
	 *
	 * @class treeModel.delta.InsertTextDelta
	 */
	class InsertTextDelta extends Delta {}

	/**
	 * Inserts a node or nodes at the given position. The nodes will have same attributes as the current attributes of
	 * {@link treeModel.Document#selection document selection}. Commonly used for typing or plain-text paste (without formatting).
	 *
	 * @chainable
	 * @memberOf treeModel.Batch
	 * @method insertText
	 * @param {treeModel.Position} position Position of insertion.
	 * @param {treeModel.Node|treeModel.Text|treeModel.NodeList|String|Iterable} nodes The list of nodes to be inserted.
	 * List of nodes can be of any type accepted by the {@link treeModel.NodeList} constructor.
	 */
	register( 'insertText', function( position, nodes ) {
		const delta = new InsertTextDelta();

		/* istanbul ignore else */
		if ( !( nodes instanceof NodeList ) ) {
			nodes = new NodeList( nodes );
		}

		for ( let node of new NodeList( nodes ) ) {
			node.setAttrsTo( this.doc.selection.getAttrs() );
		}

		const operation = new InsertOperation( position, nodes, this.doc.version );
		this.doc.applyOperation( operation );
		delta.addOperation( operation );

		this.addDelta( delta );

		return this;
	} );

	return InsertTextDelta;
} );
