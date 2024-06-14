/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/button/button
 */

/**
 * The button interface. Implemented by, among others, {@link module:ui/button/buttonview~ButtonView},
 * {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} and
 * {@link module:ui/dropdown/button/dropdownbuttonview~DropdownButtonView}.
 */
export default interface Button {

	/**
	 * The label of the button view visible to the user when {@link #withText} is `true`.
	 * It can also be used to create a {@link #tooltip}.
	 *
	 * @observable
	 */
	label: string | undefined;

	/**
	 * (Optional) The keystroke associated with the button, i.e. <kbd>CTRL+B</kbd>,
	 * in the string format compatible with {@link module:utils/keyboard}.
	 *
	 * **Note**: Use {@link module:ui/button/button~Button#withKeystroke} if you want to display
	 * the keystroke information next to the {@link module:ui/button/button~Button#label label}.
	 *
	 * @observable
	 */
	keystroke: string | undefined;

	/**
	 * (Optional) Tooltip of the button, i.e. displayed when hovering the button with the mouse cursor.
	 *
	 * * If defined as a `Boolean` (e.g. `true`), then combination of `label` and `keystroke` will be set as a tooltip.
	 * * If defined as a `String`, tooltip will equal the exact text of that `String`.
	 * * If defined as a `Function`, `label` and `keystroke` will be passed to that function, which is to return
	 * a string with the tooltip text.
	 *
	 * ```ts
	 * const view = new ButtonView( locale );
	 * view.tooltip = ( label, keystroke ) => `A tooltip for ${ label } and ${ keystroke }.`
	 * ```
	 *
	 * @observable
	 * @default false
	 */
	tooltip: boolean | string | ( ( label: string, keystroke: string | undefined ) => string );

	/**
	 * (Optional) The position of the tooltip. See {@link module:ui/tooltipmanager~TooltipManager}
	 * to learn more about the tooltip system.
	 *
	 * **Note:** It makes sense only when the {@link #tooltip `tooltip` attribute} is defined.
	 *
	 * @observable
	 * @default 's'
	 */
	tooltipPosition: 's' | 'n' | 'e' | 'w' | 'sw' | 'se';

	/**
	 * The HTML type of the button.
	 *
	 * @observable
	 * @default 'button'
	 */
	type: 'button' | 'submit' | 'reset' | 'menu';

	/**
	 * Controls whether the button view is "on". It makes sense when a feature it represents
	 * is currently active, e.g. a bold button is "on" when the selection is in the bold text.
	 *
	 * To disable the button, use {@link #isEnabled} instead.
	 *
	 * @observable
	 * @default true
	 */
	isOn: boolean;

	/**
	 * Controls whether the button view is enabled, i.e. it can be clicked and execute an action.
	 *
	 * To change the "on" state of the button, use {@link #isOn} instead.
	 *
	 * @observable
	 * @default true
	 */
	isEnabled: boolean;

	/**
	 * Controls whether the button view is visible. Visible by default, buttons are hidden
	 * using a CSS class.
	 *
	 * @observable
	 * @default true
	 */
	isVisible: boolean;

	/**
	 * Controls whether the button view is a toggle button (two–state) for assistive technologies.
	 *
	 * @observable
	 * @default false
	 */
	isToggleable: boolean;

	/**
	 * (Optional) Controls whether the label of the button is hidden (e.g. an icon–only button).
	 *
	 * @observable
	 * @default false
	 */
	withText: boolean;

	/**
	 * (Optional) Controls whether the keystroke of the button is displayed next to its
	 * {@link module:ui/button/button~Button#label label}.
	 *
	 * **Note**: This property requires a {@link module:ui/button/button~Button#keystroke keystroke}
	 * to be defined in the first place.
	 *
	 * @observable
	 * @default false
	 */
	withKeystroke: boolean;

	/**
	 * (Optional) An XML {@link module:ui/icon/iconview~IconView#content content} of the icon.
	 * When defined, an `iconView` should be added to the button.
	 *
	 * The user must provide the entire XML string, not just the path. See the
	 * {@glink framework/architecture/ui-library#setting-label-icon-and-tooltip UI library} guide for details.
	 *
	 * @observable
	 */
	icon: string | undefined;

	/**
	 * (Optional) Controls the `tabindex` HTML attribute of the button. By default, the button is focusable
	 * but does not included in the <kbd>Tab</kbd> order.
	 *
	 * @observable
	 * @default -1
	 */
	tabindex: number;

	/**
	 * (Optional) The additional CSS class set on the button.
	 *
	 * @observable
	 */
	class: string | undefined;

	/**
	 * (Optional) The ARIA property reflected by the `aria-label` DOM attribute used by assistive technologies.
	 *
	 * @observable
	 */
	ariaLabel?: string | undefined;

	/**
	 * (Optional) The ARIA property reflected by the `aria-ariaLabelledBy` DOM attribute used by assistive technologies.
	 *
	 * @observable
	 */
	ariaLabelledBy?: string | undefined;

	/**
	 * (Optional) The property reflected by the `role` DOM attribute to be used by assistive technologies.
	 *
	 * @observable
	 */
	role?: string | undefined;

	/**
	 * (Optional) The value of the `style` attribute of the label.
	 *
	 * @observable
	 */
	labelStyle: string | undefined;
}

/**
 * Fired when the button view is clicked. It won't be fired when the button {@link module:ui/button/button~Button#isEnabled}
 * is `false`.
 *
 * @eventName ~Button#execute
 */
export type ButtonExecuteEvent = {
	name: 'execute';
	args: [];
};
