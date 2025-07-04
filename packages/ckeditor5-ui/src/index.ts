/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui
 */

// This import must be at the top to ensure that `globals.css` is imported first
export { View, type UIViewRenderEvent } from './view.js';

export {
	AriaLiveAnnouncerPoliteness,
	AriaLiveAnnouncer,
	AriaLiveAnnouncerView,
	AriaLiveAnnouncerRegionView,
	type AriaLiveAnnouncerPolitenessValue,
	type AriaLiveAppendContentAttributes,
	type AriaLiveAnnounceConfig
} from './arialiveannouncer.js';

export { clickOutsideHandler } from './bindings/clickoutsidehandler.js';
export { CssTransitionDisablerMixin, type ViewWithCssTransitionDisabler } from './bindings/csstransitiondisablermixin.js';
export { DraggableViewMixin, type DraggableView, type DraggableViewDragEvent } from './bindings/draggableviewmixin.js';
export { submitHandler, type SubmitHandlerEvent } from './bindings/submithandler.js';
export { addKeyboardHandlingForGrid } from './bindings/addkeyboardhandlingforgrid.js';

export { AccessibilityHelpContentView } from './editorui/accessibilityhelp/accessibilityhelpcontentview.js';
export { AccessibilityHelp } from './editorui/accessibilityhelp/accessibilityhelp.js';
export { BodyCollection } from './editorui/bodycollection.js';
export { PoweredBy } from './editorui/poweredby.js';

export { Badge, type BadgeConfig } from './badge/badge.js';

export type { Button, ButtonExecuteEvent } from './button/button.js';
export type { ButtonLabel } from './button/buttonlabel.js';
export { ButtonView } from './button/buttonview.js';
export { ButtonLabelView } from './button/buttonlabelview.js';
export { SwitchButtonView } from './button/switchbuttonview.js';
export { ListItemButtonView } from './button/listitembuttonview.js';

export {
	FileDialogButtonView,
	FileDialogListItemButtonView,
	FileDialogViewMixin,
	type FileDialogButtonViewBase,
	type FileInputViewDoneEvent
} from './button/filedialogbuttonview.js';

export { CollapsibleView } from './collapsible/collapsibleview.js';

export {
	type ColorOption,
	type NormalizedColorOption,
	getLocalizedColorOptions,
	normalizeColorOptions,
	normalizeSingleColorDefinition
} from './colorgrid/utils.js';

export {
	ColorGridView,
	type ColorDefinition,
	type ColorGridViewExecuteEvent,
	type ColorGridViewExecuteEventData
} from './colorgrid/colorgridview.js';

export { ColorTileView } from './colorgrid/colortileview.js';

export { ColorPickerView, SliderView, ColorPickerInputRowView, type ColorPickerColorSelectedEvent } from './colorpicker/colorpickerview.js';
export type { ColorPickerConfig, ColorPickerViewConfig, ColorPickerOutputFormat } from './colorpicker/utils.js';

export {
	ColorSelectorView,
	type ColorSelectorExecuteEvent,
	type ColorSelectorColorPickerCancelEvent,
	type ColorSelectorColorPickerShowEvent
} from './colorselector/colorselectorview.js';

export {
	DocumentColorCollection,
	type DocumentColorCollectionChangeEvent,
	type DocumentColorCollectionAddEvent,
	type DocumentColorCollectionRemoveEvent
} from './colorselector/documentcolorcollection.js';

export { ColorGridsFragmentView } from './colorselector/colorgridsfragmentview.js';
export { ColorPickerFragmentView } from './colorselector/colorpickerfragmentview.js';

export { ComponentFactory } from './componentfactory.js';

export { Dialog, type DialogDefinition, type DialogShowEvent, type DialogHideEvent } from './dialog/dialog.js';
export { DialogView, DialogViewPosition, type DialogViewMoveToEvent, type DialogViewCloseEvent } from './dialog/dialogview.js';
export { DialogActionsView, type DialogActionButtonDefinition } from './dialog/dialogactionsview.js';
export { DialogContentView } from './dialog/dialogcontentview.js';

export { DropdownView, type DropdownViewEvent } from './dropdown/dropdownview.js';
export { DropdownPanelView, type PanelPosition } from './dropdown/dropdownpanelview.js';
export type { DropdownPanelFocusable } from './dropdown/dropdownpanelfocusable.js';
export type { DropdownButton, DropdownButtonOpenEvent } from './dropdown/button/dropdownbutton.js';
export { DropdownButtonView } from './dropdown/button/dropdownbuttonview.js';
export { SplitButtonView } from './dropdown/button/splitbuttonview.js';

export {
	type ListDropdownItemDefinition,
	type ListDropdownSeparatorDefinition,
	type ListDropdownButtonDefinition,
	type ListDropdownGroupDefinition,
	createDropdown,
	addMenuToDropdown,
	addToolbarToDropdown,
	addListToDropdown,
	focusChildOnDropdownOpen
} from './dropdown/utils.js';

export {
	type DropdownNestedMenuDefinition,
	type DropdownMenuButtonDefinition,
	type DropdownMenuDefinition,
	DropdownMenuPanelPositioningFunctions
} from './dropdown/menu/utils.js';

export { DropdownMenuNestedMenuView } from './dropdown/menu/dropdownmenunestedmenuview.js';
export { DropdownMenuRootListView, type DropdownMenuRootListViewExecuteEvent } from './dropdown/menu/dropdownmenurootlistview.js';
export { DropdownMenuListView } from './dropdown/menu/dropdownmenulistview.js';
export { DropdownMenuListItemView } from './dropdown/menu/dropdownmenulistitemview.js';
export { DropdownMenuListItemButtonView } from './dropdown/menu/dropdownmenulistitembuttonview.js';
export { DropdownMenuButtonView } from './dropdown/menu/dropdownmenubuttonview.js';

export {
	DropdownMenuNestedMenuPanelView,
	type DropdownMenuNestedMenuPanelPosition
} from './dropdown/menu/dropdownmenunestedmenupanelview.js';

export {
	EditorUI,
	type EditorUIReadyEvent,
	type EditorUIUpdateEvent,
	type FocusableToolbarDefinition,
	type FocusableToolbarOptions,
	type ViewportOffset
} from './editorui/editorui.js';

export { EditorUIView } from './editorui/editoruiview.js';
export { EvaluationBadge } from './editorui/evaluationbadge.js';
export { BoxedEditorUIView } from './editorui/boxed/boxededitoruiview.js';
export { InlineEditableUIView, type InlineEditableUIViewOptions } from './editableui/inline/inlineeditableuiview.js';
export { EditableUIView } from './editableui/editableuiview.js';

export { FormRowView } from './formrow/formrowview.js';
export { FormHeaderView } from './formheader/formheaderview.js';
export {
	FocusCycler,
	type FocusableView,
	type ViewWithFocusCycler,
	type FocusCyclerForwardCycleEvent,
	type FocusCyclerBackwardCycleEvent,
	type FocusCyclerActions,
	isViewWithFocusCycler,
	isFocusable
} from './focuscycler.js';

export { IconView } from './icon/iconview.js';
export { InputBase } from './input/inputbase.js';
export { InputView, type InputViewInputEvent } from './input/inputview.js';
export { InputTextView } from './inputtext/inputtextview.js';
export { InputNumberView } from './inputnumber/inputnumberview.js';

export { TextareaView, type TextareaViewUpdateEvent } from './textarea/textareaview.js';

export { IframeView, type IframeViewLoadedEvent } from './iframe/iframeview.js';

export { LabelView } from './label/labelview.js';

export { type LabeledFieldViewCreator, LabeledFieldView } from './labeledfield/labeledfieldview.js';

export {
	createLabeledInputNumber,
	createLabeledInputText,
	createLabeledTextarea,
	createLabeledDropdown
} from './labeledfield/utils.js';

export { LabeledInputView } from './labeledinput/labeledinputview.js';

export { ListItemGroupView } from './list/listitemgroupview.js';
export { ListItemView } from './list/listitemview.js';
export { ListSeparatorView } from './list/listseparatorview.js';
export { ListView } from './list/listview.js';
export { filterGroupAndItemNames } from './search/filtergroupanditemnames.js';

export {
	Notification,
	type NotificationEventType,
	type NotificationShowEvent,
	type NotificationShowSuccessEvent,
	type NotificationShowWarningEvent,
	type NotificationShowTypeEvent,
	type NotificationShowEventData,
	type NotificationShowInfoEvent
} from './notification/notification.js';

export {
	UIModel,
	UIModel as ViewModel // TODO: Remove after WProofReader has been adjusted.
} from './model.js';

export { BalloonPanelView } from './panel/balloon/balloonpanelview.js';

export {
	ContextualBalloon,
	type ContextualBalloonGetPositionOptionsEvent,
	type ViewConfiguration
} from './panel/balloon/contextualballoon.js';

export { StickyPanelView } from './panel/sticky/stickypanelview.js';

export { AutocompleteView, type AutocompleteViewConfig, type AutocompleteResultsView } from './autocomplete/autocompleteview.js';

export {
	SearchTextView,
	type SearchTextViewSearchEvent,
	type SearchTextViewConfig,
	type SearchTextViewDefaultInfoText,
	type SearchTextViewSearchEventData
} from './search/text/searchtextview.js';

export type { SearchTextQueryViewResetEvent, SearchTextQueryViewConfig } from './search/text/searchtextqueryview.js';
export { SearchResultsView } from './search/searchresultsview.js';
export { SearchInfoView } from './search/searchinfoview.js';
export type { FilteredView, FilteredViewExecuteEvent } from './search/filteredview.js';
export { HighlightedTextView } from './highlightedtext/highlightedtextview.js';
export { ButtonLabelWithHighlightView } from './highlightedtext/buttonlabelwithhighlightview.js';
export { LabelWithHighlightView } from './highlightedtext/labelwithhighlightview.js';

export { TooltipManager, type TooltipPosition } from './tooltipmanager.js';

export {
	Template,
	type TemplateDefinition,
	type AttributeValues,
	type TemplateElementDefinition,
	type TemplateTextDefinition,
	type FalsyValue,
	type NamespacedValue,
	type TemplateSimpleValue,
	type TemplateSimpleValueSchema,
	type TemplateValueSchema,
	type TemplateListenerSchema,
	type AttributeBinding,
	type ListenerBinding,
	type BindChain
} from './template.js';

export { SpinnerView } from './spinner/spinnerview.js';

export { ToolbarView, ItemsView, type ToolbarViewGroupedItemsUpdateEvent, type ToolbarOptions } from './toolbar/toolbarview.js';
export { ToolbarLineBreakView } from './toolbar/toolbarlinebreakview.js';
export { ToolbarSeparatorView } from './toolbar/toolbarseparatorview.js';
export { normalizeToolbarConfig } from './toolbar/normalizetoolbarconfig.js';
export { BalloonToolbar, type BalloonToolbarShowEvent } from './toolbar/balloon/balloontoolbar.js';
export { BlockToolbar } from './toolbar/block/blocktoolbar.js';
export { BlockButtonView } from './toolbar/block/blockbuttonview.js';

export { ViewCollection } from './viewcollection.js';

export {
	MenuBarView,
	type MenuBarConfig,
	type MenuBarConfigObject,
	type NormalizedMenuBarConfigObject,
	type MenuBarMenuEvent,
	type MenuBarMenuGroupDefinition,
	type MenuBarMenuDefinition,
	type MenuBarConfigAddedPosition,
	type MenuBarConfigAddedItem,
	type MenuBarConfigAddedGroup,
	type MenuBarConfigAddedMenu,
	type MenuBarMenuMouseEnterEvent,
	type MenuBarMenuArrowLeftEvent,
	type MenuBarMenuArrowRightEvent,
	type MenuBarMenuChangeIsOpenEvent
} from './menubar/menubarview.js';

export { MenuBarMenuButtonView } from './menubar/menubarmenubuttonview.js';
export { MenuBarMenuPanelView, type MenuBarMenuPanelPosition } from './menubar/menubarmenupanelview.js';
export { MenuBarMenuView } from './menubar/menubarmenuview.js';
export { MenuBarMenuListView } from './menubar/menubarmenulistview.js';
export { MenuBarMenuListItemView } from './menubar/menubarmenulistitemview.js';
export { MenuBarMenuListItemButtonView } from './menubar/menubarmenulistitembuttonview.js';
export { MenuBarMenuListItemFileDialogButtonView } from './menubar/menubarmenulistitemfiledialogbuttonview.js';
export { normalizeMenuBarConfig, DefaultMenuBarItems } from './menubar/utils.js';

// Internals
export { preventDefault as _preventUiViewDefault } from './bindings/preventdefault.js';
export { CheckIconHolderView as _CheckIconHolderView } from './button/listitembuttonview.js';
export { CollapsibleView as _CollapsibleView } from './collapsible/collapsibleview.js';
export { tryParseHexColor as _tryNormalizeHexColor } from './colorpicker/colorpickerview.js';
export { convertColor as _convertColor } from './colorpicker/utils.js';
export { convertToHex as _convertColorToHex } from './colorpicker/utils.js';
export { registerCustomElement as _registerCustomElement } from './colorpicker/utils.js';
export { DropdownRootMenuBehaviors as _DropdownRootMenuBehaviors } from './dropdown/menu/dropdownmenubehaviors.js';
export { DropdownMenuBehaviors as _DropdownMenuBehaviors } from './dropdown/menu/dropdownmenubehaviors.js';
export { MenuBarBehaviors as _MenuBarBehaviors } from './menubar/utils.js';
export { MenuBarMenuBehaviors as _MenuBarMenuBehaviors } from './menubar/utils.js';
export { MenuBarMenuViewPanelPositioningFunctions as _MenuBarMenuViewPanelPositioningFunctions } from './menubar/utils.js';
export { processMenuBarConfig as _processMenuBarConfig } from './menubar/utils.js';
export { RotatorView as _ContextualBalloonRotatorView } from './panel/balloon/contextualballoon.js';
export { SearchInfoView as _SearchInfoView } from './search/searchinfoview.js';
export { SearchTextQueryView as _SearchTextQueryView } from './search/text/searchtextqueryview.js';
export { TemplateBinding as _TemplateBinding } from './template.js';
export { TemplateToBinding as _TemplateToBinding } from './template.js';
export { TemplateIfBinding as _TemplateIfBinding } from './template.js';
export { type RenderData as _TemplateRenderData } from './template.js';
export { NESTED_TOOLBAR_ICONS } from './toolbar/toolbarview.js';
export { type ToolbarBehavior as _ToolbarBehavior } from './toolbar/toolbarview.js';

import './augmentation.js';
