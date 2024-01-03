/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { env, getEnvKeystrokeText, type Locale } from '@ckeditor/ckeditor5-utils';
import type { KeystrokeDefinition } from './accessibilityhelp.js';
import View from '../view.js';
import { escape } from 'lodash-es';
import TextareaView from '../textarea/textareaview.js';

/**
 * TODO
 */
export default class AccessibilityHelpContentView extends View<HTMLDivElement> {
	/**
	 * @inheritdoc
	 */
	constructor( locale: Locale, keystrokeDefinitions: Array<KeystrokeDefinition>, pluginNames: Array<string>, config: string ) {
		super( locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-accessibility-help-content' ],
				'aria-label': 'Help Contents. To close this dialog press ESC.',
				tabindex: -1
			},
			children: [
				this._createContentEditingSection( keystrokeDefinitions ),
				this._createUserInterfaceAndNavigationSection(),
				this._createEditorVersionSection(),
				this._createEditorPluginsSection( pluginNames ),
				this._createConfigSection( config )
			]
		} );
	}

	/**
	 * @inheritdoc
	 */
	public focus(): void {
		this.element!.focus();
	}

	/**
	 * @inheritdoc
	 */
	private _createContentEditingSection( keystrokeDefinitions: Array<KeystrokeDefinition> ): HTMLElement {
		const element = document.createElement( 'section' );
		const tbody = document.createElement( 'tbody' );

		// TODO: Not sure about sorting here. Some keystroke look nice next to each other, e.g. copy & paste.
		// OTOH, sorting makes it easier to find a keystroke and navigate the list in general.
		for ( const definition of keystrokeDefinitions.sort( ( a, b ) => sortAlphabetically( a.label, b.label ) ) ) {
			if ( typeof definition.keystroke === 'string' ) {
				definition.keystroke = [ definition.keystroke ];
			}

			tbody.innerHTML += `
				<tr>
					<td>${ definition.label }</td>
					<td>${ definition.keystroke.map( keystrokeToEnvKbd ).join( '<br>' ) }</td>
				</tr>
			`;
		}

		element.innerHTML = `
			<h3>Content editing</h3>
			<table>
				<thead>
					<tr>
						<th>Action</th>
						<th>Keystroke</th>
					</tr>
				</thead>
				${ tbody.outerHTML }
			</table>
		`;

		return element;
	}

	/**
	 * @inheritdoc
	 */
	private _createUserInterfaceAndNavigationSection(): HTMLElement {
		const element = document.createElement( 'section' );

		element.innerHTML = `
			<h3>User interface and navigation</h3>
			<table>
				<thead>
					<tr>
						<th>Action</th>
						<th>Keystroke</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Close contextual balloons and UI components like dropdowns</td>
						<td><kbd>Esc</kbd></td>
					</tr>
					<tr>
						<td>Move focus to the visible contextual balloon</td>
						<td><kbd>Tab</kbd></td>
					</tr>
					<tr>
						<td>Move focus between fields (inputs and buttons) in contextual balloons</td>
						<td><kbd>Tab</kbd></td>
					</tr>
					<tr>
						<td>Move focus to the toolbar</td>
						<td>${ keystrokeToEnvKbd( 'Alt+F10' ) }
							${ env.isMac ? '<br> (may require <kbd>Fn</kbd>)' : '' }</td>
					</tr>
					<tr>
						<td>Navigate through the toolbar</td>
						<td><kbd>↑</kbd> / <kbd>→</kbd> / <kbd>↓</kbd> / <kbd>←</kbd></td>
					</tr>
					<tr>
						<td>Execute the currently focused button</td>
						<td><kbd>Enter</kbd> / <kbd>Space</kbd></td>
					</tr>
				</tbody>
			</table>
		`;

		return element;
	}

	/**
	 * @inheritdoc
	 */
	private _createEditorVersionSection(): HTMLElement {
		const element = document.createElement( 'section' );

		element.innerHTML = `
			<h3>Editor version</h3>
			<p>v${ CKEDITOR_VERSION }</p>
		`;

		return element;
	}

	/**
	 * @inheritdoc
	 */
	private _createEditorPluginsSection( pluginNames: Array<string> ): HTMLElement {
		const element = document.createElement( 'section' );

		element.innerHTML = `
			<h3>Editor plugins</h3>
			<p>${ pluginNames.sort( sortAlphabetically ).map( decorateInKbd ).join( ', ' ) }</p>
		`;

		return element;
	}

	/**
	 * @inheritdoc
	 */
	private _createConfigSection( config: string ): View {
		const textareaView = new TextareaView();
		textareaView.value = config;
		textareaView.resize = 'none';
		textareaView.isReadOnly = true;

		const heading = document.createElement( 'h3' );
		heading.textContent = 'Editor config';
		const sectionView = new View();

		sectionView.setTemplate( {
			tag: 'section',
			children: [
				heading,
				textareaView
			]
		} );

		return sectionView;
	}
}

function keystrokeToEnvKbd( keystroke: string ) {
	return decorateInKbd( getEnvKeystrokeText( keystroke ) );
}

function decorateInKbd( text: string ) {
	return text.split( '+' ).map( part => `<kbd>${ part }</kbd>` ).join( '+' );
}

function sortAlphabetically( a: string, b: string ) {
	return a.localeCompare( b );
}
