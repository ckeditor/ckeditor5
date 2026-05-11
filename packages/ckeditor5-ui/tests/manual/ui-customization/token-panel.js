/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Shared token panel module — used by ui-customization and all-features-ui-customization tests.
 * Contains the token registry (FOUNDATION, SEMANTIC, COMPONENT), descriptions, refs,
 * and the generatePanel() function that builds the interactive panel DOM.
 */

/* eslint-disable max-len */

const FOUNDATION = {
	'Colors': [
		// Base surface & structure
		'--ck-color-base-background', '--ck-color-base-foreground', '--ck-color-base-border', '--ck-color-base-border-light',
		'--ck-color-base-text', '--ck-color-base-text-light',
		// Interactive states (derived from base hues)
		'--ck-color-base-hover', '--ck-color-base-active', '--ck-color-base-active-focus',
		'--ck-color-base-selected', '--ck-color-base-selected-hover',
		'--ck-color-base-focus', '--ck-color-base-focus-shadow', '--ck-color-base-focus-shadow-faded',
		// Action (green)
		'--ck-color-base-action', '--ck-color-base-action-hover',
		// Feedback
		'--ck-color-base-error', '--ck-color-base-error-shadow',
		'--ck-color-base-warning', '--ck-color-base-success', '--ck-color-base-highlight', '--ck-color-base-attention',
		// Shadow colors
		'--ck-color-shadow-drop', '--ck-color-shadow-drop-active', '--ck-color-shadow-inner'
	],
	'Border & Radius': [
		'--ck-radius-xs', '--ck-radius-base', '--ck-radius-full', '--ck-radius-corners',
		'--ck-border-width-thin', '--ck-border-width-thick'
	],
	'Spacing': [
		// Base unit first, then scale from largest to smallest
		'--ck-spacing-unit',
		'--ck-spacing-xl', '--ck-spacing-lg', '--ck-spacing-base',
		'--ck-spacing-md', '--ck-spacing-ms', '--ck-spacing-sm', '--ck-spacing-xs', '--ck-spacing-2xs'
	],
	'Shadow': [
		'--ck-inset-shadow-sm', '--ck-shadow-md', '--ck-shadow-lg'
	],
	'Typography': [
		// Font family & base size
		'--ck-font-family', '--ck-font-size-base', '--ck-line-height-base',
		// Font size scale
		'--ck-font-size-xs', '--ck-font-size-sm', '--ck-font-size-md',
		'--ck-font-size-lg', '--ck-font-size-xl',
		// Font weight scale
		'--ck-font-weight-normal', '--ck-font-weight-medium', '--ck-font-weight-semibold', '--ck-font-weight-bold'
	],
	'Focus': [
		'--ck-focus-border-color',
		'--ck-focus-shadow-geometry',
		'--ck-focus-ring',
		'--ck-focus-shadow', '--ck-focus-shadow-disabled', '--ck-focus-shadow-error',
		'--ck-outline-fake-caret'
	],
	'Other': [
		'--ck-opacity-disabled', '--ck-size-min-height'
	],
	'Motion': [
		// Transition durations
		'--ck-duration-fast', '--ck-duration-base', '--ck-duration-slow', '--ck-duration-slower',
		// Easing functions
		'--ck-ease-standard', '--ck-ease-interactive', '--ck-ease-emphasized',
		// Animation durations
		'--ck-animation-duration-fast', '--ck-animation-duration-base', '--ck-animation-duration-slow',
		'--ck-animation-duration-emphasis', '--ck-animation-duration-reduced',
		// Animation easing
		'--ck-animation-ease-standard', '--ck-animation-ease-interactive', '--ck-animation-ease-linear',
		// Animation misc
		'--ck-animation-fill-both', '--ck-animation-repeat-infinite',
		'--ck-animation-none', '--ck-transition-none'
	],
	'Layers': [
		'--ck-z-base', '--ck-z-overlay', '--ck-z-modal'
	]
};

const SEMANTIC = {
	'Colors \u2014 Surface': [
		// Base canvas, then derived surfaces
		'--ck-color-surface-canvas',
		'--ck-color-surface-control', '--ck-color-surface-container', '--ck-color-surface-inverse',
		// Borders (derived from base-border)
		'--ck-color-border-control', '--ck-color-border-container', '--ck-color-divider'
	],
	'Colors \u2014 Text': [
		// Base text, then variants
		'--ck-color-text', '--ck-color-text-primary',
		'--ck-color-text-secondary', '--ck-color-text-disabled',
		'--ck-color-text-inverse', '--ck-color-text-error'
	],
	'Colors \u2014 Feedback': [
		'--ck-color-feedback-error', '--ck-color-feedback-warning',
		'--ck-color-feedback-success', '--ck-color-feedback-highlight'
	],
	'Colors \u2014 Interactive': [
		// Hover/active states
		'--ck-color-interactive-hover-surface', '--ck-color-interactive-active-surface',
		// Selected states
		'--ck-color-interactive-selected-surface', '--ck-color-interactive-selected-surface-hover',
		'--ck-color-interactive-selected-text',
		// Primary action
		'--ck-color-interactive-primary-surface', '--ck-color-interactive-primary-surface-hover',
		'--ck-color-interactive-primary-text',
		// Focus (derived from base focus colors)
		'--ck-color-interactive-focus-border-coordinates',
		'--ck-color-interactive-focus-border', '--ck-color-interactive-focus-shadow',
		'--ck-color-interactive-focus-disabled-shadow', '--ck-color-interactive-focus-error-shadow'
	],
	'Interactive Focus': [
		// Ring and border-color (base), then shadows (derived)
		'--ck-interactive-focus-ring', '--ck-interactive-focus-border-color',
		'--ck-interactive-focus-shadow',
		'--ck-interactive-focus-disabled-shadow', '--ck-interactive-focus-error-shadow'
	],
	'Shape & Border': [
		// Border widths (base → derived)
		'--ck-border-width-control', '--ck-border-width-surface',
		'--ck-border-width-divider', '--ck-border-width-emphasis',
		// Radius: base roles first
		'--ck-border-radius-control', '--ck-border-radius-surface',
		// Radius: uniform opt-out (set to disable attached-corner behavior globally)
		'--ck-border-radius-uniform',
		// Radius: attached variants (derived from surface)
		'--ck-border-radius-surface-attached',
		'--ck-border-radius-surface-attached-top', '--ck-border-radius-surface-attached-bottom',
		// Radius: cut variants (derived from attached)
		'--ck-border-radius-surface-cut-top-left', '--ck-border-radius-surface-cut-top-right',
		'--ck-border-radius-surface-cut-bottom-right', '--ck-border-radius-surface-cut-bottom-left'
	],
	'Spacing': [
		// Control spacing (buttons, inputs)
		'--ck-spacing-control-padding-block', '--ck-spacing-control-padding-inline',
		'--ck-spacing-control-padding-inline-compact', '--ck-spacing-control-padding-inline-start-compact',
		'--ck-spacing-control-padding-block-regular', '--ck-spacing-control-padding-block-compact',
		'--ck-spacing-control-icon-gap', '--ck-spacing-control-meta-gap',
		// Surface spacing (toolbars, lists)
		'--ck-spacing-surface-padding-inline', '--ck-spacing-surface-padding-block',
		'--ck-spacing-surface-item-gap-inline', '--ck-spacing-surface-item-gap-block',
		'--ck-spacing-surface-section-gap-block',
		// Region spacing (containers)
		'--ck-spacing-region-padding-inline', '--ck-spacing-region-padding-inline-wide',
		'--ck-spacing-region-padding-block', '--ck-spacing-region-edge-margin-block'
	],
	'Typography': [
		'--ck-font-weight-ui-default', '--ck-font-weight-ui-strong', '--ck-font-weight-ui-heading',
		'--ck-font-weight-ui-label', '--ck-font-weight-ui-emphasis', '--ck-font-weight-ui-muted',
		'--ck-font-weight-ui-inherit'
	],
	'Layout': [ '--ck-size-control-min-height' ],
	'Shadow': [ '--ck-shadow-surface-floating' ],
	'Motion': [
		// Transition durations
		'--ck-transition-duration-control-fast', '--ck-transition-duration-control',
		'--ck-transition-duration-control-emphasized', '--ck-transition-duration-surface',
		// Transition easing
		'--ck-transition-timing-function-control', '--ck-transition-timing-function-control-emphasized',
		'--ck-transition-timing-function-surface',
		// Animation
		'--ck-animation-duration-feedback', '--ck-animation-duration-surface-entrance',
		'--ck-animation-duration-progress', '--ck-animation-duration-progress-reduced',
		'--ck-animation-timing-function-feedback', '--ck-animation-timing-function-progress',
		'--ck-animation-fill-mode-feedback'
	],
	'Layer': [
		'--ck-layer-base', '--ck-layer-control-raised',
		'--ck-layer-panel', '--ck-layer-panel-above', '--ck-layer-panel-below',
		'--ck-layer-dialog', '--ck-layer-tooltip',
		'--ck-layer-balloon-arrow-back', '--ck-layer-balloon-arrow-front'
	]
};

const COMPONENT = {
	// ---- Most customized components first ----
	'Button': [
		'--ck-button-padding',
		'--ck-button-border-radius', '--ck-button-border',
		'--ck-button-default-background-color', '--ck-button-default-hover-background-color',
		'--ck-button-default-active-background-color', '--ck-button-default-disabled-background-color',
		'--ck-button-on-background-color', '--ck-button-on-hover-background-color',
		'--ck-button-on-active-background-color', '--ck-button-on-disabled-background-color',
		'--ck-button-on-text-color',
		'--ck-button-action-background-color', '--ck-button-action-hover-background-color',
		'--ck-button-action-active-background-color', '--ck-button-action-disabled-background-color',
		'--ck-button-action-text-color',
		'--ck-button-save-color', '--ck-button-cancel-color',
		'--ck-button-focus-border-color', '--ck-button-opacity-disabled'
	],
	'Input': [
		'--ck-input-width', '--ck-input-padding',
		'--ck-input-border-radius', '--ck-input-border',
		'--ck-input-background-color', '--ck-input-border-color', '--ck-input-error-border-color',
		'--ck-input-text-color',
		'--ck-input-disabled-background-color', '--ck-input-disabled-border-color', '--ck-input-disabled-text-color',
		'--ck-input-focus-border-color', '--ck-input-text-width'
	],
	'Toolbar': [
		'--ck-toolbar-item-gap-inline', '--ck-toolbar-padding',
		'--ck-toolbar-border-radius', '--ck-toolbar-vertical-button-border-radius',
		'--ck-toolbar-compact-uniform-border-radius',
		'--ck-toolbar-background-color', '--ck-toolbar-border-color',
		'--ck-toolbar-border'
	],
	'Block Toolbar': [ '--ck-block-toolbar-button-size' ],
	'Dropdown': [
		'--ck-dropdown-arrow-size',
		'--ck-dropdown-panel-padding',
		'--ck-dropdown-panel-border-radius', '--ck-dropdown-panel-uniform-border-radius',
		'--ck-dropdown-panel-background-color', '--ck-dropdown-panel-border-color', '--ck-dropdown-list-background-color',
		'--ck-dropdown-panel-border'
	],
	'List': [
		'--ck-list-item-min-width', '--ck-list-padding', '--ck-list-item-outer-padding',
		'--ck-list-border-radius',
		'--ck-list-background-color', '--ck-list-divider-color',
		'--ck-list-button-hover-background-color', '--ck-list-button-on-background-color', '--ck-list-button-on-text-color',
		'--ck-list-group-label-font-size'
	],
	'List Item Button': [
		'--ck-list-item-button-padding', '--ck-list-item-button-border-radius'
	],
	'List Dropdown': [ '--ck-list-dropdown-uniform-border-radius' ],
	// ---- Dropdown sub-components ----
	'Dropdown Menu Panel': [
		'--ck-dropdown-menu-panel-max-height',
		'--ck-dropdown-menu-panel-border-radius', '--ck-dropdown-menu-panel-uniform-border-radius'
	],
	'Dropdown Menu List Item': [
		'--ck-dropdown-menu-menu-item-min-width',
		'--ck-dropdown-menu-list-item-spinner-size'
	],
	// ---- Menu bar ----
	'Menu Bar Button': [ '--ck-menu-bar-button-border-radius' ],
	'Menu Bar Panel': [
		'--ck-menu-bar-panel-border-radius', '--ck-menu-bar-panel-uniform-border-radius',
		'--ck-menu-bar-item-focus-border-color'
	],
	'Menu Bar List Item': [ '--ck-menu-bar-list-item-button-border-radius' ],
	// ---- Dialogs & panels ----
	'Dialog': [
		'--ck-dialog-max-height', '--ck-dialog-max-width',
		'--ck-dialog-border-radius', '--ck-dialog-border',
		'--ck-dialog-background-color', '--ck-dialog-overlay-background-color'
	],
	'Balloon Panel': [
		'--ck-balloon-panel-border-radius',
		'--ck-balloon-panel-border',
		'--ck-balloon-panel-background-color', '--ck-balloon-panel-border-color',
		'--ck-balloon-panel-arrow-display'
	],
	'Sticky Panel': [ '--ck-sticky-panel-uniform-border-radius' ],
	'Tooltip': [
		'--ck-tooltip-max-width', '--ck-tooltip-padding', '--ck-tooltip-border',
		'--ck-tooltip-background-color', '--ck-tooltip-text-color', '--ck-tooltip-text-font-size'
	],
	// ---- Toggle & forms ----
	'Switch Button': [
		'--ck-switch-button-toggle-border-radius', '--ck-switch-button-toggle-inner-border-radius',
		'--ck-switch-button-off-background-color', '--ck-switch-button-off-hover-background-color',
		'--ck-switch-button-on-background-color', '--ck-switch-button-on-hover-background-color',
		'--ck-switch-button-inner-background-color'
	],
	'Form Header': [
		'--ck-form-header-height', '--ck-form-header-padding-block', '--ck-form-header-label-font-size'
	],
	'Form': [ '--ck-form-default-width', '--ck-form-padding' ],
	'Form Row': [ '--ck-form-row-padding' ],
	'Labeled Field': [ '--ck-labeled-field-label-background-color', '--ck-labeled-field-label-start-gap' ],
	// ---- Editor & misc ----
	'Editor UI': [
		'--ck-editor-editable-padding',
		'--ck-editor-frame-border-radius', '--ck-editor-sticky-panel-border-radius',
		'--ck-editor-frame-border', '--ck-editor-frame-border-color',
		'--ck-editor-editable-focus-border-color'
	],
	'Accessibility Help': [
		'--ck-accessibility-help-dialog-max-height', '--ck-accessibility-help-dialog-max-width'
	],
	'Color Selector': [
		'--ck-color-selector-padding', '--ck-color-selector-uniform-border-radius',
		'--ck-color-selector-color-picker-border-top'
	],
	'Color Grid': [
		'--ck-color-grid-tile-size', '--ck-color-grid-gap', '--ck-color-grid-margin', '--ck-color-grid-padding',
		'--ck-color-grid-tile-border-radius',
		'--ck-color-grid-tile-hover-transform', '--ck-color-grid-tile-hover-layer'
	],
	'Search': [ '--ck-search-results-info-padding' ],
	'Icon': [ '--ck-icon-size' ],
	'Spinner': [ '--ck-toolbar-spinner-size' ],
	'Collapsible': [
		'--ck-collapsible-children-padding', '--ck-collapsible-button-font-weight'
	],
	'Autocomplete': [
		'--ck-autocomplete-results-max-height',
		'--ck-autocomplete-results-border-radius', '--ck-autocomplete-results-uniform-border-radius',
		'--ck-autocomplete-results-border',
		'--ck-autocomplete-results-background-color'
	],
	'Responsive Form': [
		'--ck-responsive-form-padding', '--ck-responsive-form-divider-border'
	]
};

// ---------------------------------------------------------------------------
// Token descriptions — short explanations for tokens with non-obvious behavior.
// Only tokens that need extra context are listed. The "i" icon appears only
// when a description exists.
// ---------------------------------------------------------------------------

/* eslint-disable max-len */
const TOKEN_DESCRIPTIONS = {
	// ---- Foundation — Colors ----
	'--ck-color-base-background': 'Base background color for the entire editor UI.',
	'--ck-color-base-foreground': 'Foreground color for elevated surfaces.',
	'--ck-color-base-border': 'Default border color across the UI.',
	'--ck-color-base-border-light': 'Lighter border variant for subtle separators.',
	'--ck-color-base-text': 'Default text color for the editor UI.',
	'--ck-color-base-text-light': 'Muted text color variant.',
	'--ck-color-base-hover': 'Background color on hover states.',
	'--ck-color-base-active': 'Background color on active/pressed states.',
	'--ck-color-base-active-focus': 'Background color when both active and focused.',
	'--ck-color-base-selected': 'Background for selected/toggled-on elements.',
	'--ck-color-base-selected-hover': 'Background for selected elements on hover.',
	'--ck-color-base-focus': 'Border/outline color for focused elements.',
	'--ck-color-base-focus-shadow': 'Shadow color for focus rings.',
	'--ck-color-base-focus-shadow-faded': 'Reduced-opacity focus shadow for disabled elements.',
	'--ck-color-base-action': 'Primary action color (e.g. save buttons). Usually green.',
	'--ck-color-base-action-hover': 'Hover state for primary action color.',
	'--ck-color-base-error': 'Error/danger state color.',
	'--ck-color-base-error-shadow': 'Shadow color for error focus rings.',
	'--ck-color-base-warning': 'Warning feedback color.',
	'--ck-color-base-success': 'Success feedback color.',
	'--ck-color-base-highlight': 'Highlight/accent color for attention states.',
	'--ck-color-base-attention': 'Attention/notice color (e.g. pending states).',
	'--ck-color-shadow-drop': 'Base color for drop shadows.',
	'--ck-color-shadow-drop-active': 'Stronger shadow color for active/elevated states.',
	'--ck-color-shadow-inner': 'Color for inner/inset shadows.',

	// ---- Foundation — Border & Radius ----
	'--ck-radius-xs': 'Extra-small border-radius for tight corners.',
	'--ck-radius-base': 'Default border-radius for the entire UI. Cascades to all semantic and component radius tokens.',
	'--ck-radius-full': 'Full circle radius (50%). Used for round elements like spinners.',
	'--ck-radius-corners': 'Active only when .ck-rounded-corners class is present on the editor root. Maps to radius-base.',
	'--ck-border-width-thin': 'Thin border width (e.g. 1px).',
	'--ck-border-width-thick': 'Thick border width for emphasis.',

	// ---- Foundation — Spacing ----
	'--ck-spacing-unit': 'Base spacing multiplier. All spacing scale tokens (xs–xl) are derived from this value.',
	'--ck-spacing-xl': 'Extra-large spacing. Derived from spacing-unit.',
	'--ck-spacing-lg': 'Large spacing. Derived from spacing-unit.',
	'--ck-spacing-base': 'Base spacing value. Derived from spacing-unit.',
	'--ck-spacing-md': 'Medium spacing. Derived from spacing-unit.',
	'--ck-spacing-ms': 'Medium-small spacing. Derived from spacing-unit.',
	'--ck-spacing-sm': 'Small spacing. Derived from spacing-unit.',
	'--ck-spacing-xs': 'Extra-small spacing. Derived from spacing-unit.',
	'--ck-spacing-2xs': 'Double extra-small spacing. Derived from spacing-unit.',

	// ---- Foundation — Shadow ----
	'--ck-inset-shadow-sm': 'Small inset shadow for sunken elements.',
	'--ck-shadow-md': 'Medium drop shadow for slightly elevated elements.',
	'--ck-shadow-lg': 'Large drop shadow for floating/modal elements.',

	// ---- Foundation — Typography ----
	'--ck-font-family': 'Default font family for the entire editor UI.',
	'--ck-font-size-base': 'Base font size in px. Used as the root for all relative em/rem calculations.',
	'--ck-line-height-base': 'Base line-height for UI elements.',
	'--ck-font-size-xs': 'Extra-small font size.',
	'--ck-font-size-sm': 'Small font size.',
	'--ck-font-size-md': 'Medium font size.',
	'--ck-font-size-lg': 'Large font size.',
	'--ck-font-size-xl': 'Extra-large font size.',
	'--ck-font-weight-normal': 'Normal (400) font weight.',
	'--ck-font-weight-medium': 'Medium (500) font weight.',
	'--ck-font-weight-semibold': 'Semibold (600) font weight.',
	'--ck-font-weight-bold': 'Bold (700) font weight.',

	// ---- Foundation — Focus ----
	'--ck-focus-border-color': 'Border color on focus. Use instead of focus-ring when component has customizable border-width.',
	'--ck-focus-shadow-geometry': 'The spread geometry (offsets) of focus shadows. Shared by all focus shadow variants.',
	'--ck-focus-ring': 'Complete border shorthand (width + style + color) for focused elements.',
	'--ck-focus-shadow': 'Complete focus shadow (geometry + color).',
	'--ck-focus-shadow-disabled': 'Reduced focus shadow for disabled elements.',
	'--ck-focus-shadow-error': 'Focus shadow with error color.',
	'--ck-outline-fake-caret': 'Contrast outline for fake collapsed selections and carets.',

	// ---- Foundation — Other ----
	'--ck-opacity-disabled': 'Global opacity for disabled UI elements.',
	'--ck-size-min-height': 'Minimum height for UI components. Ensures consistent button height.',

	// ---- Foundation — Motion ----
	'--ck-duration-fast': 'Fast transition duration (e.g. 100ms).',
	'--ck-duration-base': 'Base transition duration (e.g. 200ms).',
	'--ck-duration-slow': 'Slow transition duration (e.g. 300ms).',
	'--ck-duration-slower': 'Slower transition duration (e.g. 500ms).',
	'--ck-ease-standard': 'Standard easing curve for UI transitions.',
	'--ck-ease-interactive': 'Easing curve optimized for interactive elements.',
	'--ck-ease-emphasized': 'Emphasized easing curve for dramatic transitions.',
	'--ck-animation-duration-fast': 'Fast animation duration. Derived from duration-fast.',
	'--ck-animation-duration-base': 'Base animation duration. Derived from duration-base.',
	'--ck-animation-duration-slow': 'Slow animation duration. Derived from duration-slow.',
	'--ck-animation-duration-emphasis': 'Duration for emphasis animations.',
	'--ck-animation-duration-reduced': 'Animation duration for prefers-reduced-motion.',
	'--ck-animation-ease-standard': 'Standard animation easing. Derived from ease-standard.',
	'--ck-animation-ease-interactive': 'Interactive animation easing. Derived from ease-interactive.',
	'--ck-animation-ease-linear': 'Linear animation timing (no easing).',
	'--ck-animation-fill-both': 'fill-mode: both for animations.',
	'--ck-animation-repeat-infinite': 'Infinite repeat count for looping animations.',
	'--ck-animation-none': 'Resets animation to none (for disabling).',
	'--ck-transition-none': 'Resets transition to none (for disabling).',

	// ---- Foundation — Layers ----
	'--ck-z-base': 'Base z-index layer.',
	'--ck-z-overlay': 'Overlay z-index for panels above base content.',
	'--ck-z-modal': 'Modal z-index for dialogs and top-level overlays.',

	// ---- Semantic — Colors — Surface ----
	'--ck-color-surface-canvas': 'Base canvas background. Other surfaces derive from this.',
	'--ck-color-surface-control': 'Surface color for interactive controls.',
	'--ck-color-surface-container': 'Surface color for container elements (panels, dropdowns).',
	'--ck-color-surface-inverse': 'Inverted surface color (e.g. tooltip backgrounds).',
	'--ck-color-border-control': 'Border color for interactive controls.',
	'--ck-color-border-container': 'Border color for container elements.',
	'--ck-color-divider': 'Color for divider lines between sections.',

	// ---- Semantic — Colors — Text ----
	'--ck-color-text': 'General UI text color.',
	'--ck-color-text-primary': 'Primary text color for important content.',
	'--ck-color-text-secondary': 'Secondary text color for supporting content.',
	'--ck-color-text-disabled': 'Text color for disabled elements.',
	'--ck-color-text-inverse': 'Text on inverted surfaces (e.g. tooltips).',
	'--ck-color-text-error': 'Text color for error messages.',

	// ---- Semantic — Colors — Feedback ----
	'--ck-color-feedback-error': 'Error feedback color.',
	'--ck-color-feedback-warning': 'Warning feedback color.',
	'--ck-color-feedback-success': 'Success feedback color.',
	'--ck-color-feedback-highlight': 'Highlight/accent feedback color.',

	// ---- Semantic — Colors — Interactive ----
	'--ck-color-interactive-hover-surface': 'Background on hover for interactive elements.',
	'--ck-color-interactive-active-surface': 'Background on active/pressed for interactive elements.',
	'--ck-color-interactive-selected-surface': 'Background for selected/toggled-on elements.',
	'--ck-color-interactive-selected-surface-hover': 'Background for selected elements on hover.',
	'--ck-color-interactive-selected-text': 'Text color for selected interactive elements.',
	'--ck-color-interactive-primary-surface': 'Background for primary action buttons (e.g. save).',
	'--ck-color-interactive-primary-surface-hover': 'Hover background for primary action buttons.',
	'--ck-color-interactive-primary-text': 'Text color on primary action buttons.',
	'--ck-color-interactive-focus-border-coordinates': 'Raw HSL coordinates for focus border. Used in hsla() for sonar-pulse animations.',
	'--ck-color-interactive-focus-border': 'Focus border color for interactive elements.',
	'--ck-color-interactive-focus-shadow': 'Focus shadow color for interactive elements.',
	'--ck-color-interactive-focus-disabled-shadow': 'Focus shadow for disabled interactive elements.',
	'--ck-color-interactive-focus-error-shadow': 'Focus shadow for error-state interactive elements.',

	// ---- Semantic — Interactive Focus ----
	'--ck-interactive-focus-ring': 'Complete focus ring border shorthand for interactive elements.',
	'--ck-interactive-focus-border-color': 'Focus border color. Only changes color, preserving custom border-width.',
	'--ck-interactive-focus-shadow': 'Box-shadow applied on focus for interactive elements.',
	'--ck-interactive-focus-disabled-shadow': 'Focus box-shadow for disabled interactive elements.',
	'--ck-interactive-focus-error-shadow': 'Focus box-shadow for error-state interactive elements.',

	// ---- Semantic — Shape & Border ----
	'--ck-border-width-control': 'Border width for interactive controls.',
	'--ck-border-width-surface': 'Border width for surface/panel elements.',
	'--ck-border-width-divider': 'Border width for divider lines.',
	'--ck-border-width-emphasis': 'Thicker border width for emphasis.',
	'--ck-border-radius-control': 'Border radius for interactive controls (buttons, inputs). Inherits from radius-base.',
	'--ck-border-radius-surface': 'Border radius for elevated surfaces (panels, dropdowns). Inherits from radius-base.',
	'--ck-border-radius-uniform': 'Set to a radius value to disable attached-corner behavior on all panels at once.',
	'--ck-border-radius-surface-attached': 'Base radius for panels that visually attach to a trigger.',
	'--ck-border-radius-surface-attached-top': 'Radius for panels attached at the top edge.',
	'--ck-border-radius-surface-attached-bottom': 'Radius for panels attached at the bottom edge.',
	'--ck-border-radius-surface-cut-top-left': 'Radius cut on top-left corner (e.g. split button open state).',
	'--ck-border-radius-surface-cut-top-right': 'Radius cut on top-right corner.',
	'--ck-border-radius-surface-cut-bottom-right': 'Radius cut on bottom-right corner.',
	'--ck-border-radius-surface-cut-bottom-left': 'Radius cut on bottom-left corner.',

	// ---- Semantic — Spacing ----
	'--ck-spacing-control-padding-block': 'Vertical padding for controls (buttons, inputs).',
	'--ck-spacing-control-padding-inline': 'Horizontal padding for controls.',
	'--ck-spacing-control-padding-inline-compact': 'Reduced horizontal padding for compact controls.',
	'--ck-spacing-control-padding-inline-start-compact': 'Reduced start-side padding for compact controls.',
	'--ck-spacing-control-padding-block-regular': 'Regular vertical padding for controls.',
	'--ck-spacing-control-padding-block-compact': 'Compact vertical padding for controls.',
	'--ck-spacing-control-icon-gap': 'Gap between icon and label in controls.',
	'--ck-spacing-control-meta-gap': 'Gap between label and meta info (e.g. keystroke).',
	'--ck-spacing-surface-padding-inline': 'Horizontal padding inside surface containers.',
	'--ck-spacing-surface-padding-block': 'Vertical padding inside surface containers.',
	'--ck-spacing-surface-item-gap-inline': 'Horizontal gap between items in surface containers.',
	'--ck-spacing-surface-item-gap-block': 'Vertical gap between items in surface containers.',
	'--ck-spacing-surface-section-gap-block': 'Vertical gap between sections in surface containers.',
	'--ck-spacing-region-padding-inline': 'Horizontal padding for region containers.',
	'--ck-spacing-region-padding-inline-wide': 'Wider horizontal padding for region containers.',
	'--ck-spacing-region-padding-block': 'Vertical padding for region containers.',
	'--ck-spacing-region-edge-margin-block': 'Vertical margin at region edges.',

	// ---- Semantic — Typography ----
	'--ck-font-weight-ui-default': 'Default font weight for UI elements.',
	'--ck-font-weight-ui-strong': 'Strong/emphasized font weight in UI.',
	'--ck-font-weight-ui-heading': 'Font weight for UI headings/section titles.',
	'--ck-font-weight-ui-label': 'Font weight for labels.',
	'--ck-font-weight-ui-emphasis': 'Font weight for emphasized UI text.',
	'--ck-font-weight-ui-muted': 'Font weight for de-emphasized/muted text.',
	'--ck-font-weight-ui-inherit': 'Inherits font weight from parent. Used for pass-through.',

	// ---- Semantic — Layout ----
	'--ck-size-control-min-height': 'Shared min-height for controls. Ensures consistent sizing across buttons, inputs, etc.',

	// ---- Semantic — Shadow ----
	'--ck-shadow-surface-floating': 'Shadow for floating/elevated surfaces (dropdowns, balloons, dialogs).',

	// ---- Semantic — Motion ----
	'--ck-transition-duration-control-fast': 'Fast transition for controls.',
	'--ck-transition-duration-control': 'Default transition duration for controls.',
	'--ck-transition-duration-control-emphasized': 'Emphasized (slower) transition for controls.',
	'--ck-transition-duration-surface': 'Transition duration for surface/panel elements.',
	'--ck-transition-timing-function-control': 'Easing function for control transitions.',
	'--ck-transition-timing-function-control-emphasized': 'Easing for emphasized control transitions.',
	'--ck-transition-timing-function-surface': 'Easing function for surface transitions.',
	'--ck-animation-duration-feedback': 'Duration for feedback animations (e.g. success/error).',
	'--ck-animation-duration-surface-entrance': 'Duration for surface entrance animations.',
	'--ck-animation-duration-progress': 'Duration for progress/loading animations.',
	'--ck-animation-duration-progress-reduced': 'Reduced-motion duration for progress animations.',
	'--ck-animation-timing-function-feedback': 'Easing function for feedback animations.',
	'--ck-animation-timing-function-progress': 'Easing function for progress animations.',
	'--ck-animation-fill-mode-feedback': 'Fill mode for feedback animations.',

	// ---- Semantic — Layer ----
	'--ck-layer-base': 'Base stacking layer for UI elements.',
	'--ck-layer-control-raised': 'Layer for raised controls (e.g. focused buttons).',
	'--ck-layer-panel': 'Default layer for panels.',
	'--ck-layer-panel-above': 'Layer for panels that stack above others.',
	'--ck-layer-panel-below': 'Layer for panels that stack below others.',
	'--ck-layer-dialog': 'Layer for modal dialogs.',
	'--ck-layer-tooltip': 'Layer for tooltips (topmost UI layer).',
	'--ck-layer-balloon-arrow-back': 'Layer for balloon panel arrow background.',
	'--ck-layer-balloon-arrow-front': 'Layer for balloon panel arrow foreground.',

	// ---- Component — Button ----
	'--ck-button-padding': 'Padding inside buttons.',
	'--ck-button-border-radius': 'Border radius for buttons.',
	'--ck-button-border': 'Border shorthand for buttons.',
	'--ck-button-default-background-color': 'Background for default button state.',
	'--ck-button-default-hover-background-color': 'Background on hover for default buttons.',
	'--ck-button-default-active-background-color': 'Background on active for default buttons.',
	'--ck-button-default-disabled-background-color': 'Background for disabled default buttons.',
	'--ck-button-on-background-color': 'Background for toggled-on buttons.',
	'--ck-button-on-hover-background-color': 'Background on hover for toggled-on buttons.',
	'--ck-button-on-active-background-color': 'Background on active for toggled-on buttons.',
	'--ck-button-on-disabled-background-color': 'Background for disabled toggled-on buttons.',
	'--ck-button-on-text-color': 'Text color for toggled-on buttons.',
	'--ck-button-action-background-color': 'Background for primary action buttons.',
	'--ck-button-action-hover-background-color': 'Background on hover for action buttons.',
	'--ck-button-action-active-background-color': 'Background on active for action buttons.',
	'--ck-button-action-disabled-background-color': 'Background for disabled action buttons.',
	'--ck-button-action-text-color': 'Text color for action buttons.',
	'--ck-button-save-color': 'Icon/text color for save buttons.',
	'--ck-button-cancel-color': 'Icon/text color for cancel buttons.',
	'--ck-button-focus-border-color': 'Border color on button focus. Only changes color, preserving custom border-width.',
	'--ck-button-opacity-disabled': 'Opacity for disabled button icons and labels.',

	// ---- Component — Input ----
	'--ck-input-width': 'Default width for input fields.',
	'--ck-input-padding': 'Padding inside input fields.',
	'--ck-input-border-radius': 'Border radius for input fields.',
	'--ck-input-border': 'Border shorthand for input fields.',
	'--ck-input-background-color': 'Background color for input fields.',
	'--ck-input-border-color': 'Border color for input fields.',
	'--ck-input-error-border-color': 'Border color for inputs in error state.',
	'--ck-input-text-color': 'Text color inside input fields.',
	'--ck-input-disabled-background-color': 'Background for disabled inputs.',
	'--ck-input-disabled-border-color': 'Border color for disabled inputs.',
	'--ck-input-disabled-text-color': 'Text color for disabled inputs.',
	'--ck-input-focus-border-color': 'Border color on input focus. Only changes color, preserving custom border-width.',
	'--ck-input-text-width': 'Width for text-type input fields.',

	// ---- Component — Toolbar ----
	'--ck-toolbar-item-gap-inline': 'Horizontal gap between toolbar items.',
	'--ck-toolbar-padding': 'Padding inside the toolbar.',
	'--ck-toolbar-border-radius': 'Border radius for the toolbar container.',
	'--ck-toolbar-vertical-button-border-radius': 'Border radius for buttons inside vertical toolbars. Defaults to 0.',
	'--ck-toolbar-compact-uniform-border-radius': 'Uniform radius for compact toolbars. Disables cut-corner behavior.',
	'--ck-toolbar-background-color': 'Background color for the toolbar.',
	'--ck-toolbar-border-color': 'Border color for the toolbar.',
	'--ck-toolbar-border': 'Border shorthand for the toolbar.',

	// ---- Component — Block Toolbar ----
	'--ck-block-toolbar-button-size': 'Size (width/height) of the block toolbar trigger button.',

	// ---- Component — Dropdown ----
	'--ck-dropdown-arrow-size': 'Size of the dropdown arrow icon.',
	'--ck-dropdown-panel-padding': 'Inner padding of dropdown panels. Defaults to 0.',
	'--ck-dropdown-panel-border-radius': 'Border radius for dropdown panels.',
	'--ck-dropdown-panel-uniform-border-radius': 'Set to a radius value to disable attached-corner behavior on dropdown panels.',
	'--ck-dropdown-panel-background-color': 'Background color for dropdown panels.',
	'--ck-dropdown-panel-border-color': 'Border color for dropdown panels.',
	'--ck-dropdown-list-background-color': 'Background of lists inside dropdown panels. Transparent by default to respect panel corners.',
	'--ck-dropdown-panel-border': 'Border shorthand for dropdown panels.',

	// ---- Component — List ----
	'--ck-list-item-min-width': 'Minimum width for list items.',
	'--ck-list-padding': 'Padding inside list containers.',
	'--ck-list-item-outer-padding': 'Padding on the list item wrapper. Defaults to 0 — set to add spacing around items.',
	'--ck-list-border-radius': 'Border radius for list containers.',
	'--ck-list-background-color': 'Background color for list containers.',
	'--ck-list-divider-color': 'Color of dividers between list items.',
	'--ck-list-button-hover-background-color': 'Background on hover for list item buttons.',
	'--ck-list-button-on-background-color': 'Background for selected list item buttons.',
	'--ck-list-button-on-text-color': 'Text color for selected list item buttons.',
	'--ck-list-group-label-font-size': 'Font size for list group labels/headers.',

	// ---- Component — List Item Button ----
	'--ck-list-item-button-padding': 'Padding inside list item buttons.',
	'--ck-list-item-button-border-radius': 'Border radius for list item buttons. Defaults to 0 for seamless stacking.',

	// ---- Component — List Dropdown ----
	'--ck-list-dropdown-uniform-border-radius': 'Uniform radius for list dropdown panels and first/last item buttons.',

	// ---- Component — Dropdown Menu Panel ----
	'--ck-dropdown-menu-panel-max-height': 'Maximum height for dropdown menu panels.',
	'--ck-dropdown-menu-panel-border-radius': 'Border radius for dropdown menu panels.',
	'--ck-dropdown-menu-panel-uniform-border-radius': 'Uniform radius for nested dropdown menu panels.',

	// ---- Component — Dropdown Menu List Item ----
	'--ck-dropdown-menu-menu-item-min-width': 'Minimum width for dropdown menu items.',
	'--ck-dropdown-menu-list-item-spinner-size': 'Size of spinner in dropdown menu list items.',

	// ---- Component — Menu Bar ----
	'--ck-menu-bar-button-border-radius': 'Border radius for sub-menu buttons in menu bar. Defaults to 0.',
	'--ck-menu-bar-panel-border-radius': 'Border radius for menu bar panels.',
	'--ck-menu-bar-panel-uniform-border-radius': 'Uniform radius for menu bar panels. Disables attached-corner behavior.',
	'--ck-menu-bar-item-focus-border-color': 'Focus border color for menu bar items.',
	'--ck-menu-bar-list-item-button-border-radius': 'Border radius for menu bar list item buttons. Defaults to 0.',

	// ---- Component — Menu Bar List Item (from group) ----
	'--ck-menu-bar-menu-item-min-width': 'Minimum width for menu bar menu items.',

	// ---- Component — Dialog ----
	'--ck-dialog-max-height': 'Maximum height for dialogs.',
	'--ck-dialog-max-width': 'Maximum width for dialogs.',
	'--ck-dialog-border-radius': 'Border radius for dialogs.',
	'--ck-dialog-border': 'Border shorthand for dialogs.',
	'--ck-dialog-background-color': 'Background color for dialogs.',
	'--ck-dialog-overlay-background-color': 'Background color for the dialog overlay/backdrop.',

	// ---- Component — Balloon Panel ----
	'--ck-balloon-panel-border-radius': 'Border radius for balloon panels.',
	'--ck-balloon-panel-border': 'Complete border shorthand for balloon panels.',
	'--ck-balloon-panel-background-color': 'Background color for balloon panels.',
	'--ck-balloon-panel-border-color': 'Border color for balloon panels.',
	'--ck-balloon-panel-arrow-display': 'Arrow visibility. Set to "none" to hide all balloon arrows.',

	// ---- Component — Sticky Panel ----
	'--ck-sticky-panel-uniform-border-radius': 'Uniform radius for the sticky panel.',

	// ---- Component — Tooltip ----
	'--ck-tooltip-max-width': 'Maximum width for tooltips.',
	'--ck-tooltip-padding': 'Padding inside tooltips.',
	'--ck-tooltip-border': 'Border shorthand for tooltips. Defaults to transparent.',
	'--ck-tooltip-background-color': 'Background color for tooltips.',
	'--ck-tooltip-text-color': 'Text color for tooltips.',
	'--ck-tooltip-text-font-size': 'Font size for tooltip text.',

	// ---- Component — Switch Button ----
	'--ck-switch-button-toggle-border-radius': 'Border radius for the switch toggle track.',
	'--ck-switch-button-toggle-inner-border-radius': 'Border radius of the toggle handle inside switch buttons.',
	'--ck-switch-button-off-background-color': 'Track background when switch is off.',
	'--ck-switch-button-off-hover-background-color': 'Track background on hover when switch is off.',
	'--ck-switch-button-on-background-color': 'Track background when switch is on.',
	'--ck-switch-button-on-hover-background-color': 'Track background on hover when switch is on.',
	'--ck-switch-button-inner-background-color': 'Background of the switch toggle handle.',

	// ---- Component — Form Header ----
	'--ck-form-header-height': 'Height of form section headers. Set to "auto" for content-driven height.',
	'--ck-form-header-padding-block': 'Vertical padding for form headers.',
	'--ck-form-header-label-font-size': 'Font size for form header labels.',

	// ---- Component — Form ----
	'--ck-form-default-width': 'Default width for form panels.',
	'--ck-form-padding': 'Padding inside form panels.',

	// ---- Component — Form Row ----
	'--ck-form-row-padding': 'Padding inside form rows.',

	// ---- Component — Labeled Field ----
	'--ck-labeled-field-label-background-color': 'Background for floating labels on labeled fields.',
	'--ck-labeled-field-label-start-gap': 'Start-side gap for labeled field labels.',

	// ---- Component — Editor UI ----
	'--ck-editor-editable-padding': 'Padding inside the editor editable area.',
	'--ck-editor-frame-border-radius': 'Border radius for the editor frame.',
	'--ck-editor-sticky-panel-border-radius': 'Border radius for the editor sticky panel.',
	'--ck-editor-frame-border': 'Border shorthand for the editor frame.',
	'--ck-editor-frame-border-color': 'Border color for the editor frame.',
	'--ck-editor-editable-focus-border-color': 'Border color on editor editable focus. Only changes color, preserving border-width.',

	// ---- Component — Accessibility Help ----
	'--ck-accessibility-help-dialog-max-height': 'Max height for the accessibility help dialog.',
	'--ck-accessibility-help-dialog-max-width': 'Max width for the accessibility help dialog.',

	// ---- Component — Color Selector ----
	'--ck-color-selector-padding': 'Root padding on the color selector component.',
	'--ck-color-selector-uniform-border-radius': 'Uniform radius for the color selector picker button.',
	'--ck-color-selector-color-picker-border-top':
		'Top border on the color picker button (unfocused). Set to "none" to remove the divider.',

	// ---- Component — Color Grid ----
	'--ck-color-grid-tile-size': 'Size (width/height) of color grid tiles.',
	'--ck-color-grid-gap': 'Gap between color grid tiles.',
	'--ck-color-grid-margin': 'Outer margin of the color grid container.',
	'--ck-color-grid-padding': 'Padding inside the color grid container.',
	'--ck-color-grid-tile-border-radius': 'Border radius for color grid tiles.',
	'--ck-color-grid-tile-hover-transform': 'Transform on tile hover. Set to e.g. scale(1.3) for zoom effect.',
	'--ck-color-grid-tile-hover-layer': 'Z-index for hovered/focused tiles. Set to 1 so transformed tiles appear above neighbors.',

	// ---- Component — Search ----
	'--ck-search-results-info-padding': 'Padding for search results info section.',

	// ---- Component — Icon ----
	'--ck-icon-size': 'Default size for icons.',

	// ---- Component — Spinner ----
	'--ck-toolbar-spinner-size': 'Size of the spinner shown in the toolbar.',

	// ---- Component — Collapsible ----
	'--ck-collapsible-children-padding': 'Padding for collapsible section children.',
	'--ck-collapsible-button-font-weight': 'Font weight for collapsible toggle buttons.',

	// ---- Component — Autocomplete ----
	'--ck-autocomplete-results-max-height': 'Max height for autocomplete results panel.',
	'--ck-autocomplete-results-border-radius': 'Border radius for autocomplete results panel.',
	'--ck-autocomplete-results-uniform-border-radius': 'Uniform radius for autocomplete results. Disables attached-corner behavior.',
	'--ck-autocomplete-results-border': 'Border shorthand for autocomplete results panel.',
	'--ck-autocomplete-results-background-color': 'Background for autocomplete results panel.',

	// ---- Component — Responsive Form ----
	'--ck-responsive-form-padding': 'Padding for responsive form containers.',
	'--ck-responsive-form-divider-border': 'Border for dividers in responsive forms.'
};
/* eslint-enable max-len */

// ---------------------------------------------------------------------------
// Token diagrams — inline SVGs showing where a token applies visually.
// Only tokens that benefit from a visual explanation are listed.
// ---------------------------------------------------------------------------

/* eslint-disable max-len */
const TOKEN_DIAGRAMS = {
	// ---- Semantic — Spacing ----
	'--ck-spacing-control-padding-block': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="8" width="160" height="56" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="120" y="42" text-anchor="middle" font-size="11" fill="#555">Button</text>
		<line x1="120" y1="8" x2="120" y2="20" stroke="#e65100" stroke-width="1.5" marker-start="url(#ah)" marker-end="url(#ah)"/>
		<line x1="120" y1="52" x2="120" y2="64" stroke="#e65100" stroke-width="1.5" marker-start="url(#ah)" marker-end="url(#ah)"/>
		<rect x="41" y="9" width="158" height="12" fill="#fff3e0" opacity="0.7"/>
		<rect x="41" y="51" width="158" height="12" fill="#fff3e0" opacity="0.7"/>
		<defs><marker id="ah" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4"
		orient="auto"><path d="M0,0 L6,3 L0,6" fill="#e65100"/></marker></defs>
	</svg>`,

	'--ck-spacing-control-padding-inline': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="4" width="160" height="48" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="120" y="34" text-anchor="middle" font-size="11" fill="#555">Button</text>
		<line x1="40" y1="28" x2="62" y2="28" stroke="#e65100" stroke-width="1.5" marker-start="url(#ai)" marker-end="url(#ai)"/>
		<line x1="178" y1="28" x2="200" y2="28" stroke="#e65100" stroke-width="1.5" marker-start="url(#ai)" marker-end="url(#ai)"/>
		<rect x="41" y="5" width="20" height="46" fill="#fff3e0" opacity="0.7"/>
		<rect x="179" y="5" width="20" height="46" fill="#fff3e0" opacity="0.7"/>
		<defs><marker id="ai" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4"
		orient="auto"><path d="M0,0 L6,3 L0,6" fill="#e65100"/></marker></defs>
	</svg>`,

	'--ck-spacing-surface-padding-inline': `<svg viewBox="0 0 240 64" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="220" height="56" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="30" y="16" width="50" height="32" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="86" y="16" width="50" height="32" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<text x="55" y="36" text-anchor="middle" font-size="9" fill="#555">Item</text>
		<text x="111" y="36" text-anchor="middle" font-size="9" fill="#555">Item</text>
		<rect x="11" y="5" width="18" height="54" fill="#fff3e0" opacity="0.7"/>
		<rect x="211" y="5" width="18" height="54" fill="#fff3e0" opacity="0.7"/>
		<text x="180" y="36" font-size="8" fill="#e65100">padding</text>
	</svg>`,

	'--ck-spacing-surface-item-gap-inline': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="220" height="48" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="24" y="12" width="56" height="32" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="102" y="12" width="56" height="32" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<text x="52" y="32" text-anchor="middle" font-size="9" fill="#555">Item</text>
		<text x="130" y="32" text-anchor="middle" font-size="9" fill="#555">Item</text>
		<rect x="80" y="12" width="22" height="32" fill="#fff3e0" opacity="0.7" rx="2"/>
		<line x1="80" y1="28" x2="102" y2="28" stroke="#e65100" stroke-width="1.5" marker-start="url(#ag)" marker-end="url(#ag)"/>
		<text x="91" y="50" text-anchor="middle" font-size="7" fill="#e65100">gap</text>
		<defs><marker id="ag" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4"
		orient="auto"><path d="M0,0 L6,3 L0,6" fill="#e65100"/></marker></defs>
	</svg>`,

	// ---- Semantic — Shape ----
	'--ck-border-radius-control': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="4" width="160" height="48" rx="12" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="120" y="34" text-anchor="middle" font-size="11" fill="#555">Button</text>
		<path d="M40,16 L40,4 Q40,4 52,4" fill="none" stroke="#e65100" stroke-width="2"/>
		<circle cx="40" cy="16" r="2" fill="#e65100"/>
		<circle cx="52" cy="4" r="2" fill="#e65100"/>
		<text x="26" y="28" font-size="8" fill="#e65100">r</text>
	</svg>`,

	'--ck-border-radius-surface': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="64" rx="12" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<text x="120" y="24" text-anchor="middle" font-size="10" fill="#777">Panel / Dropdown</text>
		<rect x="36" y="34" width="72" height="24" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<text x="72" y="50" text-anchor="middle" font-size="9" fill="#555">Item</text>
		<path d="M20,20 L20,4 Q20,4 36,4" fill="none" stroke="#e65100" stroke-width="2"/>
		<circle cx="20" cy="20" r="2" fill="#e65100"/>
		<circle cx="36" cy="4" r="2" fill="#e65100"/>
		<text x="6" y="30" font-size="8" fill="#e65100">r</text>
	</svg>`,

	// ---- Semantic — Colors ----
	'--ck-color-surface-container': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="64" rx="6" fill="#bbdefb" stroke="#1976d2" stroke-width="1.5" stroke-dasharray="4 2"/>
		<text x="120" y="24" text-anchor="middle" font-size="10" fill="#1565c0">container surface</text>
		<rect x="36" y="34" width="72" height="24" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="116" y="34" width="72" height="24" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<text x="72" y="50" text-anchor="middle" font-size="9" fill="#555">Item</text>
		<text x="152" y="50" text-anchor="middle" font-size="9" fill="#555">Item</text>
	</svg>`,

	'--ck-color-border-control': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="4" width="160" height="48" rx="4" fill="#e8e8e8" stroke="#e65100" stroke-width="2.5" stroke-dasharray="6 2"/>
		<text x="120" y="22" text-anchor="middle" font-size="11" fill="#555">Input</text>
		<text x="120" y="42" text-anchor="middle" font-size="8" fill="#e65100">border-color</text>
	</svg>`,

	'--ck-color-interactive-hover-surface': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="68" height="48" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="54" y="32" text-anchor="middle" font-size="9" fill="#555">Normal</text>
		<rect x="100" y="4" width="68" height="48" rx="4" fill="#bbdefb" stroke="#999" stroke-width="1"/>
		<text x="134" y="26" text-anchor="middle" font-size="9" fill="#1565c0">Hovered</text>
		<text x="134" y="42" text-anchor="middle" font-size="7" fill="#1565c0">← this color</text>
		<text x="202" y="32" font-size="16" fill="#777">☝</text>
	</svg>`,

	'--ck-color-interactive-selected-surface': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="12" y="4" width="52" height="48" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="38" y="32" text-anchor="middle" font-size="9" fill="#555">Off</text>
		<rect x="72" y="4" width="52" height="48" rx="4" fill="#bbdefb" stroke="#1976d2" stroke-width="1.5"/>
		<text x="98" y="26" text-anchor="middle" font-size="9" fill="#1565c0">On</text>
		<text x="98" y="42" text-anchor="middle" font-size="7" fill="#1565c0">selected</text>
		<rect x="132" y="4" width="52" height="48" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="158" y="32" text-anchor="middle" font-size="9" fill="#555">Off</text>
	</svg>`,

	// ---- Semantic — Shadow ----
	'--ck-shadow-surface-floating': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="60" y="8" width="120" height="20" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<text x="120" y="22" text-anchor="middle" font-size="9" fill="#555">Toolbar</text>
		<rect x="48" y="32" width="144" height="44" rx="6" fill="white" stroke="#ccc" stroke-width="1" filter="url(#ds)"/>
		<text x="120" y="50" text-anchor="middle" font-size="9" fill="#555">Floating panel</text>
		<text x="120" y="66" text-anchor="middle" font-size="7" fill="#e65100">↑ shadow applied here</text>
		<defs><filter id="ds" x="-10%" y="-10%" width="130%" height="140%">
		<feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.2"/></filter></defs>
	</svg>`,

	// ---- Semantic — Border width ----
	'--ck-border-width-control': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="90" height="48" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="65" y="22" text-anchor="middle" font-size="9" fill="#555">1px border</text>
		<text x="65" y="38" text-anchor="middle" font-size="8" fill="#999">thin</text>
		<rect x="130" y="4" width="90" height="48" rx="4" fill="#e8e8e8" stroke="#e65100" stroke-width="3"/>
		<text x="175" y="22" text-anchor="middle" font-size="9" fill="#555">3px border</text>
		<text x="175" y="38" text-anchor="middle" font-size="8" fill="#e65100">thick</text>
	</svg>`,

	// ---- Semantic — Divider ----
	'--ck-color-divider': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="220" height="48" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="24" y="12" width="56" height="32" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<text x="52" y="32" text-anchor="middle" font-size="9" fill="#555">Item</text>
		<line x1="94" y1="10" x2="94" y2="46" stroke="#e65100" stroke-width="2"/>
		<rect x="108" y="12" width="56" height="32" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<text x="136" y="32" text-anchor="middle" font-size="9" fill="#555">Item</text>
		<text x="94" y="54" text-anchor="middle" font-size="7" fill="#e65100">divider</text>
	</svg>`,

	// ---- Semantic — Spacing (additional) ----
	'--ck-spacing-control-icon-gap': `<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="40" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<rect x="40" y="12" width="20" height="24" rx="2" fill="#bbb"/>
		<text x="50" y="28" text-anchor="middle" font-size="7" fill="#fff">ic</text>
		<text x="120" y="30" text-anchor="middle" font-size="10" fill="#555">Label</text>
		<rect x="60" y="12" width="18" height="24" fill="#fff3e0" opacity="0.7" rx="2"/>
		<line x1="60" y1="24" x2="78" y2="24" stroke="#e65100" stroke-width="1.5"/>
		<text x="69" y="44" text-anchor="middle" font-size="7" fill="#e65100">gap</text>
	</svg>`,

	'--ck-spacing-control-meta-gap': `<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="220" height="40" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="80" y="30" text-anchor="middle" font-size="10" fill="#555">Label</text>
		<text x="170" y="30" text-anchor="middle" font-size="9" fill="#999">Ctrl+B</text>
		<rect x="118" y="12" width="20" height="24" fill="#fff3e0" opacity="0.7" rx="2"/>
		<line x1="118" y1="24" x2="138" y2="24" stroke="#e65100" stroke-width="1.5"/>
		<text x="128" y="44" text-anchor="middle" font-size="7" fill="#e65100">meta gap</text>
	</svg>`,

	'--ck-spacing-surface-padding-block': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="72" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="36" y="20" width="168" height="14" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="36" y="40" width="168" height="14" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="21" y="5" width="198" height="14" fill="#fff3e0" opacity="0.6"/>
		<rect x="21" y="57" width="198" height="18" fill="#fff3e0" opacity="0.6"/>
		<line x1="120" y1="4" x2="120" y2="18" stroke="#e65100" stroke-width="1.5"/>
		<line x1="120" y1="58" x2="120" y2="76" stroke="#e65100" stroke-width="1.5"/>
	</svg>`,

	'--ck-spacing-surface-item-gap-block': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="72" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="36" y="12" width="168" height="18" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<text x="120" y="25" text-anchor="middle" font-size="9" fill="#555">Item</text>
		<rect x="36" y="48" width="168" height="18" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<text x="120" y="61" text-anchor="middle" font-size="9" fill="#555">Item</text>
		<rect x="36" y="30" width="168" height="18" fill="#fff3e0" opacity="0.6" rx="2"/>
		<line x1="120" y1="30" x2="120" y2="48" stroke="#e65100" stroke-width="1.5"/>
		<text x="120" y="43" text-anchor="middle" font-size="7" fill="#e65100">gap</text>
	</svg>`,

	'--ck-spacing-surface-section-gap-block': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="220" height="64" rx="4" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="20" y="10" width="30" height="24" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="54" y="10" width="30" height="24" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="100" y="10" width="30" height="24" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="134" y="10" width="30" height="24" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<line x1="88" y1="8" x2="88" y2="36" stroke="#bbb" stroke-width="1"/>
		<rect x="84" y="38" width="8" height="12" fill="#fff3e0" opacity="0.8" rx="1"/>
		<text x="88" y="48" text-anchor="middle" font-size="6" fill="#e65100">|</text>
		<text x="88" y="64" text-anchor="middle" font-size="7" fill="#e65100">section gap</text>
	</svg>`,

	'--ck-spacing-region-padding-inline': `<svg viewBox="0 0 240 64" xmlns="http://www.w3.org/2000/svg">
		<rect x="4" y="4" width="232" height="56" rx="0" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<rect x="24" y="12" width="192" height="40" rx="6" fill="#f5f5f5" stroke="#bbb" stroke-width="1"/>
		<text x="120" y="36" text-anchor="middle" font-size="10" fill="#555">Editor region</text>
		<rect x="5" y="5" width="18" height="54" fill="#fff3e0" opacity="0.7"/>
		<rect x="217" y="5" width="18" height="54" fill="#fff3e0" opacity="0.7"/>
		<text x="120" y="58" text-anchor="middle" font-size="7" fill="#e65100">region padding inline</text>
	</svg>`,

	'--ck-spacing-region-padding-block': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="64" rx="0" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<rect x="30" y="18" width="180" height="32" rx="6" fill="#f5f5f5" stroke="#bbb" stroke-width="1"/>
		<text x="120" y="38" text-anchor="middle" font-size="10" fill="#555">Editor region</text>
		<rect x="21" y="5" width="198" height="12" fill="#fff3e0" opacity="0.7"/>
		<rect x="21" y="55" width="198" height="12" fill="#fff3e0" opacity="0.7"/>
		<line x1="120" y1="4" x2="120" y2="16" stroke="#e65100" stroke-width="1.5"/>
		<line x1="120" y1="56" x2="120" y2="68" stroke="#e65100" stroke-width="1.5"/>
	</svg>`,

	'--ck-size-control-min-height': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="30" y="4" width="44" height="48" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<rect x="40" y="16" width="24" height="24" rx="2" fill="#bbb"/>
		<rect x="100" y="4" width="110" height="48" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="155" y="32" text-anchor="middle" font-size="10" fill="#555">With label</text>
		<line x1="14" y1="4" x2="14" y2="52" stroke="#e65100" stroke-width="1.5"/>
		<text x="10" y="32" text-anchor="middle" font-size="6" fill="#e65100" transform="rotate(-90 10 32)">min-height</text>
	</svg>`,

	// ---- Semantic — Spacing (compact variants, shared) ----
	'--ck-spacing-control-padding-inline-compact': `<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="100" height="40" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="60" y="28" text-anchor="middle" font-size="9" fill="#555">Regular</text>
		<rect x="11" y="5" width="20" height="38" fill="#c8e6c9" opacity="0.6"/>
		<rect x="89" y="5" width="20" height="38" fill="#c8e6c9" opacity="0.6"/>
		<rect x="130" y="4" width="80" height="40" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="170" y="28" text-anchor="middle" font-size="9" fill="#555">Compact</text>
		<rect x="131" y="5" width="12" height="38" fill="#fff3e0" opacity="0.7"/>
		<rect x="197" y="5" width="12" height="38" fill="#fff3e0" opacity="0.7"/>
		<text x="170" y="48" text-anchor="middle" font-size="7" fill="#e65100">← narrower</text>
	</svg>`,

	'--ck-spacing-control-padding-block-regular': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="100" height="48" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="60" y="32" text-anchor="middle" font-size="9" fill="#555">Regular</text>
		<rect x="11" y="5" width="98" height="10" fill="#fff3e0" opacity="0.7"/>
		<rect x="11" y="41" width="98" height="10" fill="#fff3e0" opacity="0.7"/>
		<rect x="130" y="8" width="100" height="40" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="180" y="32" text-anchor="middle" font-size="9" fill="#555">Compact</text>
		<rect x="131" y="9" width="98" height="6" fill="#c8e6c9" opacity="0.6"/>
		<rect x="131" y="41" width="98" height="6" fill="#c8e6c9" opacity="0.6"/>
	</svg>`,

	'--ck-spacing-control-padding-block-compact': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="100" height="48" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="60" y="32" text-anchor="middle" font-size="9" fill="#555">Regular</text>
		<rect x="11" y="5" width="98" height="10" fill="#c8e6c9" opacity="0.6"/>
		<rect x="11" y="41" width="98" height="10" fill="#c8e6c9" opacity="0.6"/>
		<rect x="130" y="8" width="100" height="40" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="180" y="32" text-anchor="middle" font-size="9" fill="#555">Compact</text>
		<rect x="131" y="9" width="98" height="6" fill="#fff3e0" opacity="0.7"/>
		<rect x="131" y="41" width="98" height="6" fill="#fff3e0" opacity="0.7"/>
		<text x="180" y="54" text-anchor="middle" font-size="7" fill="#e65100">← shorter</text>
	</svg>`,

	// ---- Semantic — Shape (additional) ----
	'--ck-border-radius-uniform': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="100" height="28" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<text x="60" y="22" text-anchor="middle" font-size="8" fill="#555">Trigger</text>
		<rect x="10" y="30" width="100" height="46" rx="0" ry="0" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<text x="60" y="50" text-anchor="middle" font-size="8" fill="#999">Attached</text>
		<text x="60" y="62" text-anchor="middle" font-size="7" fill="#999">corners cut</text>
		<rect x="130" y="4" width="100" height="28" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<text x="180" y="22" text-anchor="middle" font-size="8" fill="#555">Trigger</text>
		<rect x="130" y="30" width="100" height="46" rx="6" fill="#f5f5f5" stroke="#e65100" stroke-width="1.5"/>
		<text x="180" y="50" text-anchor="middle" font-size="8" fill="#e65100">Uniform</text>
		<text x="180" y="62" text-anchor="middle" font-size="7" fill="#e65100">all corners</text>
	</svg>`,

	'--ck-border-radius-surface-attached': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="70" y="4" width="100" height="24" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<text x="120" y="20" text-anchor="middle" font-size="9" fill="#555">Trigger ▾</text>
		<rect x="50" y="28" width="140" height="48" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<text x="120" y="52" text-anchor="middle" font-size="9" fill="#555">Panel</text>
		<path d="M70,28 Q70,28 50,28" fill="none" stroke="#e65100" stroke-width="2"/>
		<text x="30" y="36" font-size="7" fill="#e65100">attached</text>
		<text x="30" y="46" font-size="7" fill="#e65100">radius</text>
	</svg>`,

	'--ck-border-radius-surface-attached-top': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="50" y="4" width="140" height="36" rx="6" fill="#f5f5f5" stroke="#e65100" stroke-width="1.5"/>
		<text x="120" y="26" text-anchor="middle" font-size="9" fill="#555">Panel (above)</text>
		<rect x="70" y="44" width="100" height="24" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<text x="120" y="60" text-anchor="middle" font-size="9" fill="#555">Trigger</text>
		<text x="120" y="78" text-anchor="middle" font-size="7" fill="#e65100">attached at top — bottom corners adjusted</text>
	</svg>`,

	'--ck-border-radius-surface-attached-bottom': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="70" y="4" width="100" height="24" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<text x="120" y="20" text-anchor="middle" font-size="9" fill="#555">Trigger</text>
		<rect x="50" y="32" width="140" height="36" rx="6" fill="#f5f5f5" stroke="#e65100" stroke-width="1.5"/>
		<text x="120" y="54" text-anchor="middle" font-size="9" fill="#555">Panel (below)</text>
		<text x="120" y="78" text-anchor="middle" font-size="7" fill="#e65100">attached at bottom — top corners adjusted</text>
	</svg>`,

	'--ck-border-radius-surface-cut-top-left': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="60" height="24" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<rect x="82" y="4" width="30" height="24" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<text x="50" y="20" text-anchor="middle" font-size="8" fill="#555">Action</text>
		<text x="97" y="20" text-anchor="middle" font-size="8" fill="#555">▾</text>
		<rect x="20" y="30" width="92" height="38" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="20" y="30" width="6" height="6" fill="#fff3e0" stroke="#e65100" stroke-width="1"/>
		<text x="40" y="54" font-size="8" fill="#e65100">cut corner</text>
		<text x="160" y="40" font-size="8" fill="#777">Split button open:</text>
		<text x="160" y="52" font-size="8" fill="#777">top-left corner cut</text>
		<text x="160" y="64" font-size="8" fill="#777">to match trigger</text>
	</svg>`,

	'--ck-border-radius-surface-cut-top-right': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="60" height="24" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<rect x="82" y="4" width="30" height="24" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<rect x="20" y="30" width="92" height="38" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="106" y="30" width="6" height="6" fill="#fff3e0" stroke="#e65100" stroke-width="1"/>
		<text x="40" y="54" font-size="8" fill="#e65100">top-right cut</text>
	</svg>`,

	'--ck-border-radius-surface-cut-bottom-right': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="30" width="92" height="38" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="106" y="62" width="6" height="6" fill="#fff3e0" stroke="#e65100" stroke-width="1"/>
		<text x="66" y="54" text-anchor="middle" font-size="8" fill="#e65100">bottom-right cut</text>
	</svg>`,

	'--ck-border-radius-surface-cut-bottom-left': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="30" width="92" height="38" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="20" y="62" width="6" height="6" fill="#fff3e0" stroke="#e65100" stroke-width="1"/>
		<text x="66" y="54" text-anchor="middle" font-size="8" fill="#e65100">bottom-left cut</text>
	</svg>`,

	'--ck-border-width-surface': `<svg viewBox="0 0 240 64" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="56" rx="6" fill="#f5f5f5" stroke="#e65100" stroke-width="2.5"/>
		<text x="120" y="28" text-anchor="middle" font-size="10" fill="#555">Panel</text>
		<text x="120" y="46" text-anchor="middle" font-size="8" fill="#e65100">border-width on surfaces</text>
	</svg>`,

	'--ck-border-width-divider': `<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="90" height="40" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<text x="55" y="28" text-anchor="middle" font-size="9" fill="#555">Section</text>
		<line x1="112" y1="8" x2="112" y2="40" stroke="#e65100" stroke-width="2.5"/>
		<rect x="124" y="4" width="90" height="40" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<text x="169" y="28" text-anchor="middle" font-size="9" fill="#555">Section</text>
		<text x="112" y="48" text-anchor="middle" font-size="7" fill="#e65100">divider width</text>
	</svg>`,

	// ---- Semantic — Focus ----
	'--ck-interactive-focus-ring': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="4" width="160" height="48" rx="4" fill="#e8e8e8" stroke="#1976d2" stroke-width="2"/>
		<text x="120" y="32" text-anchor="middle" font-size="10" fill="#555">Focused Button</text>
		<text x="120" y="48" text-anchor="middle" font-size="7" fill="#1976d2">← focus ring (border)</text>
	</svg>`,

	'--ck-interactive-focus-shadow': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="4" width="160" height="48" rx="4" fill="#e8e8e8" stroke="#1976d2" stroke-width="2" filter="url(#fs)"/>
		<text x="120" y="26" text-anchor="middle" font-size="10" fill="#555">Focused</text>
		<text x="120" y="42" text-anchor="middle" font-size="7" fill="#1976d2">outer glow = focus shadow</text>
		<defs><filter id="fs" x="-15%" y="-15%" width="130%" height="140%">
		<feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#1976d2" flood-opacity="0.4"/></filter></defs>
	</svg>`,

	// ---- Semantic — Surfaces comparison ----
	'--ck-color-surface-canvas': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="4" y="4" width="232" height="72" rx="0" fill="#bbdefb" stroke="#1976d2" stroke-width="1.5" stroke-dasharray="4 2"/>
		<text x="120" y="16" text-anchor="middle" font-size="8" fill="#1565c0">canvas (outermost)</text>
		<rect x="16" y="22" width="208" height="48" rx="4" fill="#e3f2fd" stroke="#999" stroke-width="1"/>
		<text x="60" y="40" font-size="8" fill="#555">control</text>
		<rect x="120" y="28" width="96" height="36" rx="4" fill="#e8eaf6" stroke="#999" stroke-width="1"/>
		<text x="168" y="50" text-anchor="middle" font-size="8" fill="#555">container</text>
	</svg>`,

	'--ck-color-surface-control': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="220" height="48" rx="4" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="24" y="12" width="80" height="32" rx="4" fill="#bbdefb" stroke="#1976d2" stroke-width="1.5" stroke-dasharray="4 2"/>
		<text x="64" y="32" text-anchor="middle" font-size="9" fill="#1565c0">control</text>
		<rect x="118" y="12" width="80" height="32" rx="4" fill="#bbdefb" stroke="#1976d2" stroke-width="1.5" stroke-dasharray="4 2"/>
		<text x="158" y="32" text-anchor="middle" font-size="9" fill="#1565c0">control</text>
	</svg>`,

	'--ck-color-surface-inverse': `<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">
		<rect x="60" y="4" width="120" height="40" rx="4" fill="#424242" stroke="#616161" stroke-width="1"/>
		<text x="120" y="22" text-anchor="middle" font-size="9" fill="#fff">Tooltip text</text>
		<text x="120" y="38" text-anchor="middle" font-size="7" fill="#bbb">inverted surface</text>
	</svg>`,

	'--ck-color-border-container': `<svg viewBox="0 0 240 64" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="56" rx="6" fill="#f5f5f5" stroke="#e65100" stroke-width="2" stroke-dasharray="6 2"/>
		<text x="120" y="28" text-anchor="middle" font-size="10" fill="#555">Container</text>
		<text x="120" y="46" text-anchor="middle" font-size="8" fill="#e65100">container border color</text>
	</svg>`,

	// ---- Semantic — Interactive (additional) ----
	'--ck-color-interactive-active-surface': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="68" height="48" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="54" y="32" text-anchor="middle" font-size="9" fill="#555">Normal</text>
		<rect x="100" y="6" width="68" height="48" rx="4" fill="#90caf9" stroke="#999" stroke-width="1"/>
		<text x="134" y="26" text-anchor="middle" font-size="9" fill="#1565c0">Pressed</text>
		<text x="134" y="42" text-anchor="middle" font-size="7" fill="#1565c0">active surface</text>
	</svg>`,

	'--ck-color-interactive-primary-surface': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="60" y="4" width="120" height="48" rx="4" fill="#26a69a" stroke="#00897b" stroke-width="1"/>
		<text x="120" y="26" text-anchor="middle" font-size="11" fill="#fff">Save</text>
		<text x="120" y="42" text-anchor="middle" font-size="7" fill="hsla(0,0%,100%,.8)">primary action surface</text>
	</svg>`,

	// ---- Semantic — Balloon arrow ----
	'--ck-balloon-panel-arrow-display': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="20" width="100" height="44" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<polygon points="50,20 58,8 66,20" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<text x="60" y="46" text-anchor="middle" font-size="9" fill="#555">Arrow</text>
		<rect x="130" y="20" width="100" height="44" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<text x="180" y="46" text-anchor="middle" font-size="9" fill="#555">No arrow</text>
		<text x="180" y="12" text-anchor="middle" font-size="8" fill="#e65100">display: none</text>
	</svg>`,

	// ---- Component — Button anatomy ----
	'--ck-button-padding': `<svg viewBox="0 0 240 64" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="56" rx="4" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<rect x="44" y="16" width="20" height="28" rx="2" fill="#bbb"/>
		<text x="54" y="34" text-anchor="middle" font-size="7" fill="#fff">ic</text>
		<text x="130" y="36" text-anchor="middle" font-size="11" fill="#555">Label</text>
		<rect x="21" y="5" width="22" height="54" fill="#fff3e0" opacity="0.6"/>
		<rect x="197" y="5" width="22" height="54" fill="#fff3e0" opacity="0.6"/>
		<rect x="21" y="5" width="198" height="10" fill="#fff3e0" opacity="0.4"/>
		<rect x="21" y="49" width="198" height="10" fill="#fff3e0" opacity="0.4"/>
		<text x="120" y="64" text-anchor="middle" font-size="7" fill="#e65100">button padding (all sides)</text>
	</svg>`,

	'--ck-button-border-radius': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="4" width="160" height="48" rx="12" fill="#e8e8e8" stroke="#999" stroke-width="1"/>
		<text x="120" y="34" text-anchor="middle" font-size="11" fill="#555">Button</text>
		<path d="M40,16 L40,4 Q40,4 52,4" fill="none" stroke="#e65100" stroke-width="2"/>
		<circle cx="40" cy="16" r="2" fill="#e65100"/>
		<circle cx="52" cy="4" r="2" fill="#e65100"/>
		<text x="26" y="28" font-size="8" fill="#e65100">r</text>
	</svg>`,

	'--ck-button-border': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="4" width="160" height="48" rx="4" fill="#e8e8e8" stroke="#e65100" stroke-width="2.5" stroke-dasharray="6 2"/>
		<text x="120" y="28" text-anchor="middle" font-size="11" fill="#555">Button</text>
		<text x="120" y="44" text-anchor="middle" font-size="8" fill="#e65100">border shorthand</text>
	</svg>`,

	// ---- Component — Input anatomy ----
	'--ck-input-padding': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="48" rx="4" fill="#fff" stroke="#999" stroke-width="1"/>
		<text x="80" y="32" text-anchor="middle" font-size="10" fill="#555">Input text...</text>
		<rect x="21" y="5" width="16" height="46" fill="#fff3e0" opacity="0.7"/>
		<rect x="203" y="5" width="16" height="46" fill="#fff3e0" opacity="0.7"/>
		<rect x="21" y="5" width="198" height="8" fill="#fff3e0" opacity="0.4"/>
		<rect x="21" y="43" width="198" height="8" fill="#fff3e0" opacity="0.4"/>
	</svg>`,

	'--ck-input-border-radius': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="48" rx="10" fill="#fff" stroke="#999" stroke-width="1"/>
		<text x="120" y="32" text-anchor="middle" font-size="10" fill="#555">Input field</text>
		<path d="M20,14 L20,4 Q20,4 30,4" fill="none" stroke="#e65100" stroke-width="2"/>
		<text x="10" y="26" font-size="8" fill="#e65100">r</text>
	</svg>`,

	'--ck-input-border': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="48" rx="4" fill="#fff" stroke="#e65100" stroke-width="2.5" stroke-dasharray="6 2"/>
		<text x="120" y="28" text-anchor="middle" font-size="10" fill="#555">Input field</text>
		<text x="120" y="44" text-anchor="middle" font-size="8" fill="#e65100">border shorthand</text>
	</svg>`,

	// ---- Component — Toolbar anatomy ----
	'--ck-toolbar-item-gap-inline': `<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="220" height="40" rx="4" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="20" y="10" width="36" height="28" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="72" y="10" width="36" height="28" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="56" y="10" width="16" height="28" fill="#fff3e0" opacity="0.7" rx="2"/>
		<line x1="56" y1="24" x2="72" y2="24" stroke="#e65100" stroke-width="1.5"/>
		<text x="64" y="44" text-anchor="middle" font-size="7" fill="#e65100">item gap</text>
	</svg>`,

	'--ck-toolbar-padding': `<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="220" height="48" rx="4" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="28" y="14" width="32" height="28" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="66" y="14" width="32" height="28" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="11" y="5" width="16" height="46" fill="#fff3e0" opacity="0.7"/>
		<rect x="213" y="5" width="16" height="46" fill="#fff3e0" opacity="0.7"/>
		<rect x="11" y="5" width="218" height="8" fill="#fff3e0" opacity="0.4"/>
		<rect x="11" y="43" width="218" height="8" fill="#fff3e0" opacity="0.4"/>
		<text x="160" y="32" font-size="8" fill="#e65100">toolbar padding</text>
	</svg>`,

	// ---- Component — Dropdown anatomy ----
	'--ck-dropdown-panel-padding': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="4" width="100" height="24" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<text x="90" y="20" text-anchor="middle" font-size="9" fill="#555">Trigger ▾</text>
		<rect x="40" y="30" width="160" height="46" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="48" y="38" width="144" height="14" rx="3" fill="#e0e0e0"/>
		<rect x="48" y="56" width="144" height="14" rx="3" fill="#e0e0e0"/>
		<rect x="41" y="31" width="6" height="44" fill="#fff3e0" opacity="0.7"/>
		<rect x="193" y="31" width="6" height="44" fill="#fff3e0" opacity="0.7"/>
		<text x="170" y="78" font-size="7" fill="#e65100">panel padding</text>
	</svg>`,

	// ---- Component — List anatomy ----
	'--ck-list-padding': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="72" rx="6" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="34" y="16" width="172" height="16" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="34" y="38" width="172" height="16" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="34" y="60" width="172" height="10" rx="3" fill="#e0e0e0" stroke="#bbb" stroke-width="1"/>
		<rect x="21" y="5" width="12" height="70" fill="#fff3e0" opacity="0.7"/>
		<rect x="207" y="5" width="12" height="70" fill="#fff3e0" opacity="0.7"/>
		<rect x="21" y="5" width="198" height="10" fill="#fff3e0" opacity="0.4"/>
	</svg>`,

	// ---- Component — Switch anatomy ----
	'--ck-switch-button-toggle-border-radius': `<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="8" width="48" height="28" rx="14" fill="#bbb" stroke="#999" stroke-width="1"/>
		<circle cx="36" cy="22" r="10" fill="#fff" stroke="#999" stroke-width="1"/>
		<text x="44" y="46" text-anchor="middle" font-size="7" fill="#999">Off</text>
		<rect x="100" y="8" width="48" height="28" rx="14" fill="#26a69a" stroke="#00897b" stroke-width="1"/>
		<circle cx="132" cy="22" r="10" fill="#fff" stroke="#00897b" stroke-width="1"/>
		<text x="124" y="46" text-anchor="middle" font-size="7" fill="#26a69a">On</text>
		<path d="M100,22 Q100,8 114,8" fill="none" stroke="#e65100" stroke-width="1.5"/>
		<text x="176" y="26" font-size="8" fill="#e65100">track radius</text>
	</svg>`,

	'--ck-switch-button-toggle-inner-border-radius': `<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">
		<rect x="80" y="6" width="48" height="32" rx="16" fill="#26a69a" stroke="#00897b" stroke-width="1"/>
		<circle cx="112" cy="22" r="11" fill="#fff" stroke="#e65100" stroke-width="2"/>
		<text x="112" y="26" text-anchor="middle" font-size="7" fill="#e65100">r</text>
		<text x="112" y="46" text-anchor="middle" font-size="7" fill="#e65100">handle radius</text>
	</svg>`,

	// ---- Component — Dialog anatomy ----
	'--ck-dialog-border-radius': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="4" y="4" width="232" height="72" fill="hsla(0,0%,0%,.15)" rx="0"/>
		<rect x="40" y="12" width="160" height="56" rx="10" fill="#fff" stroke="#999" stroke-width="1"/>
		<text x="120" y="36" text-anchor="middle" font-size="10" fill="#555">Dialog</text>
		<text x="120" y="52" text-anchor="middle" font-size="8" fill="#999">content area</text>
		<path d="M40,24 L40,12 Q40,12 52,12" fill="none" stroke="#e65100" stroke-width="2"/>
		<text x="28" y="30" font-size="8" fill="#e65100">r</text>
	</svg>`,

	// ---- Component — Balloon panel anatomy ----
	'--ck-balloon-panel-border-radius': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="16" width="160" height="48" rx="8" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<polygon points="110,16 118,4 126,16" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<text x="120" y="44" text-anchor="middle" font-size="10" fill="#555">Balloon panel</text>
		<path d="M40,26 L40,16 Q40,16 48,16" fill="none" stroke="#e65100" stroke-width="2"/>
		<text x="28" y="30" font-size="8" fill="#e65100">r</text>
	</svg>`,

	// ---- Component — Color grid anatomy ----
	'--ck-color-grid-tile-size': `<svg viewBox="0 0 240 64" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="8" width="24" height="24" rx="2" fill="#f44336"/>
		<rect x="48" y="8" width="24" height="24" rx="2" fill="#e91e63"/>
		<rect x="76" y="8" width="24" height="24" rx="2" fill="#9c27b0"/>
		<rect x="104" y="8" width="24" height="24" rx="2" fill="#2196f3"/>
		<rect x="20" y="36" width="24" height="24" rx="2" fill="#4caf50"/>
		<rect x="48" y="36" width="24" height="24" rx="2" fill="#ff9800"/>
		<rect x="76" y="36" width="24" height="24" rx="2" fill="#795548"/>
		<rect x="104" y="36" width="24" height="24" rx="2" fill="#607d8b"/>
		<line x1="140" y1="8" x2="140" y2="32" stroke="#e65100" stroke-width="1.5"/>
		<text x="160" y="24" font-size="8" fill="#e65100">tile size</text>
	</svg>`,

	'--ck-color-grid-gap': `<svg viewBox="0 0 240 64" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="8" width="24" height="24" rx="2" fill="#f44336"/>
		<rect x="50" y="8" width="24" height="24" rx="2" fill="#e91e63"/>
		<rect x="80" y="8" width="24" height="24" rx="2" fill="#9c27b0"/>
		<rect x="20" y="38" width="24" height="24" rx="2" fill="#4caf50"/>
		<rect x="50" y="38" width="24" height="24" rx="2" fill="#ff9800"/>
		<rect x="80" y="38" width="24" height="24" rx="2" fill="#795548"/>
		<rect x="44" y="8" width="6" height="24" fill="#fff3e0" opacity="0.8" rx="1"/>
		<rect x="74" y="8" width="6" height="24" fill="#fff3e0" opacity="0.8" rx="1"/>
		<line x1="44" y1="20" x2="50" y2="20" stroke="#e65100" stroke-width="1.5"/>
		<text x="140" y="28" font-size="8" fill="#e65100">gap between tiles</text>
	</svg>`,

	// ---- Component — Editor UI anatomy ----
	'--ck-editor-editable-padding': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="10" y="4" width="220" height="72" rx="4" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="10" y="4" width="220" height="20" rx="4" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<text x="120" y="18" text-anchor="middle" font-size="9" fill="#555">Toolbar</text>
		<rect x="10" y="24" width="220" height="52" fill="#fff" stroke="#999" stroke-width="1"/>
		<text x="60" y="52" font-size="10" fill="#555">Content...</text>
		<rect x="11" y="25" width="18" height="50" fill="#fff3e0" opacity="0.7"/>
		<rect x="211" y="25" width="18" height="50" fill="#fff3e0" opacity="0.7"/>
		<rect x="11" y="25" width="218" height="10" fill="#fff3e0" opacity="0.4"/>
		<rect x="11" y="65" width="218" height="10" fill="#fff3e0" opacity="0.4"/>
	</svg>`,

	'--ck-editor-frame-border-radius': `<svg viewBox="0 0 240 72" xmlns="http://www.w3.org/2000/svg">
		<rect x="20" y="4" width="200" height="64" rx="10" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="20" y="4" width="200" height="22" rx="10" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
		<text x="120" y="20" text-anchor="middle" font-size="9" fill="#555">Toolbar</text>
		<text x="120" y="48" text-anchor="middle" font-size="10" fill="#555">Editor</text>
		<path d="M20,16 L20,4 Q20,4 30,4" fill="none" stroke="#e65100" stroke-width="2"/>
		<text x="10" y="26" font-size="8" fill="#e65100">r</text>
	</svg>`,

	// ---- Component — Dropdown list background ----
	'--ck-dropdown-list-background-color': `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
		<rect x="40" y="4" width="160" height="72" rx="8" fill="#f5f5f5" stroke="#999" stroke-width="1"/>
		<rect x="48" y="12" width="144" height="56" fill="#bbdefb" opacity="0.4" rx="0"/>
		<text x="120" y="36" text-anchor="middle" font-size="8" fill="#1565c0">list background</text>
		<text x="120" y="50" text-anchor="middle" font-size="7" fill="#1565c0">transparent = panel</text>
		<text x="120" y="60" text-anchor="middle" font-size="7" fill="#1565c0">corners show through</text>
	</svg>`
};
/* eslint-enable max-len */

// ---------------------------------------------------------------------------
// Token reference map — shows which foundation/semantic token a token uses.
// Only tokens that reference other --ck-* tokens via var() are listed.
// ---------------------------------------------------------------------------

/* eslint-disable max-len */
const TOKEN_REFS = {
	// Foundation — derived from other foundation tokens
	'--ck-spacing-xl': '--ck-spacing-unit', '--ck-spacing-lg': '--ck-spacing-unit',
	'--ck-spacing-base': '--ck-spacing-unit', '--ck-spacing-md': '--ck-spacing-unit',
	'--ck-spacing-ms': '--ck-spacing-unit', '--ck-spacing-sm': '--ck-spacing-unit',
	'--ck-spacing-xs': '--ck-spacing-unit', '--ck-spacing-2xs': '--ck-spacing-unit',
	'--ck-focus-shadow': '--ck-focus-shadow-geometry',
	'--ck-focus-shadow-disabled': '--ck-focus-shadow-geometry',
	'--ck-focus-shadow-error': '--ck-focus-shadow-geometry',
	'--ck-focus-border-color': '--ck-color-focus-border',
	'--ck-inset-shadow-sm': '--ck-color-shadow-inner',
	'--ck-shadow-md': '--ck-color-shadow-drop',
	'--ck-shadow-lg': '--ck-color-shadow-drop-active',
	'--ck-animation-duration-fast': '--ck-duration-fast',
	'--ck-animation-duration-base': '--ck-duration-base',
	'--ck-animation-duration-slow': '--ck-duration-slow',
	'--ck-animation-ease-standard': '--ck-ease-standard',
	'--ck-animation-ease-interactive': '--ck-ease-interactive',
	'--ck-z-overlay': '--ck-z-base',

	// Semantic — colors
	'--ck-color-surface-canvas': '--ck-color-base-background',
	'--ck-color-surface-control': '--ck-color-surface-canvas',
	'--ck-color-surface-container': '--ck-color-surface-canvas',
	'--ck-color-surface-inverse': '--ck-color-base-text',
	'--ck-color-border-control': '--ck-color-base-border',
	'--ck-color-border-container': '--ck-color-base-border',
	'--ck-color-divider': '--ck-color-base-border',
	'--ck-color-text': '--ck-color-text-primary',
	'--ck-color-text-primary': '--ck-color-base-text',
	'--ck-color-text-secondary': '--ck-color-base-text-light',
	'--ck-color-text-disabled': '--ck-color-text-secondary',
	'--ck-color-text-inverse': '--ck-color-base-background',
	'--ck-color-text-error': '--ck-color-feedback-error',
	'--ck-color-feedback-error': '--ck-color-base-error',
	'--ck-color-feedback-success': '--ck-color-base-success',
	'--ck-color-feedback-warning': '--ck-color-base-warning',
	'--ck-color-feedback-highlight': '--ck-color-base-highlight',
	'--ck-color-interactive-hover-surface': '--ck-color-base-hover',
	'--ck-color-interactive-active-surface': '--ck-color-base-hover',
	'--ck-color-interactive-selected-surface': '--ck-color-base-selected',
	'--ck-color-interactive-selected-surface-hover': '--ck-color-base-selected-hover',
	'--ck-color-interactive-selected-text': '--ck-color-base-active',
	'--ck-color-interactive-primary-surface': '--ck-color-base-action',
	'--ck-color-interactive-primary-surface-hover': '--ck-color-base-action-hover',
	'--ck-color-interactive-primary-text': '--ck-color-text-inverse',
	'--ck-color-interactive-focus-shadow': '--ck-color-base-focus-shadow',

	// Semantic — interactive focus
	'--ck-interactive-focus-ring': '--ck-focus-ring',
	'--ck-interactive-focus-border-color': '--ck-focus-border-color',
	'--ck-interactive-focus-shadow': '--ck-focus-shadow',
	'--ck-interactive-focus-disabled-shadow': '--ck-focus-shadow-disabled',
	'--ck-interactive-focus-error-shadow': '--ck-focus-shadow-error',

	// Semantic — shape
	'--ck-border-width-control': '--ck-border-width-thin',
	'--ck-border-width-surface': '--ck-border-width-thin',
	'--ck-border-width-divider': '--ck-border-width-thin',
	'--ck-border-width-emphasis': '--ck-border-width-thick',
	'--ck-radius-corners': '--ck-radius-base',
	'--ck-border-radius-control': '--ck-radius-base',
	'--ck-border-radius-surface': '--ck-radius-base',
	'--ck-border-radius-surface-attached': '--ck-border-radius-surface',
	'--ck-border-radius-surface-attached-top': '--ck-border-radius-surface-attached',
	'--ck-border-radius-surface-attached-bottom': '--ck-border-radius-surface-attached',

	// Semantic — spacing
	'--ck-spacing-control-padding-block': '--ck-spacing-xs',
	'--ck-spacing-control-padding-inline': '--ck-spacing-base',
	'--ck-spacing-control-padding-inline-compact': '--ck-spacing-sm',
	'--ck-spacing-control-padding-block-regular': '--ck-spacing-sm',
	'--ck-spacing-control-padding-block-compact': '--ck-spacing-2xs',
	'--ck-spacing-control-icon-gap': '--ck-spacing-md',
	'--ck-spacing-control-meta-gap': '--ck-spacing-lg',
	'--ck-spacing-surface-padding-inline': '--ck-spacing-sm',
	'--ck-spacing-surface-padding-block': '--ck-spacing-sm',
	'--ck-spacing-surface-item-gap-inline': '--ck-spacing-sm',
	'--ck-spacing-region-padding-inline': '--ck-spacing-base',
	'--ck-spacing-region-padding-block': '--ck-spacing-base',

	// Semantic — typography
	'--ck-font-weight-ui-default': '--ck-font-weight-normal',
	'--ck-font-weight-ui-strong': '--ck-font-weight-bold',
	'--ck-font-weight-ui-heading': '--ck-font-weight-bold',
	'--ck-font-weight-ui-label': '--ck-font-weight-semibold',
	'--ck-font-weight-ui-emphasis': '--ck-font-weight-bold',
	'--ck-font-weight-ui-muted': '--ck-font-weight-normal',

	// Semantic — motion
	'--ck-transition-duration-control-fast': '--ck-duration-fast',
	'--ck-transition-duration-control': '--ck-duration-base',
	'--ck-transition-duration-control-emphasized': '--ck-duration-slow',
	'--ck-transition-duration-surface': '--ck-duration-slower',
	'--ck-transition-timing-function-control': '--ck-ease-interactive',
	'--ck-transition-timing-function-surface': '--ck-ease-standard',

	// Semantic — layout, shadow, layer
	'--ck-size-control-min-height': '--ck-size-min-height',
	'--ck-shadow-surface-floating': '--ck-shadow-md',
	'--ck-layer-base': '--ck-z-base',
	'--ck-layer-panel': '--ck-z-overlay',
	'--ck-layer-dialog': '--ck-z-modal',

	// Component — button
	'--ck-button-border-radius': '--ck-border-radius-control',
	'--ck-button-focus-border-color': '--ck-interactive-focus-border-color',
	'--ck-button-opacity-disabled': '--ck-opacity-disabled',
	'--ck-button-default-hover-background-color': '--ck-color-interactive-hover-surface',
	'--ck-button-default-active-background-color': '--ck-color-interactive-active-surface',
	'--ck-button-on-background-color': '--ck-color-interactive-selected-surface',
	'--ck-button-on-hover-background-color': '--ck-color-interactive-selected-surface-hover',
	'--ck-button-on-text-color': '--ck-color-interactive-selected-text',
	'--ck-button-action-background-color': '--ck-color-interactive-primary-surface',
	'--ck-button-action-hover-background-color': '--ck-color-interactive-primary-surface-hover',
	'--ck-button-action-text-color': '--ck-color-interactive-primary-text',
	'--ck-button-save-color': '--ck-color-feedback-success',
	'--ck-button-cancel-color': '--ck-color-feedback-warning',
	'--ck-switch-button-on-background-color': '--ck-button-action-background-color',
	'--ck-switch-button-inner-background-color': '--ck-color-surface-canvas',

	// Component — input
	'--ck-input-border-radius': '--ck-border-radius-control',
	'--ck-input-focus-border-color': '--ck-interactive-focus-border-color',
	'--ck-input-background-color': '--ck-color-surface-control',
	'--ck-input-border-color': '--ck-color-border-control',
	'--ck-input-error-border-color': '--ck-color-feedback-error',
	'--ck-input-text-color': '--ck-color-text-primary',
	'--ck-input-disabled-text-color': '--ck-color-text-disabled',

	// Component — dropdown
	'--ck-dropdown-panel-uniform-border-radius': '--ck-border-radius-uniform',
	'--ck-dropdown-panel-border-radius': '--ck-border-radius-surface-attached',
	'--ck-dropdown-panel-background-color': '--ck-color-surface-container',
	'--ck-dropdown-panel-border-color': '--ck-color-border-container',

	// Component — dropdown menu
	'--ck-dropdown-menu-panel-uniform-border-radius': '--ck-border-radius-uniform',

	// Component — list dropdown
	'--ck-list-dropdown-uniform-border-radius': '--ck-border-radius-uniform',

	// Component — toolbar
	'--ck-toolbar-compact-uniform-border-radius': '--ck-border-radius-uniform',
	'--ck-toolbar-border-radius': '--ck-border-radius-surface',
	'--ck-toolbar-background-color': '--ck-color-surface-container',
	'--ck-toolbar-border-color': '--ck-color-border-container',

	// Component — dialog
	'--ck-dialog-border-radius': '--ck-border-radius-surface',
	'--ck-dialog-background-color': '--ck-color-surface-container',

	// Component — editor UI
	'--ck-editor-editable-focus-border-color': '--ck-interactive-focus-border-color',
	'--ck-editor-frame-border-radius': '--ck-border-radius-surface',

	// Component — list
	'--ck-list-border-radius': '--ck-border-radius-surface',
	'--ck-list-background-color': '--ck-color-surface-control',
	'--ck-list-button-hover-background-color': '--ck-button-default-hover-background-color',
	'--ck-list-button-on-background-color': '--ck-button-on-text-color',
	'--ck-list-button-on-text-color': '--ck-color-text-inverse',

	// Component — panel
	'--ck-balloon-panel-background-color': '--ck-color-surface-container',
	'--ck-balloon-panel-border-color': '--ck-color-border-container',

	// Component — sticky panel
	'--ck-sticky-panel-uniform-border-radius': '--ck-border-radius-uniform',

	// Component — menu bar
	'--ck-menu-bar-panel-uniform-border-radius': '--ck-border-radius-uniform',

	// Component — color selector
	'--ck-color-selector-uniform-border-radius': '--ck-border-radius-uniform',

	// Component — autocomplete
	'--ck-autocomplete-results-uniform-border-radius': '--ck-border-radius-uniform',

	// Component — tooltip
	'--ck-tooltip-background-color': '--ck-color-surface-inverse',
	'--ck-tooltip-text-color': '--ck-color-text-inverse'
};
/* eslint-enable max-len */

// ---------------------------------------------------------------------------
// Reverse dependency map: base token → list of tokens that depend on it.
// Built from TOKEN_REFS at init time. Used to cascade input refreshes.
// ---------------------------------------------------------------------------

const DEPENDENTS = {};

for ( const [ dependent, base ] of Object.entries( TOKEN_REFS ) ) {
	if ( !DEPENDENTS[ base ] ) {
		DEPENDENTS[ base ] = [];
	}

	DEPENDENTS[ base ].push( dependent );
}

/**
 * After a token value changes, refresh the displayed input values of all
 * tokens that depend on it (directly or transitively). Only non-overridden
 * rows are refreshed — manually changed values are preserved.
 */
function refreshDependents( changedToken ) {
	const directDependents = DEPENDENTS[ changedToken ];

	if ( !directDependents ) {
		return;
	}

	for ( const dep of directDependents ) {
		const row = document.querySelector( `.token-row[data-token="${ dep }"]` );

		if ( row && !row.classList.contains( 'is-overridden' ) ) {
			refreshRow( row );
		}

		// Recurse — if B depends on A, and C depends on B, changing A refreshes both B and C.
		refreshDependents( dep );
	}
}

/**
 * Scrolls to a token row, opens its parent <details> elements, and plays
 * a highlight blink animation so the user can see where the source token lives.
 */
function scrollToAndHighlightToken( tokenName ) {
	const targetRow = document.querySelector( `.token-row[data-token="${ tokenName }"]` );

	if ( !targetRow ) {
		return;
	}

	// Open all ancestor <details> elements so the row is visible.
	let ancestor = targetRow.parentElement;

	while ( ancestor ) {
		if ( ancestor.tagName === 'DETAILS' && !ancestor.open ) {
			ancestor.open = true;
		}

		ancestor = ancestor.parentElement;
	}

	// Scroll into view.
	targetRow.scrollIntoView( { behavior: 'smooth', block: 'center' } );

	// Blink highlight.
	targetRow.classList.remove( 'token-row--blink' );
	// Force reflow so re-adding the class restarts the animation.
	targetRow.offsetWidth; // eslint-disable-line no-unused-expressions
	targetRow.classList.add( 'token-row--blink' );

	targetRow.addEventListener( 'animationend', () => {
		targetRow.classList.remove( 'token-row--blink' );
	}, { once: true } );
}

// ---------------------------------------------------------------------------
// Auto-detect token type from its name
// ---------------------------------------------------------------------------

function inferType( name ) {
	if ( name.includes( 'color' ) || name.includes( 'background' ) ) {
		return 'color';
	}

	if ( name.includes( 'opacity' ) ) {
		return 'opacity';
	}

	if ( name.includes( 'font-weight' ) ) {
		return 'weight';
	}

	if ( name.includes( 'font-family' ) ) {
		return 'text';
	}

	if ( name.includes( 'duration' ) ) {
		return 'duration';
	}

	if ( name.includes( 'ease' ) || name.includes( 'timing-function' ) ) {
		return 'easing';
	}

	if ( name.includes( 'z-index' ) || name.includes( '-layer' ) || name === '--ck-z-base' ||
		name === '--ck-z-overlay' || name === '--ck-z-modal' ) {
		return 'number';
	}

	if ( name.includes( 'shadow' ) || name.includes( 'transition' ) || name.includes( 'animation' ) ||
		name.includes( 'border' ) && !name.includes( 'radius' ) && !name.includes( 'width' ) ||
		name.includes( 'ring' ) ) {
		return 'text';
	}

	// Default: treat as size (px, em, calc)
	return 'size';
}

// ---------------------------------------------------------------------------
// Helper: convert color string to hex for color picker
// ---------------------------------------------------------------------------

function colorToHex( colorStr ) {
	const temp = document.createElement( 'div' );
	temp.style.color = colorStr;
	document.body.appendChild( temp );
	const computed = getComputedStyle( temp ).color;
	document.body.removeChild( temp );

	const match = computed.match( /(\d+),\s*(\d+),\s*(\d+)/ );

	if ( !match ) {
		return '#000000';
	}

	return '#' + [ match[ 1 ], match[ 2 ], match[ 3 ] ]
		.map( c => parseInt( c ).toString( 16 ).padStart( 2, '0' ) )
		.join( '' );
}

function getComputedTokenValue( name ) {
	return getComputedStyle( document.documentElement ).getPropertyValue( name ).trim();
}

// ---------------------------------------------------------------------------
// UI generation
// ---------------------------------------------------------------------------

function createTokenRow( name ) {
	const type = inferType( name );
	const row = document.createElement( 'div' );
	row.className = 'token-row';
	row.dataset.token = name;

	// Token name
	const nameEl = document.createElement( 'div' );
	nameEl.className = 'token-name';
	nameEl.title = name;

	const nameText = document.createElement( 'span' );
	nameText.textContent = name.replace( /^--ck-/, '' );
	nameEl.appendChild( nameText );

	const description = TOKEN_DESCRIPTIONS[ name ];

	if ( description ) {
		const descEl = document.createElement( 'span' );
		descEl.className = 'token-description';
		descEl.textContent = description;
		nameEl.appendChild( descEl );
	}

	const diagram = TOKEN_DIAGRAMS[ name ];

	if ( diagram ) {
		const diagramBtn = document.createElement( 'span' );
		diagramBtn.className = 'token-diagram-toggle';
		diagramBtn.textContent = '\uD83D\uDDBC';
		diagramBtn.title = 'Show diagram';

		const diagramEl = document.createElement( 'div' );
		diagramEl.className = 'token-diagram';
		diagramEl.innerHTML = diagram;
		diagramEl.hidden = true;

		diagramBtn.addEventListener( 'click', () => {
			diagramEl.hidden = !diagramEl.hidden;
		} );

		nameEl.appendChild( diagramBtn );
		nameEl.appendChild( diagramEl );
	}

	const ref = TOKEN_REFS[ name ];

	if ( ref ) {
		const refEl = document.createElement( 'span' );
		refEl.className = 'token-ref';
		refEl.textContent = '\u2190 ' + ref.replace( /^--ck-/, '' );
		refEl.title = ref;

		refEl.addEventListener( 'click', () => {
			scrollToAndHighlightToken( ref );
		} );

		nameEl.appendChild( refEl );
	}

	row.appendChild( nameEl );

	// Input control
	const inputWrap = document.createElement( 'div' );
	inputWrap.className = 'token-input';

	const currentValue = getComputedTokenValue( name );

	if ( type === 'color' ) {
		const colorInput = document.createElement( 'input' );
		colorInput.type = 'color';

		try {
			colorInput.value = colorToHex( currentValue );
		} catch {
			colorInput.value = '#000000';
		}

		const textInput = document.createElement( 'input' );
		textInput.type = 'text';
		textInput.value = currentValue;

		colorInput.addEventListener( 'input', () => {
			document.documentElement.style.setProperty( name, colorInput.value );
			textInput.value = colorInput.value;
			row.classList.add( 'is-overridden' );
			row.classList.remove( 'is-preset-changed' );
			refreshDependents( name );
		} );

		textInput.addEventListener( 'change', () => {
			document.documentElement.style.setProperty( name, textInput.value );

			try {
				colorInput.value = colorToHex( textInput.value );
			} catch {
				// Ignore.
			}

			row.classList.add( 'is-overridden' );
			row.classList.remove( 'is-preset-changed' );
			refreshDependents( name );
		} );

		inputWrap.appendChild( colorInput );
		inputWrap.appendChild( textInput );
	} else if ( type === 'opacity' ) {
		const range = document.createElement( 'input' );
		range.type = 'range';
		range.min = '0';
		range.max = '1';
		range.step = '0.05';
		range.value = parseFloat( currentValue ) || 0.5;

		const textInput = document.createElement( 'input' );
		textInput.type = 'text';
		textInput.value = currentValue;

		range.addEventListener( 'input', () => {
			document.documentElement.style.setProperty( name, range.value );
			textInput.value = range.value;
			row.classList.add( 'is-overridden' );
			row.classList.remove( 'is-preset-changed' );
			refreshDependents( name );
		} );

		textInput.addEventListener( 'change', () => {
			document.documentElement.style.setProperty( name, textInput.value );
			range.value = parseFloat( textInput.value ) || 0;
			row.classList.add( 'is-overridden' );
			row.classList.remove( 'is-preset-changed' );
			refreshDependents( name );
		} );

		inputWrap.appendChild( range );
		inputWrap.appendChild( textInput );
	} else if ( type === 'duration' ) {
		const range = document.createElement( 'input' );
		range.type = 'range';
		range.min = '0';
		range.max = '2';
		range.step = '0.05';
		range.value = parseFloat( currentValue ) || 0.2;

		const textInput = document.createElement( 'input' );
		textInput.type = 'text';
		textInput.value = currentValue;

		range.addEventListener( 'input', () => {
			const val = range.value + 's';
			document.documentElement.style.setProperty( name, val );
			textInput.value = val;
			row.classList.add( 'is-overridden' );
			row.classList.remove( 'is-preset-changed' );
			refreshDependents( name );
		} );

		textInput.addEventListener( 'change', () => {
			document.documentElement.style.setProperty( name, textInput.value );
			range.value = parseFloat( textInput.value ) || 0;
			row.classList.add( 'is-overridden' );
			row.classList.remove( 'is-preset-changed' );
			refreshDependents( name );
		} );

		inputWrap.appendChild( range );
		inputWrap.appendChild( textInput );
	} else if ( type === 'weight' ) {
		const select = document.createElement( 'select' );

		for ( const w of [ 100, 200, 300, 400, 500, 600, 700, 800, 900, 'inherit' ] ) {
			const opt = document.createElement( 'option' );
			opt.value = w;
			opt.textContent = w;

			if ( String( w ) === currentValue.trim() ) {
				opt.selected = true;
			}

			select.appendChild( opt );
		}

		select.addEventListener( 'change', () => {
			document.documentElement.style.setProperty( name, select.value );
			row.classList.add( 'is-overridden' );
			row.classList.remove( 'is-preset-changed' );
			refreshDependents( name );
		} );

		inputWrap.appendChild( select );
	} else if ( type === 'easing' ) {
		const select = document.createElement( 'select' );
		const easings = [ 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'cubic-bezier(0, 0, 0.24, 0.95)' ];

		for ( const e of easings ) {
			const opt = document.createElement( 'option' );
			opt.value = e;
			opt.textContent = e.length > 20 ? 'cubic-bezier(...)' : e;

			if ( e === currentValue.trim() ) {
				opt.selected = true;
			}

			select.appendChild( opt );
		}

		select.addEventListener( 'change', () => {
			document.documentElement.style.setProperty( name, select.value );
			row.classList.add( 'is-overridden' );
			row.classList.remove( 'is-preset-changed' );
			refreshDependents( name );
		} );

		inputWrap.appendChild( select );
	} else if ( type === 'number' ) {
		const numInput = document.createElement( 'input' );
		numInput.type = 'number';
		numInput.value = parseInt( currentValue ) || 0;

		numInput.addEventListener( 'change', () => {
			document.documentElement.style.setProperty( name, numInput.value );
			row.classList.add( 'is-overridden' );
			row.classList.remove( 'is-preset-changed' );
			refreshDependents( name );
		} );

		inputWrap.appendChild( numInput );
	} else {
		const textInput = document.createElement( 'input' );
		textInput.type = 'text';
		textInput.value = currentValue;

		textInput.addEventListener( 'change', () => {
			document.documentElement.style.setProperty( name, textInput.value );
			row.classList.add( 'is-overridden' );
			row.classList.remove( 'is-preset-changed' );
			refreshDependents( name );
		} );

		inputWrap.appendChild( textInput );
	}

	row.appendChild( inputWrap );

	// Reset button
	const resetBtn = document.createElement( 'button' );
	resetBtn.className = 'token-reset';
	resetBtn.textContent = '\u21BA';
	resetBtn.title = 'Reset to default';
	resetBtn.addEventListener( 'click', () => {
		document.documentElement.style.removeProperty( name );
		row.classList.remove( 'is-overridden' );
		refreshRow( row );
		refreshDependents( name );

		// If a preset is active and affects this token, restore the amber highlight.
		row.classList.toggle( 'is-preset-changed', isTokenChangedByPreset( name ) );
	} );

	row.appendChild( resetBtn );

	return row;
}

function refreshRow( row ) {
	const tokenName = row.dataset.token;
	const newVal = getComputedTokenValue( tokenName );
	const inputs = row.querySelectorAll( 'input, select' );

	for ( const input of inputs ) {
		if ( input.type === 'color' ) {
			try {
				input.value = colorToHex( newVal );
			} catch {
				// Ignore.
			}
		} else if ( input.type === 'range' ) {
			input.value = parseFloat( newVal ) || 0;
		} else if ( input.type === 'number' ) {
			const parsed = parseInt( newVal );
			input.value = isNaN( parsed ) ? '' : parsed;
		} else if ( input.tagName === 'SELECT' ) {
			input.value = newVal.trim();
		} else {
			input.value = newVal;
		}
	}
}

// ---------------------------------------------------------------------------
// Stylesheet preset manager — paste, compare, and switch between stylesheets.
// ---------------------------------------------------------------------------

const stylesheetEntries = [];
let stylesheetNextId = 1;
let stylesheetActiveId = null;

// When true, selecting/adding/updating a stylesheet clears all manual inline overrides first.
let clearOverridesOnSwitch = false;

function clearAllInlineOverrides() {
	const panel = document.getElementById( 'token-panel' );
	const allTokens = [ ...Object.values( FOUNDATION ), ...Object.values( SEMANTIC ), ...Object.values( COMPONENT ) ].flat();

	for ( const token of allTokens ) {
		document.documentElement.style.removeProperty( token );
	}

	for ( const row of panel.querySelectorAll( '.token-row' ) ) {
		row.classList.remove( 'is-overridden' );
	}
}

function refreshAllRows() {
	const panel = document.getElementById( 'token-panel' );

	for ( const row of panel.querySelectorAll( '.token-row' ) ) {
		refreshRow( row );
	}
}

function refreshAllNonOverriddenRows() {
	const panel = document.getElementById( 'token-panel' );

	for ( const row of panel.querySelectorAll( '.token-row' ) ) {
		if ( !row.classList.contains( 'is-overridden' ) ) {
			refreshRow( row );
		}
	}
}

function activateStylesheet( id ) {
	const panel = document.getElementById( 'token-panel' );

	// Snapshot current computed values before switching.
	const valuesBefore = {};

	for ( const row of panel.querySelectorAll( '.token-row' ) ) {
		valuesBefore[ row.dataset.token ] = getComputedTokenValue( row.dataset.token );
	}

	// Deactivate current.
	if ( stylesheetActiveId !== null ) {
		const current = stylesheetEntries.find( e => e.id === stylesheetActiveId );

		if ( current ) {
			current.styleEl.media = 'not all';
		}
	}

	// Clear inline overrides if the flag is set.
	if ( clearOverridesOnSwitch ) {
		clearAllInlineOverrides();
	}

	stylesheetActiveId = id;

	// Activate new (null means "None").
	if ( id !== null ) {
		const entry = stylesheetEntries.find( e => e.id === id );

		if ( entry ) {
			entry.styleEl.removeAttribute( 'media' );
		}
	}

	// Wait for style recalculation, then refresh and mark changed rows.
	requestAnimationFrame( () => {
		if ( clearOverridesOnSwitch ) {
			refreshAllRows();
		} else {
			refreshAllNonOverriddenRows();
		}

		// Mark tokens whose value changed due to the stylesheet switch.
		for ( const row of panel.querySelectorAll( '.token-row' ) ) {
			const token = row.dataset.token;
			const newValue = getComputedTokenValue( token );

			if ( newValue !== valuesBefore[ token ] && !row.classList.contains( 'is-overridden' ) ) {
				row.classList.add( 'is-preset-changed' );
			} else {
				row.classList.remove( 'is-preset-changed' );
			}
		}
	} );
}

function removeStylesheet( id, listContainer, refs ) {
	const idx = stylesheetEntries.findIndex( e => e.id === id );

	if ( idx === -1 ) {
		return;
	}

	const entry = stylesheetEntries[ idx ];
	entry.styleEl.remove();
	stylesheetEntries.splice( idx, 1 );

	if ( stylesheetActiveId === id ) {
		stylesheetActiveId = null;

		// Clear textarea since the active entry was removed.
		refs.textarea.value = '';
		refs.nameInput.value = '';
		refs.addBtn.textContent = 'Add Stylesheet';
		refs.addNewBtn.hidden = true;

		requestAnimationFrame( () => {
			refreshAllNonOverriddenRows();
		} );
	}

	renderStylesheetList( listContainer, refs );
}

/**
 * @param {HTMLDivElement} listContainer
 * @param {Object} refs Shared references to textarea, nameInput, and addBtn for load-on-select.
 */
function renderStylesheetList( listContainer, refs ) {
	listContainer.innerHTML = '';

	// "None (default)" radio — always first.
	const noneEntry = document.createElement( 'div' );
	noneEntry.className = 'stylesheet-entry' + ( stylesheetActiveId === null ? ' is-active' : '' );

	const noneRadio = document.createElement( 'input' );
	noneRadio.type = 'radio';
	noneRadio.name = 'ck-stylesheet-preset';
	noneRadio.value = '';
	noneRadio.checked = stylesheetActiveId === null;

	noneRadio.addEventListener( 'change', () => {
		activateStylesheet( null );

		// Clear textarea when switching to "None".
		refs.textarea.value = '';
		refs.nameInput.value = '';
		refs.addBtn.textContent = 'Add Stylesheet';
		refs.addNewBtn.hidden = true;

		renderStylesheetList( listContainer, refs );
	} );

	const noneLabel = document.createElement( 'label' );
	noneLabel.textContent = 'None (default)';
	noneLabel.addEventListener( 'click', () => {
		noneRadio.checked = true;
		noneRadio.dispatchEvent( new Event( 'change' ) );
	} );

	noneEntry.appendChild( noneRadio );
	noneEntry.appendChild( noneLabel );
	listContainer.appendChild( noneEntry );

	// One entry per added stylesheet.
	for ( const entry of stylesheetEntries ) {
		const row = document.createElement( 'div' );
		row.className = 'stylesheet-entry' + ( stylesheetActiveId === entry.id ? ' is-active' : '' );

		const radio = document.createElement( 'input' );
		radio.type = 'radio';
		radio.name = 'ck-stylesheet-preset';
		radio.value = entry.id;
		radio.checked = stylesheetActiveId === entry.id;

		radio.addEventListener( 'change', () => {
			activateStylesheet( entry.id );

			// Load the stylesheet content into the textarea for editing.
			refs.textarea.value = entry.cssText;
			refs.nameInput.value = entry.name;
			refs.addBtn.textContent = 'Update Stylesheet';
			refs.addNewBtn.hidden = false;

			renderStylesheetList( listContainer, refs );
		} );

		const label = document.createElement( 'label' );
		label.textContent = entry.name;
		label.title = entry.name;
		label.addEventListener( 'click', () => {
			radio.checked = true;
			radio.dispatchEvent( new Event( 'change' ) );
		} );

		const removeBtn = document.createElement( 'button' );
		removeBtn.className = 'stylesheet-remove';
		removeBtn.textContent = '\u00D7';
		removeBtn.title = 'Remove stylesheet';
		removeBtn.addEventListener( 'click', e => {
			e.stopPropagation();
			removeStylesheet( entry.id, listContainer, refs );
		} );

		row.appendChild( radio );
		row.appendChild( label );
		row.appendChild( removeBtn );
		listContainer.appendChild( row );
	}
}

function generateStylesheetManagerSection( presets ) {
	const details = document.createElement( 'details' );
	details.className = 'stylesheet-presets';
	const summary = document.createElement( 'summary' );
	summary.textContent = 'Stylesheet Presets';
	details.appendChild( summary );

	const manager = document.createElement( 'div' );
	manager.className = 'stylesheet-manager';

	// Textarea for pasting CSS.
	const textarea = document.createElement( 'textarea' );
	textarea.placeholder = 'Paste CSS here (e.g. :root { --ck-radius-base: 10px; })';
	manager.appendChild( textarea );

	// Controls row: name input + add/update button + reset button.
	const controls = document.createElement( 'div' );
	controls.className = 'stylesheet-controls';

	const nameInput = document.createElement( 'input' );
	nameInput.type = 'text';
	nameInput.placeholder = 'Stylesheet name (optional)';

	const addBtn = document.createElement( 'button' );
	addBtn.textContent = 'Add Stylesheet';

	const addNewBtn = document.createElement( 'button' );
	addNewBtn.textContent = 'Add New';
	addNewBtn.title = 'Keep textarea content and create a new stylesheet from it';
	addNewBtn.hidden = true;

	const resetBtn = document.createElement( 'button' );
	resetBtn.textContent = 'Reset';
	resetBtn.title = 'Deselect active stylesheet and clear textarea';

	controls.appendChild( nameInput );
	controls.appendChild( addBtn );
	controls.appendChild( addNewBtn );
	controls.appendChild( resetBtn );
	manager.appendChild( controls );

	// Checkbox: clear manual overrides on switch.
	const clearRow = document.createElement( 'label' );
	clearRow.className = 'stylesheet-clear-option';

	const clearCheckbox = document.createElement( 'input' );
	clearCheckbox.type = 'checkbox';
	clearCheckbox.checked = false;
	clearCheckbox.addEventListener( 'change', () => {
		clearOverridesOnSwitch = clearCheckbox.checked;
	} );

	clearRow.appendChild( clearCheckbox );
	clearRow.append( ' Clear manual overrides on switch' );
	manager.appendChild( clearRow );

	// List of stylesheet entries with radios.
	const listContainer = document.createElement( 'div' );
	listContainer.className = 'stylesheet-list';
	manager.appendChild( listContainer );

	// Shared refs passed to renderStylesheetList so entries can load into textarea.
	const refs = { textarea, nameInput, addBtn, addNewBtn };

	// Wire up "Add / Update" button.
	addBtn.addEventListener( 'click', () => {
		const cssText = textarea.value.trim();

		if ( !cssText ) {
			return;
		}

		// Update existing entry if one is selected.
		if ( stylesheetActiveId !== null ) {
			const active = stylesheetEntries.find( e => e.id === stylesheetActiveId );

			if ( active ) {
				active.cssText = cssText;
				active.name = nameInput.value.trim() || active.name;

				// Snapshot before update.
				const panel = document.getElementById( 'token-panel' );
				const valuesBefore = {};

				for ( const row of panel.querySelectorAll( '.token-row' ) ) {
					valuesBefore[ row.dataset.token ] = getComputedTokenValue( row.dataset.token );
				}

				if ( clearOverridesOnSwitch ) {
					clearAllInlineOverrides();
				}

				active.styleEl.textContent = cssText;

				requestAnimationFrame( () => {
					if ( clearOverridesOnSwitch ) {
						refreshAllRows();
					} else {
						refreshAllNonOverriddenRows();
					}

					// Mark tokens changed by the update.
					for ( const row of panel.querySelectorAll( '.token-row' ) ) {
						const token = row.dataset.token;
						const newValue = getComputedTokenValue( token );

						if ( newValue !== valuesBefore[ token ] && !row.classList.contains( 'is-overridden' ) ) {
							row.classList.add( 'is-preset-changed' );
						} else {
							row.classList.remove( 'is-preset-changed' );
						}
					}
				} );

				renderStylesheetList( listContainer, refs );

				return;
			}
		}

		// Otherwise add a new entry.
		const name = nameInput.value.trim() || 'Stylesheet ' + stylesheetNextId;

		const entry = {
			id: stylesheetNextId++,
			name,
			cssText,
			styleEl: document.createElement( 'style' )
		};

		entry.styleEl.dataset.ckPreset = entry.id;
		entry.styleEl.textContent = cssText;
		entry.styleEl.media = 'not all';
		document.head.appendChild( entry.styleEl );

		stylesheetEntries.push( entry );

		// Activate the newly added stylesheet and keep it loaded for editing.
		activateStylesheet( entry.id );
		addBtn.textContent = 'Update Stylesheet';
		addNewBtn.hidden = false;

		renderStylesheetList( listContainer, refs );
	} );

	// Wire up "Add New" button — create a new stylesheet from the current textarea content.
	addNewBtn.addEventListener( 'click', () => {
		const cssText = textarea.value.trim();

		if ( !cssText ) {
			return;
		}

		const name = nameInput.value.trim() || 'Stylesheet ' + stylesheetNextId;

		const entry = {
			id: stylesheetNextId++,
			name,
			cssText,
			styleEl: document.createElement( 'style' )
		};

		entry.styleEl.dataset.ckPreset = entry.id;
		entry.styleEl.textContent = cssText;
		entry.styleEl.media = 'not all';
		document.head.appendChild( entry.styleEl );

		stylesheetEntries.push( entry );

		activateStylesheet( entry.id );
		addBtn.textContent = 'Update Stylesheet';

		renderStylesheetList( listContainer, refs );
	} );

	// Wire up "Reset" button — deselect and clear.
	resetBtn.addEventListener( 'click', () => {
		activateStylesheet( null );

		textarea.value = '';
		nameInput.value = '';
		addBtn.textContent = 'Add Stylesheet';
		addNewBtn.hidden = true;

		renderStylesheetList( listContainer, refs );
	} );

	// Load built-in presets (if any).
	if ( presets && presets.length ) {
		for ( const preset of presets ) {
			const entry = {
				id: stylesheetNextId++,
				name: preset.name,
				cssText: preset.css,
				styleEl: document.createElement( 'style' )
			};

			entry.styleEl.dataset.ckPreset = entry.id;
			entry.styleEl.textContent = preset.css;
			entry.styleEl.media = 'not all';
			document.head.appendChild( entry.styleEl );

			stylesheetEntries.push( entry );
		}
	}

	// Initial render.
	renderStylesheetList( listContainer, refs );

	details.appendChild( manager );

	return details;
}

/**
 * Checks if the active stylesheet preset changes the given token's value
 * compared to the default (no stylesheet). Returns true if the token
 * value with the preset differs from the value without it.
 */
function isTokenChangedByPreset( token ) {
	if ( stylesheetActiveId === null ) {
		return false;
	}

	const active = stylesheetEntries.find( e => e.id === stylesheetActiveId );

	if ( !active ) {
		return false;
	}

	const withPreset = getComputedTokenValue( token );

	// Temporarily disable preset to read the default value.
	active.styleEl.media = 'not all';
	const withoutPreset = getComputedTokenValue( token );
	active.styleEl.removeAttribute( 'media' );

	return withPreset !== withoutPreset;
}

function updateSummaryHighlights( panel ) {
	for ( const details of panel.querySelectorAll( 'details' ) ) {
		const summary = details.querySelector( ':scope > summary' );

		if ( !summary ) {
			continue;
		}

		const hasOverrides = details.querySelector( '.token-row.is-overridden' ) !== null;
		const hasPresetChanges = details.querySelector( '.token-row.is-preset-changed' ) !== null;

		summary.classList.toggle( 'has-overrides', hasOverrides );
		summary.classList.toggle( 'has-preset-changes', hasPresetChanges );
	}
}

/**
 * @param {Array<{name: string, css: string}>} [presets] Optional array of built-in stylesheet presets.
 */
export function generatePanel( presets ) {
	const panel = document.getElementById( 'token-panel' );

	// Stylesheet preset manager (paste & compare).
	panel.appendChild( generateStylesheetManagerSection( presets ) );

	const tiers = [
		{ key: 'foundation', label: 'Foundation Tokens', data: FOUNDATION, open: true },
		{ key: 'semantic', label: 'Semantic Tokens', data: SEMANTIC, open: false },
		{ key: 'component', label: 'Component Tokens', data: COMPONENT, open: false }
	];

	for ( const tier of tiers ) {
		const tierDetails = document.createElement( 'details' );

		if ( tier.open ) {
			tierDetails.open = true;
		}

		const tierSummary = document.createElement( 'summary' );
		const tokenCount = Object.values( tier.data ).reduce( ( sum, arr ) => sum + arr.length, 0 );
		tierSummary.textContent = tier.label + ' (' + tokenCount + ')';
		tierDetails.appendChild( tierSummary );

		for ( const [ category, tokens ] of Object.entries( tier.data ) ) {
			const catDetails = document.createElement( 'details' );
			const catSummary = document.createElement( 'summary' );
			catSummary.textContent = category + ' (' + tokens.length + ')';
			catDetails.appendChild( catSummary );

			for ( const token of tokens ) {
				catDetails.appendChild( createTokenRow( token ) );
			}

			tierDetails.appendChild( catDetails );
		}

		panel.appendChild( tierDetails );
	}

	// Reset all
	document.getElementById( 'reset-all' ).addEventListener( 'click', () => {
		const allTokens = [ ...Object.values( FOUNDATION ), ...Object.values( SEMANTIC ), ...Object.values( COMPONENT ) ].flat();

		for ( const token of allTokens ) {
			document.documentElement.style.removeProperty( token );
		}

		for ( const row of panel.querySelectorAll( '.token-row' ) ) {
			row.classList.remove( 'is-overridden' );
			refreshRow( row );
		}
	} );

	// Toggle all diagrams.
	let diagramsVisible = false;
	const toggleDiagramsBtn = document.getElementById( 'toggle-diagrams' );

	toggleDiagramsBtn.addEventListener( 'click', () => {
		diagramsVisible = !diagramsVisible;

		for ( const diagram of panel.querySelectorAll( '.token-diagram' ) ) {
			diagram.hidden = !diagramsVisible;
		}

		toggleDiagramsBtn.textContent = diagramsVisible ? 'Hide Diagrams' : 'Show Diagrams';
	} );

	// Highlight ancestor <summary> elements when any child token is overridden.
	// Uses a MutationObserver on class changes so every override/reset path is covered automatically.
	const observer = new MutationObserver( () => {
		updateSummaryHighlights( panel );
	} );

	observer.observe( panel, {
		subtree: true,
		attributes: true,
		attributeFilter: [ 'class' ]
	} );

	// Export overrides section — below token tiers.
	const exportSection = document.createElement( 'div' );
	exportSection.className = 'token-export';

	const exportBtn = document.createElement( 'button' );
	exportBtn.className = 'token-export-btn';
	exportBtn.textContent = 'Generate Stylesheet from Overrides';

	const exportOutput = document.createElement( 'textarea' );
	exportOutput.className = 'token-export-output';
	exportOutput.readOnly = true;
	exportOutput.hidden = true;

	exportBtn.addEventListener( 'click', () => {
		const overriddenRows = panel.querySelectorAll( '.token-row.is-overridden' );
		const lines = [];

		for ( const row of overriddenRows ) {
			const token = row.dataset.token;
			const value = document.documentElement.style.getPropertyValue( token ).trim();

			if ( value ) {
				lines.push( '\t' + token + ': ' + value + ';' );
			}
		}

		if ( lines.length === 0 ) {
			exportOutput.value = '/* No overrides — tweak some tokens first. */';
		} else {
			exportOutput.value = ':root {\n' + lines.join( '\n' ) + '\n}';
		}

		exportOutput.hidden = false;
		exportOutput.select();
	} );

	exportSection.appendChild( exportBtn );
	exportSection.appendChild( exportOutput );
	panel.appendChild( exportSection );
}
