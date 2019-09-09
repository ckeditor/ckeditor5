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

const RESIZE_CHECK_INTERVAL = 500;

export default function getResizeObserver( callback ) {
	// TODO: One day, the ResizeObserver API will be supported in all modern web browsers.
	// When it happens, this module will no longer make sense and should be removed and
	// the native implementation should be used across the project to save bytes.
	// Check out https://caniuse.com/#feat=resizeobserver.
	if ( typeof global.window.ResizeObserver === 'function' ) {
		return new global.window.ResizeObserver( callback );
	} else {
		return new ResizeObserverPolyfill( callback );
	}
}

class ResizeObserverPolyfill {
	constructor( callback ) {
		this.callback = callback;
		this.elements = new Set();

		this._startPeriodicCheck();
	}

	observe( element ) {
		this.elements.add( element );
	}

	unobserve( element ) {
		this.elements.remove( element );
		this._previousRects.delete( element );

		if ( !this.elements.size ) {
			this._stopPeriodicCheck();
		}
	}

	disconnect() {
		this.elements.forEach( element => this.unobserve( element ) );

		this._stopPeriodicCheck();
	}

	_startPeriodicCheck() {
		this._previousRects = new Map();

		const periodicCheck = () => {
			this._checkElementRectsAndExecuteCallbacks();
			this._periodicCheckTimeout = setTimeout( periodicCheck, RESIZE_CHECK_INTERVAL );
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

		// The first check should always yield true despite no Previous rect to compare to.
		// The native ResizeObserver does that and... that makes sense. Sort of.
		const hasChanged = !previousRect || !previousRect.isEqual( currentRect );

		this._previousRects.set( element, currentRect );

		return hasChanged;
	}
}

mix( ResizeObserverPolyfill, DomEmitterMixin );
