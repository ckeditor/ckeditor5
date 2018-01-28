/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/bindings/getbindingtargets
 */

export default function bindOneToMany( dropdownModel, boundProperty, collection, collectionProperty, callback ) {
	dropdownModel.bind( boundProperty ).to(
		// Bind to #isOn of each button...
		...getBindingTargets( collection, collectionProperty ),
		// ...and chose the title of the first one which #isOn is true.
		callback
	);
}

// Returns an array of binding components for
// {@link module:utils/observablemixin~Observable#bind} from a set of iterable
// buttons.
//
// @param {Iterable.<module:ui/button/buttonview~ButtonView>} buttons
// @param {String} attribute
// @returns {Array.<String>}
function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}
