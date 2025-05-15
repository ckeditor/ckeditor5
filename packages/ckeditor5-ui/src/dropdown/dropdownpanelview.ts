/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dropdown/dropdownpanelview
 */

import View from '../view.js';
import type ViewCollection from '../viewcollection.js';
import type DropdownPanelFocusable from './dropdownpanelfocusable.js';

import { logWarning, type Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The dropdown panel view class.
 *
 * See {@link module:ui/dropdown/dropdownview~DropdownView} to learn about the common usage.
 */
export default class DropdownPanelView extends View implements DropdownPanelFocusable {
	/**
	 * Collection of the child views in this panel.
	 *
	 * A common child type is the {@link module:ui/list/listview~ListView} and {@link module:ui/toolbar/toolbarview~ToolbarView}.
	 * See {@link module:ui/dropdown/utils~addListToDropdown} and
	 * {@link module:ui/dropdown/utils~addToolbarToDropdown} to learn more about child views of dropdowns.
	 */
	public readonly children: ViewCollection;

	/**
	 * Controls whether the panel is visible.
	 *
	 * @observable
	 */
	declare public isVisible: boolean;

	/**
	 * The position of the panel, relative to the parent.
	 *
	 * This property is reflected in the CSS class set to {@link #element} that controls
	 * the position of the panel.
	 *
	 * @observable
	 * @default 'se'
	 */
	declare public position: PanelPosition;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isVisible', false );
		this.set( 'position', 'se' );

		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-reset',
					'ck-dropdown__panel',
					bind.to( 'position', value => `ck-dropdown__panel_${ value }` ),
					bind.if( 'isVisible', 'ck-dropdown__panel-visible' )
				],
				tabindex: '-1'
			},

			children: this.children,

			on: {
				// Drag and drop in the panel should not break the selection in the editor.
				// https://github.com/ckeditor/ckeditor5-ui/issues/228
				selectstart: bind.to( evt => {
					if ( ( evt.target as HTMLElement ).tagName.toLocaleLowerCase() === 'input' ) {
						return;
					}

					evt.preventDefault();
				} )
			}
		} );
	}

	/**
	 * Focuses the first view in the {@link #children} collection.
	 *
	 * See also {@link module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable}.
	 */
	public focus(): void {
		if ( this.children.length ) {
			const firstChild: any = this.children.first;

			if ( typeof firstChild.focus === 'function' ) {
				firstChild.focus();
			} else {
				/**
				 * The child view of a dropdown could not be focused because it is missing the `focus()` method.
				 *
				 * This warning appears when a dropdown {@link module:ui/dropdown/dropdownview~DropdownView#isOpen gets open} and it
				 * attempts to focus the {@link module:ui/dropdown/dropdownpanelview~DropdownPanelView#children first child} of its panel
				 * but the child does not implement the
				 * {@link module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable focusable interface}.
				 *
				 * Focusing the content of a dropdown on open greatly improves the accessibility. Please make sure the view instance
				 * provides the `focus()` method for the best user experience.
				 *
				 * @error ui-dropdown-panel-focus-child-missing-focus
				 * @param {module:ui/view~View} childView Child view.
				 * @param {module:ui/dropdown/dropdownpanelview~DropdownPanelView} dropdownPanel A parent of a child.
				 */
				logWarning( 'ui-dropdown-panel-focus-child-missing-focus', { childView: this.children.first, dropdownPanel: this } );
			}
		}
	}

	/**
	 * Focuses the view element or last item in view collection on opening dropdown's panel.
	 *
	 * See also {@link module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable}.
	 */
	public focusLast(): void {
		if ( this.children.length ) {
			const lastChild: any = this.children.last;

			if ( typeof lastChild.focusLast === 'function' ) {
				lastChild.focusLast();
			} else {
				lastChild.focus();
			}
		}
	}
}

/**
 * The position of the panel, relative to the parent.
 */
export type PanelPosition = 's' | 'se' | 'sw' | 'sme' | 'smw' | 'n' | 'ne' | 'nw' | 'nme' | 'nmw';
