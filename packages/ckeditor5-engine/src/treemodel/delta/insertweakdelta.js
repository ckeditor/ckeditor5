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
	 * uses the `InsertWeakDelta` class which inherits from the `Delta` class and may overwrite some methods.
	 *
	 * @class treeModel.delta.InsertWeakDelta
	 */
	class InsertWeakDelta extends Delta {}

	/**
	 * Inserts a node or nodes at the given position. {@link treeModel.Batch#insertWeak} is commonly used for actions
	 * like typing or plain-text paste (without formatting). There are two differences between
	 * {@link treeModel.Batch#insert} and {@link treeModel.Batch#insertWeak}:
	 * * When using `insertWeak`, inserted nodes will have same attributes as the current attributes of
	 * {@link treeModel.Document#selection document selection}.
	 * * During {@link treeModel.operation.transform operational transformation}, if nodes are inserted between moved nodes
	 * they end up inserted at the position before moved range (so they do not move with the range). `insertWeak` changes
	 * this behavior - inserted nodes "sticks" with range and end up in moved range.
	 *
	 *
	 *				|----------|				move + insert				move + insertWeak
	 *		<p>fo[o^ba]r</p><p>|</p>			<p>foxyzr</p><p>oba</p>		<p>for</p><p>oxyzba</p>
	 *		  	 "xyz"
	 *
	 * @chainable
	 * @memberOf treeModel.Batch
	 * @method insertWeak
	 * @param {treeModel.Position} position Position of insertion.
	 * @param {treeModel.Node|treeModel.Text|treeModel.NodeList|String|Iterable} nodes The list of nodes to be inserted.
	 * List of nodes can be of any type accepted by the {@link treeModel.NodeList} constructor.
	 */
	register( 'insertWeak', function( position, nodes ) {
		const delta = new InsertWeakDelta();

		nodes = new NodeList( nodes );

		for ( let node of nodes ) {
			node.setAttrsTo( this.doc.selection.getAttrs() );
		}

		const operation = new InsertOperation( position, nodes, this.doc.version );
		this.doc.applyOperation( operation );
		delta.addOperation( operation );

		this.addDelta( delta );

		return this;
	} );

	return InsertWeakDelta;
} );
