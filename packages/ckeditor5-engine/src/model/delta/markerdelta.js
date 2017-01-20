/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/markerdelta
 */

import Delta from './delta';
import DeltaFactory from './deltafactory';
import { register } from '../batch';
import MarkerOperation from '../operation/markeroperation';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * @classdesc
 * To provide specific OT behavior and better collisions solving, the {@link module:engine/model/batch~Batch#setMarker Batch#setMarker}
 * and {@link module:engine/model/batch~Batch#removeMarker Batch#removeMarker} methods use the `MarkerDelta` class which inherits
 * from the `Delta` class and may overwrite some methods.
 */
export default class MarkerDelta extends Delta {
	/**
	 * A class that will be used when creating reversed delta.
	 *
	 * @private
	 * @type {Function}
	 */
	get _reverseDeltaClass() {
		return MarkerDelta;
	}

	/**
	 * @inheritDoc
	 */
	static get className() {
		return 'engine.model.delta.MarkerDelta';
	}
}

/**
 * Adds or updates {@link module:engine/model/markercollection~Marker marker} with given name to given `range`.
 *
 * If passed name is a name of already existing marker (or {@link module:engine/model/markercollection~Marker Marker} instance
 * is passed), `range` parameter may be omitted. In this case marker will not be updated in
 * {@link module:engine/model/document~Document#markers document marker collection}. However the marker will be added to
 * the document history. This may be important for other features, like undo. From document history point of view, it will
 * look like the marker was created and added to the document at the moment when it is set using this method.
 *
 * This is useful if the marker is created before it can be added to document history (e.g. a feature creating the marker
 * is waiting for additional data, etc.). In this case, the marker may be first created directly through
 * {@link module:engine/model/markercollection~MarkerCollection MarkerCollection API} and only later added using `Batch` API.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#setMarker
 * @param {module:engine/model/markercollection~Marker|String} markerOrName Marker to update or marker name to add or update.
 * @param {module:engine/model/range~Range} [range] Marker range.
 */
register( 'setMarker', function( markerOrName, range ) {
	const name = typeof markerOrName == 'string' ? markerOrName : markerOrName.name;

	if ( !range && !this.document.markers.has( name ) ) {
		/**
		 * Range parameter is required when adding a new marker.
		 *
		 * @error batch-setMarker-no-range
		 */
		throw new CKEditorError( 'batch-setMarker-no-range: Range parameter is required when adding a new marker.' );
	}

	if ( !range ) {
		range = this.document.markers.get( name ).getRange();
	}

	addOperation( this, name, range );

	return this;
} );

/**
 * Removes given {@link module:engine/model/markercollection~Marker marker} or marker with given name.
 *
 * @chainable
 * @method module:engine/model/batch~Batch#removeMarker
 * @param {module:engine/model/markerscollection~Marker|String} markerOrName
 */
register( 'removeMarker', function( markerOrName ) {
	const name = typeof markerOrName == 'string' ? markerOrName : markerOrName.name;

	addOperation( this, name, null );

	return this;
} );

function addOperation( batch, name, newRange ) {
	const doc = batch.document;

	const delta = new MarkerDelta();
	const marker = doc.markers.get( name );
	const oldRange = marker ? marker.getRange() : null;

	if ( !newRange && !oldRange ) {
		/**
		 * Trying to remove marker that does not exist.
		 *
		 * @error batch-removeMarker-no-marker
		 */
		throw new CKEditorError( 'batch-removeMarker-no-marker: Trying to remove marker that does not exist.' );
	}

	const operation = new MarkerOperation( name, oldRange, newRange, doc.version );

	batch.addDelta( delta );
	delta.addOperation( operation );
	doc.applyOperation( operation );
}

DeltaFactory.register( MarkerDelta );
