/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/bubblingeventinfo
 */

import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

/**
 * The event object passed to bubbling event callbacks. It is used to provide information about the event as well as a tool to
 * manipulate it.
 *
 * @extends module:utils/eventinfo~EventInfo
 */
export default class BubblingEventInfo extends EventInfo {
	/**
	 * @param {Object} source The emitter.
	 * @param {String} name The event name.
	 * @param {module:engine/view/range~Range} startRange The view range that the bubbling should start from.
	 */
	constructor( source, name, startRange ) {
		super( source, name );

		/**
		 * The view range that the bubbling should start from.
		 *
		 * @readonly
		 * @member {module:engine/view/range~Range}
		 */
		this.startRange = startRange;

		/**
		 * The current event phase.
		 *
		 * @protected
		 * @member {'none'|'capturing'|'atTarget'|'bubbling'}
		 */
		this._eventPhase = 'none';

		/**
		 * The current bubbling target.
		 *
		 * @protected
		 * @member {module:engine/view/document~Document|module:engine/view/node~Node|null}
		 */
		this._currentTarget = null;
	}

	/**
	 * The current event phase.
	 *
	 * @readonly
	 * @member {'none'|'capturing'|'atTarget'|'bubbling'}
	 */
	get eventPhase() {
		return this._eventPhase;
	}

	/**
	 * The current bubbling target.
	 *
	 * @readonly
	 * @member {module:engine/view/document~Document|module:engine/view/node~Node|null}
	 */
	get currentTarget() {
		return this._currentTarget;
	}
}
