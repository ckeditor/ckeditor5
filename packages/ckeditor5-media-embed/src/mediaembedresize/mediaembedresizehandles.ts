/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedresize/mediaembedresizehandles
 */

import type { ModelElement, ViewContainerElement } from '@ckeditor/ckeditor5-engine';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { WidgetResize } from '@ckeditor/ckeditor5-widget';
import { MediaEmbedEditing } from '../mediaembedediting.js';
import type { ResizeMediaEmbedCommand } from './resizemediaembedcommand.js';
import { RESIZED_MEDIA_CLASS } from './constants.js';

/**
 * The media embed resize by handles feature.
 *
 * It adds the ability to resize each media embed using handles.
 */
export class MediaEmbedResizeHandles extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ WidgetResize ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedResizeHandles' as const;
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
		const command: ResizeMediaEmbedCommand = this.editor.commands.get( 'resizeMediaEmbed' )!;
		this.bind( 'isEnabled' ).to( command );

		this._setupResizerCreator();
	}

	/**
	 * Attaches a resizer to every media widget and keeps each resizer's `isEnabled` in sync
	 * with whether the current URL points to a resizable provider.
	 *
	 * Always-attach is intentional. Detaching a resizer after a URL change would trigger
	 * `WidgetResizer._cleanup()`, which re-applies a stale `_initialViewWidth` captured at the
	 * start of a prior drag — leaving an orphan `style="width: …"` on the figure. Toggling
	 * `isEnabled` hides the handles without invoking destroy-time cleanup.
	 */
	private _setupResizerCreator(): void {
		const editor = this.editor;
		const widgetResize = editor.plugins.get( WidgetResize );
		const registry = editor.plugins.get( MediaEmbedEditing ).registry;

		const syncResizers = () => {
			for ( const root of editor.model.document.getRoots() ) {
				for ( const item of editor.model.createRangeIn( root ).getItems() ) {
					if ( !item.is( 'element', 'media' ) ) {
						continue;
					}

					const viewElement = editor.editing.mapper.toViewElement( item ) as ViewContainerElement | undefined;

					/* istanbul ignore if: paranoid check — conversion has run at this point -- @preserve */
					if ( !viewElement ) {
						continue;
					}

					const resizer = widgetResize.getResizerByViewElement( viewElement ) ||
						this._attachResizer( item, viewElement );

					const isResizable = registry.isMediaResizable( item.getAttribute( 'url' ) as string || '' );
					resizer.isEnabled = this.isEnabled && isResizable;
				}
			}
		};

		// Sync resizers after the initial render.
		editor.ui.once( 'update', syncResizers );

		// Sync after inserts (new media) and after URL changes (provider may have switched between
		// resizable/non-resizable). Skip text-only changes. Low priority ensures downcast has run.
		this.listenTo( editor.model.document, 'change:data', () => {
			const hasRelevantChange = editor.model.document.differ.getChanges().some( change => {
				if ( change.type === 'insert' && change.name !== '$text' ) {
					return true;
				}

				if ( change.type === 'attribute' && change.attributeKey === 'url' ) {
					return true;
				}

				return false;
			} );

			if ( hasRelevantChange ) {
				syncResizers();
			}
		}, { priority: 'low' } );

		// Plugin's own isEnabled (bound to the command) can flip independently of model changes —
		// propagate those flips to every attached resizer.
		this.on( 'change:isEnabled', syncResizers );
	}

	/**
	 * Attaches a resizer to a single media widget.
	 */
	private _attachResizer( modelElement: ModelElement, widgetView: ViewContainerElement ) {
		const editor = this.editor;
		const editingView = editor.editing.view;

		const resizer = editor.plugins.get( WidgetResize ).attachTo( {
			unit: '%',
			modelElement,
			viewElement: widgetView,
			editor,

			getHandleHost: domWidgetElement => domWidgetElement.querySelector( '.ck-media__wrapper' )!,
			getResizeHost: domWidgetElement => domWidgetElement,

			onCommit: newValue => {
				editingView.change( writer => writer.removeClass( RESIZED_MEDIA_CLASS, widgetView ) );
				editor.execute( 'resizeMediaEmbed', { width: newValue } );
			}
		} );

		resizer.on( 'updateSize', () => {
			if ( !widgetView.hasClass( RESIZED_MEDIA_CLASS ) ) {
				editingView.change( writer => writer.addClass( RESIZED_MEDIA_CLASS, widgetView ) );
			}
		} );

		// Redraw once the view has flushed to DOM — otherwise the freshly inserted resizer
		// UIElement has no inline styles and handles cluster at the top-left corner (visible
		// after drag-and-drop until another event eventually triggers a redraw).
		editingView.once( 'render', () => resizer.redraw() );

		return resizer;
	}
}
