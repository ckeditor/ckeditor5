/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Mixin that injects the common Toolbar–like bindings.
 *
 * See {@link ui.bindings.Toolbar}.
 *
 * @mixin ui.bindings.ToolbarBindingsMixin
 */
const ToolbarBindingsMixin = {
	/**
	 * Adds buttons to the toolbar. Buttons are taken from the {@link ui.editorUI.EditorUI#featureComponents}
	 * factory.
	 *
	 * @param {String[]} buttons The name of the buttons to add to the toolbar.
	 */
	addButtons( buttons ) {
		for ( let button of buttons ) {
			this.add( 'buttons', this.editor.ui.featureComponents.create( button ) );
		}
	}
};

export default ToolbarBindingsMixin;
