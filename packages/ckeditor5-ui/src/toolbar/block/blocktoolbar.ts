/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/toolbar/block/blocktoolbar
 */

import {
	Plugin,
	type Editor
} from '@ckeditor/ckeditor5-core';

import {
	type EventInfo,
	getAncestors,
	global,
	Rect,
	ResizeObserver,
	toUnit,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import type { DocumentSelectionChangeRangeEvent } from '@ckeditor/ckeditor5-engine';

import BlockButtonView from './blockbuttonview.js';
import BalloonPanelView from '../../panel/balloon/balloonpanelview.js';
import ToolbarView, { NESTED_TOOLBAR_ICONS } from '../toolbarview.js';
import clickOutsideHandler from '../../bindings/clickoutsidehandler.js';
import normalizeToolbarConfig from '../normalizetoolbarconfig.js';

import type ButtonView from '../../button/buttonview.js';
import type { ButtonExecuteEvent } from '../../button/button.js';
import type { EditorUIReadyEvent, EditorUIUpdateEvent } from '../../editorui/editorui.js';

const toPx = /* #__PURE__ */ toUnit( 'px' );

/**
 * The block toolbar plugin.
 *
 * This plugin provides a button positioned next to the block of content where the selection is anchored.
 * Upon clicking the button, a dropdown providing access to editor features shows up, as configured in
 * {@link module:core/editor/editorconfig~EditorConfig#blockToolbar}.
 *
 * By default, the button is displayed next to all elements marked in {@link module:engine/model/schema~Schema}
 * as `$block` for which the toolbar provides at least one option.
 *
 * By default, the button is attached so its right boundary is touching the
 * {@link module:engine/view/editableelement~EditableElement}:
 *
 * ```
 *  __ |
 * |  ||  This is a block of content that the
 *  ¯¯ |  button is attached to. This is a
 *     |  block of content that the button is
 *     |  attached to.
 * ```
 *
 * The position of the button can be adjusted using the CSS `transform` property:
 *
 * ```css
 * .ck-block-toolbar-button {
 * 	transform: translateX( -10px );
 * }
 * ```
 *
 * ```
 *  __   |
 * |  |  |  This is a block of content that the
 *  ¯¯   |  button is attached to. This is a
 *       |  block of content that the button is
 *       |  attached to.
 * ```
 *
 * **Note**: If you plan to run the editor in a right–to–left (RTL) language, keep in mind the button
 * will be attached to the **right** boundary of the editable area. In that case, make sure the
 * CSS position adjustment works properly by adding the following styles:
 *
 * ```css
 * .ck[dir="rtl"] .ck-block-toolbar-button {
 * 	transform: translateX( 10px );
 * }
 * ```
 */
export default class BlockToolbar extends Plugin {
	/**
	 * The toolbar view.
	 */
	public readonly toolbarView: ToolbarView;

	/**
	 * The balloon panel view, containing the {@link #toolbarView}.
	 */
	public readonly panelView: BalloonPanelView;

	/**
	 * The button view that opens the {@link #toolbarView}.
	 */
	public readonly buttonView: BlockButtonView;

	/**
	 * An instance of the resize observer that allows to respond to changes in editable's geometry
	 * so the toolbar can stay within its boundaries (and group toolbar items that do not fit).
	 *
	 * **Note**: Used only when `shouldNotGroupWhenFull` was **not** set in the
	 * {@link module:core/editor/editorconfig~EditorConfig#blockToolbar configuration}.
	 */
	private _resizeObserver: ResizeObserver | null = null;

	/**
	 * A cached and normalized `config.blockToolbar` object.
	 */
	private _blockToolbarConfig: ReturnType<typeof normalizeToolbarConfig>;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BlockToolbar' as const;
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
	constructor( editor: Editor ) {
		super( editor );

		this._blockToolbarConfig = normalizeToolbarConfig( this.editor.config.get( 'blockToolbar' ) );
		this.toolbarView = this._createToolbarView();
		this.panelView = this._createPanelView();
		this.buttonView = this._createButtonView();

		// Close the #panelView upon clicking outside of the plugin UI.
		clickOutsideHandler( {
			emitter: this.panelView,
			contextElements: [ this.panelView.element!, this.buttonView.element! ],
			activator: () => this.panelView.isVisible,
			callback: () => this._hidePanel()
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		const editBlockText = t( 'Click to edit block' );
		const dragToMoveText = t( 'Drag to move' );
		const editBlockLabel = t( 'Edit block' );

		const isDragDropBlockToolbarPluginLoaded = editor.plugins.has( 'DragDropBlockToolbar' );
		const label = isDragDropBlockToolbarPluginLoaded ? `${ editBlockText }\n${ dragToMoveText }` : editBlockLabel;

		this.buttonView.label = label;

		if ( isDragDropBlockToolbarPluginLoaded ) {
			this.buttonView.element!.dataset.ckeTooltipClass = 'ck-tooltip_multi-line';
		}

		// Hides panel on a direct selection change.
		this.listenTo<DocumentSelectionChangeRangeEvent>( editor.model.document.selection, 'change:range', ( evt, data ) => {
			if ( data.directChange ) {
				this._hidePanel();
			}
		} );

		this.listenTo<EditorUIUpdateEvent>( editor.ui, 'update', () => this._updateButton() );
		// `low` priority is used because of https://github.com/ckeditor/ckeditor5-core/issues/133.
		this.listenTo<ObservableChangeEvent>( editor, 'change:isReadOnly', () => this._updateButton(), { priority: 'low' } );
		this.listenTo<ObservableChangeEvent>( editor.ui.focusTracker, 'change:isFocused', () => this._updateButton() );

		// Reposition button on resize.
		this.listenTo<ObservableChangeEvent<boolean>>( this.buttonView, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				// Keep correct position of button and panel on window#resize.
				this.buttonView.listenTo( window, 'resize', () => this._updateButton() );
			} else {
				// Stop repositioning button when is hidden.
				this.buttonView.stopListening( window, 'resize' );

				// Hide the panel when the button disappears.
				this._hidePanel();
			}
		} );

		// Reposition button on scroll.
		this._repositionButtonOnScroll();

		// Register the toolbar so it becomes available for Alt+F10 and Esc navigation.
		editor.ui.addToolbar( this.toolbarView, {
			beforeFocus: () => this._showPanel(),
			afterBlur: () => this._hidePanel()
		} );

		// Fills the toolbar with its items based on the configuration.
		// This needs to be done after all plugins are ready.
		editor.ui.once<EditorUIReadyEvent>( 'ready', () => {
			this.toolbarView.fillFromConfig( this._blockToolbarConfig, this.editor.ui.componentFactory );

			// Hide panel before executing each button in the panel.
			for ( const item of this.toolbarView.items ) {
				item.on<ButtonExecuteEvent>( 'execute', () => this._hidePanel( true ), { priority: 'high' } );
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
		this.panelView.destroy();
		this.buttonView.destroy();
		this.toolbarView.destroy();

		if ( this._resizeObserver ) {
			this._resizeObserver.destroy();
		}
	}

	/**
	 * Creates the {@link #toolbarView}.
	 */
	private _createToolbarView(): ToolbarView {
		const t = this.editor.locale.t;
		const shouldGroupWhenFull = !this._blockToolbarConfig.shouldNotGroupWhenFull;
		const toolbarView = new ToolbarView( this.editor.locale, {
			shouldGroupWhenFull,
			isFloating: true
		} );

		toolbarView.ariaLabel = t( 'Editor block content toolbar' );

		return toolbarView;
	}

	/**
	 * Creates the {@link #panelView}.
	 */
	private _createPanelView(): BalloonPanelView {
		const editor = this.editor;
		const panelView = new BalloonPanelView( editor.locale );

		panelView.content.add( this.toolbarView );
		panelView.class = 'ck-toolbar-container';
		editor.ui.view.body.add( panelView );

		// Close #panelView on `Esc` press.
		this.toolbarView.keystrokes.set( 'Esc', ( evt, cancel ) => {
			this._hidePanel( true );
			cancel();
		} );

		return panelView;
	}

	/**
	 * Creates the {@link #buttonView}.
	 */
	private _createButtonView(): BlockButtonView {
		const editor = this.editor;
		const t = editor.t;
		const buttonView = new BlockButtonView( editor.locale );
		const iconFromConfig = this._blockToolbarConfig.icon;

		const icon = NESTED_TOOLBAR_ICONS[ iconFromConfig! ] || iconFromConfig || NESTED_TOOLBAR_ICONS.dragIndicator;

		buttonView.set( {
			label: t( 'Edit block' ),
			icon,
			withText: false
		} );

		// Bind the panelView observable properties to the buttonView.
		buttonView.bind( 'isOn' ).to( this.panelView, 'isVisible' );
		buttonView.bind( 'tooltip' ).to( this.panelView, 'isVisible', isVisible => !isVisible );

		// Toggle the panelView upon buttonView#execute.
		this.listenTo<ButtonExecuteEvent>( buttonView, 'execute', () => {
			if ( !this.panelView.isVisible ) {
				this._showPanel();
			} else {
				this._hidePanel( true );
			}
		} );

		// Hide the panelView when the buttonView is disabled. `isEnabled` flag might be changed when
		// user scrolls the viewport and the button is no longer visible. In such case, the panel should be hidden
		// otherwise it will be displayed in the wrong place.
		this.listenTo<ObservableChangeEvent<boolean>>( buttonView, 'change:isEnabled', ( evt, name, isEnabled ) => {
			if ( !isEnabled && this.panelView.isVisible ) {
				this._hidePanel( false );
			}
		} );

		editor.ui.view.body.add( buttonView );

		return buttonView;
	}

	/**
	 * Shows or hides the button.
	 * When all the conditions for displaying the button are matched, it shows the button. Hides otherwise.
	 */
	private _updateButton() {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;

		// Hides the button when the editor is not focused.
		if ( !editor.ui.focusTracker.isFocused ) {
			this._hideButton();

			return;
		}

		// Hides the button when the selection is in non-editable place.
		if ( !editor.model.canEditAt( editor.model.document.selection ) ) {
			this._hideButton();

			return;
		}

		// Get the first selected block, button will be attached to this element.
		const modelTarget = Array.from( model.document.selection.getSelectedBlocks() )[ 0 ];

		// Hides the button when there is no enabled item in toolbar for the current block element.
		if ( !modelTarget || Array.from( this.toolbarView.items ).every( ( item: any ) => !item.isEnabled ) ) {
			this._hideButton();

			return;
		}

		// Get DOM target element.
		const domTarget = view.domConverter.mapViewToDom( editor.editing.mapper.toViewElement( modelTarget )! );

		// Show block button.
		this.buttonView.isVisible = true;

		// Make sure that the block toolbar panel is resized properly.
		this._setupToolbarResize();

		// Attach block button to target DOM element.
		this._attachButtonToElement( domTarget as any );

		// When panel is opened then refresh it position to be properly aligned with block button.
		if ( this.panelView.isVisible ) {
			this._showPanel();
		}
	}

	/**
	 * Hides the button.
	 */
	private _hideButton() {
		this.buttonView.isVisible = false;
	}

	/**
	 * Shows the {@link #toolbarView} attached to the {@link #buttonView}.
	 * If the toolbar is already visible, then it simply repositions it.
	 */
	private _showPanel() {
		// Usually, the only way to show the toolbar is by pressing the block button. It makes it impossible for
		// the toolbar to show up when the button is invisible (feature does not make sense for the selection then).
		// The toolbar navigation using Alt+F10 does not access the button but shows the panel directly using this method.
		// So we need to check whether this is possible first.
		if ( !this.buttonView.isVisible ) {
			return;
		}

		const wasVisible = this.panelView.isVisible;

		// So here's the thing: If there was no initial panelView#show() or these two were in different order, the toolbar
		// positioning will break in RTL editors. Weird, right? What you show know is that the toolbar
		// grouping works thanks to:
		//
		// * the ResizeObserver, which kicks in as soon as the toolbar shows up in DOM (becomes visible again).
		// * the observable ToolbarView#maxWidth, which triggers re-grouping when changed.
		//
		// Here are the possible scenarios:
		//
		// 1. (WRONG ❌) If the #maxWidth is set when the toolbar is invisible, it won't affect item grouping (no DOMRects, no grouping).
		//    Then, when panelView.pin() is called, the position of the toolbar will be calculated for the old
		//    items grouping state, and when finally ResizeObserver kicks in (hey, the toolbar is visible now, right?)
		//    it will group/ungroup some items and the length of the toolbar will change. But since in RTL the toolbar
		//    is attached on the right side and the positioning uses CSS "left", it will result in the toolbar shifting
		//    to the left and being displayed in the wrong place.
		// 2. (WRONG ❌) If the panelView.pin() is called first and #maxWidth set next, then basically the story repeats. The balloon
		//    calculates the position for the old toolbar grouping state, then the toolbar re-groups items and because
		//    it is positioned using CSS "left" it will move.
		// 3. (RIGHT ✅) We show the panel first (the toolbar does re-grouping but it does not matter), then the #maxWidth
		//    is set allowing the toolbar to re-group again and finally panelView.pin() does the positioning when the
		//    items grouping state is stable and final.
		//
		// https://github.com/ckeditor/ckeditor5/issues/6449, https://github.com/ckeditor/ckeditor5/issues/6575
		this.panelView.show();

		const editableElement = this._getSelectedEditableElement();

		this.toolbarView.maxWidth = this._getToolbarMaxWidth( editableElement );

		this.panelView.pin( {
			target: this.buttonView.element!,
			limiter: editableElement
		} );

		if ( !wasVisible ) {
			( this.toolbarView.items.get( 0 ) as any ).focus();
		}
	}

	/**
	 * Returns currently selected editable, based on the model selection.
	 */
	private _getSelectedEditableElement(): HTMLElement {
		const selectedModelRootName = this.editor.model.document.selection.getFirstRange()!.root.rootName!;

		return this.editor.ui.getEditableElement( selectedModelRootName )!;
	}

	/**
	 * Hides the {@link #toolbarView}.
	 *
	 * @param focusEditable When `true`, the editable will be focused after hiding the panel.
	 */
	private _hidePanel( focusEditable?: boolean ) {
		this.panelView.isVisible = false;

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Repositions the button on scroll.
	 */
	private _repositionButtonOnScroll() {
		const { buttonView } = this;

		let pendingAnimationFrame = false;

		// Reposition the button on scroll, but do it only once per animation frame to avoid performance issues.
		const repositionOnScroll = ( evt: EventInfo, domEvt: Event ) => {
			if ( pendingAnimationFrame ) {
				return;
			}

			// It makes no sense to reposition the button when the user scrolls the dropdown or any other
			// nested scrollable element. The button should be repositioned only when the user scrolls the
			// editable or any other scrollable parent of the editable. Leaving it as it is buggy on Chrome
			// where scrolling nested scrollables is not properly handled.
			// See more: https://github.com/ckeditor/ckeditor5/issues/17067
			const editableElement = this._getSelectedEditableElement();

			if (
				domEvt.target !== global.document &&
				!getAncestors( editableElement ).includes( domEvt.target as HTMLElement )
			) {
				return;
			}

			pendingAnimationFrame = true;
			global.window.requestAnimationFrame( () => {
				this._updateButton();
				pendingAnimationFrame = false;
			} );
		};

		// Watch scroll event only when the button is visible, it prevents attaching the scroll event listener
		// to the document when the button is not visible.
		buttonView.on<ObservableChangeEvent<boolean>>( 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				buttonView.listenTo( global.document, 'scroll', repositionOnScroll, {
					useCapture: true,
					usePassive: true
				} );
			} else {
				buttonView.stopListening( global.document, 'scroll', repositionOnScroll );
			}
		} );
	}

	/**
	 * Attaches the {@link #buttonView} to the target block of content.
	 *
	 * @param targetElement Target element.
	 */
	private _attachButtonToElement( targetElement: HTMLElement ) {
		const buttonElement = this.buttonView.element!;
		const editableElement = this._getSelectedEditableElement();

		const contentStyles = window.getComputedStyle( targetElement );

		const editableRect = new Rect( editableElement );
		const contentPaddingTop = parseInt( contentStyles.paddingTop, 10 );
		// When line height is not an integer then treat it as "normal".
		// MDN says that 'normal' == ~1.2 on desktop browsers.
		const contentLineHeight = parseInt( contentStyles.lineHeight, 10 ) || parseInt( contentStyles.fontSize, 10 ) * 1.2;

		const buttonRect = new Rect( buttonElement );
		const contentRect = new Rect( targetElement );

		let positionLeft;

		if ( this.editor.locale.uiLanguageDirection === 'ltr' ) {
			positionLeft = editableRect.left - buttonRect.width;
		} else {
			positionLeft = editableRect.right;
		}

		const positionTop = contentRect.top + contentPaddingTop + ( contentLineHeight - buttonRect.height ) / 2;

		buttonRect.moveTo( positionLeft, positionTop );

		const absoluteButtonRect = buttonRect.toAbsoluteRect();

		this.buttonView.top = absoluteButtonRect.top;
		this.buttonView.left = absoluteButtonRect.left;

		this._clipButtonToViewport( this.buttonView, editableElement );
	}

	/**
	 * Clips the button element to the viewport of the editable element.
	 *
	 * 	* If the button overflows the editable viewport, it is clipped to make it look like it's cut off by the editable scrollable region.
	 * 	* If the button is fully hidden by the top of the editable, it is not clickable but still visible in the DOM.
	 *
	 * @param buttonView The button view to clip.
	 * @param editableElement The editable element whose viewport is used for clipping.
	 */
	private _clipButtonToViewport(
		buttonView: ButtonView,
		editableElement: HTMLElement
	) {
		const absoluteButtonRect = new Rect( buttonView.element! );
		const scrollViewportRect = new Rect( editableElement ).getVisible();

		// Sets polygon clip path for the button element, if there is no argument provided, the clip path is removed.
		const setButtonClipping = ( ...paths: Array<string> ) => {
			buttonView.element!.style.clipPath = paths.length ? `polygon(${ paths.join( ',' ) })` : '';
		};

		// Hide the button if it's fully hidden by the top of the editable.
		// Note that the button is still visible in the DOM, but it's not clickable. It's because we don't
		// want to hide the button completely, as there are plenty of `isVisible` watchers which toggles
		// the button scroll listeners.
		const markAsHidden = ( isHidden: boolean ) => {
			buttonView.isEnabled = !isHidden;
			buttonView.element!.style.pointerEvents = isHidden ? 'none' : '';
		};

		if ( scrollViewportRect && scrollViewportRect.bottom < absoluteButtonRect.bottom ) {
			// Calculate the delta between the button bottom and the editable bottom, and clip the button
			// to make it look like it's cut off by the editable scrollable region.
			const delta = Math.min(
				absoluteButtonRect.height,
				absoluteButtonRect.bottom - scrollViewportRect.bottom
			);

			markAsHidden( delta >= absoluteButtonRect.height );
			setButtonClipping(
				'0 0',
				'100% 0',
				`100% calc(100% - ${ toPx( delta ) })`,
				`0 calc(100% - ${ toPx( delta ) }`
			);
		} else if ( scrollViewportRect && scrollViewportRect.top > absoluteButtonRect.top ) {
			// Calculate the delta between the button top and the editable top, and clip the button
			// to make it look like it's cut off by the editable scrollable region.
			const delta = Math.min(
				absoluteButtonRect.height,
				scrollViewportRect.top - absoluteButtonRect.top
			);

			markAsHidden( delta >= absoluteButtonRect.height );
			setButtonClipping(
				`0 ${ toPx( delta ) }`,
				`100% ${ toPx( delta ) }`,
				'100% 100%',
				'0 100%'
			);
		} else {
			// Reset the clip path if button is fully visible.
			markAsHidden( false );
			setButtonClipping();
		}
	}

	/**
	 * Creates a resize observer that observes selected editable and resizes the toolbar panel accordingly.
	 */
	private _setupToolbarResize() {
		const editableElement = this._getSelectedEditableElement();

		// Do this only if the automatic grouping is turned on.
		if ( !this._blockToolbarConfig.shouldNotGroupWhenFull ) {
			// If resize observer is attached to a different editable than currently selected editable, re-attach it.
			if ( this._resizeObserver && this._resizeObserver.element !== editableElement ) {
				this._resizeObserver.destroy();
				this._resizeObserver = null;
			}

			if ( !this._resizeObserver ) {
				this._resizeObserver = new ResizeObserver( editableElement, () => {
					this.toolbarView.maxWidth = this._getToolbarMaxWidth( editableElement );
				} );
			}
		}
	}

	/**
	 * Gets the {@link #toolbarView} max-width, based on given `editableElement` width plus the distance between the farthest
	 * edge of the {@link #buttonView} and the editable.
	 *
	 * @returns A maximum width that toolbar can have, in pixels.
	 */
	private _getToolbarMaxWidth( editableElement: HTMLElement ) {
		const editableRect = new Rect( editableElement );
		const buttonRect = new Rect( this.buttonView.element! );
		const isRTL = this.editor.locale.uiLanguageDirection === 'rtl';
		const offset = isRTL ? ( buttonRect.left - editableRect.right ) + buttonRect.width : editableRect.left - buttonRect.left;

		return toPx( editableRect.width + offset );
	}
}
