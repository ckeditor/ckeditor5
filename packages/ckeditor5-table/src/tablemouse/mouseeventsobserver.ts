/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablemouse/mouseeventsobserver
 */

import { DomEventObserver, type DomEventData, type View } from 'ckeditor5/src/engine';

/**
 * The mouse selection event observer.
 *
 * It registers listeners for the following DOM events:
 *
 * - `'mousemove'`
 * - `'mouseleave'`
 *
 * Note that this observer is disabled by default. To enable this observer, it needs to be added to
 * {@link module:engine/view/view~View} using the {@link module:engine/view/view~View#addObserver} method.
 *
 * The observer is registered by the {@link module:table/tableselection~TableSelection} plugin.
 */
export default class MouseEventsObserver extends DomEventObserver<'mousemove' | 'mouseleave'> {
	public readonly domEventType = [
		'mousemove', 'mouseleave'
	] as const;

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: MouseEvent ): void {
		this.fire( domEvent.type, domEvent );
	}
}

/**
 * Fired when the mouse is moved over one of the editables.
 *
 * Introduced by {@link module:table/tablemouse/mouseeventsobserver~MouseEventsObserver}.
 *
 * Note that this event is not available by default. To make it available,
 * {@link module:table/tablemouse/mouseeventsobserver~MouseEventsObserver} needs to be added
 * to {@link module:engine/view/view~View} using the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:table/tablemouse/mouseeventsobserver~MouseEventsObserver
 * @eventName module:engine/view/document~Document#mousemove
 * @param data Event data.
 */
export type ViewDocumentMouseMoveEvent = {
	name: 'mousemove';
	args: [ data: DomEventData<MouseEvent> ];
};

/**
 * Fired when the mouse is moved out of one of the editables.
 *
 * Introduced by {@link module:table/tablemouse/mouseeventsobserver~MouseEventsObserver}.
 *
 * Note that this event is not available by default. To make it available,
 * {@link module:table/tablemouse/mouseeventsobserver~MouseEventsObserver} needs to be added
 * to {@link module:engine/view/view~View} using the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:table/tablemouse/mouseeventsobserver~MouseEventsObserver
 * @eventName module:engine/view/document~Document#mouseleave
 * @param data Event data.
 */
export type ViewDocumentMouseLeaveEvent = {
	name: 'mouseleave';
	args: [ data: DomEventData<MouseEvent> ];
};
