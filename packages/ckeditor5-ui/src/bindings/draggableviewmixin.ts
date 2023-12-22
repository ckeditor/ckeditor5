/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import type View from '../view.js';
import { type Constructor, type Mixed, global, type EventInfo } from '@ckeditor/ckeditor5-utils';

/**
 * TODO
 */
export default function DraggableViewMixin<Base extends Constructor<View>>( view: Base ): Mixed<Base, DraggableView> {
	abstract class DraggableMixin extends view {
		/**
		 * TODO
		 */
		declare public isDragging: boolean;

		/**
		 * TODO
		 */
		private _onDragBound = this._onDrag.bind( this );

		/**
		 * TODO
		 */
		private _onDragEndBound = this._onDragEnd.bind( this );

		/**
		 * TODO
		 */
		private _lastDraggingCoordinates: { x: number; y: number } = { x: 0, y: 0 };

		/**
		 * TODO
		 */
		constructor( ...args: Array<any> ) {
			super( ...args );

			this.on( 'render', () => {
				this._attachListeners();
			} );

			this.set( 'isDragging', false );
		}

		/**
		 * TODO
		 */
		private _attachListeners() {
			this.listenTo( this.element!, 'mousedown', this._onDragStart.bind( this ) );
			this.listenTo( this.element!, 'touchstart', this._onDragStart.bind( this ) );
		}

		/**
		 * TODO
		 */
		private _attachDragListeners() {
			this.listenTo( global.document, 'mouseup', this._onDragEndBound );
			this.listenTo( global.document, 'touchend', this._onDragEndBound );
			this.listenTo( global.document, 'mousemove', this._onDragBound );
			this.listenTo( global.document, 'touchmove', this._onDragBound );
		}

		/**
		 * TODO
		 */
		private _detachDragListeners() {
			this.stopListening( global.document, 'mouseup', this._onDragEndBound );
			this.stopListening( global.document, 'touchend', this._onDragEndBound );
			this.stopListening( global.document, 'mousemove', this._onDragBound );
			this.stopListening( global.document, 'touchmove', this._onDragBound );
		}

		/**
		 * TODO
		 */
		private _onDragStart( evt: EventInfo, domEvt: MouseEvent | TouchEvent ) {
			if ( !this._isHandleElementPressed( domEvt ) ) {
				return;
			}

			this._attachDragListeners();

			let x = 0;
			let y = 0;

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
		 * TODO
		 */
		private _onDrag( evt: EventInfo, domEvt: MouseEvent | TouchEvent ) {
			// If dragging was stopped by some external intervention, stop listening.
			if ( !this.isDragging ) {
				this._detachDragListeners();

				return;
			}

			let newX = 0;
			let newY = 0;

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
		 * TODO
		 */
		private _onDragEnd() {
			this._detachDragListeners();

			this.isDragging = false;
		}

		/**
		 * TODO
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
 * TODO
 */
export interface DraggableView extends View {
	get dragHandleElement(): HTMLElement | null;
	resetDrag(): void;
}

/**
 * TODO
 */
export type DraggableViewDragEvent = {
	name: 'drag';
	args: [ {
		deltaX: number;
		deltaY: number;
	} ];
};
