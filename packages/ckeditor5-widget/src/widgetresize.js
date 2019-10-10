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
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { throttle } from 'lodash-es';

/**
 * The widget resize feature plugin.
 *
 * Use the {@link module:widget/widgetresize~WidgetResize#attachTo} method to create a resizer for the specified widget.
 *
 * @extends module:core/plugin~Plugin
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class WidgetResize extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'WidgetResize';
	}

	init() {
		/**
		 * A map of resizers created using this plugin instance.
		 *
		 * @type {Map.<module:engine/view/containerelement~ContainerElement, module:widget/widgetresize/resizer~Resizer>}
		 */
		this.resizers = new Map();

		/**
		 * @protected
		 * @observable
		 * @type {module:widget/widgetresize/resizer~Resizer|null} Currently visible resizer.
		 */
		this.set( '_visibleResizer', null );

		/**
		 * References an active resizer.
		 *
		 * Active resizer means a resizer which handle is actively used by the end user.
		 *
		 * @protected
		 * @observable
		 * @type {module:widget/widgetresize/resizer~Resizer|null}
		 */
		this.set( '_activeResizer', null );

		const domDocument = global.window.document;

		this.editor.model.schema.setAttributeProperties( 'width', {
			isFormatting: true
		} );

		this._observer = Object.create( DomEmitterMixin );

		this._observer.listenTo( domDocument, 'mousedown', ( event, domEventData ) => {
			if ( !Resizer.isResizeHandle( domEventData.target ) ) {
				return;
			}

			const resizeHandle = domEventData.target;

			this._activeResizer = this._getResizerByHandle( resizeHandle );

			if ( this._activeResizer ) {
				this._activeResizer.begin( resizeHandle );
			}
		} );

		this._observer.listenTo( domDocument, 'mousemove', throttle( ( event, domEventData ) => {
			if ( this._activeResizer ) {
				this._activeResizer.updateSize( domEventData );
			}
		}, 16 ) ); // 60 fps

		this._observer.listenTo( domDocument, 'mouseup', () => {
			if ( this._activeResizer ) {
				this._activeResizer.commit();

				this._activeResizer = null;
			}
		} );

		this._attachFocusChangeListener();

		const redrawFocusedResizer = throttle( () => {
			if ( this._visibleResizer ) {
				this._visibleResizer.redraw();
			}
		}, 200 ); // 5 fps

		this.on( 'change:_visibleResizer', redrawFocusedResizer );

		// Redrawing on any change of the UI of the editor (including content changes).
		this.editor.ui.on( 'update', redrawFocusedResizer );

		// Resizers need to be redrawn upon window resize, because new window might shrink resize host.
		this._observer.listenTo( global.window, 'resize', redrawFocusedResizer );
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

		this.resizers.set( options.viewElement, resizer );

		return resizer;
	}

	/**
	 * Listens for selection change and sets the visible resizer accordingly.
	 *
	 * @private
	 */
	_attachFocusChangeListener() {
		this.editor.editing.downcastDispatcher.on( 'selection', ( evt, data, conversionApi ) => {
			const viewWriter = conversionApi.writer;
			let lastMarked = null;
			let matchedResizer = null;

			for ( const range of viewWriter.document.selection.getRanges() ) {
				for ( const value of range ) {
					const node = value.item;

					// Do not mark nested widgets in selected one. See: ckeditor/ckeditor5-widget#57.
					if ( isWidget( node ) && !isChild( node, lastMarked ) && node.hasClass( 'ck-widget_with-resizer' ) ) {
						matchedResizer = this.resizers.get( node ) || matchedResizer;

						lastMarked = node;
					}
				}
			}

			this._visibleResizer = matchedResizer;
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

	_getResizerByHandle( domResizeHandle ) {
		for ( const resizer of this.resizers.values() ) {
			if ( resizer.containsHandle( domResizeHandle ) ) {
				return resizer;
			}
		}
	}
}

mix( WidgetResize, ObservableMixin );

/**
 * Interface describing a resizer. It allows to specify the resizing host, custom logic for calculating aspect ratio, etc.
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
 * A callback to be executed once the resizing process is done.
 *
 * It receives a `Number` (`newValue`) as a parameter.
 *
 * For example, {@link module:image/imageresize~ImageResize} uses it to execute the image resize command
 * which puts the new value into the model.
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
