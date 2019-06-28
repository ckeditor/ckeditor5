/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widget
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MouseObserver from './view/mouseobserver';
import MouseMoveObserver from './view/mousemoveobserver';
import getAncestors from '@ckeditor/ckeditor5-utils/src/dom/getancestors';
import ResizeContext2 from './resizecontext';

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
		this.contexts = [];
		this.activeContext = null;

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

		// Mouse move observer is only needed when the mouse button is pressed.
		// this.listenTo( viewDocument, 'mousemove', () => console.log( 'move' ) );
		this.listenTo( viewDocument, 'mousemove', ( event, domEventData ) => {
			if ( this.activeContext ) {
				this.activeContext.updateSize( domEventData );
			}
		} );

		this.listenTo( viewDocument, 'mousedown', ( event, domEventData ) => {
			const target = domEventData.domTarget;

			const resizeHandler = isResizeHandler( target ) || getAncestors( target ).filter( isResizeHandler )[ 0 ];

			if ( resizeHandler ) {
				isActive = true;
				this._observers.mouseMove.enable();

				this.activeContext = this._getContextByHandler( resizeHandler );

				if ( this.activeContext ) {
					this.activeContext.begin( resizeHandler );
				}
			}
		} );

		const finishResizing = () => {
			if ( isActive ) {
				isActive = false;
				this._observers.mouseMove.disable();

				if ( this.activeContext ) {
					this.activeContext.commit( this.editor );
				}

				this.activeContext = null;
			}
		};

		// @todo: it should listen on the entire window, as it should also catch events outside of the editable.
		this.listenTo( viewDocument, 'mouseup', finishResizing );

		function isResizeHandler( element ) {
			return element.classList && element.classList.contains( 'ck-widget__resizer' );
		}
	}

	apply( widgetElement, writer ) {
		const context = new ResizeContext2();
		context.attach( widgetElement, writer );

		this.editor.editing.view.once( 'render', () => context.redraw() );

		this.contexts.push( context );
	}

	/**
	 * Returns a resize context associated with given `domResizeWrapper`.
	 *
	 * @param {HTMLElement} domResizeWrapper
	 */
	_getContextByWrapper( domResizeWrapper ) {
		for ( const context of this.contexts ) {
			if ( domResizeWrapper.isSameNode( context.domResizeWrapper ) ) {
				return context;
			}
		}
	}

	_getContextByHandler( domResizeHandler ) {
		return this._getContextByWrapper( getAncestors( domResizeHandler )
			.filter( element => element.classList.contains( 'ck-widget__resizer-wrapper' ) )[ 0 ] );
	}
}
