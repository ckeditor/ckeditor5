/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { createElement, getEnvKeystrokeText, type Locale } from '@ckeditor/ckeditor5-utils';
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
				createElement( document, 'p', {}, t( 'Below, you can find a list of keyboard shortcuts that can be used in the editor.' ) ),
				...this._createCategories( keystrokes ),
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
	private _createCategories( keystrokes: Map<string, KeystrokesCategory> ): Array<HTMLElement> {
		return Array.from( keystrokes.entries() ).map( ( [ , category ] ) => {
			return createElement( document, 'section', {}, [
				// Category header.
				createElement( document, 'h3', {}, category.label ),

				// Category definitions (<dl>) and their optional headers (<h4>).
				...Array.from( category.keystrokeGroups.entries() ).map( this._createGroup.bind( this ) ).flat()
			] );
		} );
	}

	/**
	 * TODO
	 */
	private _createGroup( [ , group ]: [ groupId: string, group: KeystrokeGroupDefinition ] ): Array<HTMLElement> {
		const elements: Array<HTMLElement> = [
			createElement( document, 'dl', {}, group.keystrokes
				.sort( ( a, b ) => sortAlphabetically( a.label, b.label ) )
				.map( this._createGroupRow.bind( this ) )
				.flat()
			)
		];

		if ( group.label ) {
			elements.unshift( createElement( document, 'h4', {}, group.label ) );
		}

		return elements;
	}

	/**
	 * TODO
	 */
	private _createGroupRow( keystrokeDef: KeystrokeDefinition ): [ HTMLElement, HTMLElement ] {
		const t = this.locale!.t;
		const dt = createElement( document, 'dt' );
		const dd = createElement( document, 'dd' );
		const normalizedKeystrokeDefinition = normalizeKeystrokeDefinition( keystrokeDef.keystroke );
		const keystrokeAlternativeHTMLs = [];

		for ( const keystrokeAlternative of normalizedKeystrokeDefinition ) {
			keystrokeAlternativeHTMLs.push( keystrokeAlternative.map( keystrokeToEnvKbd ).join( '' ) );
		}

		dt.innerHTML = keystrokeDef.label;
		dd.innerHTML = keystrokeAlternativeHTMLs.join( ', ' ) +
			( keystrokeDef.mayRequireFn ? ` ${ t( '(may require <kbd>Fn</kbd>)' ) }` : '' );

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
