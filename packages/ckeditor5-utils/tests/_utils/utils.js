/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console:false */

import EmitterMixin from '../../src/emittermixin';

const utils = {
	/**
	 * Creates an instance inheriting from {@link utils.EmitterMixin} with one additional method `observe()`.
	 * It allows observing changes to attributes in objects being {@link utils.Observable observable}.
	 *
	 * The `observe()` method accepts:
	 *
	 * * `{String} observableName` – Identifier for the observable object. E.g. `"Editable"` when
	 * you observe one of editor's editables. This name will be displayed on the console.
	 * * `{utils.Observable observable} – The object to observe.
	 * * `{Array.<String>} filterNames` – Array of propery names to be observed.
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
				value: function observe( observableName, observable, filterNames ) {
					observer.listenTo( observable, 'change', ( evt, propertyName, value, oldValue ) => {
						if ( !filterNames || filterNames.includes( propertyName ) ) {
							console.log( `[Change in ${ observableName }] ${ propertyName } = '${ value }' (was '${ oldValue }')` );
						}
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
		let key, boundObservable, attrs;

		for ( key in stateBefore ) {
			expect( observable[ key ] ).to.be.equal( stateBefore[ key ] );
		}

		// Change attributes of bound observables.
		for ( [ boundObservable, attrs ] of data ) {
			for ( key in attrs ) {
				if ( !boundObservable.hasOwnProperty( key ) ) {
					boundObservable.set( key, attrs[ key ] );
				} else {
					boundObservable[ key ] = attrs[ key ];
				}
			}
		}

		for ( key in stateAfter ) {
			expect( observable[ key ] ).to.be.equal( stateAfter[ key ] );
		}
	}
};

export default utils;
