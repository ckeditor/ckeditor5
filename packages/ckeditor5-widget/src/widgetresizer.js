/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widget
 */

import WidgetResizeFeature from './widgetresizefeature';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MouseObserver from './view/mouseobserver';
import MouseMoveObserver from './view/mousemoveobserver';

import getAncestors from '@ckeditor/ckeditor5-utils/src/dom/getancestors';

class ResizeContext {
	constructor( handler ) {
		const resizeWrapper = getAncestors( handler ).filter(
			element => element.classList.contains( 'ck-widget_with-resizer' )
		)[ 0 ];

		this.widgetWrapper = resizeWrapper;
		this.shadowWrapper = resizeWrapper.querySelector( '.ck-widget__resizer-shadow' );
	}

	initialize() {
		this.shadowWrapper.classList.add( 'ck-widget__resizer-shadow-active' );
	}

	destroy() {
		this.shadowWrapper.classList.remove( 'ck-widget__resizer-shadow-active' );

		this.shadowWrapper = null;
		this.wrapper = null;
	}

	updateSize() {}
}

/**
 * The base class for widget features. This type provides a common API for reusable features of widgets.
 */
export default class WidgetResizer extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'WidgetResizer';
	}

	init() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;

		this._observers = {
			mouseMove: view.addObserver( MouseMoveObserver ),
			mouseDownUp: view.addObserver( MouseObserver )
		};

		// It should start disabled, only upon clicking drag handler it interests us.
		// Currently broken due to https://github.com/ckeditor/ckeditor5-engine/blob/ce6422b/src/view/view.js#L364
		this._observers.mouseMove.disable();

		let isActive = false;
		let resizeContext = null;

		// Mouse move observer is only needed when the mouse button is pressed.
		// this.listenTo( viewDocument, 'mousemove', () => console.log( 'move' ) );

		this.listenTo( viewDocument, 'mousedown', ( event, domEventData ) => {
			const target = domEventData.domTarget;

			const resizeHandler = isResizeWrapper( target ) || getAncestors( target ).filter( isResizeWrapper )[ 0 ];

			if ( resizeHandler ) {
				isActive = true;
				this._observers.mouseMove.enable();

				resizeContext = new ResizeContext( resizeHandler );
				resizeContext.initialize();
			}
		} );

		this.listenTo( viewDocument, 'mouseup', () => {
			// @todo listen also for mouse up outside of the editable.
			if ( isActive ) {
				isActive = false;
				this._observers.mouseMove.disable();

				resizeContext.destroy();
				resizeContext = null;
			}
		} );

		function isResizeWrapper( element ) {
			return element.classList && element.classList.contains( 'ck-widget__resizer' );
		}
	}

	apply( widgetElement, writer ) {
		// @todo inline the logic
		const ret = new WidgetResizeFeature();

		ret.apply( widgetElement, writer );

		return ret;
	}
}
