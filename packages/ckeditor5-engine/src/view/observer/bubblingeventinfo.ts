/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/observer/bubblingeventinfo
 */

import { EventInfo } from '@ckeditor/ckeditor5-utils';
import { type ViewDocument } from '../document.js';
import { type ViewNode } from '../node.js';
import { type ViewRange } from '../range.js';

/**
 * The event object passed to bubbling event callbacks. It is used to provide information about the event as well as a tool to
 * manipulate it.
 */
export class BubblingEventInfo<TName extends string = string, TReturn = unknown> extends EventInfo<TName, TReturn> {
	/**
	 * The view range that the bubbling should start from.
	 */
	public readonly startRange: ViewRange;

	/**
	 * The current event phase.
	 */
	private _eventPhase: BubblingEventPhase;

	/**
	 * The current bubbling target.
	 */
	private _currentTarget: ViewDocument | ViewNode | null;

	/**
	 * @param source The emitter.
	 * @param name The event name.
	 * @param startRange The view range that the bubbling should start from.
	 */
	constructor( source: object, name: TName, startRange: ViewRange ) {
		super( source, name );

		this.startRange = startRange;
		this._eventPhase = 'none';
		this._currentTarget = null;
	}

	/**
	 * The current event phase.
	 */
	public get eventPhase(): BubblingEventPhase {
		return this._eventPhase;
	}

	/**
	 * The current bubbling target.
	 */
	public get currentTarget(): ViewDocument | ViewNode | null {
		return this._currentTarget;
	}
}

/**
 * The phase the event is in.
 */
export type BubblingEventPhase = 'none' | 'capturing' | 'atTarget' | 'bubbling';
