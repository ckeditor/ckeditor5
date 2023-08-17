/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/tododocumentlist/inputchangebserver
 */

import { DomEventObserver, type DomEventData } from 'ckeditor5/src/engine';

/**
 * TODO
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~View} by {@link module:engine/view/view~View#addObserver} method.
 */
export default class InputChangeObserver extends DomEventObserver<'change'> {
	/**
	 * @inheritDoc
	 */
	public readonly domEventType = [ 'change' ] as const;

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: Event ): void {
		this.fire( 'inputChange', domEvent );
	}
}

/**
 * Fired when the TODO
 *
 * Introduced by TODO
 *
 * Note that this event is not available by default. To make it available, TODO
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:list/tododocumentlist/inputchangebserver~InputChangeObserver
 * @eventName module:engine/view/document~Document#inputchange
 * @param data The event data.
 */
export type ViewDocumentInputChangeEvent = {
	name: 'inputChange';
	args: [ data: DomEventData<Event> ];
};
