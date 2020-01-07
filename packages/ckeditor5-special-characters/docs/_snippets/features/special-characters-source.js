/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';

class SpecialCharactersEmoji extends Plugin {
	static get pluginName() {
		return 'SpecialCharactersEmoji';
	}

	init() {
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Emoji', [
			{ title: 'smiley face', character: '😊' },
			{ title: 'rocket', character: '🚀' },
			{ title: 'basketball', character: '🏀' },
			{ title: 'floppy disk', character: '💾' },
			{ title: 'hearth', character: '❤' }
		] );
	}
}

class SpecialCharactersArrowsExtended extends Plugin {
	static get pluginName() {
		return 'SpecialCharactersArrowsExtended';
	}

	init() {
		this.editor.plugins.get( 'SpecialCharacters' ).addItems( 'Arrows', [
			{ title: 'simple arrow left', character: '←' },
			{ title: 'simple arrow up', character: '↑' },
			{ title: 'simple arrow right', character: '→' },
			{ title: 'simple arrow down', character: '↓' }
		] );
	}
}

ClassicEditor.builtinPlugins.push( Alignment );
ClassicEditor.builtinPlugins.push( SpecialCharacters );
ClassicEditor.builtinPlugins.push( SpecialCharactersEssentials );
ClassicEditor.builtinPlugins.push( SpecialCharactersEmoji );
ClassicEditor.builtinPlugins.push( SpecialCharactersArrowsExtended );

window.ClassicEditor = ClassicEditor;
