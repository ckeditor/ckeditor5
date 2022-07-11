/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/dropdownpanelview
 */

import View from '../view';
import { logWarning } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * The dropdown panel view class.
 *
 * See {@link module:ui/dropdown/dropdownview~DropdownView} to learn about the common usage.
 *
 * @extends module:ui/view~View
 */
export default class DropdownPanelView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Controls whether the panel is visible.
		 *
		 * @observable
		 * @member {Boolean} #isVisible
		 */
		this.set( 'isVisible', false );

		/**
		 * The position of the panel, relative to the parent.
		 *
		 * This property is reflected in the CSS class set to {@link #element} that controls
		 * the position of the panel.
		 *
		 * @observable
		 * @default 'se'
		 * @member {'s'|'se'|'sw'|'sme'|'smw'|'n'|'ne'|'nw'|'nme'|'nmw'} #position
		 */
		this.set( 'position', 'se' );

		/**
		 * Collection of the child views in this panel.
		 *
		 * A common child type is the {@link module:ui/list/listview~ListView} and {@link module:ui/toolbar/toolbarview~ToolbarView}.
		 * See {@link module:ui/dropdown/utils~addListToDropdown} and
		 * {@link module:ui/dropdown/utils~addToolbarToDropdown} to learn more about child views of dropdowns.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
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
				]
			},

			children: this.children,

			on: {
				// Drag and drop in the panel should not break the selection in the editor.
				// https://github.com/ckeditor/ckeditor5-ui/issues/228
				selectstart: bind.to( evt => evt.preventDefault() )
			}
		} );
	}

	/**
	 * Focuses the view element or first item in view collection on opening dropdown's panel.
	 *
	 * See also {@link module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable}.
	 */
	focus() {
		if ( this.children.length ) {
			if ( typeof this.children.first.focus === 'function' ) {
				this.children.first.focus();
			} else {
				/**
				 * This view is missing the focus() method. Therefore it could not be focused by default in the dropdown.
				 *
				 * @error ui-dropdown-view-missing-focus
				 * @param {module:ui/view~View} view
				 */
				logWarning( 'ui-dropdown-view-missing-focus', this.children.first );
			}
		}
	}

	/**
	 * Focuses the view element or last item in view collection on opening dropdown's panel.
	 *
	 * See also {@link module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable}.
	 */
	focusLast() {
		if ( this.children.length ) {
			const lastChild = this.children.last;

			if ( typeof lastChild.focusLast === 'function' ) {
				lastChild.focusLast();
			} else {
				lastChild.focus();
			}
		}
	}
}
