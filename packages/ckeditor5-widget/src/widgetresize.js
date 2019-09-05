/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresize
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Resizer from './widgetresize/resizer';
import { isWidget } from './utils';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { throttle } from 'lodash-es';

/**
 * Widget resize feature plugin.
 *
 * Use the {@link module:widget/widgetresize~WidgetResize#attachTo} method to create a resizer for the specified widget.
 *
 * @extends module:core/plugin~Plugin
 */
export default class WidgetResize extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'WidgetResize';
	}

	_resizeWorkaround() {
		this.editor.editing.downcastDispatcher.on( 'selection', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;
			let lastMarked = null;

			for ( const range of viewWriter.document.selection.getRanges() ) {
				for ( const value of range ) {
					const node = value.item;

					// Do not mark nested widgets in selected one. See: ckeditor/ckeditor5-widget#57.
					if ( isWidget( node ) && !isChild( node, lastMarked ) && node.hasClass( 'ck-widget_with-resizer' ) ) {
						const resizer = this.resizersByWrapper.get( node );

						if ( resizer ) {
							resizer.redraw();
						}

						lastMarked = node;
					}
				}
			}
		}, { priority: 'low' } );

		// Checks whether the specified `element` is a child of the `parent` element.
		//
		// @param {module:engine/view/element~Element} element An element to check.
		// @param {module:engine/view/element~Element|null} parent A parent for the element.
		// @returns {Boolean}
		function isChild( element, parent ) {
			if ( !parent ) {
				return false;
			}

			return Array.from( element.getAncestors() ).includes( parent );
		}
	}

	init() {
		this.resizers = [];
		this.resizersByWrapper = new Map();
		this.activeResizer = null;

		const domDocument = global.window.document;
		const THROTTLE_THRESHOLD = 16; // 16ms = ~60fps

		this.editor.model.schema.setAttributeProperties( 'width', {
			isFormatting: true
		} );

		this._resizeWorkaround();

		this._observer = Object.create( DomEmitterMixin );

		this._observer.listenTo( domDocument, 'mousedown', ( event, domEventData ) => {
			if ( !Resizer.isResizeHandle( domEventData.target ) ) {
				return;
			}

			const resizeHandle = domEventData.target;

			this.activeResizer = this._getResizerByHandle( resizeHandle );

			if ( this.activeResizer ) {
				this.activeResizer.begin( resizeHandle );
			}
		} );

		this._observer.listenTo( domDocument, 'mousemove', throttle( ( event, domEventData ) => {
			if ( this.activeResizer ) {
				this.activeResizer.updateSize( domEventData );
			}
		}, THROTTLE_THRESHOLD ) );

		this._observer.listenTo( domDocument, 'mouseup', () => {
			if ( this.activeResizer ) {
				this.activeResizer.commit();

				this.activeResizer = null;
			}
		} );

		const redrawResizers = throttle( () => {
			if ( this.activeResizer ) {
				this.activeResizer.redraw();
			}
		}, 100 );

		// Redrawing on any change of the UI of the editor (including content changes).
		this.editor.ui.on( 'update', redrawResizers );

		// Resizers need to be redrawn upon window resize, because new window might shrink resize host.
		this._observer.listenTo( global.window, 'resize', redrawResizers );
	}

	destroy() {
		this._observer.stopListening();
	}

	/**
	 * @param {module:widget/widgetresize~ResizerOptions} [options] Resizer options.
	 * @returns {module:widget/widgetresize/resizer~Resizer}
	 */
	attachTo( options ) {
		const resizer = new Resizer( options );

		resizer.attach();

		this.editor.editing.view.once( 'render', () => resizer.redraw() ); // no longer needed as we listen for widget selection change

		this.resizers.push( resizer );

		this.resizersByWrapper.set( options.viewElement, resizer );

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
 * @member {module:engine/model/element~Element} module:widget/widgetresize~ResizerOptions#modelElement
 */

/**
 * @member {module:engine/view/containerelement~ContainerElement} module:widget/widgetresize~ResizerOptions#viewElement
 */

/**
 * @member {module:engine/view/downcastwriter~DowncastWriter} module:widget/widgetresize~ResizerOptions#downcastWriter
 */

/**
 * A callback to be executed once resizing process is done.
 *
 * It receives a `Number` (`newValue`) as a parameter.
 *
 * For example, {@link module:image/imageresize~ImageResize} uses it to execute image resize command,
 * which puts new value into the model.
 *
 * ```js
 * {
 *	modelElement: data.item,
 *	viewElement: widget,
 *	downcastWriter: conversionApi.writer,
 *
 *	onCommit( newValue ) {
 *		editor.execute( 'imageResize', { width: newValue } );
 *	}
 * };
 * ```
 *
 *
 * @member {Function} module:widget/widgetresize~ResizerOptions#onCommit
 */

/**
 * @member {Function} module:widget/widgetresize~ResizerOptions#getResizeHost
 */

/**
 * @member {Function} module:widget/widgetresize~ResizerOptions#isCentered
 */
