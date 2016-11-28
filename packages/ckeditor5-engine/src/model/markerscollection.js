/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import LiveRange from './liverange.js';
import Range from './range.js';
import EmitterMixin from '../../utils/emittermixin.js';
import CKEditorError from '../../utils/ckeditorerror.js';
import mix from '../../utils/mix.js';

/**
 * Manages and stores markers.
 *
 * Markers are simply {@link module:engine/model/liverange~LiveRange live ranges} added to `MarkersCollection`.
 * Markers are used to represent information connected with model document. In contrary to
 * {@link module:engine/model/node~Node nodes}, which are bits of data, markers are marking a part of model document.
 * Each live range/marker is added with `name` parameter. Name is used to group and identify markers. Multiple live
 * ranges can be added under the same name.
 *
 * Whenever live range is added or removed from markers collection, markers collection fires `addMarker` and `removeMarker`
 * events. Same happens when a live range is changed due to changes in the model (both events are fired, `removeMarker` first,
 * then `addMarker`).
 *
 * Markers can be converted to view by adding appropriate converters for
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:addMarker addMarker} and
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:removeMarker removeMarker}
 * events, or by building converters for {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher}
 * using {@link module:engine/conversion/buildmodelconverter~buildModelConverter model converter builder}.
 *
 * Markers are similar to adding and converting attributes on nodes. The difference is that attribute is connected to
 * a given node (i.e. a character is bold no matter if it gets moved or content around it changes). Markers on the
 * other hand are continuous ranges (i.e. if a character from inside of marker range is moved somewhere else, marker
 * range is shrunk and the character does not have any attribute or information that it was in the marked range).
 *
 * @memberOf engine.model
 */
export default class MarkersCollection {
	/**
	 * Creates a markers collection.
	 */
	constructor() {
		/**
		 * Stores range to marker name bindings for added ranges.
		 *
		 * @private
		 * @member {Map} #_markerNames
		 */
		this._markerNames = new Map();
	}

	/**
	 * Sets a name for given live range and adds it to the markers collection. Multiple live ranges may have same name.
	 * Markers can also be grouped while still having different names, i.e.: `search:22`, `search:37`.
	 *
	 * Throws, if given `liveRange` is not an instance of {@link module:engine/model/liverange~LiveRange}.
	 *
	 * Throws, if given {@link module:engine/model/liverange~LiveRange LiveRange} instance is already added to the collection.
	 *
	 * `MarkersCollection` instance listens to `change` event of all live ranges added to it and fires `removeMarker`
	 * and `addMarker` events when the live range changes.
	 *
	 * @param {module:engine/model/liverange~LiveRange} liveRange Live range to be added as a marker to markers collection.
	 * @param {String} markerName Name to be associated with given `liveRange`.
	 */
	addRange( liveRange, markerName ) {
		if ( this._markerNames.has( liveRange ) ) {
			/**
			 * Given range instance was already added.
			 *
			 * @error markers-collection-add-range-range-already-added
			 */
			throw new CKEditorError( 'markers-collection-add-range-already-added: Given range instance was already added.' );
		}

		if ( !( liveRange instanceof LiveRange ) ) {
			/**
			 * Added range is not an instance of LiveRange.
			 *
			 * @error markers-collection-add-range-not-live-range
			 */
			throw new CKEditorError( 'markers-collection-add-range-not-live-range: Added range is not an instance of LiveRange.' );
		}

		this._markerNames.set( liveRange, markerName );
		this.fire( 'addMarker', markerName, Range.createFromRange( liveRange ) );
	}

	/**
	 * Removes a live range from markers collection and makes markers collection stop listening to that live range
	 * `change` event.
	 *
	 * @param {module:engine/model/liverange~LiveRange} liveRange Live range to be removed from markers collection.
	 * @returns {Boolean} `true` is passed `liveRange` was found and removed from the markers collection, `false` otherwise.
	 */
	removeRange( liveRange ) {
		const markerName = this._markerNames.get( liveRange );

		if ( markerName ) {
			this._markerNames.delete( liveRange );
			this.fire( 'removeMarker', markerName, Range.createFromRange( liveRange ) );

			return true;
		}

		return false;
	}

	/**
	 * Substitutes given `oldLiveRange`, that was already added to the markers collection, with given `newLiveRange`.
	 *
	 * This method is basically a wrapper for using {@link module:engine/model/markerscollection~MarkersCollection#removeRange removeRange}
	 * followed by using {@link module:engine/model/markerscollection~MarkersCollection#addRange addRange}.
	 *
	 * **Note**: this method does not change properties of `oldLiveRange`.
	 *
	 * @param {module:engine/model/liverange~LiveRange} oldLiveRange Live range to be changed.
	 * @param {module:engine/model/liverange~LiveRange} newLiveRange Live range to be added.
	 * @returns {Boolean} `true` if `oldLiveRange` was found and changed, `false` otherwise.
	 */
	updateRange( oldLiveRange, newLiveRange ) {
		const markerName = this._markerNames.get( oldLiveRange );

		if ( markerName ) {
			this.removeRange( oldLiveRange );
			this.addRange( newLiveRange, markerName );

			return true;
		}

		return false;
	}

	/**
	 * Destroys markers collection.
	 */
	destroy() {
		this.stopListening();
	}
}

mix( MarkersCollection, EmitterMixin );
