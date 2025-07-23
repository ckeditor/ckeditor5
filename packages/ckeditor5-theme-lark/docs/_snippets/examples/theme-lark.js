/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin, Command, ClassicEditor, CloudServices, EasyImage, ImageUpload, FindAndReplace } from 'ckeditor5';
import { CS_CONFIG, ArticlePluginSet, getViewportTopOffsetConfig } from '@snippets/index.js';

import './custom.css';

import DARK_MODE_STYLES from './theme-lark.css?raw';

class DarkModeToggle extends Plugin {
	static get pluginName() {
		return 'DarkModeToggle';
	}

	init() {
		const editor = this.editor;

		// Config.
		editor.config.define( 'darkMode', {
			mode: 'auto'
		} );

		// Command.
		const command = new DarkModeToggleCommand( editor );
		editor.commands.add( 'darkModeToggle', command );

		// Default behavior. Commands can be executed when the editor is ready to use.
		editor.once( 'ready', () => {
			if ( this._shouldSwitchToDarkMode() ) {
				editor.execute( 'darkModeToggle', 'dark' );
			}

			const mode = editor.config.get( 'darkMode.mode' );

			if ( mode === 'auto' ) {
				this._detectColorSchemaChange();
			}
		} );
	}

	destroy() {
		if ( this._mediaQueryList && this._mediaQueryListener ) {
			this._mediaQueryList.removeEventListener( 'change', this._mediaQueryListener );
		}

		super.destroy();
	}

	_detectColorSchemaChange() {
		this._mediaQueryList = window.matchMedia( '(prefers-color-scheme: dark)' );
		this._mediaQueryListener = event => {
			this.editor.execute( 'darkModeToggle', event.matches ? 'dark' : 'light' );
		};

		this._mediaQueryList.addEventListener( 'change', this._mediaQueryListener );
	}

	_shouldSwitchToDarkMode() {
		const mode = this.editor.config.get( 'darkMode.mode' );

		if ( mode === 'dark' ) {
			return true;
		}

		// Detect a user preference.
		return window.matchMedia && window.matchMedia( '(prefers-color-scheme: dark)' ).matches;
	}
}

class DarkModeToggleCommand extends Command {
	constructor( editor ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;

		this.styleElement = document.createElement( 'style' );
		document.head.appendChild( this.styleElement );

		this.value = false;
	}

	destroy() {
		this.styleElement.remove();

		return super.destroy();
	}

	execute( mode = undefined ) {
		const shouldEnableDarkMode = mode === 'dark' || ( !mode && !this.value );

		if ( shouldEnableDarkMode ) {
			this.styleElement.innerHTML = DARK_MODE_STYLES;
		} else {
			this.styleElement.innerHTML = '';
		}

		// This command does not affect data, so we must refresh it manually.
		this.refresh();
	}

	refresh() {
		this.isEnabled = true;
		this.value = this.styleElement.innerText.length !== 0;
	}
}

ClassicEditor
	.create( document.querySelector( '#snippet-classic-editor' ), {
		plugins: [ ArticlePluginSet, EasyImage, ImageUpload, CloudServices, FindAndReplace, DarkModeToggle ],
		toolbar: {
			items: [
				'undo', 'redo', 'findAndReplace',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'toggleImageCaption', 'imageTextAlternative' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
