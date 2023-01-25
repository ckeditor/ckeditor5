/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/bubblingeventinfo
 */

import { EventInfo } from '@ckeditor/ckeditor5-utils';
import type Document from '../document';
import type Node from '../node';
import type Range from '../range';

/**
 * The event object passed to bubbling event callbacks. It is used to provide information about the event as well as a tool to
 * manipulate it.
 */
export default class BubblingEventInfo<TName extends string = string, TReturn = unknown> extends EventInfo<TName, TReturn> {
	/**
	 * The view range that the bubbling should start from.
	 */
	public readonly startRange: Range;

	/**
	 * The current event phase.
	 */
	private _eventPhase: EventPhase;

	/**
	 * The current bubbling target.
	 */
	private _currentTarget: Document | Node | null;

	/**
	 * @param source The emitter.
	 * @param name The event name.
	 * @param startRange The view range that the bubbling should start from.
	 */
	constructor( source: object, name: TName, startRange: Range ) {
		super( source, name );

		this.startRange = startRange;
		this._eventPhase = 'none';
		this._currentTarget = null;
	}

	/**
	 * The current event phase.
	 */
	public get eventPhase(): EventPhase {
		return this._eventPhase;
	}

	/**
	 * The current bubbling target.
	 */
	public get currentTarget(): Document | Node | null {
		return this._currentTarget;
	}
}

/**
 * The phase the event is in.
 */
export type EventPhase = 'none' | 'capturing' | 'atTarget' | 'bubbling';
