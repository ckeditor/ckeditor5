/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module editor-classic/classiceditorui
 */

import type { Editor, ElementApi } from 'ckeditor5/src/core.js';
import {
	EditorUI,
	DialogView,
	normalizeToolbarConfig,
	type DialogViewMoveToEvent,
	type Dialog,
	type EditorUIReadyEvent,
	type ContextualBalloonGetPositionOptionsEvent
} from 'ckeditor5/src/ui.js';
import {
	enablePlaceholder,
	type ViewScrollToTheSelectionEvent
} from 'ckeditor5/src/engine.js';
import { ElementReplacer, Rect, type EventInfo } from 'ckeditor5/src/utils.js';
import type ClassicEditorUIView from './classiceditoruiview.js';

/**
 * The classic editor UI class.
 */
export default class ClassicEditorUI extends EditorUI {
	/**
	 * The main (top–most) view of the editor UI.
	 */
	public readonly view: ClassicEditorUIView;

	/**
	 * A normalized `config.toolbar` object.
	 */
	private readonly _toolbarConfig: ReturnType<typeof normalizeToolbarConfig>;

	/**
	 * The element replacer instance used to hide the editor's source element.
	 */
	private readonly _elementReplacer: ElementReplacer;

	/**
	 * Creates an instance of the classic editor UI class.
	 *
	 * @param editor The editor instance.
	 * @param view The view of the UI.
	 */
	constructor( editor: Editor, view: ClassicEditorUIView ) {
		super( editor );

		this.view = view;
		this._toolbarConfig = normalizeToolbarConfig( editor.config.get( 'toolbar' ) );

		this._elementReplacer = new ElementReplacer();

		this.listenTo<ViewScrollToTheSelectionEvent>(
			editor.editing.view, 'scrollToTheSelection', this._handleScrollToTheSelectionWithStickyPanel.bind( this ) );
	}

	/**
	 * @inheritDoc
	 */
	public override get element(): HTMLElement | null {
		return this.view.element;
	}

	/**
	 * Initializes the UI.
	 *
	 * @param replacementElement The DOM element that will be the source for the created editor.
	 */
	public init( replacementElement: HTMLElement | null ): void {
		const editor = this.editor;
		const view = this.view;
		const editingView = editor.editing.view;
		const editable = view.editable;
		const editingRoot = editingView.document.getRoot()!;

		// The editable UI and editing root should share the same name. Then name is used
		// to recognize the particular editable, for instance in ARIA attributes.
		editable.name = editingRoot.rootName;

		view.render();

		// The editable UI element in DOM is available for sure only after the editor UI view has been rendered.
		// But it can be available earlier if a DOM element has been passed to BalloonEditor.create().
		const editableElement = editable.element!;

		// Register the editable UI view in the editor. A single editor instance can aggregate multiple
		// editable areas (roots) but the classic editor has only one.
		this.setEditableElement( editable.name, editableElement );

		// Let the editable UI element respond to the changes in the global editor focus
		// tracker. It has been added to the same tracker a few lines above but, in reality, there are
		// many focusable areas in the editor, like balloons, toolbars or dropdowns and as long
		// as they have focus, the editable should act like it is focused too (although technically
		// it isn't), e.g. by setting the proper CSS class, visually announcing focus to the user.
		// Doing otherwise will result in editable focus styles disappearing, once e.g. the
		// toolbar gets focused.
		view.editable.bind( 'isFocused' ).to( this.focusTracker );

		// Bind the editable UI element to the editing view, making it an end– and entry–point
		// of the editor's engine. This is where the engine meets the UI.
		editingView.attachDomRoot( editableElement );

		// If an element containing the initial data of the editor was provided, replace it with
		// an editor instance's UI in DOM until the editor is destroyed. For instance, a <textarea>
		// can be such element.
		if ( replacementElement ) {
			this._elementReplacer.replace( replacementElement, this.element as HTMLElement | undefined );
		}

		this._initPlaceholder();
		this._initToolbar();

		if ( view.menuBarView ) {
			this.initMenuBar( view.menuBarView );
		}

		this._initDialogPluginIntegration();
		this._initContextualBalloonIntegration();

		this.fire<EditorUIReadyEvent>( 'ready' );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		const view = this.view;
		const editingView = this.editor.editing.view;

		this._elementReplacer.restore();

		if ( editingView.getDomRoot( view.editable.name! ) ) {
			editingView.detachDomRoot( view.editable.name! );
		}

		view.destroy();
	}

	/**
	 * Initializes the editor toolbar.
	 */
	private _initToolbar(): void {
		const view = this.view;

		// Set–up the sticky panel with toolbar.
		view.stickyPanel.bind( 'isActive' ).to( this.focusTracker, 'isFocused' );
		view.stickyPanel.limiterElement = view.element;
		view.stickyPanel.bind( 'viewportTopOffset' ).to( this, 'viewportOffset', ( { visualTop } ) => visualTop || 0 );

		view.toolbar.fillFromConfig( this._toolbarConfig, this.componentFactory );

		// Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
		this.addToolbar( view.toolbar );
	}

	/**
	 * Enable the placeholder text on the editing root.
	 */
	private _initPlaceholder(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const editingRoot = editingView.document.getRoot()!;
		const sourceElement = ( editor as Editor & ElementApi ).sourceElement;

		let placeholderText;
		const placeholder = editor.config.get( 'placeholder' );

		if ( placeholder ) {
			placeholderText = typeof placeholder === 'string' ? placeholder : placeholder[ this.view.editable.name! ];
		}

		if ( !placeholderText && sourceElement && sourceElement.tagName.toLowerCase() === 'textarea' ) {
			placeholderText = sourceElement.getAttribute( 'placeholder' );
		}

		if ( placeholderText ) {
			editingRoot.placeholder = placeholderText;
		}

		enablePlaceholder( {
			view: editingView,
			element: editingRoot,
			isDirectHost: false,
			keepOnFocus: true
		} );
	}

	/**
	 * Provides an integration between the sticky toolbar and {@link module:ui/panel/balloon/contextualballoon contextual balloon plugin}.
	 * It allows the contextual balloon to consider the height of the
	 * {@link module:editor-classic/classiceditoruiview~ClassicEditorUIView#stickyPanel}. It prevents the balloon from overlapping
	 * the sticky toolbar by adjusting the balloon's position using viewport offset configuration.
	 */
	private _initContextualBalloonIntegration(): void {
		if ( !this.editor.plugins.has( 'ContextualBalloon' ) ) {
			return;
		}

		const { stickyPanel } = this.view;
		const contextualBalloon = this.editor.plugins.get( 'ContextualBalloon' );

		contextualBalloon.on<ContextualBalloonGetPositionOptionsEvent>( 'getPositionOptions', evt => {
			const position = evt.return;

			if ( !position || !stickyPanel.isSticky || !stickyPanel.element ) {
				return;
			}

			// Measure toolbar (and menu bar) height.
			const stickyPanelHeight = new Rect( stickyPanel.element ).height;

			// Handle edge case when the target element is larger than the limiter.
			// It's an issue because the contextual balloon can overlap top table cells when the table is larger than the viewport
			// and it's placed at the top of the editor. It's better to overlap toolbar in that situation.
			// Check this issue: https://github.com/ckeditor/ckeditor5/issues/15744
			const target = typeof position.target === 'function' ? position.target() : position.target;
			const limiter = typeof position.limiter === 'function' ? position.limiter() : position.limiter;

			if ( target && limiter && new Rect( target ).height >= new Rect( limiter ).height - stickyPanelHeight ) {
				return;
			}

			// Ensure that viewport offset is present, it can be undefined according to the typing.
			const viewportOffsetConfig = { ...position.viewportOffsetConfig };
			const newTopViewportOffset = ( viewportOffsetConfig.top || 0 ) + stickyPanelHeight;

			evt.return = {
				...position,
				viewportOffsetConfig: {
					...viewportOffsetConfig,
					top: newTopViewportOffset
				}
			};
		}, { priority: 'low' } );

		// Update balloon position when the toolbar becomes sticky or when ui viewportOffset changes.
		const updateBalloonPosition = () => {
			if ( contextualBalloon.visibleView ) {
				contextualBalloon.updatePosition();
			}
		};

		this.listenTo( stickyPanel, 'change:isSticky', updateBalloonPosition );
		this.listenTo( this.editor.ui, 'change:viewportOffset', updateBalloonPosition );
	}

	/**
	 * Provides an integration between the sticky toolbar and {@link module:utils/dom/scroll~scrollViewportToShowTarget}.
	 * It allows the UI-agnostic engine method to consider the geometry of the
	 * {@link module:editor-classic/classiceditoruiview~ClassicEditorUIView#stickyPanel} that pins to the
	 * edge of the viewport and can obscure the user caret after scrolling the window.
	 *
	 * @param evt The `scrollToTheSelection` event info.
	 * @param data The payload carried by the `scrollToTheSelection` event.
	 * @param originalArgs The original arguments passed to `scrollViewportToShowTarget()` method (see implementation to learn more).
	 */
	private _handleScrollToTheSelectionWithStickyPanel(
		evt: EventInfo<'scrollToTheSelection'>,
		data: ViewScrollToTheSelectionEvent[ 'args' ][ 0 ],
		originalArgs: ViewScrollToTheSelectionEvent[ 'args' ][ 1 ]
	): void {
		const stickyPanel = this.view.stickyPanel;

		if ( stickyPanel.isSticky ) {
			const stickyPanelHeight = new Rect( stickyPanel.element! ).height;

			data.viewportOffset.top += stickyPanelHeight;
		} else {
			const scrollViewportOnPanelGettingSticky = () => {
				this.editor.editing.view.scrollToTheSelection( originalArgs );
			};

			this.listenTo( stickyPanel, 'change:isSticky', scrollViewportOnPanelGettingSticky );

			// This works as a post-scroll-fixer because it's impossible predict whether the panel will be sticky after scrolling or not.
			// Listen for a short period of time only and if the toolbar does not become sticky very soon, cancel the listener.
			setTimeout( () => {
				this.stopListening( stickyPanel, 'change:isSticky', scrollViewportOnPanelGettingSticky );
			}, 20 );
		}
	}

	/**
	 * Provides an integration between the sticky toolbar and {@link module:ui/dialog/dialog the Dialog plugin}.
	 *
	 * It moves the dialog down to ensure that the
	 * {@link module:editor-classic/classiceditoruiview~ClassicEditorUIView#stickyPanel sticky panel}
	 * used by the editor UI will not get obscured by the dialog when the dialog uses one of its automatic positions.
	 */
	private _initDialogPluginIntegration(): void {
		if ( !this.editor.plugins.has( 'Dialog' ) ) {
			return;
		}

		const stickyPanel = this.view.stickyPanel;
		const dialogPlugin: Dialog = this.editor.plugins.get( 'Dialog' );

		dialogPlugin.on( 'show', () => {
			const dialogView = dialogPlugin.view!;

			dialogView.on<DialogViewMoveToEvent>( 'moveTo', ( evt, data ) => {
				// Engage only when the panel is sticky, and the dialog is using one of default positions.
				// Ignore modals because they are displayed on top of the page (and overlay) and they do not collide with anything
				// See (https://github.com/ckeditor/ckeditor5/issues/17339).
				if ( !stickyPanel.isSticky || dialogView.wasMoved || dialogView.isModal ) {
					return;
				}

				const stickyPanelContentRect = new Rect( stickyPanel.contentPanelElement );

				if ( data[ 1 ] < stickyPanelContentRect.bottom + DialogView.defaultOffset ) {
					data[ 1 ] = stickyPanelContentRect.bottom + DialogView.defaultOffset;
				}
			}, { priority: 'high' } );
		}, { priority: 'low' } );
	}
}
