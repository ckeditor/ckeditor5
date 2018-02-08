/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/conversion
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * An utility class that helps organizing dispatchers and adding converters to them.
 */
export default class Conversion {
	/**
	 * Creates new Conversion instance.
	 */
	constructor() {
		this._dispatchersGroups = new Map();
	}

	/**
	 * Registers one or more converters under given group name. Then, group name can be used to assign a converter
	 * to multiple dispatchers at once.
	 *
	 * If given group name is used for a second time,
	 * {@link module:utils/ckeditorerror~CKEditorError conversion-register-group-exists} error is thrown.
	 *
	 * @param {String} groupName A name for dispatchers group.
	 * @param {Array.<module:engine/conversion/downcastdispatcher~DowncastDispatcher|
	 * module:engine/conversion/upcastdispatcher~UpcastDispatcher>} dispatchers Dispatchers to register
	 * under given name.
	 */
	register( groupName, dispatchers ) {
		if ( this._dispatchersGroups.has( groupName ) ) {
			/**
			 * Trying to register a group name that was already registered.
			 *
			 * @error conversion-register-group-exists
			 */
			throw new CKEditorError( 'conversion-register-group-exists: Trying to register a group name that was already registered.' );
		}

		this._dispatchersGroups.set( groupName, dispatchers );
	}

	/**
	 * Provides chainable API to assign converters to dispatchers registered under given group name. Converters are added
	 * by calling `.add()` method of an object returned by this function.
	 *
	 *		conversion.for( 'downcast' )
	 *			.add( conversionHelperA )
	 *			.add( conversionHelperB );
	 *
	 * In above example, `conversionHelperA` and `conversionHelperB` will be called for all dispatchers from `'model'` group.
	 *
	 * `.add()` takes exactly one parameter, which is a function. That function should accept one parameter, which
	 * is a dispatcher instance. The function should add an actual converter to passed dispatcher instance.
	 *
	 * Conversion helpers for most common cases are already provided. They are flexible enough to cover most use cases.
	 * See documentation to learn how they can be configured.
	 *
	 * For downcast (model to view conversion), these are:
	 *
	 * * {@link module:engine/conversion/downcast-converters~downcastElementToElement downcast element to element converter},
	 * * {@link module:engine/conversion/downcast-converters~downcastAttributeToElement downcast attribute to element converter},
	 * * {@link module:engine/conversion/downcast-converters~downcastAttributeToAttribute downcast attribute to attribute converter}.
	 *
	 * For upcast (view to model conversion), these are:
	 *
	 * * {@link module:engine/conversion/upcast-converters~upcastElementToElement upcast element to element converter},
	 * * {@link module:engine/conversion/upcast-converters~upcastElementToAttribute upcast attribute to element converter},
	 * * {@link module:engine/conversion/upcast-converters~upcastAttributeToAttribute upcast attribute to attribute converter}.
	 *
	 * An example of using conversion helpers to convert `paragraph` model element to `p` view element (and back):
	 *
	 *		// Define conversion configuration - model element 'paragraph' should be converted to view element 'p'.
	 *		const config = { model: 'paragraph', view: 'p' };
	 *
	 *		// Add converters to proper dispatchers using conversion helpers.
	 *		conversion.for( 'downcast' ).add( downcastElementToElement( config ) );
	 *		conversion.for( 'upcast' ).add( upcastElementToElement( config ) );
	 *
	 * An example of providing custom conversion helper that uses custom converter function:
	 *
	 *		// Adding custom `myConverter` converter for 'paragraph' element insertion, with default priority ('normal').
	 *		conversion.for( 'downcast' ).add( conversion.customConverter( 'insert:paragraph', myConverter ) );
	 *
	 * @param {String} groupName Name of dispatchers group to add converters to.
	 * @returns {Object} Object with `.add()` method, providing a way to add converters.
	 */
	for( groupName ) {
		const dispatchers = this._getDispatchers( groupName );

		return {
			add( conversionHelper ) {
				_addToDispatchers( dispatchers, conversionHelper );

				return this;
			}
		};
	}

	/**
	 * Returns dispatchers registered under given group name.
	 *
	 * If given group name has not been registered,
	 * {@link module:utils/ckeditorerror~CKEditorError conversion-for-unknown-group} error is thrown.
	 *
	 * @private
	 * @param {String} groupName
	 * @returns {Array.<module:engine/conversion/downcastdispatcher~DowncastDispatcher|
	 * module:engine/conversion/upcastdispatcher~UpcastDispatcher>}
	 */
	_getDispatchers( groupName ) {
		const dispatchers = this._dispatchersGroups.get( groupName );

		if ( !dispatchers ) {
			/**
			 * Trying to add a converter to an unknown dispatchers group.
			 *
			 * @error conversion-for-unknown-group
			 */
			throw new CKEditorError( 'conversion-for-unknown-group: Trying to add a converter to an unknown dispatchers group.' );
		}

		return dispatchers;
	}
}

// Helper function for `Conversion` `.add()` method.
//
// Calls `conversionHelper` on each dispatcher from the group specified earlier in `.for()` call, effectively
// adding converters to all specified dispatchers.
//
// @private
// @param {Array.<module:engine/conversion/downcastdispatcher~DowncastDispatcher|
// module:engine/conversion/upcastdispatcher~UpcastDispatcher>} dispatchers
// @param {Function} conversionHelper
function _addToDispatchers( dispatchers, conversionHelper ) {
	for ( const dispatcher of dispatchers ) {
		conversionHelper( dispatcher );
	}
}
