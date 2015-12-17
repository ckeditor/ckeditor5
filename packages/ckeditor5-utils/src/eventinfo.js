/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * The event object passed to event callbacks. It is used to provide information about the event as well as a tool to
 * manipulate it.
 *
 * @class EventInfo
 */

import { spy } from './utils.js';

export default class EventInfo {
	constructor( source, name ) {
		/**
		 * The object that fired the event.
		 */
		this.source = source;

		/**
		 * The event name.
		 */
		this.name = name;

		// The following methods are defined in the constructor because they must be re-created per instance.

		/**
		 * Stops the event emitter to call further callbacks for this event interaction.
		 *
		 * @method
		 */
		this.stop = spy();

		/**
		 * Removes the current callback from future interactions of this event.
		 *
		 * @method
		 */
		this.off = spy();
	}
}
