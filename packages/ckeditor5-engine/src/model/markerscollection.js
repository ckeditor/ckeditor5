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
 * Markers are simply {@link module:engine/model/liverange~LiveRange live ranges} that were added to `MarkersCollection`.
 * Markers are used to represent information connected with model document. In contrary to
 * {@link module:engine/model/node~Node nodes}, which are bits of data, markers are marking a part of model document.
 * Each live range is added with `name` parameter. Name is used to group and identify markers. Names have to be unique, but
 * markers can be grouped by using common prefixes, separated with `:`, for example: `user:john` or `search:3`.
 *
 * Whenever live range is added or removed from `MarkersCollection`,
 * {@link module:engine/model/markerscollection~MarkersCollection#event:addMarker addMarker event} and
 * {@link module:engine/model/markerscollection~MarkersCollection#event:addMarker removeMarker event} are fired.
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
 */
export default class MarkersCollection {
	/**
	 * Creates a markers collection.
	 */
	constructor() {
		/**
		 * Stores marker name to range bindings for added ranges.
		 *
		 * @private
		 * @member {Map} #_nameToRange
		 */
		this._nameToRange = new Map();
	}

	/**
	 * Returns an iterator that iterates over all markers added to the collection. Each item returned by the iterator is an array
	 * containing two elements, first is a marker {String name} and second is a marker {@link module:engine/model/range~Range range}.
	 *
	 * @returns {Iterator}
	 */
	[ Symbol.iterator ]() {
		return this._nameToRange.entries();
	}

	/**
	 * Sets a name for given live range and adds it to the markers collection.
	 *
	 * Throws, if given `markerName` was already used.
	 *
	 * Throws, if given `liveRange` is not an instance of {@link module:engine/model/liverange~LiveRange}.
	 *
	 * @param {String} markerName Name to be associated with given `liveRange`.
	 * @param {module:engine/model/liverange~LiveRange} liveRange Live range to be added as a marker to markers collection.
	 */
	add( markerName, liveRange ) {
		if ( this._nameToRange.has( markerName ) ) {
			/**
			 * Marker with given name is already added.
			 *
			 * @error markers-collection-add-name-exists
			 */
			throw new CKEditorError( 'markers-collection-add-name-exists: Marker with given name is already added.' );
		}

		if ( !( liveRange instanceof LiveRange ) ) {
			/**
			 * Added range is not an instance of LiveRange.
			 *
			 * @error markers-collection-add-range-not-live-range
			 */
			throw new CKEditorError( 'markers-collection-add-range-not-live-range: Added range is not an instance of LiveRange.' );
		}

		this._nameToRange.set( markerName, liveRange );
		this.fire( 'add', markerName, Range.createFromRange( liveRange ) );
	}

	/**
	 * Returns the live range that was added to `MarkersCollection` under given `markerName`.
	 *
	 * @param {String} markerName Name of range to get.
	 * @returns {module:engine/model/liverange~LiveRange|null} Range added to collection under given name or `null` if
	 * no range was added with that name.
	 */
	get( markerName ) {
		return this._nameToRange.get( markerName ) || null;
	}

	/**
	 * Removes a live range from markers collection.
	 *
	 * @param {String|module:engine/model/liverange~LiveRange} nameOrRange Name of live range to remove or live range instance.
	 * @returns {Boolean} `true` is passed if range was found and removed from the markers collection, `false` otherwise.
	 */
	remove( nameOrRange ) {
		if ( nameOrRange instanceof LiveRange ) {
			const name = this._getMarkerName( nameOrRange );

			if ( name ) {
				return this.remove( name );
			}

			return false;
		}

		const range = this._nameToRange.get( nameOrRange );

		if ( range ) {
			this._nameToRange.delete( nameOrRange );
			this.fire( 'remove', nameOrRange, Range.createFromRange( range ) );

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
	 * @param {String|module:engine/model/liverange~LiveRange} nameOrRange Name of range or range instance to be changed.
	 * @param {module:engine/model/liverange~LiveRange} newLiveRange Live range to be added.
	 * @returns {Boolean} `true` if `oldLiveRange` was found and changed, `false` otherwise.
	 */
	update( nameOrRange, newLiveRange ) {
		if ( nameOrRange instanceof LiveRange ) {
			const name = this._getMarkerName( nameOrRange );

			if ( name ) {
				return this.update( name, newLiveRange );
			}

			return false;
		}

		const removed = this.remove( nameOrRange );

		if ( removed ) {
			this.add( nameOrRange, newLiveRange );
		}

		return removed;
	}

	/**
	 * Destroys markers collection.
	 */
	destroy() {
		this.stopListening();
	}

	/**
	 * Returns range for given name.
	 *
	 * @private
	 * @param {module:engine/model/liverange~LiveRange} range Range for which name should be obtained.
	 * @returns {String|null} Name of the range or `null` if range has not been added to the collection.
	 */
	_getMarkerName( range ) {
		for ( let [ markerName, markerRange ] of this ) {
			if ( markerRange == range ) {
				return markerName;
			}
		}

		return null;
	}
}

mix( MarkersCollection, EmitterMixin );
