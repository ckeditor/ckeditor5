/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresize
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Resizer, {
	type ResizerBeginEvent,
	type ResizerCancelEvent,
	type ResizerCommitEvent
} from './widgetresize/resizer';
import { Emitter as DomEmitter } from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import MouseObserver, { type ViewDocumentMouseEvent } from '@ckeditor/ckeditor5-engine/src/view/observer/mouseobserver';
import { throttle, type DebouncedFunc } from 'lodash-es';

import '../theme/widgetresize.css';

import type { EditorUIUpdateEvent } from '@ckeditor/ckeditor5-core/src/editor/editorui';
import type { DocumentChangeEvent } from '@ckeditor/ckeditor5-engine/src/model/document';
import type { ViewSelectionChangeEvent } from '@ckeditor/ckeditor5-engine/src/view/selection';
import type { Editor } from '@ckeditor/ckeditor5-core';
import type { DomEventData, Element, ViewContainerElement } from '@ckeditor/ckeditor5-engine';
import type WidgetToolbarRepository from './widgettoolbarrepository';
import type EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

/**
 * The widget resize feature plugin.
 *
 * Use the {@link module:widget/widgetresize~WidgetResize#attachTo} method to create a resizer for the specified widget.
 *
 * @extends module:core/plugin~Plugin
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class WidgetResize extends Plugin {
	declare public selectedResizer: Resizer | null;

	/**
	 * @internal
	 */
	declare public _activeResizer: Resizer | null;

	private _resizers!: Map<ViewContainerElement, Resizer>;
	private _observer!: DomEmitter;
	private _redrawSelectedResizerThrottled!: DebouncedFunc<() => void>;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'WidgetResize' {
		return 'WidgetResize';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editing = this.editor.editing;
		const domDocument = global.window.document;

		/**
		 * The currently selected resizer.
		 *
		 * @observable
		 * @member {module:widget/widgetresize/resizer~Resizer|null} #selectedResizer
		 */
		this.set( 'selectedResizer', null );

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
		 * @protected
		 * @type {Map.<module:engine/view/containerelement~ContainerElement, module:widget/widgetresize/resizer~Resizer>}
		 */
		this._resizers = new Map();

		editing.view.addObserver( MouseObserver );

		this._observer = new DomEmitter();

		this.listenTo<ViewDocumentMouseEvent>(
			editing.view.document,
			'mousedown',
			this._mouseDownListener.bind( this ),
			{ priority: 'high' }
		);

		this._observer.listenTo( domDocument, 'mousemove', this._mouseMoveListener.bind( this ) );
		this._observer.listenTo( domDocument, 'mouseup', this._mouseUpListener.bind( this ) );

		this._redrawSelectedResizerThrottled = throttle( () => this.redrawSelectedResizer(), 200 );

		// Redrawing on any change of the UI of the editor (including content changes).
		this.editor.ui.on<EditorUIUpdateEvent>( 'update', this._redrawSelectedResizerThrottled );

		// Remove view widget-resizer mappings for widgets that have been removed from the document.
		// https://github.com/ckeditor/ckeditor5/issues/10156
		// https://github.com/ckeditor/ckeditor5/issues/10266
		this.editor.model.document.on<DocumentChangeEvent>( 'change', () => {
			for ( const [ viewElement, resizer ] of this._resizers ) {
				if ( !viewElement.isAttached() ) {
					this._resizers.delete( viewElement );
					resizer.destroy();
				}
			}
		}, { priority: 'lowest' } );

		// Resizers need to be redrawn upon window resize, because new window might shrink resize host.
		this._observer.listenTo( global.window, 'resize', this._redrawSelectedResizerThrottled );

		const viewSelection = this.editor.editing.view.document.selection;

		viewSelection.on<ViewSelectionChangeEvent>( 'change', () => {
			const selectedElement = viewSelection.getSelectedElement() as ViewContainerElement;

			const resizer = this.getResizerByViewElement( selectedElement ) || null;
			if ( resizer ) {
				this.select( resizer );
			} else {
				this.deselect();
			}
		} );
	}

	/**
	 * Redraws the selected resizer if there is any selected resizer and if it is visible.
	 */
	public redrawSelectedResizer(): void {
		if ( this.selectedResizer && this.selectedResizer.isVisible ) {
			this.selectedResizer.redraw();
		}
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this._observer.stopListening();

		for ( const resizer of this._resizers.values() ) {
			resizer.destroy();
		}

		this._redrawSelectedResizerThrottled.cancel();
	}

	/**
	 * Marks resizer as selected.
	 *
	 * @param {module:widget/widgetresize/resizer~Resizer} resizer
	 */
	public select( resizer: Resizer ): void {
		this.deselect();
		this.selectedResizer = resizer;
		this.selectedResizer.isSelected = true;
	}

	/**
	 * Deselects currently set resizer.
	 */
	public deselect(): void {
		if ( this.selectedResizer ) {
			this.selectedResizer.isSelected = false;
		}

		this.selectedResizer = null;
	}

	/**
	 * @param {module:widget/widgetresize~ResizerOptions} [options] Resizer options.
	 * @returns {module:widget/widgetresize/resizer~Resizer}
	 */
	public attachTo( options: ResizerOptions ): Resizer {
		const resizer = new Resizer( options );
		const plugins = this.editor.plugins;

		resizer.attach();

		if ( plugins.has( 'WidgetToolbarRepository' ) ) {
			// Hiding widget toolbar to improve the performance
			// (https://github.com/ckeditor/ckeditor5-widget/pull/112#issuecomment-564528765).
			const widgetToolbarRepository = plugins.get( 'WidgetToolbarRepository' );

			resizer.on<ResizerBeginEvent>( 'begin', () => {
				widgetToolbarRepository.forceDisabled( 'resize' );
			}, { priority: 'lowest' } );

			resizer.on<ResizerCancelEvent>( 'cancel', () => {
				widgetToolbarRepository.clearForceDisabled( 'resize' );
			}, { priority: 'highest' } );

			resizer.on<ResizerCommitEvent>( 'commit', () => {
				widgetToolbarRepository.clearForceDisabled( 'resize' );
			}, { priority: 'highest' } );
		}

		this._resizers.set( options.viewElement, resizer );

		const viewSelection = this.editor.editing.view.document.selection;
		const selectedElement = viewSelection.getSelectedElement() as ViewContainerElement;

		// If the element the resizer is created for is currently focused, it should become visible.
		if ( this.getResizerByViewElement( selectedElement ) == resizer ) {
			this.select( resizer );
		}

		return resizer;
	}

	/**
	 * Returns a resizer created for a given view element (widget element).
	 *
	 * @param {module:engine/view/containerelement~ContainerElement} viewElement View element associated with the resizer.
	 * @returns {module:widget/widgetresize/resizer~Resizer|undefined}
	 */
	public getResizerByViewElement( viewElement: ViewContainerElement ): Resizer | undefined {
		return this._resizers.get( viewElement );
	}

	/**
	 * Returns a resizer that contains a given resize handle.
	 *
	 * @protected
	 * @param {HTMLElement} domResizeHandle
	 * @returns {module:widget/widgetresize/resizer~Resizer}
	 */
	private _getResizerByHandle( domResizeHandle: HTMLElement ): Resizer | undefined {
		for ( const resizer of this._resizers.values() ) {
			if ( resizer.containsHandle( domResizeHandle ) ) {
				return resizer;
			}
		}
	}

	/**
	 * @protected
	 * @param {module:utils/eventinfo~EventInfo} event
	 * @param {Event} domEventData Native DOM event.
	 */
	private _mouseDownListener( event: EventInfo, domEventData: DomEventData ) {
		const resizeHandle = domEventData.domTarget;

		if ( !Resizer.isResizeHandle( resizeHandle ) ) {
			return;
		}

		this._activeResizer = this._getResizerByHandle( resizeHandle ) || null;

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
	private _mouseMoveListener( event: unknown, domEventData: MouseEvent ) {
		if ( this._activeResizer ) {
			this._activeResizer.updateSize( domEventData );
		}
	}

	/**
	 * @protected
	 */
	private _mouseUpListener(): void {
		if ( this._activeResizer ) {
			this._activeResizer.commit();
			this._activeResizer = null;
		}
	}
}

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
 * For example, {@link module:image/imageresize~ImageResize} uses it to execute the resize image command
 * which puts the new value into the model.
 *
 * ```js
 * {
 *	editor,
 *	modelElement: data.item,
 *	viewElement: widget,
 *
 *	onCommit( newValue ) {
 *		editor.execute( 'resizeImage', { width: newValue } );
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
export interface ResizerOptions {
	editor: Editor;
	modelElement: Element;
	viewElement: ViewContainerElement;
	unit?: 'px' | '%';
	onCommit: ( newValue: string ) => void;
	getResizeHost: ( widgetWrapper: HTMLElement ) => HTMLElement;
	getHandleHost: ( widgetWrapper: HTMLElement ) => HTMLElement;
	isCentered?: ( resizer: Resizer ) => boolean;
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ WidgetResize.pluginName ]: WidgetResize;
	}
}
