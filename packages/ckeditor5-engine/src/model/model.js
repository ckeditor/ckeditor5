/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/model
 */

import Batch from './batch';
import Schema from './schema';
import Document from './document';
import MarkerCollection from './markercollection';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

export default class Model {
	constructor() {
		this._pendingChanges = [];

		this.document = new Document( this );

		/**
		 * Schema for this document.
		 *
		 * @member {module:engine/model/schema~Schema}
		 */
		this.schema = new Schema();

		/**
		 * Document's markers' collection.
		 *
		 * @readonly
		 * @member {module:engine/model/markercollection~MarkerCollection}
		 */
		this.markers = new MarkerCollection();

		this.decorate( 'applyOperation' );
	}

	change( callback ) {
		if ( this._pendingChanges.length === 0 ) {
			this._pendingChanges.push( { batch: new Batch(), callback } );

			return this._runPendingChanges()[ 0 ];
		} else {
			return callback( this._currentWriter );
		}
	}

	enqueueChange( batchOrType, callback ) {
		if ( typeof batchOrType === 'string' ) {
			batchOrType = new Batch( batchOrType );
		} else if ( typeof batchOrType == 'function' ) {
			callback = batchOrType;
			batchOrType = new Batch();
		}

		this._pendingChanges.push( { batchOrType, callback } );

		if ( this._pendingChanges.length == 1 ) {
			this._runPendingChanges();

			this.fire( 'changesDone' );
		}
	}

	_runPendingChanges() {
		const ret = [];

		while ( this._pendingChanges.length ) {
			this._currentWriter = this._pendingChanges[ 0 ].batch;

			ret.push( this._pendingChanges[ 0 ].callback( this._currentWriter ) );

			this.fire( 'change' );

			this._pendingChanges.shift();

			this._currentWriter = null;
		}

		this.fire( 'changesDone' );

		return ret;
	}

	applyOperation( operation ) {
		return operation._execute();
	}

	transformDeltas() {
		// ...
	}
}

mix( Model, ObservableMixin );
