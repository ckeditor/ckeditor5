/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui
 */

// This import must be at the top to ensure that `globals.css` is imported first
export { default as View, type UIViewRenderEvent } from './view.js';

export { default as clickOutsideHandler } from './bindings/clickoutsidehandler.js';
export { default as injectCssTransitionDisabler } from './bindings/injectcsstransitiondisabler.js';
export { default as CssTransitionDisablerMixin, type ViewWithCssTransitionDisabler } from './bindings/csstransitiondisablermixin.js';
export { default as submitHandler } from './bindings/submithandler.js';
export { default as addKeyboardHandlingForGrid } from './bindings/addkeyboardhandlingforgrid.js';

export { default as AccessibilityHelp } from './editorui/accessibilityhelp/accessibilityhelp.js';

export { default as BodyCollection } from './editorui/bodycollection.js';

export type { default as Button, ButtonExecuteEvent } from './button/button.js';
export type { default as ButtonLabel } from './button/buttonlabel.js';
export { default as ButtonView } from './button/buttonview.js';
export { default as ButtonLabelView } from './button/buttonlabelview.js';
export { default as SwitchButtonView } from './button/switchbuttonview.js';
export { default as ListItemButtonView } from './button/listitembuttonview.js';
export { default as FileDialogButtonView, FileDialogListItemButtonView } from './button/filedialogbuttonview.js';

export { default as CollapsibleView } from './collapsible/collapsibleview.js';

export * from './colorgrid/utils.js';
export { default as ColorGridView, type ColorDefinition } from './colorgrid/colorgridview.js';
export { default as ColorTileView } from './colorgrid/colortileview.js';

export { default as ColorPickerView } from './colorpicker/colorpickerview.js';
export type { ColorPickerConfig, ColorPickerViewConfig, ColorPickerOutputFormat } from './colorpicker/utils.js';

export {
	default as ColorSelectorView,
	type ColorSelectorExecuteEvent,
	type ColorSelectorColorPickerCancelEvent,
	type ColorSelectorColorPickerShowEvent
} from './colorselector/colorselectorview.js';

export { default as ComponentFactory } from './componentfactory.js';

export { default as Dialog } from './dialog/dialog.js';
export { default as DialogView, DialogViewPosition, type DialogViewMoveToEvent } from './dialog/dialogview.js';

export { default as DropdownView } from './dropdown/dropdownview.js';
export { default as DropdownPanelView } from './dropdown/dropdownpanelview.js';
export { default as DropdownButtonView } from './dropdown/button/dropdownbuttonview.js';
export { default as SplitButtonView } from './dropdown/button/splitbuttonview.js';
export * from './dropdown/utils.js';

export { default as EditorUI, type EditorUIReadyEvent, type EditorUIUpdateEvent } from './editorui/editorui.js';
export { default as EditorUIView } from './editorui/editoruiview.js';
export { default as BoxedEditorUIView } from './editorui/boxed/boxededitoruiview.js';
export { default as InlineEditableUIView } from './editableui/inline/inlineeditableuiview.js';

export { default as FormHeaderView } from './formheader/formheaderview.js';
export {
	default as FocusCycler,
	type FocusableView,
	type ViewWithFocusCycler,
	type FocusCyclerForwardCycleEvent,
	type FocusCyclerBackwardCycleEvent,
	isViewWithFocusCycler,
	isFocusable
} from './focuscycler.js';

export { default as IconView } from './icon/iconview.js';
export { default as InputView } from './input/inputview.js';
export { default as InputTextView } from './inputtext/inputtextview.js';
export { default as InputNumberView } from './inputnumber/inputnumberview.js';

export { default as TextareaView, type TextareaViewUpdateEvent } from './textarea/textareaview.js';

export { default as IframeView } from './iframe/iframeview.js';

export { default as LabelView } from './label/labelview.js';
export { type LabeledFieldViewCreator, default as LabeledFieldView } from './labeledfield/labeledfieldview.js';
export * from './labeledfield/utils.js';

export { default as ListItemGroupView } from './list/listitemgroupview.js';
export { default as ListItemView } from './list/listitemview.js';
export { default as ListSeparatorView } from './list/listseparatorview.js';
export { default as ListView } from './list/listview.js';

export { default as Notification } from './notification/notification.js';

export { default as ViewModel } from './model.js';
export { default as BalloonPanelView } from './panel/balloon/balloonpanelview.js';
export { default as ContextualBalloon } from './panel/balloon/contextualballoon.js';
export { default as StickyPanelView } from './panel/sticky/stickypanelview.js';

export { default as AutocompleteView, type AutocompleteViewConfig, type AutocompleteResultsView } from './autocomplete/autocompleteview.js';
export { default as SearchTextView, type SearchTextViewSearchEvent, type SearchTextViewConfig } from './search/text/searchtextview.js';
export { default as SearchInfoView } from './search/searchinfoview.js';
export type { default as FilteredView, FilteredViewExecuteEvent } from './search/filteredview.js';
export { default as HighlightedTextView } from './highlightedtext/highlightedtextview.js';

export { default as TooltipManager } from './tooltipmanager.js';
export { default as Template, type TemplateDefinition } from './template.js';

export { default as SpinnerView } from './spinner/spinnerview.js';

export { default as ToolbarView } from './toolbar/toolbarview.js';
export { default as ToolbarLineBreakView } from './toolbar/toolbarlinebreakview.js';
export { default as ToolbarSeparatorView } from './toolbar/toolbarseparatorview.js';
export { default as normalizeToolbarConfig } from './toolbar/normalizetoolbarconfig.js';
export { default as BalloonToolbar, type BalloonToolbarShowEvent } from './toolbar/balloon/balloontoolbar.js';
export { default as BlockToolbar } from './toolbar/block/blocktoolbar.js';

export { default as ViewCollection } from './viewcollection.js';

export { default as MenuBarView, type MenuBarConfig } from './menubar/menubarview.js';
export { default as MenuBarMenuView } from './menubar/menubarmenuview.js';
export { default as MenuBarMenuListView } from './menubar/menubarmenulistview.js';
export { default as MenuBarMenuListItemView } from './menubar/menubarmenulistitemview.js';
export { default as MenuBarMenuListItemButtonView } from './menubar/menubarmenulistitembuttonview.js';
export { default as MenuBarMenuListItemFileDialogButtonView } from './menubar/menubarmenulistitemfiledialogbuttonview.js';
export { normalizeMenuBarConfig, DefaultMenuBarItems, _initMenuBar } from './menubar/utils.js';

import './augmentation.js';
