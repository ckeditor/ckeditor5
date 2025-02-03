/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ColorUI from './../../src/ui/colorui.js';
import FontColorCommand from './../../src/fontcolor/fontcolorcommand.js';

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
