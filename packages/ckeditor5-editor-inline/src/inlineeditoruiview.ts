/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module editor-inline/inlineeditoruiview
 */

import {
	BalloonPanelView,
	EditorUIView,
	InlineEditableUIView,
	MenuBarView,
	ToolbarView
} from 'ckeditor5/src/ui.js';
import {
	Rect,
	ResizeObserver,
	toUnit,
	type PositioningFunction,
	type Locale
} from 'ckeditor5/src/utils.js';
import type { EditingView } from 'ckeditor5/src/engine.js';

import '../theme/inlineeditor.css';

const toPx = /* #__PURE__ */ toUnit( 'px' );

/**
 * Inline editor UI view. Uses an nline editable and a floating toolbar.
 */
export default class InlineEditorUIView extends EditorUIView {
	/**
	 * A floating toolbar view instance.
	 */
	public override readonly toolbar: ToolbarView;

	/**
	 * The offset from the top edge of the web browser's viewport which makes the
	 * UI become sticky. The default value is `0`, which means that the UI becomes
	 * sticky when its upper edge touches the top of the page viewport.
	 *
	 * This attribute is useful when the web page has UI elements positioned to the top
	 * either using `position: fixed` or `position: sticky`, which would cover the
	 * UI or vice–versa (depending on the `z-index` hierarchy).
	 *
	 * Bound to {@link module:ui/editorui/editorui~EditorUI#viewportOffset `EditorUI#viewportOffset`}.
	 *
	 * If {@link module:core/editor/editorconfig~EditorConfig#ui `EditorConfig#ui.viewportOffset.top`} is defined, then
	 * it will override the default value.
	 *
	 * @observable
	 * @default 0
	 */
	declare public viewportTopOffset: number;

	/**
	 * A balloon panel view instance.
	 */
	public readonly panel: BalloonPanelView;

	/**
	 * A set of positioning functions used by the {@link #panel} to float around
	 * {@link #element editableElement}.
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
	 * Editable UI view.
	 */
	public readonly editable: InlineEditableUIView;

	/**
	 * An instance of the resize observer that helps dynamically determine the geometry of the toolbar
	 * and manage items that do not fit into a single row.
	 *
	 * **Note:** Created in {@link #render}.
	 */
	private _resizeObserver: ResizeObserver | null;

	/**
	 * Creates an instance of the inline editor UI view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param editingView The editing view instance this view is related to.
	 * @param editableElement The editable element. If not specified, it will be automatically created by
	 * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
	 * @param options Configuration options for the view instance.
	 * @param options.shouldToolbarGroupWhenFull When set `true` enables automatic items grouping
	 * in the main {@link module:editor-inline/inlineeditoruiview~InlineEditorUIView#toolbar toolbar}.
	 * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
	 * @param options.label When set, this value will be used as an accessible `aria-label` of the
	 * {@link module:ui/editableui/editableuiview~EditableUIView editable view}.
	 */
	constructor(
		locale: Locale,
		editingView: EditingView,
		editableElement?: HTMLElement,
		options: {
			shouldToolbarGroupWhenFull?: boolean;
			useMenuBar?: boolean;
			label?: string | Record<string, string>;
		} = {}
	) {
		super( locale );

		this.toolbar = new ToolbarView( locale, {
			shouldGroupWhenFull: options.shouldToolbarGroupWhenFull,
			isFloating: true
		} );

		if ( options.useMenuBar ) {
			this.menuBarView = new MenuBarView( locale );
		}

		this.set( 'viewportTopOffset', 0 );

		this.panel = new BalloonPanelView( locale );
		this.panelPositions = this._getPanelPositions();

		this.panel.extendTemplate( {
			attributes: {
				class: 'ck-toolbar-container'
			}
		} );

		this.editable = new InlineEditableUIView( locale, editingView, editableElement, {
			label: options.label
		} );

		this._resizeObserver = null;
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.body.add( this.panel );
		this.registerChild( this.editable );

		if ( this.menuBarView ) {
			// Set toolbar as a child of a stickyPanel and makes toolbar sticky.
			this.panel.content.addMany( [ this.menuBarView, this.toolbar ] );
		} else {
			this.panel.content.add( this.toolbar );
		}

		const options = this.toolbar.options;

		// Set toolbar's max-width on the initialization and update it on the editable resize,
		// if 'shouldToolbarGroupWhenFull' in config is set to 'true'.
		if ( options.shouldGroupWhenFull ) {
			const editableElement = this.editable.element!;

			this._resizeObserver = new ResizeObserver( editableElement, () => {
				this.toolbar.maxWidth = toPx( new Rect( editableElement ).width );
			} );
		}
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
	 * Determines the panel top position of the {@link #panel} in {@link #panelPositions}.
	 *
	 * @param editableRect Rect of the {@link #element}.
	 * @param panelRect Rect of the {@link #panel}.
	 */
	private _getPanelPositionTop( editableRect: Rect, panelRect: Rect ): number {
		let top;

		if ( editableRect.top > panelRect.height + this.viewportTopOffset ) {
			top = editableRect.top - panelRect.height;
		} else if ( editableRect.bottom > panelRect.height + this.viewportTopOffset + 50 ) {
			top = this.viewportTopOffset;
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

		if ( this.locale.uiLanguageDirection === 'ltr' ) {
			return positions;
		} else {
			return positions.reverse();
		}
	}
}
