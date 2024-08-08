/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/bindings/draggableviewmixin
 */

import type View from '../view.js';
import { global, type Constructor, type Mixed, type EventInfo } from '@ckeditor/ckeditor5-utils';

/**
 * A mixin that brings the possibility to observe dragging of the view element.
 * The view has to implement the {@link ~DraggableView} interface to use it:
 *
 * ```js
 * export default class MyDraggableView extends DraggableViewMixin( View ) implements DraggableView {
 * 		// ...
 * }
 * ```
 *
 * Creating a class extending it attaches a set of mouse and touch listeners allowing to observe dragging of the view element:
 * * `mousedown` and `touchstart` on the view element - starting the dragging.
 * * `mousemove` and `touchmove` on the document - updating the view coordinates.
 * * `mouseup` and `touchend` on the document - stopping the dragging.
 *
 * The mixin itself does not provide a visual feedback (that is, the dragged element does not change its position) -
 * it is up to the developer to implement it.
 */
export default function DraggableViewMixin<Base extends Constructor<View>>( view: Base ): Mixed<Base, DraggableView> {
	abstract class DraggableMixin extends view implements DraggableView {
		/**
		 * A flag indicating whether the view is currently being dragged.
		 *
		 * @observable
		 */
		declare public isDragging: boolean;

		/**
		 * A bound version of {@link #_onDrag}.
		 */
		private _onDragBound = this._onDrag.bind( this );

		/**
		 * A bound version of {@link #_onDragEnd}.
		 */
		private _onDragEndBound = this._onDragEnd.bind( this );

		/**
		 * The last coordinates of the view. It is updated on every mouse move.
		 */
		private _lastDraggingCoordinates: { x: number; y: number } = { x: 0, y: 0 };

		/**
		 * @inheritDoc
		 */
		constructor( ...args: Array<any> ) {
			super( ...args );

			this.on( 'render', () => {
				this._attachListeners();
			} );

			this.set( 'isDragging', false );
		}

		/**
		 * Attaches the listeners for the drag start.
		 */
		private _attachListeners() {
			this.listenTo( this.element!, 'mousedown', this._onDragStart.bind( this ) );
			this.listenTo( this.element!, 'touchstart', this._onDragStart.bind( this ) );
		}

		/**
		 * Attaches the listeners for the dragging and drag end.
		 */
		private _attachDragListeners() {
			this.listenTo( global.document, 'mouseup', this._onDragEndBound );
			this.listenTo( global.document, 'touchend', this._onDragEndBound );
			this.listenTo( global.document, 'mousemove', this._onDragBound );
			this.listenTo( global.document, 'touchmove', this._onDragBound );
		}

		/**
		 * Detaches the listeners after the drag end.
		 */
		private _detachDragListeners() {
			this.stopListening( global.document, 'mouseup', this._onDragEndBound );
			this.stopListening( global.document, 'touchend', this._onDragEndBound );
			this.stopListening( global.document, 'mousemove', this._onDragBound );
			this.stopListening( global.document, 'touchmove', this._onDragBound );
		}

		/**
		 * Starts the dragging listeners and sets the initial view coordinates.
		 */
		private _onDragStart( evt: EventInfo, domEvt: MouseEvent | TouchEvent ) {
			if ( !this._isHandleElementPressed( domEvt ) ) {
				return;
			}

			this._attachDragListeners();

			let x = 0;
			let y = 0;

			// If dragging is performed with a mouse, there is only one set of coordinates available.
			// But when using a touch device, there may be many of them, so use the coordinates from the first touch.
			if ( domEvt instanceof MouseEvent ) {
				x = domEvt.clientX;
				y = domEvt.clientY;
			} else {
				x = domEvt.touches[ 0 ].clientX;
				y = domEvt.touches[ 0 ].clientY;
			}

			this._lastDraggingCoordinates = { x, y };

			this.isDragging = true;
		}

		/**
		 * Updates the view coordinates and fires the `drag` event.
		 */
		private _onDrag( evt: EventInfo, domEvt: MouseEvent | TouchEvent ) {
			// If dragging was stopped by some external intervention, stop listening.
			if ( !this.isDragging ) {
				this._detachDragListeners();

				return;
			}

			let newX = 0;
			let newY = 0;

			// If dragging is performed with a mouse, there is only one set of coordinates available.
			// But when using a touch device, there may be many of them, so use the coordinates from the first touch.
			if ( domEvt instanceof MouseEvent ) {
				newX = domEvt.clientX;
				newY = domEvt.clientY;
			} else {
				newX = domEvt.touches[ 0 ].clientX;
				newY = domEvt.touches[ 0 ].clientY;
			}

			// Prevents selection of text while dragging on Safari.
			domEvt.preventDefault();

			this.fire<DraggableViewDragEvent>( 'drag', {
				deltaX: Math.round( newX - this._lastDraggingCoordinates.x ),
				deltaY: Math.round( newY - this._lastDraggingCoordinates.y )
			} );

			this._lastDraggingCoordinates = { x: newX, y: newY };
		}

		/**
		 * Stops the dragging and detaches the listeners.
		 */
		private _onDragEnd() {
			this._detachDragListeners();

			this.isDragging = false;
		}

		/**
		 * Checks if the drag handle element was pressed.
		 */
		private _isHandleElementPressed( domEvt: MouseEvent | TouchEvent ) {
			if ( !this.dragHandleElement ) {
				return false;
			}

			return this.dragHandleElement === domEvt.target ||
				( domEvt.target instanceof HTMLElement && this.dragHandleElement.contains( domEvt.target ) );
		}

		public abstract get dragHandleElement(): HTMLElement | null;
	}

	return DraggableMixin as any;
}

/**
 * An interface that should be implemented by views that want to be draggable.
 */
export interface DraggableView extends View {
	get dragHandleElement(): HTMLElement | null;
}

/**
 * An event data object for the {@link ~DraggableView} `drag` event. Fired when the view is dragged.
 */
export type DraggableViewDragEvent = {
	name: 'drag';
	args: [ {
		deltaX: number;
		deltaY: number;
	} ];
};
