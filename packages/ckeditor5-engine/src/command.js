/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EmitterMixin from './emittermixin.js';
import utils from './utils.js';

/**
 * The base class for CKEditor commands.
 *
 * @class core.Command
 */

export default class Command {
	/**
	 * Creates a new Command instance.
	 */
	constructor( editor ) {
		this.editor = editor;
		this.isEnabled = true;

		// If schema checking function is specified, add it to the `checkEnabled` listeners.
		// Feature will be disabled if it does not apply to schema requirements.
		if ( this.checkSchema ) {
			this.on( 'checkEnabled', ( evt ) => {
				if ( !this.checkSchema() ) {
					evt.stop();

					return false;
				}
			} );
		}
	}

	checkEnabled() {
		this.isEnabled = this.fire( 'checkEnabled' ) !== false;
	}

	_disable() {
		this.on( 'checkEnabled', disableCallback );
		this.checkEnabled();
	}

	_enable() {
		this.off( 'checkEnabled', disableCallback );
		this.checkEnabled();
	}

	execute() {
		// Should be overwritten in child class.
	}
}

function disableCallback( evt ) {
	evt.stop();

	return false;
}

utils.mix( Command, EmitterMixin );
