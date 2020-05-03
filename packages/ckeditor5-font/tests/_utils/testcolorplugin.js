/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ColorUI from './../../src/ui/colorui';
import FontColorCommand from './../../src/fontcolor/fontcolorcommand';

export default class TestColorPlugin extends ColorUI {
	constructor( editor ) {
		super( editor, {
			commandName: 'testColorCommand',
			componentName: 'testColor',
			icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"></svg>',
			dropdownLabel: editor.locale.t( 'Test Color' )
		} );

		editor.commands.add( 'testColorCommand', new FontColorCommand( editor ) );
		editor.model.schema.extend( '$text', { allowAttributes: 'testColor' } );
	}

	static get pluginName() {
		return 'TestColorPlugin';
	}
}
