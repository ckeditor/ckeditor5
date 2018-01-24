/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import getBindingTargets from '../../bindings/getbindingtargets';

/**
 * @module ui/dropdown/helpers/enablemodelifoneisenabled
 */

export default function enableModelIfOneIsEnabled( model, observables ) {
	model.bind( 'isEnabled' ).to(
		// Bind to #isEnabled of each observable...
		...getBindingTargets( observables, 'isEnabled' ),
		// ...and set it true if any observable #isEnabled is true.
		( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
	);
}
