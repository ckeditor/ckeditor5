/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/dropdownpanelview
 */

import View from '../view';

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
					'ck-reset',
					'ck-dropdown__panel',
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
			this.children.first.focus();
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
