/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module widget/widgetresize
 */

import Resizer, {
	type ResizerBeginEvent,
	type ResizerCancelEvent,
	type ResizerCommitEvent
} from './widgetresize/resizer.js';

import type WidgetToolbarRepository from './widgettoolbarrepository.js';

import {
	Plugin,
	type Editor
} from '@ckeditor/ckeditor5-core';

import {
	MouseObserver,
	type DocumentChangeEvent,
	type DomEventData,
	type Element,
	type ViewContainerElement,
	type ViewDocumentMouseDownEvent,
	type ViewSelectionChangeEvent
} from '@ckeditor/ckeditor5-engine';

import type { EditorUIUpdateEvent } from '@ckeditor/ckeditor5-ui';

import {
	DomEmitterMixin,
	global,
	type DomEmitter,
	type EventInfo
} from '@ckeditor/ckeditor5-utils';

import { throttle, type DebouncedFunction } from 'es-toolkit/compat';

import '../theme/widgetresize.css';

/**
 * The widget resize feature plugin.
 *
 * Use the {@link module:widget/widgetresize~WidgetResize#attachTo} method to create a resizer for the specified widget.
 */
export default class WidgetResize extends Plugin {
	/**
	 * The currently selected resizer.
	 *
	 * @observable
	 */
	declare public selectedResizer: Resizer | null;

	/**
	 * References an active resizer.
	 *
	 * Active resizer means a resizer which handle is actively used by the end user.
	 *
	 * @internal
	 * @observable
	 */
	declare public _activeResizer: Resizer | null;

	/**
	 * A map of resizers created using this plugin instance.
	 */
	private _resizers = new Map<ViewContainerElement, Resizer>();

	private _observer!: DomEmitter;

	private _redrawSelectedResizerThrottled!: DebouncedFunction<() => void>;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'WidgetResize' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editing = this.editor.editing;
		const domDocument = global.window.document;

		this.set( 'selectedResizer', null );
		this.set( '_activeResizer', null );

		editing.view.addObserver( MouseObserver );

		this._observer = new ( DomEmitterMixin() )();

		this.listenTo<ViewDocumentMouseDownEvent>(
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
	 * @param options Resizer options.
	 */
	public attachTo( options: ResizerOptions ): Resizer {
		const resizer = new Resizer( options );
		const plugins = this.editor.plugins;

		resizer.attach();

		if ( plugins.has( 'WidgetToolbarRepository' ) ) {
			// Hiding widget toolbar to improve the performance
			// (https://github.com/ckeditor/ckeditor5-widget/pull/112#issuecomment-564528765).
			const widgetToolbarRepository: WidgetToolbarRepository = plugins.get( 'WidgetToolbarRepository' );

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
	 * @param viewElement View element associated with the resizer.
	 */
	public getResizerByViewElement( viewElement: ViewContainerElement ): Resizer | undefined {
		return this._resizers.get( viewElement );
	}

	/**
	 * Returns a resizer that contains a given resize handle.
	 */
	private _getResizerByHandle( domResizeHandle: HTMLElement ): Resizer | undefined {
		for ( const resizer of this._resizers.values() ) {
			if ( resizer.containsHandle( domResizeHandle ) ) {
				return resizer;
			}
		}
	}

	/**
	 * @param domEventData Native DOM event.
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
	 * @param domEventData Native DOM event.
	 */
	private _mouseMoveListener( event: unknown, domEventData: MouseEvent ) {
		if ( this._activeResizer ) {
			this._activeResizer.updateSize( domEventData );
		}
	}

	private _mouseUpListener(): void {
		if ( this._activeResizer ) {
			this._activeResizer.commit();
			this._activeResizer = null;
		}
	}
}

/**
 * Interface describing a resizer. It allows to specify the resizing host, custom logic for calculating aspect ratio, etc.
 */
export interface ResizerOptions {

	/**
	 * Editor instance associated with the resizer.
	 */
	editor: Editor;

	modelElement: Element;

	/**
	 * A view of an element to be resized. Typically it's the main widget's view instance.
	 */
	viewElement: ViewContainerElement;

	unit?: 'px' | '%';

	/**
	 * A callback to be executed once the resizing process is done.
	 *
	 * It receives a `Number` (`newValue`) as a parameter.
	 *
	 * For example, {@link module:image/imageresize~ImageResize} uses it to execute the resize image command
	 * which puts the new value into the model.
	 *
	 * ```ts
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
	 */
	onCommit: ( newValue: string ) => void;

	getResizeHost: ( widgetWrapper: HTMLElement ) => HTMLElement;

	getHandleHost: ( widgetWrapper: HTMLElement ) => HTMLElement;

	isCentered?: ( resizer: Resizer ) => boolean;
}
