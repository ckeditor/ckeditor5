/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import spy from './spy.js';

/**
 * The event object passed to event callbacks. It is used to provide information about the event as well as a tool to
 * manipulate it.
 *
 * @memberOf utils
 */
export default class EventInfo {
	constructor( source, name ) {
		/**
		 * The object that fired the event.
		 *
		 * @member utils.EventInfo#source
		 */
		this.source = source;

		/**
		 * The event name.
		 *
		 * @member utils.EventInfo#name
		 */
		this.name = name;

		/**
		 * Path this event has followed. See {@link utils.EmitterMixin#delegate}.
		 *
		 * @member utils.EventInfo#path
		 */
		this.path = [];

		// The following methods are defined in the constructor because they must be re-created per instance.

		/**
		 * Stops the event emitter to call further callbacks for this event interaction.
		 *
		 * @method utils.EventInfo#stop
		 */
		this.stop = spy();

		/**
		 * Removes the current callback from future interactions of this event.
		 *
		 * @method utils.EventInfo#off
		 */
		this.off = spy();
	}
}
