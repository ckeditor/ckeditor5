/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* global console:false */

import moduleUtils from '/tests/_utils/module.js';
import EmitterMixin from '/ckeditor5/core/emittermixin.js';

const utils = {
	/**
	 * Defines CKEditor plugin which is a mock of an editor creator.
	 *
	 * The mocked creator is available under:
	 *
	 *		editor.plugins.get( 'creator-thename' );
	 *
	 * @param {String} creatorName Name of the creator.
	 * @param {Object} [proto] Prototype of the creator. Properties from the proto param will
	 * be copied to the prototype of the creator.
	 */
	defineEditorCreatorMock( creatorName, proto ) {
		moduleUtils.define( 'creator-' + creatorName, [ 'core/creator' ], ( Creator ) => {
			class TestCreator extends Creator {}

			if ( proto ) {
				for ( let propName in proto ) {
					TestCreator.prototype[ propName ] = proto[ propName ];
				}
			}

			return TestCreator;
		} );
	},

	/**
	 * Returns the number of elements return by the iterator.
	 *
	 *		testUtils.getIteratorCount( [ 1, 2, 3, 4, 5 ] ); // 5;
	 *
	 * @param {Iterable.<*>} iterator Any iterator.
	 * @returns {Number} Number of elements returned by that iterator.
	 */
	getIteratorCount( iterator ) {
		let count = 0;

		for ( let _ of iterator ) { // jshint ignore:line
			count++;
		}

		return count;
	},

	/**
	 * Creates an instance inheriting from {@link core.EmitterMixin} with one additional method `observe()`.
	 * It allows observing changes to attributes in objects being {@link core.Observable observable}.
	 *
	 * The `observe()` method accepts:
	 *
	 * * `{String} observableName` – Identifier for the observable object. E.g. `"Editable"` when
	 * you observe one of editor's editables. This name will be displayed on the console.
	 * * `{core.Observable observable} – The object to observe.
	 *
	 * Typical usage:
	 *
	 *		const observer = utils.createObserver();
	 *		observer.observe( 'Editable', editor.editables.current );
	 *
	 *		// Stop listening (method from the EmitterMixin):
	 *		observer.stopListening();
	 *
	 * @returns {Emitter} The observer.
	 */
	createObserver() {
		const observer = Object.create( EmitterMixin, {
			observe: {
				value: function observe( observableName, observable ) {
					observer.listenTo( observable, 'change', ( evt, propertyName, value, oldValue ) => {
						console.log( `[Change in ${ observableName }] ${ propertyName } = '${ value }' (was '${ oldValue }')` );
					} );

					return observer;
				}
			}
		} );

		return observer;
	},

	/**
	 * Checkes wether observable properties are properly bound to each other.
	 *
	 * Syntax given that observable `A` is bound to observables [`B`, `C`, ...]:
	 *
	 *		assertBinding( A,
	 *			{ initial `A` attributes },
	 *			[
	 *				[ B, { new `B` attributes } ],
	 *				[ C, { new `C` attributes } ],
	 *				...
	 *			],
	 *			{ `A` attributes after [`B`, 'C', ...] changed }
	 *		);
	 */
	assertBinding( observable, stateBefore, data, stateAfter ) {
		let key, pair;

		for ( key in stateBefore ) {
			expect( observable[ key ] ).to.be.equal( stateBefore[ key ] );
		}

		// Change attributes of bound observables.
		for ( pair of data ) {
			for ( key in pair[ 1 ] ) {
				pair[ 0 ][ key ] = pair[ 1 ][ key ];
			}
		}

		for ( key in stateAfter ) {
			expect( observable[ key ] ).to.be.equal( stateAfter[ key ] );
		}
	}
};

export default utils;
