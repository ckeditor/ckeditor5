/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/resizeobserver
 */

/* globals setTimeout, clearTimeout */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';

const CHECK_TIMEOUT = 500;
const NativeResizeObserver = global.window.ResizeObserver;

export default class ResizeObserver {
	constructor( callback ) {
		this.callback = callback;
		this.elements = new Set();

		if ( typeof NativeResizeObserver === 'function' ) {
			this._nativeObserver = new NativeResizeObserver( entries => {
				callback( entries.map( entry => ( {
					target: entry.target,
					contentRect: new Rect( entry.contentRect )
				} ) ) );
			} );
		} else {
			this._startPeriodicCheck();
		}
	}

	observe( element ) {
		this.elements.add( element );

		if ( this._nativeObserver ) {
			this._nativeObserver.observe( element );
		}
	}

	unobserve( element ) {
		this.elements.remove( element );

		if ( this._nativeObserver ) {
			this._nativeObserver.unobserve( element );
		} else {
			this._previousRects.delete( element );

			if ( !this.elements.size ) {
				this._stopPeriodicCheck();
			}
		}
	}

	disconnect() {
		this.elements.forEach( element => this.unobserve( element ) );

		if ( this._nativeObserver ) {
			this._nativeObserver.disconnect();
		} else {
			this._stopPeriodicCheck();
		}
	}

	_startPeriodicCheck() {
		this._previousRects = new Map();

		const periodicCheck = () => {
			this._checkElementRectsAndExecuteCallbacks();
			this._periodicCheckTimeout = setTimeout( periodicCheck, CHECK_TIMEOUT );
		};

		this.listenTo( global.window, 'resize', () => {
			this._checkElementRectsAndExecuteCallbacks();
		} );

		periodicCheck();
	}

	_stopPeriodicCheck() {
		clearTimeout( this._periodicCheckTimeout );
		this.stopListening();
		this._previousRects.clear();
	}

	_checkElementRectsAndExecuteCallbacks() {
		const entries = [];

		for ( const element of this.elements ) {
			if ( this._hasRectChanged( element ) ) {
				entries.push( {
					target: element,
					contentRect: this._previousRects.get( element )
				} );
			}
		}

		if ( entries.length ) {
			this.callback( entries );
		}
	}

	_hasRectChanged( element ) {
		const currentRect = new Rect( element );
		const previousRect = this._previousRects.get( element );

		// The first check should always be positive despite no Previous rect to compare to.
		// The native ResizeObserver does that and... that makes sense.
		const hasChanged = !previousRect || !previousRect.isEqual( currentRect );

		this._previousRects.set( element, currentRect );

		return hasChanged;
	}
}

mix( ResizeObserver, DomEmitterMixin );
