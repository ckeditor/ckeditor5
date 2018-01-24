/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/bindings/getbindingtargets
 */

/**
 * Returns an array of binding components for
 * {@link module:utils/observablemixin~Observable#bind} from a set of iterable
 * buttons.
 *
 * @param {Iterable.<module:ui/button/buttonview~ButtonView>} buttons
 * @param {String} attribute
 * @returns {Array.<String>}
 */
export default function getBindingTargets( buttons, attribute ) {
	return Array.prototype.concat( ...buttons.map( button => [ button, attribute ] ) );
}
