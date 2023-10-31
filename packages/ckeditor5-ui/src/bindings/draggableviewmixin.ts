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
		private _transformDelta = { x: 0, y: 0 };

		/**
		 * TODO
		 */
		private _isDragging: boolean = false;

		/**
		 * TODO
		 */
		private _startCoordinates: { x: number; y: number } = { x: 0, y: 0 };

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

		public reset(): void {
			this._transformDelta = { x: 0, y: 0 };
		}

		/**
		 * TODO
		 */
		private _attachListeners() {
			this.listenTo( this.element!, 'mousedown', this._onDragStart.bind( this ) );
			this.listenTo( global.document, 'mouseup', this._onDragEnd.bind( this ) );
			this.listenTo( global.document, 'mousemove', this._onDrag.bind( this ) );

			this.listenTo( this.element!, 'touchstart', this._onDragStart.bind( this ) );
			this.listenTo( global.document, 'touchend', this._onDragEnd.bind( this ) );
			this.listenTo( global.document, 'touchmove', this._onDrag.bind( this ) );
		}

		/**
		 * TODO
		 */
		private _onDragStart( evt: EventInfo, domEvt: MouseEvent | TouchEvent ) {
			if ( !this.isDraggable ) {
				return;
			}

			const x = ( domEvt instanceof TouchEvent ? domEvt.touches[ 0 ] : domEvt ).clientX;
			const y = ( domEvt instanceof TouchEvent ? domEvt.touches[ 0 ] : domEvt ).clientY;

			this._startCoordinates = {
				x: x - this._transformDelta.x,
				y: y - this._transformDelta.y
			};

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

			this._transformDelta = {
				x: Math.round( x - this._startCoordinates.x ),
				y: Math.round( y - this._startCoordinates.y )
			};

			this.fire<DraggableViewDragEvent>( 'drag', {
				transformDelta: { ...this._transformDelta }
			} );
		}

		/**
		 * TODO
		 */
		private _onDragEnd() {
			if ( !this.isDraggable ) {
				return;
			}

			this._isDragging = false;
		}
	}

	return DraggableMixin as any;
}

/**
 * TODO
 */
export interface DraggableView extends View {
	isDraggable: boolean;
	reset(): void;
}

/**
 * TODO
 */
export type DraggableViewDragEvent = {
	name: 'drag';
	args: [ {
		transformDelta: { x: number; y: number };
	} ];
};
