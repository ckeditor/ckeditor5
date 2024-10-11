/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgettoolbarrepository
 */

import {
	Plugin,
	type ToolbarConfigItem
} from '@ckeditor/ckeditor5-core';

import type { ViewDocumentSelection, ViewElement } from '@ckeditor/ckeditor5-engine';

import {
	ContextualToolbarRepository,
	type BalloonToolbar,
	type BalloonToolbarShowEvent
} from '@ckeditor/ckeditor5-ui';

import { isWidget } from './utils.js';
import type { RectSource } from '@ckeditor/ckeditor5-utils';

/**
 * Widget toolbar repository plugin. A central point for registering widget toolbars. This plugin handles the whole
 * toolbar rendering process and exposes a concise API.
 *
 * To add a toolbar for your widget use the {@link ~WidgetToolbarRepository#register `WidgetToolbarRepository#register()`} method.
 *
 * The following example comes from the {@link module:image/imagetoolbar~ImageToolbar} plugin:
 *
 * ```ts
 * class ImageToolbar extends Plugin {
 * 	static get requires() {
 * 		return [ WidgetToolbarRepository ];
 * 	}
 *
 * 	afterInit() {
 * 		const editor = this.editor;
 * 		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
 *
 * 		widgetToolbarRepository.register( 'image', {
 * 			items: editor.config.get( 'image.toolbar' ),
 * 			getRelatedElement: getClosestSelectedImageWidget
 * 		} );
 * 	}
 * }
 * ```
 */
export default class WidgetToolbarRepository extends Plugin {
	/**
	 * TODO
	 */
	private _contextualToolbarRepository!: ContextualToolbarRepository;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualToolbarRepository ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'WidgetToolbarRepository' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// // TODO should not be needed
		// // Disables the default balloon toolbar for all widgets.
		// if ( editor.plugins.has( 'BalloonToolbar' ) ) {
		// 	const balloonToolbar: BalloonToolbar = editor.plugins.get( 'BalloonToolbar' );
		//
		// 	this.listenTo<BalloonToolbarShowEvent>( balloonToolbar, 'show', evt => {
		// 		if ( isWidgetSelected( editor.editing.view.document.selection ) ) {
		// 			evt.stop();
		// 		}
		// 	}, { priority: 'high' } );
		// }

		this._contextualToolbarRepository = this.editor.plugins.get( ContextualToolbarRepository );
	}

	/**
	 * Registers toolbar in the WidgetToolbarRepository. It renders it in the `ContextualBalloon` based on the value of the invoked
	 * `getRelatedElement` function. Toolbar items are gathered from `items` array.
	 * The balloon's CSS class is by default `ck-toolbar-container` and may be override with the `balloonClassName` option.
	 *
	 * Note: This method should be called in the {@link module:core/plugin~PluginInterface#afterInit `Plugin#afterInit()`}
	 * callback (or later) to make sure that the given toolbar items were already registered by other plugins.
	 *
	 * @param toolbarId An id for the toolbar. Used to
	 * @param options.ariaLabel Label used by assistive technologies to describe this toolbar element.
	 * @param options.items Array of toolbar items.
	 * @param options.getRelatedElement Callback which returns an element the toolbar should be attached to.
	 * @param options.balloonClassName CSS class for the widget balloon.
	 */
	public register(
		toolbarId: string,
		{
			ariaLabel,
			items,
			getRelatedElement,
			balloonClassName = 'ck-toolbar-container'
		}: {
			ariaLabel?: string;
			items: Array<ToolbarConfigItem>;
			getRelatedElement: ( selection: ViewDocumentSelection ) => ( ViewElement | null );
			balloonClassName?: string;
		}
	): void {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const t = editor.t;

		ariaLabel = ariaLabel || t( 'Widget toolbar' );

		this._contextualToolbarRepository.register( toolbarId, {
			ariaLabel,
			items,
			getRelatedTarget: selection => {
				const relatedElement = getRelatedElement( selection );

				return relatedElement && editingView.domConverter.mapViewToDom( relatedElement ) as RectSource | null;
			},
			balloonClassName
		} );
	}
}

function isWidgetSelected( selection: ViewDocumentSelection ) {
	const viewElement = selection.getSelectedElement();

	return !!( viewElement && isWidget( viewElement ) );
}
