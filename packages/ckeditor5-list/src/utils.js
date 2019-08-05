/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/utils
 */

import { getFillerOffset } from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

/**
 * Creates list item {@link module:engine/view/containerelement~ContainerElement}.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The writer instance.
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createViewListItemElement( writer ) {
	const viewItem = writer.createContainerElement( 'li' );
	viewItem.getFillerOffset = getListItemFillerOffset;

	return viewItem;
}

/**
 * Helper method for creating an UI button and linking it with an appropriate command.
 *
 * @private
 * @param {module:core/editor/editor~Editor} editor The editor instance to which UI component will be added.
 * @param {String} commandName The name of the command.
 * @param {Object} label The button label.
 * @param {String} icon The source of the icon.
 */
export function createUIComponent( editor, commandName, label, icon ) {
	editor.ui.componentFactory.add( commandName, locale => {
		const command = editor.commands.get( commandName );

		const buttonView = new ButtonView( locale );

		buttonView.set( {
			label,
			icon,
			tooltip: true
		} );

		// Bind button model to command.
		buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		// Execute command.
		buttonView.on( 'execute', () => editor.execute( commandName ) );

		return buttonView;
	} );
}

// Implementation of getFillerOffset for view list item element.
//
// @returns {Number|null} Block filler offset or `null` if block filler is not needed.
function getListItemFillerOffset() {
	const hasOnlyLists = !this.isEmpty && ( this.getChild( 0 ).name == 'ul' || this.getChild( 0 ).name == 'ol' );

	if ( this.isEmpty || hasOnlyLists ) {
		return 0;
	}

	return getFillerOffset.call( this );
}
