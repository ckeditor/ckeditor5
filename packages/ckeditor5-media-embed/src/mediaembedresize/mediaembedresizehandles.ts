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

const RESIZED_MEDIA_CLASS = 'media_resized';

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
	 * Iterates over all media model elements and attaches a resizer to any that don't already have one.
	 */
	private _setupResizerCreator(): void {
		const editor = this.editor;
		const widgetResize = editor.plugins.get( WidgetResize );
		const registry = editor.plugins.get( MediaEmbedEditing ).registry;

		const attachToAllMedia = () => {
			const root = editor.model.document.getRoot();

			/* istanbul ignore if: paranoid check -- @preserve */
			if ( !root ) {
				return;
			}

			for ( const item of editor.model.createRangeIn( root ).getItems() ) {
				if ( !item.is( 'element', 'media' ) ) {
					continue;
				}

				if ( !registry.isMediaResizable( item.getAttribute( 'url' ) as string || '' ) ) {
					continue;
				}

				const viewElement = editor.editing.mapper.toViewElement( item ) as ViewContainerElement | undefined;

				/* istanbul ignore if: paranoid check — conversion has run at this point -- @preserve */
				if ( !viewElement ) {
					continue;
				}

				if ( widgetResize.getResizerByViewElement( viewElement ) ) {
					continue;
				}

				this._attachResizer( item, viewElement );
			}
		};

		// Attach resizers after the initial render.
		editor.ui.once( 'update', attachToAllMedia );

		// Attach resizers after any model change that might insert media.
		// Skip the sweep for text-only changes (typing); only element inserts can produce
		// a new media widget. Low priority ensures downcast has produced the view element.
		this.listenTo( editor.model.document, 'change:data', () => {
			const hasElementInsert = editor.model.document.differ.getChanges().some(
				change => change.type === 'insert' && change.name !== '$text'
			);

			if ( hasElementInsert ) {
				attachToAllMedia();
			}
		}, { priority: 'low' } );
	}

	/**
	 * Attaches a resizer to a single media widget.
	 */
	private _attachResizer( modelElement: ModelElement, widgetView: ViewContainerElement ): void {
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

		resizer.bind( 'isEnabled' ).to( this );

		// Redraw once the view has flushed to DOM — otherwise the freshly inserted resizer
		// UIElement has no inline styles and handles cluster at the top-left corner (visible
		// after drag-and-drop until another event eventually triggers a redraw).
		editingView.once( 'render', () => resizer.redraw() );
	}
}
