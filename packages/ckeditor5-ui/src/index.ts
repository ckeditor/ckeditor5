/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui
 */

export { default as clickOutsideHandler } from './bindings/clickoutsidehandler.js';
export { default as injectCssTransitionDisabler } from './bindings/injectcsstransitiondisabler.js';
export { default as CssTransitionDisablerMixin, type ViewWithCssTransitionDisabler } from './bindings/csstransitiondisablermixin.js';
export { default as submitHandler } from './bindings/submithandler.js';
export { default as addKeyboardHandlingForGrid } from './bindings/addkeyboardhandlingforgrid.js';

export { default as BodyCollection } from './editorui/bodycollection.js';

export { type ButtonExecuteEvent } from './button/button.js';
export { default as ButtonView } from './button/buttonview.js';
export { default as SwitchButtonView } from './button/switchbuttonview.js';

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
export { default as FocusCycler, type FocusableView } from './focuscycler.js';

export { default as IconView } from './icon/iconview.js';
export { default as InputView } from './input/inputview.js';
export { default as InputTextView } from './inputtext/inputtextview.js';
export { default as InputNumberView } from './inputnumber/inputnumberview.js';

export { default as IframeView } from './iframe/iframeview.js';

export { default as LabelView } from './label/labelview.js';
export { default as LabeledFieldView } from './labeledfield/labeledfieldview.js';
export * from './labeledfield/utils.js';

export { default as ListItemView } from './list/listitemview.js';
export { default as ListView } from './list/listview.js';

export { default as Notification } from './notification/notification.js';

export { default as Model } from './model.js';
export { default as BalloonPanelView } from './panel/balloon/balloonpanelview.js';
export { default as ContextualBalloon } from './panel/balloon/contextualballoon.js';
export { default as StickyPanelView } from './panel/sticky/stickypanelview.js';

export { default as TooltipManager } from './tooltipmanager.js';
export { default as Template, type TemplateDefinition } from './template.js';

export { default as ToolbarView } from './toolbar/toolbarview.js';
export { default as ToolbarLineBreakView } from './toolbar/toolbarlinebreakview.js';
export { default as ToolbarSeparatorView } from './toolbar/toolbarseparatorview.js';
export { default as normalizeToolbarConfig } from './toolbar/normalizetoolbarconfig.js';
export { default as BalloonToolbar, type BalloonToolbarShowEvent } from './toolbar/balloon/balloontoolbar.js';
export { default as BlockToolbar } from './toolbar/block/blocktoolbar.js';

export { default as View, type UIViewRenderEvent } from './view.js';
export { default as ViewCollection } from './viewcollection.js';

import { default as colorPaletteIcon } from '../theme/icons/color-palette.svg';

export const icons = {
	colorPaletteIcon
};

import './augmentation.js';
