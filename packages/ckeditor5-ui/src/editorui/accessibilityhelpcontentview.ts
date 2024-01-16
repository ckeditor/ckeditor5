/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editorui/accessibilityhelpcontentview
 */

import {
	createElement,
	env,
	getEnvKeystrokeText,
	type Locale
} from '@ckeditor/ckeditor5-utils';
import {
	type AccessibilityHelpKeystrokeDefinition,
	type AccessibilityHelpKeystrokeGroupDefinition,
	type AccessibilityHelpKeystrokesCategory
} from './accessibilityhelp.js';
import View from '../view.js';
import LabelView from '../label/labelview.js';

/**
 * The view displaying keystrokes in the Accessibility help dialog.
 */
export default class AccessibilityHelpContentView extends View<HTMLDivElement> {
	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, keystrokes: Map<string, AccessibilityHelpKeystrokesCategory> ) {
		super( locale );

		const t = locale.t;
		const helpLabel = new LabelView();

		helpLabel.text = t( 'Help Contents. To close this dialog press ESC.' );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-accessibility-help-dialog__content' ],
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
	 * @inheritDoc
	 */
	public focus(): void {
		this.element!.focus();
	}

	/**
	 * Creates `<section><h3>Category label</h3>...</section>` elements for each category of keystrokes.
	 */
	private _createCategories( keystrokes: Map<string, AccessibilityHelpKeystrokesCategory> ): Array<HTMLElement> {
		return Array.from( keystrokes.entries() ).map( ( [ , category ] ) => {
			return createElement( document, 'section', {}, [
				// Category header.
				createElement( document, 'h3', {}, category.label ),

				// Category definitions (<dl>) and their optional headers (<h4>).
				...Array.from( category.groups.entries() ).map( this._createGroup.bind( this ) ).flat()
			] );
		} );
	}

	/**
	 * Creates `[<h4>Optional label</h4>]<dl>...</dl>` elements for each group of keystrokes in a category.
	 */
	private _createGroup( [ , group ]: [ groupId: string, group: AccessibilityHelpKeystrokeGroupDefinition ] ): Array<HTMLElement> {
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
	 * Creates `<dt>Keystroke label</dt><dd>Keystroke definition</dd>` elements for each keystroke in a group.
	 */
	private _createGroupRow( keystrokeDef: AccessibilityHelpKeystrokeDefinition ): [ HTMLElement, HTMLElement ] {
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
			( keystrokeDef.mayRequireFn && env.isMac ? ` ${ t( '(may require <kbd>Fn</kbd>)' ) }` : '' );

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

function normalizeKeystrokeDefinition( definition: AccessibilityHelpKeystrokeDefinition[ 'keystroke' ] ): Array<Array<string>> {
	if ( typeof definition === 'string' ) {
		return [ [ definition ] ];
	}

	if ( typeof definition[ 0 ] === 'string' ) {
		return [ definition as Array<string> ];
	}

	return definition as Array<Array<string>>;
}
