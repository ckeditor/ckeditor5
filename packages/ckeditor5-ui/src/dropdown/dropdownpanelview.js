/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/dropdown/dropdownpanelview
 */

import View from '../view';
import Template from '../template';

/**
 * The dropdown panel view class.
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
		 * Collection of the child views.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		this.template = new Template( {
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
}
