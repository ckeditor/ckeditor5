/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/eventinfo
 */

import spy from './spy.js';

/**
 * The event object passed to event callbacks. It is used to provide information about the event as well as a tool to
 * manipulate it.
 */
export default class EventInfo {
	constructor( source, name ) {
		/**
		 * The object that fired the event.
		 *
		 * @member #source
		 */
		this.source = source;

		/**
		 * The event name.
		 *
		 * @member #name
		 */
		this.name = name;

		/**
		 * Path this event has followed. See {@link module:utils/emittermixin~EmitterMixin#delegate}.
		 *
		 * @member #path
		 */
		this.path = [];

		// The following methods are defined in the constructor because they must be re-created per instance.

		/**
		 * Stops the event emitter to call further callbacks for this event interaction.
		 *
		 * @method #stop
		 */
		this.stop = spy();

		/**
		 * Removes the current callback from future interactions of this event.
		 *
		 * @method #off
		 */
		this.off = spy();
	}
}
