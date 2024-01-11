/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { env, getEnvKeystrokeText, type Locale } from '@ckeditor/ckeditor5-utils';
import type { KeystrokeDefinition } from './accessibilityhelp.js';
import View from '../view.js';

/**
 * TODO
 */
export default class AccessibilityHelpContentView extends View<HTMLDivElement> {
	/**
	 * @inheritdoc
	 */
	constructor( locale: Locale, keystrokeDefinitions: Array<KeystrokeDefinition> ) {
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
				this._createUserInterfaceAndNavigationSection()
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
			const normalizedKeystrokeDefinition = normalizeKeystrokeDefinition( definition.keystroke );
			const keystrokeAlternativeHTMLs = [];

			for ( const keystrokeAlternative of normalizedKeystrokeDefinition ) {
				keystrokeAlternativeHTMLs.push( keystrokeAlternative.map( keystrokeToEnvKbd ).join( '' ) );
			}

			tbody.innerHTML += `
				<tr>
					<td>${ definition.label }</td>
					<td>${ keystrokeAlternativeHTMLs.join( '<br>' ) }</td>
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
							${ env.isMac ? ' (may require <kbd>Fn</kbd>)' : '' }</td>
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

function normalizeKeystrokeDefinition( definition: KeystrokeDefinition[ 'keystroke' ] ): Array<Array<string>> {
	if ( typeof definition === 'string' ) {
		return [ [ definition ] ];
	}

	if ( definition.every( entry => typeof entry == 'string' ) ) {
		return [ definition as Array<string> ];
	}

	return definition as Array<Array<string>>;
}
