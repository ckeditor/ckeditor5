/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ToolbarView from '../toolbarview.js';
import BalloonPanelView from '../../panel/balloon/balloonpanelview.js';
import type { EditorUIUpdateEvent } from '../../editorui/editorui.js';
import normalizeToolbarConfig from '../normalizetoolbarconfig.js';

import { type Editor, Plugin } from '@ckeditor/ckeditor5-core';
import { type PositioningFunction, Rect, ResizeObserver, toUnit } from '@ckeditor/ckeditor5-utils';

const toPx = toUnit( 'px' );

/**
 * TODO
 */
export default class InlineToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'InlineToolbar' as const;
	}

	/**
	 * A toolbar view instance.
	 */
	public readonly toolbarView: ToolbarView;

	/**
	 * A balloon panel view instance.
	 */
	public readonly panelView: BalloonPanelView;

	/**
	 * A set of positioning functions used by the {@link #panelView} to float around the editable elements.
	 *
	 * The positioning functions are as follows:
	 *
	 * * West:
	 *
	 * ```
	 * [ Panel ]
	 * +------------------+
	 * | #editableElement |
	 * +------------------+
	 *
	 * +------------------+
	 * | #editableElement |
	 * |[ Panel ]         |
	 * |                  |
	 * +------------------+
	 *
	 * +------------------+
	 * | #editableElement |
	 * +------------------+
	 * [ Panel ]
	 * ```
	 *
	 * * East:
	 *
	 * ```
	 *            [ Panel ]
	 * +------------------+
	 * | #editableElement |
	 * +------------------+
	 *
	 * +------------------+
	 * | #editableElement |
	 * |         [ Panel ]|
	 * |                  |
	 * +------------------+
	 *
	 * +------------------+
	 * | #editableElement |
	 * +------------------+
	 *            [ Panel ]
	 * ```
	 *
	 * See: {@link module:utils/dom/position~Options#positions}.
	 */
	public readonly panelPositions: Array<PositioningFunction>;

	/**
	 * An instance of the resize observer that helps dynamically determine the geometry of the toolbar
	 * and manage items that do not fit into a single row.
	 *
	 * **Note:** Created on demand in {@link #init}.
	 */
	private _resizeObserver: ResizeObserver | null;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		const locale = editor.locale;
		const shouldGroupWhenFull = !editor.config.get( 'toolbar.shouldNotGroupWhenFull' );

		this.toolbarView = new ToolbarView( locale, {
			shouldGroupWhenFull,
			isFloating: true
		} );

		this.panelView = new BalloonPanelView( locale );
		this.panelPositions = this._getPanelPositions();
		this.panelView.extendTemplate( {
			attributes: {
				class: 'ck-toolbar-container'
			}
		} );

		this._resizeObserver = null;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.ui.view.body.add( this.panelView );

		this.panelView.content.add( this.toolbarView );
		this.panelView.bind( 'isVisible' ).to( editor.ui.focusTracker, 'isFocused' );

		this.editor.ui.focusTracker.on( 'change:focusedElement', () => {
			// Set toolbar's max-width on the initialization and update it on the editable resize,
			// if 'shouldToolbarGroupWhenFull' in config is set to 'true'.
		} );

		// https://github.com/ckeditor/ckeditor5-editor-inline/issues/4
		this.listenTo<EditorUIUpdateEvent>( editor.ui, 'update', () => {
			const focusedEditableElement = this._getFocusedEditableElement();

			if ( this.toolbarView.options.shouldGroupWhenFull ) {
				this._attachToolbarMaxWidthUpdater( focusedEditableElement );
			}

			// Don't pin if the panel is not already visible. It prevents the panel
			// showing up when there's no focus in the UI.
			if ( this.panelView.isVisible && focusedEditableElement ) {
				this.panelView.pin( {
					target: this._getFocusedEditableElement()!,
					positions: this.panelPositions
				} );
			}
		} );

		// Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
		editor.ui.addToolbar( this.toolbarView );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		this.toolbarView.fillFromConfig(
			normalizeToolbarConfig( editor.config.get( 'inlineToolbar' ) ),
			editor.ui.componentFactory
		);
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		if ( this._resizeObserver ) {
			this._resizeObserver.destroy();
		}
	}

	/**
	 * TODO
	 */
	private _getFocusedEditableElement(): HTMLElement | null {
		const editor = this.editor;
		const editableNames = editor.ui.getEditableElementsNames();

		for ( const name of editableNames ) {
			const editableElement = editor.ui.getEditableElement( name )!;

			if ( editor.ui.focusTracker.focusedElement === editableElement ) {
				return editableElement;
			}
		}

		return null;
	}

	/**
	 * Determines the panel top position of the {@link #panel} in {@link #panelPositions}.
	 *
	 * @param editableRect Rect of the {@link #element}.
	 * @param panelRect Rect of the {@link #panel}.
	 */
	private _getPanelPositionTop( editableRect: Rect, panelRect: Rect ): number {
		const viewportTopOffset = this.editor.ui.viewportOffset.top || 0;
		let top;

		if ( editableRect.top > panelRect.height + viewportTopOffset ) {
			top = editableRect.top - panelRect.height;
		} else if ( editableRect.bottom > panelRect.height + viewportTopOffset + 50 ) {
			top = viewportTopOffset;
		} else {
			top = editableRect.bottom;
		}

		return top;
	}

	/**
	 * Returns the positions for {@link #panelPositions}.
	 *
	 * See: {@link module:utils/dom/position~Options#positions}.
	 */
	private _getPanelPositions(): Array<PositioningFunction> {
		const positions: Array<PositioningFunction> = [
			( editableRect, panelRect ) => {
				return {
					top: this._getPanelPositionTop( editableRect, panelRect ),
					left: editableRect.left,
					name: 'toolbar_west',
					config: {
						withArrow: false
					}
				};
			},
			( editableRect, panelRect ) => {
				return {
					top: this._getPanelPositionTop( editableRect, panelRect ),
					left: editableRect.left + editableRect.width - panelRect.width,
					name: 'toolbar_east',
					config: {
						withArrow: false
					}
				};
			}
		];

		if ( this.editor.locale.uiLanguageDirection === 'ltr' ) {
			return positions;
		} else {
			return positions.reverse();
		}
	}

	/**
	 * TODO
	 */
	private _attachToolbarMaxWidthUpdater( focusedEditableElement: HTMLElement | null ): void {
		if ( this._resizeObserver ) {
			this._resizeObserver.destroy();
		}

		if ( focusedEditableElement ) {
			const setMaxWidth = () => {
				this.toolbarView.maxWidth = toPx( new Rect( focusedEditableElement ).width );
			};

			setMaxWidth();

			this._resizeObserver = new ResizeObserver( focusedEditableElement, setMaxWidth );
		}
	}
}
