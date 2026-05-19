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
	 * Attaches a resizer to every newly inserted media widget. Walks only the ranges
	 * reported by the differ — never the whole document — so unrelated inserts (e.g.
	 * pressing Enter to create a paragraph) cost only the differ check.
	 *
	 * Each resizer's `isEnabled` is bound to the plugin in {@link #_attachResizer},
	 * so it auto-tracks the resize command's state.
	 */
	private _setupResizerCreator(): void {
		const editor = this.editor;
		const model = editor.model;
		const widgetResize = editor.plugins.get( WidgetResize );

		// Low priority ensures downcast has run before we look up view elements.
		this.listenTo( model.document, 'change:data', () => {
			for ( const change of model.document.differ.getChanges() ) {
				if ( change.type !== 'insert' || change.name === '$text' ) {
					continue;
				}

				const insertedRange = model.createRange(
					change.position,
					change.position.getShiftedBy( change.length )
				);

				for ( const item of insertedRange.getItems() ) {
					if ( !item.is( 'element', 'media' ) ) {
						continue;
					}

					const viewElement = editor.editing.mapper.toViewElement( item ) as ViewContainerElement | undefined;

					/* istanbul ignore if: paranoid check — conversion has run at this point -- @preserve */
					if ( !viewElement ) {
						continue;
					}

					if ( !widgetResize.getResizerByViewElement( viewElement ) ) {
						this._attachResizer( item, viewElement );
					}
				}
			}
		}, { priority: 'low' } );
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

		resizer.bind( 'isEnabled' ).to( this );

		resizer.on( 'updateSize', () => {
			if ( !widgetView.hasClass( RESIZED_MEDIA_CLASS ) ) {
				editingView.change( writer => writer.addClass( RESIZED_MEDIA_CLASS, widgetView ) );
			}
		} );

		// Redraw once the view has flushed to DOM — otherwise the freshly inserted resizer
		// UIElement has no inline styles and handles cluster at the top-left corner (visible
		// after drag-and-drop until another event eventually triggers a redraw).
		editingView.once( 'render', () => resizer.redraw() );
	}
}
