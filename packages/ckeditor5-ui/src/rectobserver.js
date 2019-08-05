/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/RectObserver
 */

/* globals setTimeout, clearTimeout, ResizeObserver */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';

export default class RectObserver {
	constructor( element ) {
		this.element = element;
	}

	observe( callback ) {
		if ( typeof ResizeObserver === 'function' ) {
			this._observer = new ResizeObserver( entries => {
				callback( new Rect( entries[ 0 ].contentRect ) );
			} ).observe( this.element );
		} else {
			let previousRect;

			const hasRectChanged = () => {
				const currentRect = new Rect( this.element );
				const hasChanged = previousRect && !previousRect.isEqual( currentRect );

				previousRect = currentRect;

				return hasChanged;
			};

			const periodicCheck = () => {
				if ( hasRectChanged() ) {
					callback( previousRect );
				}

				this._checkTimeout = setTimeout( periodicCheck, 500 );
			};

			this.listenTo( global.window, 'resize', () => {
				if ( hasRectChanged() ) {
					callback( previousRect );
				}
			} );

			periodicCheck();
		}
	}

	stopObserving() {
		if ( this._observer ) {
			this._observer.disconnect();
		} else {
			this.stopListening();
			clearTimeout( this._checkTimeout );
		}
	}
}

mix( RectObserver, DomEmitterMixin );
