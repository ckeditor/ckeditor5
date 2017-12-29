/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
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

		[ 'insertContent', 'deleteContent', 'modifySelection', 'getSelectedContent', 'applyOperation' ]
			.forEach( methodName => this.decorate( methodName ) );

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

		// TODO review
		// Create an "all allowed" context in the schema for processing the pasted content.
		// Read: https://github.com/ckeditor/ckeditor5-engine/issues/638#issuecomment-255086588

		this.schema.register( '$clipboardHolder', {
			allowContentOf: '$root'
		} );
		this.schema.extend( '$text', { allowIn: '$clipboardHolder' } );
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
			if ( item.is( 'textProxy' ) || this.schema.isObject( item.name ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Removes all events listeners set by model instance and destroy Document.
	 */
	destroy() {
		this.document.destroy();
		this.stopListening();
	}
}

mix( Model, ObservableMixin );

/**
 * Fired after leaving each {@link module:engine/model/model~Model#enqueueChange} block or outermost
 * {@link module:engine/model/model~Model#change} block.
 * Have the same parameters as {@link module:engine/model/model~Model#change}.
 *
 * @event change
 */

/**
 * Fired when all queued model changes are done.
 *
 * @see #change
 * @see #enqueueChange
 * @event changesDone
 */

/**
 * Fired every time any {@link module:engine/model/operation/operation~Operation operation} is applied on the model
 * using {@link #applyOperation}.
 *
 * Note that this is an internal event for the specific use-cases. You can use it if you need to know about each operation
 * applied on the document, but in most cases {@link #change} event which is fired when all changes in a
 * {@link module:engine/model/batch~Batch} are applied, is a better choice.
 *
 * With the high priority operation is validated.
 *
 * With the normal priority operation is executed. After that priority you will be able to get additional
 * information about the applied changes returned by {@link module:engine/model/operation/operation~Operation#_execute}
 * as `evt.return`.
 *
 * With the low priority the {@link module:engine/model/document~Document} listen on this event and updates its version.
 *
 * @event applyOperation
 * @param {Array} args Arguments of the `applyOperation` which are an array with a single element:
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
