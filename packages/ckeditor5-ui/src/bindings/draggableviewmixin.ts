/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import type View from '../view';
import { type Constructor, type Mixed, global, type EventInfo } from '@ckeditor/ckeditor5-utils';

/**
 * TODO
 */
export default function DraggableViewMixin<Base extends Constructor<View>>( view: Base ): Mixed<Base, DraggableView>
{
	abstract class DraggableMixin extends view {
		/**
		 * TODO
		 */
		declare public isDraggable: boolean;

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
		private _isDragging: boolean = false;

		/**
		 * TODO
		 */
		private _currentCoordinates: { x: number; y: number } = { x: 0, y: 0 };

		/**
		 * TODO
		 */
		constructor( ...args: Array<any> ) {
			super( ...args );

			this.set( 'isDraggable', true );

			if ( this.isRendered ) {
				this._attachListeners();
			} else {
				this.on( 'render', () => {
					this._attachListeners();
				} );
			}
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
		private _attachDragDurationListeners() {
			this.listenTo( global.document, 'mouseup', this._onDragEndBound );
			this.listenTo( global.document, 'touchend', this._onDragEndBound );
			this.listenTo( global.document, 'mousemove', this._onDragBound );
			this.listenTo( global.document, 'touchmove', this._onDragBound );
		}

		/**
		 * TODO
		 */
		private _detachDragDurationListeners() {
			this.stopListening( global.document, 'mouseup', this._onDragEndBound );
			this.stopListening( global.document, 'touchend', this._onDragEndBound );
			this.stopListening( global.document, 'mousemove', this._onDragBound );
			this.stopListening( global.document, 'touchmove', this._onDragBound );
		}

		/**
		 * TODO
		 */
		private _onDragStart( evt: EventInfo, domEvt: MouseEvent | TouchEvent ) {
			if ( !this.isDraggable || !this._isHandleEventTarget( domEvt ) ) {
				return;
			}

			this._attachDragDurationListeners();

			const x = ( domEvt instanceof TouchEvent ? domEvt.touches[ 0 ] : domEvt ).clientX;
			const y = ( domEvt instanceof TouchEvent ? domEvt.touches[ 0 ] : domEvt ).clientY;

			this._currentCoordinates = { x, y };

			this._isDragging = true;
		}

		/**
		 * TODO
		 */
		private _onDrag( evt: EventInfo, domEvt: MouseEvent | TouchEvent ) {
			if ( !this.isDraggable || !this._isDragging ) {
				return;
			}

			const x = ( domEvt instanceof TouchEvent ? domEvt.touches[ 0 ] : domEvt ).clientX;
			const y = ( domEvt instanceof TouchEvent ? domEvt.touches[ 0 ] : domEvt ).clientY;

			this.fire<DraggableViewDragEvent>( 'drag', {
				x: Math.round( x - this._currentCoordinates.x ),
				y: Math.round( y - this._currentCoordinates.y )
			} );

			this._currentCoordinates = { x, y };
		}

		/**
		 * TODO
		 */
		private _onDragEnd() {
			this._detachDragDurationListeners();

			if ( !this.isDraggable ) {
				return;
			}

			this._isDragging = false;
		}

		/**
		 * TODO
		 */
		private _isHandleEventTarget( domEvt: MouseEvent | TouchEvent ) {
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
	isDraggable: boolean;
	get dragHandleElement(): HTMLElement | null;
	resetDrag(): void;
}

/**
 * TODO
 */
export type DraggableViewDragEvent = {
	name: 'drag';
	args: [ {
		x: number;
		y: number;
	} ];
};
