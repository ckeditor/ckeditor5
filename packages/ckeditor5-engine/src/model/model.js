/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/model
 */

import Batch from './batch';
import Writer from './writer';
import Schema from './schema';
import Document from './document';
import MarkerCollection from './markercollection';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Editors data model class. Model defines all data: either nodes users see in editable roots, grouped as the
 * {@link module:engine/model/model~Model#document}, and all detached nodes, used to data manipulation. All of them are
 * created and modified by the {@link module:engine/model/writer~Writer}, which can be get using
 * {@link module:engine/model/model~Model#change} or {@link module:engine/model/model~Model#enqueueChange} methods.
 */
export default class Model {
	constructor() {
		/**
		 * All callbacks added by {@link module:engine/model/model~Model#change} or
		 * {@link module:engine/model/model~Model#enqueueChange} methods waiting to be executed.
		 *
		 * @private
		 * @type {Array.<Function>}
		 */
		this._pendingChanges = [];

		/**
		 * Editors document model.
		 *
		 * @member {module:engine/model/document~Document}
		 */
		this.document = new Document( this );

		/**
		 * Schema for editors model.
		 *
		 * @member {module:engine/model/schema~Schema}
		 */
		this.schema = new Schema();

		/**
		 * Models markers' collection.
		 *
		 * @readonly
		 * @member {module:engine/model/markercollection~MarkerCollection}
		 */
		this.markers = new MarkerCollection();

		this.decorate( 'applyOperation' );
	}

	/**
	 * Change method is the primary way of changing the model. You should use it to modify any node, including detached
	 * nodes, not added to the {@link module:engine/model/model~Model#document}.
	 *
	 *		model.change( writer => {
	 *			writer.insertText( 'foo', paragraph, 'end' );
	 *		} );
	 *
	 * All changes inside the change block use the same {@link module:engine/model/batch~Batch} so share the same
	 * undo step.
	 *
	 *		model.change( writer => {
	 *			writer.insertText( 'foo', paragraph, 'end' ); // foo
	 *
	 *			model.change( writer => {
	 *				writer.insertText( 'bar', paragraph, 'end' ); // foobar
	 *			} );
	 *
	 * 			writer.insertText( 'bom', paragraph, 'end' ); // foobarbom
	 *		} );
	 *
	 * Change block is executed imminently.
	 *
	 * You can also return a value from the change block.
	 *
	 *		const img = model.change( writer => {
	 *			return writer.createElement( 'img' );
	 *		} );
	 *
	 * When the outermost block is done the {@link #event:change} event is fired.
	 *
	 * @see #enqueueChange
	 * @fires event:change
	 * @fires event:changesDone
	 * @param {Function} callback Callback function which may modify the model.
	 * @returns {*} Value returned by the callback
	 */
	change( callback ) {
		if ( this._pendingChanges.length === 0 ) {
			this._pendingChanges.push( { batch: new Batch(), callback } );

			return this._runPendingChanges()[ 0 ];
		} else {
			return callback( this._currentWriter );
		}
	}

	/**
	 * `enqueueChange` method is very similar to the {@link #change change method}, with two major differences.
	 *
	 * First, the callback of the `enqueueChange` is executed when all other changes are done. It might be executed
	 * imminently if it is not nested in any other change block, but if it is nested in another change it will be delayed
	 * and executed after the outermost block. If will be also executed after all previous `enqueueChange` blocks.
	 *
	 *		model.change( writer => {
	 *			console.log( 1 );
	 *
	 *			model.enqueueChange( writer => {
	 *				console.log( 3 );
	 *			} );
	 *
	 * 			console.log( 2 );
	 *		} );
	 *
	 * Second, it let you define the {@link module:engine/model/batch~Batch} to which you want to add your changes.
	 * By default it creates a new batch, note that in the sample above `change` and `enqueueChange` blocks use a different
	 * batch (and different {@link module:engine/model/writer~Writer} since each of them operates on the separate batch).
	 *
	 * Using `enqueueChange` block you can also add some changes to the batch you used before.
	 *
	 *		model.enqueueChange( batch, writer => {
	 *			writer.insertText( 'foo', paragraph, 'end' );
	 *		} );
	 *
	 * @fires event:change
	 * @fires event:changesDone
	 * @param {module:engine/model/batch~Batch|String} batchOrType Batch or batch type should be used in the callback.
	 * If not defined new batch will be created.
	 * @param {Function} callback Callback function which may modify the model.
	 */
	enqueueChange( batchOrType, callback ) {
		if ( typeof batchOrType === 'string' ) {
			batchOrType = new Batch( batchOrType );
		} else if ( typeof batchOrType == 'function' ) {
			callback = batchOrType;
			batchOrType = new Batch();
		}

		this._pendingChanges.push( { batch: batchOrType, callback } );

		if ( this._pendingChanges.length == 1 ) {
			this._runPendingChanges();
		}
	}

	/**
	 * Common part of {@link module:engine/model/model~Model#change} and {@link module:engine/model/model~Model#enqueueChange}
	 * which calls callbacks and returns array of values returned by these callbacks.
	 *
	 * @private
	 * @returns {Array.<*>} Array of values returned by callbacks.
	 */
	_runPendingChanges() {
		const ret = [];

		while ( this._pendingChanges.length ) {
			this._currentWriter = new Writer( this, this._pendingChanges[ 0 ].batch );

			ret.push( this._pendingChanges[ 0 ].callback( this._currentWriter ) );

			this.fire( 'change' );

			this._pendingChanges.shift();

			this._currentWriter = null;
		}

		this.fire( 'changesDone' );

		return ret;
	}

	/**
	 * {@link module:utils/observablemixin~ObservableMixin#decorate Decorated} function to apply
	 * {@link module:engine/model/operation/operation~Operation operations} on the model.
	 *
	 * @param {module:engine/model/operation/operation~Operation} operation Operation to apply
	 * @returns {Object} Object with additional information about the applied changes. It properties depends on the
	 * operation type.
	 */
	applyOperation( operation ) {
		return operation._execute();
	}

	/**
	 * Removes all events listeners set by model instance and destroy Document.
	 */
	destroy() {
		this.document.destroy();
		this.stopListening();
	}

	/**
	 * Fires after leaving each {@link module:engine/model/model~Model#enqueueChange} block or outermost
	 * {@link module:engine/model/model~Model#change} block.
	 * Have the same parameters as {@link module:engine/model/model~Model#change}.
	 *
	 * @event change
	 */

	/**
	 * Fires when all queued model changes are done.
	 *
	 * @see #change
	 * @see #enqueueChange
	 * @event changesDone
	 */

	/**
	 * @event applyOperation
	 */
}

mix( Model, ObservableMixin );
