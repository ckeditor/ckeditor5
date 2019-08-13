/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresizer
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import getAncestors from '@ckeditor/ckeditor5-utils/src/dom/getancestors';
import ResizeContext from './resizecontext';
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
		this.contexts = [];
		this.activeContext = null;

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
			if ( this.activeContext ) {
				this.activeContext.updateSize( domEventData );
			}
		}, THROTTLE_THRESHOLD );

		this._observers.mouseDownUp.listenTo( mouseObserverHost, 'mousedown', ( event, domEventData ) => {
			const target = domEventData.target;

			const resizeHandler = isResizeHandler( target ) ? target : getAncestors( target ).filter( isResizeHandler )[ 0 ];

			if ( resizeHandler ) {
				this._observers.mouseMove.listenTo( mouseObserverHost, 'mousemove', mouseMoveListener );

				this.activeContext = this._getContextByHandler( resizeHandler );

				if ( this.activeContext ) {
					this.activeContext.begin( resizeHandler );
				}
			}
		} );

		const finishResizing = () => {
			if ( this.activeContext ) {
				this._observers.mouseMove.stopListening( mouseObserverHost, 'mousemove', mouseMoveListener );

				if ( this.activeContext ) {
					this.activeContext.commit( this.editor );
				}

				this.activeContext = null;
			}
		};

		const resizeContexts = throttle( () => {
			for ( const context of this.contexts ) {
				context.redraw();
			}
		}, THROTTLE_THRESHOLD );

		this._observers.mouseDownUp.listenTo( mouseObserverHost, 'mouseup', finishResizing );

		// Redrawing on layout change fixes issue with browser window resize or undo causing a mispositioned resizer.
		this.editor.editing.view.document.on( 'layoutChanged', resizeContexts );

		// Resizers need to be redrawn upon window resize, because new window might shrink resize host.
		this._observers.windowResize.listenTo( global.window, 'resize', resizeContexts );

		function isResizeHandler( element ) {
			return element.classList && element.classList.contains( 'ck-widget__resizer' );
		}
	}

	/**
	 * Method that applies a resizer to a given `widgetElement`.
	 *
	 * ```js
	 * conversion.for( 'editingDowncast' ).elementToElement( {
	 *		model: 'image',
	 *		view: ( modelElement, viewWriter ) => {
	 *			const widget = toImageWidget( createImageViewElement( viewWriter ), viewWriter, t( 'image widget' ) );
	 *
	 *			editor.plugins.get( 'WidgetResizer' ).apply( widget, viewWriter );
	 *
	 *			return widget;
	 *		}
	 *	} );
	 * ```
	 *
	 * You can use the `options` parameter to customize the behavior of the resizer:
	 *
	 * ```js
	 * conversion.for( 'editingDowncast' ).elementToElement( {
	 *			model: 'image',
	 *			view: ( modelElement, viewWriter ) => {
	 *				const widget = toImageWidget( createImageViewElement( viewWriter ), viewWriter, t( 'image widget' ) );
	 *
	 *				editor.plugins.get( 'WidgetResizer' ).apply( widget, viewWriter, {
	 *					getResizeHost( wrapper ) {
	 *						return wrapper.querySelector( 'img' );
	 *					},
	 *					getAspectRatio( resizeHost ) {
	 *						return resizeHost.naturalWidth / resizeHost.naturalHeight;
	 *					},
	 *					isCentered( context ) {
	 *						const imageStyle = context._getModel( editor, context.widgetWrapperElement ).getAttribute( 'imageStyle' );
	 *
	 *						return !imageStyle || imageStyle == 'full';
	 *					}
	 *				} );
	 *
	 *				return widget;
	 *			}
	 *		} );
	 * ```
	 *
	 * @param {module:engine/view/containerelement~ContainerElement} widgetElement
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 * @param {module:widget/widgetresizer~ResizerOptions} [options] Resizer options.
	 * @returns {module:widget/resizecontext~ResizeContext}
	 */
	apply( widgetElement, writer, options ) {
		const context = new ResizeContext( options );
		context.attach( widgetElement, writer );

		this.editor.editing.view.once( 'render', () => context.redraw() );

		this.contexts.push( context );

		return context;
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

/**
 * Interface describing a resizer. It allows to specify resizing host, custom logic for calculating aspect ratio etc.
 *
 * @interface ResizerOptions
 */

/**
 * Function to explicitly point the resizing host.
 *
 * By default resizer will use widget wrapper, but it's possible to point any child within widget wrapper.
 *
 * ```js
 *	editor.plugins.get( 'WidgetResizer' ).apply( widget, conversionApi.writer, {
 *		getResizeHost( wrapper ) {
 *			return wrapper.querySelector( 'img' );
 *		}
 *	} );
 * ```
 *
 * @member {Function} module:widget/widgetresizer~ResizerOptions#getResizeHost
 */

/**
 * @member {Function} module:widget/widgetresizer~ResizerOptions#getAspectRatio
 */

/**
 * ```js
 *	editor.plugins.get( 'WidgetResizer' ).apply( widget, conversionApi.writer, {
 *		isCentered( context ) {
 *			const imageStyle = context._getModel( editor, context.widgetWrapperElement ).getAttribute( 'imageStyle' );
 *
 *			return !imageStyle || imageStyle == 'full';
 *		}
 *	} );
 * ```
 * @member {Function} module:widget/widgetresizer~ResizerOptions#isCentered
 */
