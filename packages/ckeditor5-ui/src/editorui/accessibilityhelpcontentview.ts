/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getEnvKeystrokeText, type Locale } from '@ckeditor/ckeditor5-utils';
import {
	type KeystrokeDefinition,
	type KeystrokeGroupDefinition,
	type KeystrokesCategory
} from './accessibilityhelp.js';
import View from '../view.js';
import LabelView from '../label/labelview.js';

/**
 * TODO
 */
export default class AccessibilityHelpContentView extends View<HTMLDivElement> {
	/**
	 * @inheritdoc
	 */
	constructor( locale: Locale, keystrokes: Map<string, KeystrokesCategory> ) {
		super( locale );

		const t = locale.t;
		const helpLabel = new LabelView();

		helpLabel.text = t( 'Help Contents. To close this dialog press ESC.' );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-accessibility-help-content' ],
				'aria-labelledby': helpLabel.id,
				role: 'document',
				tabindex: -1
			},
			children: [
				...this._getKeystrokeCategoryElements( keystrokes ),
				helpLabel
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

			for ( const [ groupId, group ] of category.keystrokeGroups ) {
				container.append( ...this._createKeystrokeGroupElements( groupId, group ) );
			}

			categoryElements.push( container );
		}

		return categoryElements;
	}

	/**
	 * TODO
	 */
	private _createKeystrokeGroupElements( groupId: string, group: KeystrokeGroupDefinition ): Array<HTMLElement> {
		const elements = [];
		const dl = document.createElement( 'dl' );

		if ( group.label ) {
			const header = document.createElement( 'h4' );
			header.innerHTML = group.label;

			elements.push( header );
		}

		for ( const keystrokeDef of group.keystrokes.sort( ( a, b ) => sortAlphabetically( a.label, b.label ) ) ) {
			dl.append( ...this._createKeystrokeRowElement( keystrokeDef ) );
		}

		elements.push( dl );

		return elements;
	}

	/**
	 * TODO
	 */
	private _createKeystrokeRowElement( keystrokeDef: KeystrokeDefinition ): [ HTMLElement, HTMLElement ] {
		const dt = document.createElement( 'dt' );
		const dd = document.createElement( 'dd' );
		const normalizedKeystrokeDefinition = normalizeKeystrokeDefinition( keystrokeDef.keystroke );
		const keystrokeAlternativeHTMLs = [];

		for ( const keystrokeAlternative of normalizedKeystrokeDefinition ) {
			keystrokeAlternativeHTMLs.push( keystrokeAlternative.map( keystrokeToEnvKbd ).join( '' ) );
		}

		dt.innerHTML = keystrokeDef.label;
		dd.innerHTML = keystrokeAlternativeHTMLs.join( ', ' );

		return [ dt, dd ];
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
