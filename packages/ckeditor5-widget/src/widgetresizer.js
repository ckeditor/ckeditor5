/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresizer
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Resizer from './resizer';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { throttle } from 'lodash-es';

/**
 * Widget resize feature plugin.
 *
 * Use the {@link module:widget/widgetresizer~WidgetResizer#apply} method to create resizer for a provided widget.
 */
export default class WidgetResizer extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'WidgetResizer';
	}

	init() {
		this.resizers = [];
		this.activeResizer = null;

		const mouseObserverHost = global.window.document;
		const THROTTLE_THRESHOLD = 16; // 16ms = ~60fps

		this.editor.model.schema.setAttributeProperties( 'width', {
			isFormatting: true
		} );

		this._observers = {
			mouseMove: Object.create( DomEmitterMixin ),
			mouseDownUp: Object.create( DomEmitterMixin ),
			windowResize: Object.create( DomEmitterMixin )
		};

		const mouseMoveListener = throttle( ( event, domEventData ) => {
			if ( this.activeResizer ) {
				this.activeResizer.updateSize( domEventData );
			}
		}, THROTTLE_THRESHOLD );

		this._observers.mouseDownUp.listenTo( mouseObserverHost, 'mousedown', ( event, domEventData ) => {
			if ( !Resizer.isResizeHandle( domEventData.target ) ) {
				return;
			}

			const resizeHandle = domEventData.target;

			this._observers.mouseMove.listenTo( mouseObserverHost, 'mousemove', mouseMoveListener );

			this.activeResizer = this._getResizerByHandle( resizeHandle );

			if ( this.activeResizer ) {
				this.activeResizer.begin( resizeHandle );
			}
		} );

		const finishResizing = () => {
			if ( this.activeResizer ) {
				this._observers.mouseMove.stopListening( mouseObserverHost, 'mousemove', mouseMoveListener );

				if ( this.activeResizer ) {
					this.activeResizer.commit( this.editor );
				}

				this.activeResizer = null;
			}
		};

		const resizeContexts = throttle( () => {
			for ( const context of this.resizers ) {
				context.redraw();
			}
		}, THROTTLE_THRESHOLD );

		this._observers.mouseDownUp.listenTo( mouseObserverHost, 'mouseup', finishResizing );

		// Redrawing on layout change fixes issue with browser window resize or undo causing a mispositioned resizer.
		this.editor.editing.view.document.on( 'layoutChanged', resizeContexts );

		// Resizers need to be redrawn upon window resize, because new window might shrink resize host.
		this._observers.windowResize.listenTo( global.window, 'resize', resizeContexts );
	}

	/**
	 * @param {module:widget/widgetresizer~ResizerOptions} [options] Resizer options.
	 * @returns {module:widget/resizer~Resizer}
	 */
	attachTo( options ) {
		const resizer = new Resizer( options );

		resizer.attach();

		this.editor.editing.view.once( 'render', () => resizer.redraw() );

		this.resizers.push( resizer );

		return resizer;
	}

	_getResizerByHandle( domResizeHandle ) {
		for ( const resizer of this.resizers ) {
			if ( resizer.containsHandle( domResizeHandle ) ) {
				return resizer;
			}
		}
	}
}

/**
 * Interface describing a resizer. It allows to specify resizing host, custom logic for calculating aspect ratio etc.
 *
 * @interface ResizerOptions
 */

/**
 * @member {module:engine/model/element~Element} module:widget/widgetresizer~ResizerOptions#modelElement
 */

/**
 * @member {module:engine/view/containerelement~ContainerElement} module:widget/widgetresizer~ResizerOptions#viewElement
 */

/**
 * @member {module:engine/view/downcastwriter~DowncastWriter} module:widget/widgetresizer~ResizerOptions#downcastWriter
 */

/**
 * @member {Function} module:widget/widgetresizer~ResizerOptions#getResizeHost
 */

/**
 * @member {Function} module:widget/widgetresizer~ResizerOptions#getAspectRatio
 */

/**
 * @member {Function} module:widget/widgetresizer~ResizerOptions#isCentered
 */
