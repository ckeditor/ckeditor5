/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/todolist/todocheckboxchangeobserver
 */

import { DomEventObserver, type DomEventData } from 'ckeditor5/src/engine.js';

/**
 * Observes all to-do list checkboxes state changes.
 *
 * Note that this observer is not available by default. To make it available it needs to be added to
 * {@link module:engine/view/view~View} by {@link module:engine/view/view~View#addObserver} method.
 */
export default class TodoCheckboxChangeObserver extends DomEventObserver<'change'> {
	/**
	 * @inheritDoc
	 */
	public readonly domEventType = [ 'change' ] as const;

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: Event ): void {
		if ( domEvent.target ) {
			const viewTarget = this.view.domConverter.mapDomToView( domEvent.target as HTMLElement );

			if (
				viewTarget &&
				viewTarget.is( 'element', 'input' ) &&
				viewTarget.getAttribute( 'type' ) == 'checkbox' &&
				viewTarget.findAncestor( { classes: 'todo-list__label' } )
			) {
				this.fire( 'todoCheckboxChange', domEvent );
			}
		}
	}
}

/**
 * Fired when the to-do list checkbox is toggled.
 *
 * Introduced by {@link module:list/todolist/todocheckboxchangeobserver~TodoCheckboxChangeObserver}.
 *
 * Note that this event is not available by default. To make it available,
 * {@link module:list/todolist/todocheckboxchangeobserver~TodoCheckboxChangeObserver}
 * needs to be added to {@link module:engine/view/view~View} by the {@link module:engine/view/view~View#addObserver} method.
 *
 * @see module:list/todolist/todocheckboxchangeobserver~TodoCheckboxChangeObserver
 * @eventName module:engine/view/document~Document#todoCheckboxChange
 * @param data The event data.
 */
export type ViewDocumentTodoCheckboxChangeEvent = {
	name: 'todoCheckboxChange';
	args: [ data: DomEventData<Event> ];
};
