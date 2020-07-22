/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresize
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Resizer from './widgetresize/resizer';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import MouseObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mouseobserver';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { throttle } from 'lodash-es';

import '../theme/widgetresize.css';

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

	/**
	 * @inheritDoc
	 */
	init() {
		/**
		 * The currently visible resizer.
		 *
		 * @protected
		 * @observable
		 * @member {module:widget/widgetresize/resizer~Resizer|null} #_visibleResizer
		 */
		this.set( '_visibleResizer', null );

		/**
		 * References an active resizer.
		 *
		 * Active resizer means a resizer which handle is actively used by the end user.
		 *
		 * @protected
		 * @observable
		 * @member {module:widget/widgetresize/resizer~Resizer|null} #_activeResizer
		 */
		this.set( '_activeResizer', null );

		/**
		 * A map of resizers created using this plugin instance.
		 *
		 * @private
		 * @type {Map.<module:engine/view/containerelement~ContainerElement, module:widget/widgetresize/resizer~Resizer>}
		 */
		this._resizers = new Map();

		const domDocument = global.window.document;

		this.editor.model.schema.setAttributeProperties( 'width', {
			isFormatting: true
		} );

		this.editor.editing.view.addObserver( MouseObserver );

		this._observer = Object.create( DomEmitterMixin );

		this.listenTo( this.editor.editing.view.document, 'mousedown', this._mouseDownListener.bind( this ), { priority: 'high' } );

		this._observer.listenTo( domDocument, 'mousemove', this._mouseMoveListener.bind( this ) );
		this._observer.listenTo( domDocument, 'mouseup', this._mouseUpListener.bind( this ) );

		const redrawFocusedResizer = () => {
			if ( this._visibleResizer ) {
				this._visibleResizer.redraw();
			}
		};

		const redrawFocusedResizerThrottled = throttle( redrawFocusedResizer, 50 );

		// Redraws occurring upon a change of visible resizer must not be throttled, as it is crucial for the initial
		// render. Without it the resizer frame would be misaligned with resizing host for a fraction of second.
		this.on( 'change:_visibleResizer', redrawFocusedResizer );

		// Redrawing on any change of the UI of the editor (including content changes).
		this.editor.ui.on( 'update', redrawFocusedResizerThrottled );

		// Resizers need to be redrawn upon window resize, because new window might shrink resize host.
		this._observer.listenTo( global.window, 'resize', redrawFocusedResizerThrottled );

		const viewSelection = this.editor.editing.view.document.selection;

		viewSelection.on( 'change', () => {
			const selectedElement = viewSelection.getSelectedElement();

			this._visibleResizer = this._getResizerByViewElement( selectedElement ) || null;
		} );

		// Currently, we have set the `redrawFocusedResizerThrottled()` callback on every editor's `update`,
		// which doesn't stop executing when we click outside the editor.
		// We should reset the `#_visibleResizer` to stop redrawing the ResizeWidget's handles when they are not in use.
		// ATM, constantly redrawing widget is hard to be set disabled.
		this.editor.ui.view.editable.on( 'change:isFocused', () => {
			if ( !this.editor.ui.view.editable.isFocused ) {
				this._visibleResizer = null;
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._observer.stopListening();

		for ( const resizer of this._resizers.values() ) {
			resizer.destroy();
		}
	}

	/**
	 * @param {module:widget/widgetresize~ResizerOptions} [options] Resizer options.
	 * @returns {module:widget/widgetresize/resizer~Resizer}
	 */
	attachTo( options ) {
		const resizer = new Resizer( options );
		const plugins = this.editor.plugins;

		resizer.attach();

		if ( plugins.has( 'WidgetToolbarRepository' ) ) {
			// Hiding widget toolbar to improve the performance
			// (https://github.com/ckeditor/ckeditor5-widget/pull/112#issuecomment-564528765).
			const widgetToolbarRepository = plugins.get( 'WidgetToolbarRepository' );

			resizer.on( 'begin', () => {
				widgetToolbarRepository.forceDisabled( 'resize' );
			}, { priority: 'lowest' } );

			resizer.on( 'cancel', () => {
				widgetToolbarRepository.clearForceDisabled( 'resize' );
			}, { priority: 'highest' } );

			resizer.on( 'commit', () => {
				widgetToolbarRepository.clearForceDisabled( 'resize' );
			}, { priority: 'highest' } );
		}

		this._resizers.set( options.viewElement, resizer );

		return resizer;
	}

	/**
	 * Returns a resizer that contains a given resize handle.
	 *
	 * @protected
	 * @param {HTMLElement} domResizeHandle
	 * @returns {module:widget/widgetresize/resizer~Resizer}
	 */
	_getResizerByHandle( domResizeHandle ) {
		for ( const resizer of this._resizers.values() ) {
			if ( resizer.containsHandle( domResizeHandle ) ) {
				return resizer;
			}
		}
	}

	/**
	 * Returns a resizer created for a given view element (widget element).
	 *
	 * @protected
	 * @param {module:engine/view/containerelement~ContainerElement} viewElement
	 * @returns {module:widget/widgetresize/resizer~Resizer}
	 */
	_getResizerByViewElement( viewElement ) {
		return this._resizers.get( viewElement );
	}

	/**
	 * @protected
	 * @param {module:utils/eventinfo~EventInfo} event
	 * @param {Event} domEventData Native DOM event.
	 */
	_mouseDownListener( event, domEventData ) {
		const resizeHandle = domEventData.domTarget;

		if ( !Resizer.isResizeHandle( resizeHandle ) ) {
			return;
		}

		this._activeResizer = this._getResizerByHandle( resizeHandle );

		if ( this._activeResizer ) {
			this._activeResizer.begin( resizeHandle );

			// Do not call other events when resizing. See: #6755.
			event.stop();
			domEventData.preventDefault();
		}
	}

	/**
	 * @protected
	 * @param {module:utils/eventinfo~EventInfo} event
	 * @param {Event} domEventData Native DOM event.
	 */
	_mouseMoveListener( event, domEventData ) {
		if ( this._activeResizer ) {
			this._activeResizer.updateSize( domEventData );
		}
	}

	/**
	 * @protected
	 */
	_mouseUpListener() {
		if ( this._activeResizer ) {
			this._activeResizer.commit();
			this._activeResizer = null;
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
 * Editor instance associated with the resizer.
 *
 * @member {module:core/editor/editor~Editor} module:widget/widgetresize~ResizerOptions#editor
 */

/**
 * @member {module:engine/model/element~Element} module:widget/widgetresize~ResizerOptions#modelElement
 */

/**
 * A view of an element to be resized. Typically it's the main widget's view instance.
 *
 * @member {module:engine/view/containerelement~ContainerElement} module:widget/widgetresize~ResizerOptions#viewElement
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
 *	editor,
 *	modelElement: data.item,
 *	viewElement: widget,
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
