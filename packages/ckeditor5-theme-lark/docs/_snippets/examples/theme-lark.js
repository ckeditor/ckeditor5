/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	Plugin,
	Command,
	ClassicEditor,
	CloudServices,
	PictureEditing,
	CKBox,
	CKBoxImageEdit,
	ImageUpload,
	FindAndReplace,
	CodeBlock
} from 'ckeditor5';

import { CS_CONFIG, TOKEN_URL, ArticlePluginSet, getViewportTopOffsetConfig } from '@snippets/index.js';

import DARK_MODE_STYLES from './custom.css?raw';

// This code snippets is used in the following documentation files:
//
// - packages/ckeditor5-theme-lark/docs/examples/theme-customization.md
// - packages/ckeditor5-theme-lark/docs/framework/theme-customization.md
//
// Ensure to update the HTML tree when modifying it in this snippet on both pages.

class DarkModeCKBoxIntegration extends Plugin {
	static get pluginName() {
		return 'DarkModeCKBoxIntegration';
	}

	afterInit() {
		const editor = this.editor;

		// Processing with the integration only when CKBox is available.
		if ( !editor.plugins.has( 'CKBoxEditing' ) ) {
			return;
		}

		// Load CKBox dark theme.
		this._ckboxLinkElement = document.createElement( 'link' );
		this._ckboxLinkElement.rel = 'stylesheet';
		this._ckboxLinkElement.href = 'https://cdn.ckbox.io/ckbox/2.4.0/styles/themes/dark.css';

		document.head.appendChild( this._ckboxLinkElement );

		// Integrate the dark mode toggle command with CKBox.
		const defaultTheme = editor.config.get( 'ckbox.theme' );
		const darkModeToggleCommand = editor.commands.get( 'darkModeToggle' );

		this.listenTo( darkModeToggleCommand, 'execute', () => {
			const { value } = darkModeToggleCommand;

			editor.config.set( 'ckbox.theme', value === 'dark' ? 'dark' : defaultTheme );
		}, { priority: 'low' } );
	}

	destroy() {
		if ( this._ckboxLinkElement ) {
			this._ckboxLinkElement.remove();
		}

		return super.destroy();
	}
}

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

		return super.destroy();
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

		this.value = '';
	}

	destroy() {
		this.styleElement.remove();

		return super.destroy();
	}

	execute( mode = undefined ) {
		const shouldEnableDarkMode = mode === 'dark' || ( !mode && this.value === 'light' );

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
		this.value = this.styleElement.innerText.length !== 0 ? 'dark' : 'light';
	}
}

ClassicEditor
	.create( document.querySelector( '#snippet-classic-editor' ), {
		plugins: [
			ArticlePluginSet,
			PictureEditing,
			CKBox,
			CKBoxImageEdit,
			ImageUpload,
			CloudServices,
			FindAndReplace,
			CodeBlock,
			DarkModeToggle,
			DarkModeCKBoxIntegration
		],
		toolbar: {
			items: [
				'undo', 'redo', 'findAndReplace',
				'|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed', 'codeBlock',
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
		darkMode: {
			mode: 'dark'
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			forceDemoLabel: true,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;

		const themeModeLightInput = document.getElementById( 'theme-mode-light' ).querySelector( 'input' );
		const themeModeDarkInput = document.getElementById( 'theme-mode-dark' ).querySelector( 'input' );

		themeModeLightInput.addEventListener( 'change', handleModeChange );
		themeModeDarkInput.addEventListener( 'change', handleModeChange );

		function handleModeChange( evt ) {
			const value = evt.target.value === 'dark' ? 'dark' : 'light';

			editor.execute( 'darkModeToggle', value );
		}

		const command = editor.commands.get( 'darkModeToggle' );

		if ( command.value === 'dark' ) {
			themeModeDarkInput.checked = true;
		} else {
			themeModeLightInput.checked = true;
		}

		// Reflect the input state based on changing the theme mode via the command.
		command.on( 'change:value', ( event, property, newValue ) => {
			if ( newValue === 'dark' ) {
				themeModeDarkInput.checked = true;
			} else {
				themeModeLightInput.checked = true;
			}
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
