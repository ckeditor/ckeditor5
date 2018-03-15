/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/model
 */

// Load all basic deltas and transformations, they register themselves.
import './delta/basic-deltas';
import './delta/basic-transformations';

import Batch from './batch';
import Writer from './writer';
import Schema from './schema';
import Document from './document';
import MarkerCollection from './markercollection';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import deltaTransform from './delta/transform';
import ModelElement from './element';
import ModelRange from './range';

import insertContent from './utils/insertcontent';
import deleteContent from './utils/deletecontent';
import modifySelection from './utils/modifyselection';
import getSelectedContent from './utils/getselectedcontent';

/**
 * Editor's data model class. Model defines all the data: both nodes that are attached to the roots of the
 * {@link module:engine/model/model~Model#document model document}, and also all detached nodes which has not been yet
 * added to the document.
 *
 * All those nodes are created and modified by the {@link module:engine/model/writer~Writer model writer}, which can be
 * accessed by using {@link module:engine/model/model~Model#change} or {@link module:engine/model/model~Model#enqueueChange} methods.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class Model {
	constructor() {
		/**
		 * Models markers' collection.
		 *
		 * @readonly
		 * @member {module:engine/model/markercollection~MarkerCollection}
		 */
		this.markers = new MarkerCollection();

		/**
		 * Editors document model.
		 *
		 * @readonly
		 * @member {module:engine/model/document~Document}
		 */
		this.document = new Document( this );

		/**
		 * Schema for editors model.
		 *
		 * @readonly
		 * @member {module:engine/model/schema~Schema}
		 */
		this.schema = new Schema();

		/**
		 * All callbacks added by {@link module:engine/model/model~Model#change} or
		 * {@link module:engine/model/model~Model#enqueueChange} methods waiting to be executed.
		 *
		 * @private
		 * @type {Array.<Function>}
		 */
		this._pendingChanges = [];

		/**
		 * The last created and currently used writer instance.
		 *
		 * @private
		 * @member {module:engine/model/writer~Writer}
		 */
		this._currentWriter = null;

		[ 'insertContent', 'deleteContent', 'modifySelection', 'getSelectedContent', 'applyOperation' ]
			.forEach( methodName => this.decorate( methodName ) );

		// Adding operation validation with `highest` priority, so it is called before any other feature would like
		// to do anything with the operation. If the operation has incorrect parameters it should throw on the earliest occasion.
		this.on( 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			operation._validate();
		}, { priority: 'highest' } );

		// Register some default abstract entities.
		this.schema.register( '$root', {
			isLimit: true
		} );
		this.schema.register( '$block', {
			allowIn: '$root',
			isBlock: true
		} );
		this.schema.register( '$text', {
			allowIn: '$block'
		} );
		this.schema.register( '$clipboardHolder', {
			allowContentOf: '$root',
			isLimit: true
		} );
		this.schema.extend( '$text', { allowIn: '$clipboardHolder' } );

		// Element needed by `upcastElementToMarker` converter.
		// This element temporarily represents marker bound during conversion process and is removed
		// at the end of conversion. `UpcastDispatcher` or at least `Conversion` class looks like a better for this
		// registration but both know nothing about Schema.
		this.schema.register( '$marker', {
			allowIn: [ '$root', '$block' ]
		} );
	}

	/**
	 * Change method is the primary way of changing the model. You should use it to modify any node, including detached
	 * nodes (not added to the {@link module:engine/model/model~Model#document model document}).
	 *
	 *		model.change( writer => {
	 *			writer.insertText( 'foo', paragraph, 'end' );
	 *		} );
	 *
	 * All changes inside the change block use the same {@link module:engine/model/batch~Batch} so they share the same
	 * undo step.
	 *
	 *		model.change( writer => {
	 *			writer.insertText( 'foo', paragraph, 'end' ); // foo.
	 *
	 *			model.change( writer => {
	 *				writer.insertText( 'bar', paragraph, 'end' ); // foobar.
	 *			} );
	 *
	 * 			writer.insertText( 'bom', paragraph, 'end' ); // foobarbom.
	 *		} );
	 *
	 * Change block is executed immediately.
	 *
	 * You can also return a value from the change block.
	 *
	 *		const img = model.change( writer => {
	 *			return writer.createElement( 'img' );
	 *		} );
	 *
	 * When the outermost block is done the {@link #event:_change} event is fired.
	 *
	 * @see #enqueueChange
	 * @param {Function} callback Callback function which may modify the model.
	 * @returns {*} Value returned by the callback.
	 */
	change( callback ) {
		if ( this._pendingChanges.length === 0 ) {
			// If this is the outermost block, create a new batch and start `_runPendingChanges` execution flow.
			this._pendingChanges.push( { batch: new Batch(), callback } );

			return this._runPendingChanges()[ 0 ];
		} else {
			// If this is not the outermost block, just execute the callback.
			return callback( this._currentWriter );
		}
	}

	/**
	 * `enqueueChange` method performs similar task as the {@link #change change method}, with two major differences.
	 *
	 * First, the callback of the `enqueueChange` is executed when all other changes are done. It might be executed
	 * immediately if it is not nested in any other change block, but if it is nested in another (enqueue)change block,
	 * it will be delayed and executed after the outermost block.
	 *
	 *		model.change( writer => {
	 *			console.log( 1 );
	 *
	 *			model.enqueueChange( writer => {
	 *				console.log( 2 );
	 *			} );
	 *
	 * 			console.log( 3 );
	 *		} ); // Will log: 1, 3, 2.
	 *
	 * Second, it lets you define the {@link module:engine/model/batch~Batch} into which you want to add your changes.
	 * By default, a new batch is created. In the sample above, `change` and `enqueueChange` blocks use a different
	 * batch (and different {@link module:engine/model/writer~Writer} since each of them operates on the separate batch).
	 *
	 * Using `enqueueChange` block you can also add some changes to the batch you used before.
	 *
	 *		model.enqueueChange( batch, writer => {
	 *			writer.insertText( 'foo', paragraph, 'end' );
	 *		} );
	 *
	 * `Batch` instance can be obtained from {@link module:engine/model/writer~Writer#batch the writer}.
	 *
	 * @param {module:engine/model/batch~Batch|String} batchOrType Batch or batch type should be used in the callback.
	 * If not defined, a new batch will be created.
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
	 * {@link module:utils/observablemixin~ObservableMixin#decorate Decorated} function to apply
	 * {@link module:engine/model/operation/operation~Operation operations} on the model.
	 *
	 * @param {module:engine/model/operation/operation~Operation} operation Operation to apply
	 */
	applyOperation( operation ) {
		operation._execute();
	}

	/**
	 * Transforms two sets of deltas by themselves. Returns both transformed sets.
	 *
	 * @param {Array.<module:engine/model/delta/delta~Delta>} deltasA Array with the first set of deltas to transform. These
	 * deltas are considered more important (than `deltasB`) when resolving conflicts.
	 * @param {Array.<module:engine/model/delta/delta~Delta>} deltasB Array with the second set of deltas to transform. These
	 * deltas are considered less important (than `deltasA`) when resolving conflicts.
	 * @param {Boolean} [useContext=false] When set to `true`, transformation will store and use additional context
	 * information to guarantee more expected results. Should be used whenever deltas related to already applied
	 * deltas are transformed (for example when undoing changes).
	 * @returns {Object}
	 * @returns {Array.<module:engine/model/delta/delta~Delta>} return.deltasA The first set of deltas transformed
	 * by the second set of deltas.
	 * @returns {Array.<module:engine/model/delta/delta~Delta>} return.deltasB The second set of deltas transformed
	 * by the first set of deltas.
	 */
	transformDeltas( deltasA, deltasB, useContext = false ) {
		return deltaTransform.transformDeltaSets( deltasA, deltasB, useContext ? this.document : null );
	}

	/**
	 * See {@link module:engine/model/utils/insertcontent~insertContent}.
	 *
	 * @fires insertContent
	 * @param {module:engine/model/documentfragment~DocumentFragment|module:engine/model/item~Item} content The content to insert.
	 * @param {module:engine/model/selection~Selection} selection Selection into which the content should be inserted.
	 */
	insertContent( content, selection ) {
		insertContent( this, content, selection );
	}

	/**
	 * See {@link module:engine/model/utils/deletecontent.deleteContent}.
	 *
	 * Note: For the sake of predictability, the resulting selection should always be collapsed.
	 * In cases where a feature wants to modify deleting behavior so selection isn't collapsed
	 * (e.g. a table feature may want to keep row selection after pressing <kbd>Backspace</kbd>),
	 * then that behavior should be implemented in the view's listener. At the same time, the table feature
	 * will need to modify this method's behavior too, e.g. to "delete contents and then collapse
	 * the selection inside the last selected cell" or "delete the row and collapse selection somewhere near".
	 * That needs to be done in order to ensure that other features which use `deleteContent()` will work well with tables.
	 *
	 * @fires deleteContent
	 * @param {module:engine/model/selection~Selection} selection Selection of which the content should be deleted.
	 * @param {Object} options See {@link module:engine/model/utils/deletecontent~deleteContent}'s options.
	 */
	deleteContent( selection, options ) {
		deleteContent( this, selection, options );
	}

	/**
	 * See {@link module:engine/model/utils/modifyselection~modifySelection}.
	 *
	 * @fires modifySelection
	 * @param {module:engine/model/selection~Selection} selection The selection to modify.
	 * @param {Object} options See {@link module:engine/model/utils/modifyselection.modifySelection}'s options.
	 */
	modifySelection( selection, options ) {
		modifySelection( this, selection, options );
	}

	/**
	 * See {@link module:engine/model/utils/getselectedcontent~getSelectedContent}.
	 *
	 * @fires getSelectedContent
	 * @param {module:engine/model/selection~Selection} selection The selection of which content will be retrieved.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Document fragment holding the clone of the selected content.
	 */
	getSelectedContent( selection ) {
		return getSelectedContent( this, selection );
	}

	/**
	 * Checks whether given {@link module:engine/model/range~Range range} or {@link module:engine/model/element~Element element}
	 * has any content.
	 *
	 * Content is any text node or element which is registered in {@link module:engine/model/schema~Schema schema}.
	 *
	 * @param {module:engine/model/range~Range|module:engine/model/element~Element} rangeOrElement Range or element to check.
	 * @returns {Boolean}
	 */
	hasContent( rangeOrElement ) {
		if ( rangeOrElement instanceof ModelElement ) {
			rangeOrElement = ModelRange.createIn( rangeOrElement );
		}

		if ( rangeOrElement.isCollapsed ) {
			return false;
		}

		for ( const item of rangeOrElement.getItems() ) {
			// Remember, `TreeWalker` returns always `textProxy` nodes.
			if ( item.is( 'textProxy' ) || this.schema.isObject( item ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Removes all events listeners set by model instance and destroys {@link module:engine/model/document~Document}.
	 */
	destroy() {
		this.document.destroy();
		this.stopListening();
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
			// Create a new writer using batch instance created for this chain of changes.
			const currentBatch = this._pendingChanges[ 0 ].batch;
			this._currentWriter = new Writer( this, currentBatch );

			// Execute changes callback and gather the returned value.
			const callbackReturnValue = this._pendingChanges[ 0 ].callback( this._currentWriter );
			ret.push( callbackReturnValue );

			// Fire internal `_change` event.
			this.fire( '_change', this._currentWriter );

			this._pendingChanges.shift();
			this._currentWriter = null;
		}

		return ret;
	}

	/**
	 * Fired after leaving each {@link module:engine/model/model~Model#enqueueChange} block or outermost
	 * {@link module:engine/model/model~Model#change} block.
	 *
	 * **Note:** This is an internal event! Use {@link module:engine/model/document~Document#event:change} instead.
	 *
	 * @protected
	 * @event _change
	 * @param {module:engine/model/writer~Writer} writer `Writer` instance that has been used in the change block.
	 */

	/**
	 * Fired every time any {@link module:engine/model/operation/operation~Operation operation} is applied on the model
	 * using {@link #applyOperation}.
	 *
	 * Note that this event is suitable only for very specific use-cases. Use it if you need to listen to every single operation
	 * applied on the document. However, in most cases {@link module:engine/model/document~Document#event:change} should
	 * be used.
	 *
	 * A few callbacks are already added to this event by engine internal classes:
	 *
	 * * with `highest` priority operation is validated,
	 * * with `normal` priority operation is executed,
	 * * with `low` priority the {@link module:engine/model/document~Document} updates its version,
	 * * with `low` priority {@link module:engine/model/liveposition~LivePosition} and {@link module:engine/model/liverange~LiveRange}
	 * update themselves.
	 *
	 * @event applyOperation
	 * @param {Array} args Arguments of the `applyOperation` which is an array with a single element - applied
	 * {@link module:engine/model/operation/operation~Operation operation}.
	 */

	/**
	 * Event fired when {@link #insertContent} method is called.
	 *
	 * The {@link #insertContent default action of that method} is implemented as a
	 * listener to this event so it can be fully customized by the features.
	 *
	 * @event insertContent
	 * @param {Array} args The arguments passed to the original method.
	 */

	/**
	 * Event fired when {@link #deleteContent} method is called.
	 *
	 * The {@link #deleteContent default action of that method} is implemented as a
	 * listener to this event so it can be fully customized by the features.
	 *
	 * @event deleteContent
	 * @param {Array} args The arguments passed to the original method.
	 */

	/**
	 * Event fired when {@link #modifySelection} method is called.
	 *
	 * The {@link #modifySelection default action of that method} is implemented as a
	 * listener to this event so it can be fully customized by the features.
	 *
	 * @event modifySelection
	 * @param {Array} args The arguments passed to the original method.
	 */

	/**
	 * Event fired when {@link #getSelectedContent} method is called.
	 *
	 * The {@link #getSelectedContent default action of that method} is implemented as a
	 * listener to this event so it can be fully customized by the features.
	 *
	 * @event getSelectedContent
	 * @param {Array} args The arguments passed to the original method.
	 */
}

mix( Model, ObservableMixin );
