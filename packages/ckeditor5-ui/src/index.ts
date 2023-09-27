/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui
 */

export { default as clickOutsideHandler } from './bindings/clickoutsidehandler';
export { default as injectCssTransitionDisabler } from './bindings/injectcsstransitiondisabler';
export { default as CssTransitionDisablerMixin, type ViewWithCssTransitionDisabler } from './bindings/csstransitiondisablermixin';
export { default as submitHandler } from './bindings/submithandler';
export { default as addKeyboardHandlingForGrid } from './bindings/addkeyboardhandlingforgrid';

export { default as BodyCollection } from './editorui/bodycollection';

export { type ButtonExecuteEvent } from './button/button';
export { type default as ButtonLabel } from './button/buttonlabel';
export { default as ButtonView } from './button/buttonview';
export { default as ButtonLabelView } from './button/buttonlabelview';
export { default as SwitchButtonView } from './button/switchbuttonview';

export * from './colorgrid/utils';
export { default as ColorGridView, type ColorDefinition } from './colorgrid/colorgridview';
export { default as ColorTileView } from './colorgrid/colortileview';

export { default as ColorPickerView } from './colorpicker/colorpickerview';
export type { ColorPickerConfig, ColorPickerViewConfig, ColorPickerOutputFormat } from './colorpicker/utils';

export {
	default as ColorSelectorView,
	type ColorSelectorExecuteEvent,
	type ColorSelectorColorPickerCancelEvent,
	type ColorSelectorColorPickerShowEvent
} from './colorselector/colorselectorview';

export { default as ComponentFactory } from './componentfactory';

export { default as DropdownView } from './dropdown/dropdownview';
export { default as DropdownPanelView } from './dropdown/dropdownpanelview';
export { default as DropdownButtonView } from './dropdown/button/dropdownbuttonview';
export { default as SplitButtonView } from './dropdown/button/splitbuttonview';
export * from './dropdown/utils';

export { default as EditorUI, type EditorUIReadyEvent, type EditorUIUpdateEvent } from './editorui/editorui';
export { default as EditorUIView } from './editorui/editoruiview';
export { default as BoxedEditorUIView } from './editorui/boxed/boxededitoruiview';
export { default as InlineEditableUIView } from './editableui/inline/inlineeditableuiview';

export { default as FormHeaderView } from './formheader/formheaderview';
export {
	default as FocusCycler,
	type FocusableView,
	type FocusCyclerForwardCycleEvent,
	type FocusCyclerBackwardCycleEvent
} from './focuscycler';

export { default as IconView } from './icon/iconview';
export { default as InputView } from './input/inputview';
export { default as InputTextView } from './inputtext/inputtextview';
export { default as InputNumberView } from './inputnumber/inputnumberview';

export { default as TextareaView, type TextareaViewUpdateEvent } from './textarea/textareaview';

export { default as IframeView } from './iframe/iframeview';

export { default as LabelView } from './label/labelview';
export { type LabeledFieldViewCreator, default as LabeledFieldView } from './labeledfield/labeledfieldview';
export * from './labeledfield/utils';

export { default as ListItemGroupView } from './list/listitemgroupview';
export { default as ListItemView } from './list/listitemview';
export { default as ListView } from './list/listview';

export { default as Notification } from './notification/notification';

export { default as Model } from './model';
export { default as BalloonPanelView } from './panel/balloon/balloonpanelview';
export { default as ContextualBalloon } from './panel/balloon/contextualballoon';
export { default as StickyPanelView } from './panel/sticky/stickypanelview';

export { default as AutocompleteView, type AutocompleteViewConfig, type AutocompleteResultsView } from './autocomplete/autocompleteview';
export { default as SearchTextView, type SearchTextViewSearchEvent, type SearchTextViewConfig } from './search/text/searchtextview';
export { default as SearchInfoView } from './search/searchinfoview';
export { default as FilteredView, type FilteredViewExecuteEvent } from './search/filteredview';
export { default as HighlightedTextView } from './highlightedtext/highlightedtextview';

export { default as TooltipManager } from './tooltipmanager';
export { default as Template, type TemplateDefinition } from './template';

export { default as SpinnerView } from './spinner/spinnerview';

export { default as ToolbarView } from './toolbar/toolbarview';
export { default as ToolbarLineBreakView } from './toolbar/toolbarlinebreakview';
export { default as ToolbarSeparatorView } from './toolbar/toolbarseparatorview';
export { default as normalizeToolbarConfig } from './toolbar/normalizetoolbarconfig';
export { default as BalloonToolbar, type BalloonToolbarShowEvent } from './toolbar/balloon/balloontoolbar';
export { default as BlockToolbar } from './toolbar/block/blocktoolbar';

export { default as View, type UIViewRenderEvent } from './view';
export { default as ViewCollection } from './viewcollection';

import { default as colorPaletteIcon } from '../theme/icons/color-palette.svg';

export const icons = {
	colorPaletteIcon
};

import './augmentation';
