/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getEnvKeystrokeText, type Locale } from '@ckeditor/ckeditor5-utils';
import {
	DEFAULT_GROUP_ID,
	type KeystrokeDefinition,
	type KeystrokeGroupDefinition,
	type KeystrokesCategory
} from './accessibilityhelp.js';
import View from '../view.js';

/**
 * TODO
 */
export default class AccessibilityHelpContentView extends View<HTMLDivElement> {
	/**
	 * @inheritdoc
	 */
	constructor( locale: Locale, keystrokes: Map<string, KeystrokesCategory> ) {
		super( locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-accessibility-help-content' ],
				'aria-label': 'Help Contents. To close this dialog press ESC.',
				tabindex: -1
			},
			children: [
				...this._getKeystrokeCategoryElements( keystrokes )
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
	 * TODO
	 */
	private _getKeystrokeCategoryElements( keystrokes: Map<string, KeystrokesCategory> ): Array<HTMLElement> {
		const categoryElements = [];

		for ( const [ , category ] of keystrokes ) {
			const container = document.createElement( 'section' );
			const header = document.createElement( 'h3' );

			header.innerHTML = category.label;
			container.append( header );

			if ( category.description ) {
				const description = document.createElement( 'p' );
				description.innerHTML = category.description;
				container.append( description );
			}

			const table = document.createElement( 'table' );
			const tbody = document.createElement( 'tbody' );

			for ( const [ groupId, group ] of category.keystrokeGroups ) {
				tbody.append( ...this._createKeystrokeGroupElements( groupId, group ) );
			}

			table.innerHTML = `<table>
				<thead>
					<tr>
						<th>Action</th>
						<th>Keystroke</th>
					</tr>
				</thead>
				${ tbody.outerHTML }
			</table>`;

			container.append( table );
			categoryElements.push( container );
		}

		return categoryElements;
	}

	/**
	 * TODO
	 */
	private _createKeystrokeGroupElements( groupId: string, group: KeystrokeGroupDefinition ): Array<HTMLElement> {
		const elements = [];

		if ( groupId !== DEFAULT_GROUP_ID ) {
			const headerRow = document.createElement( 'tr' );

			headerRow.innerHTML = `<tr>
				<th colspan="2">${ group.label }</th>
			</tr>`;

			elements.push( headerRow );
		}

		for ( const keystrokeDef of group.keystrokes.sort( ( a, b ) => sortAlphabetically( a.label, b.label ) ) ) {
			elements.push( this._createKeystrokeRowElement( keystrokeDef ) );
		}

		return elements;
	}

	/**
	 * TODO
	 */
	private _createKeystrokeRowElement( keystrokeDef: KeystrokeDefinition ): HTMLElement {
		const row = document.createElement( 'tr' );
		const normalizedKeystrokeDefinition = normalizeKeystrokeDefinition( keystrokeDef.keystroke );
		const keystrokeAlternativeHTMLs = [];

		for ( const keystrokeAlternative of normalizedKeystrokeDefinition ) {
			keystrokeAlternativeHTMLs.push( keystrokeAlternative.map( keystrokeToEnvKbd ).join( '' ) );
		}

		row.innerHTML = `<tr>
			<td>${ keystrokeDef.label }</td>
			<td>${ keystrokeAlternativeHTMLs.join( ', ' ) }</td>
		</tr>`;

		return row;
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
