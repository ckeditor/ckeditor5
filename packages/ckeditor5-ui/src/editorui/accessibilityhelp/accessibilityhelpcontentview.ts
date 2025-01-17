/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/editorui/accessibilityhelp/accessibilityhelpcontentview
 */

import {
	createElement,
	env,
	getEnvKeystrokeText,
	type Locale
} from '@ckeditor/ckeditor5-utils';

import View from '../../view.js';
import LabelView from '../../label/labelview.js';
import type {
	KeystrokeInfoCategoryDefinition,
	KeystrokeInfoDefinition,
	KeystrokeInfoDefinitions,
	KeystrokeInfoGroupDefinition
} from '@ckeditor/ckeditor5-core';

/**
 * The view displaying keystrokes in the Accessibility help dialog.
 */
export default class AccessibilityHelpContentView extends View<HTMLDivElement> {
	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, keystrokes: KeystrokeInfoDefinitions ) {
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
				...this._createCategories( Array.from( keystrokes.values() ) ),
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
	private _createCategories( categories: Array<KeystrokeInfoCategoryDefinition> ): Array<HTMLElement> {
		return categories.map( categoryDefinition => {
			const elements: Array<HTMLElement> = [
				// Category header.
				createElement( document, 'h3', {}, categoryDefinition.label ),

				// Category definitions (<dl>) and their optional headers (<h4>).
				...Array.from( categoryDefinition.groups.values() )
					.map( groupDefinition => this._createGroup( groupDefinition ) )
					.flat()
			];

			// Category description (<p>).
			if ( categoryDefinition.description ) {
				elements.splice( 1, 0, createElement( document, 'p', {}, categoryDefinition.description ) );
			}

			return createElement( document, 'section', {}, elements );
		} );
	}

	/**
	 * Creates `[<h4>Optional label</h4>]<dl>...</dl>` elements for each group of keystrokes in a category.
	 */
	private _createGroup( groupDefinition: KeystrokeInfoGroupDefinition ): Array<HTMLElement> {
		const definitionAndDescriptionElements = groupDefinition.keystrokes
			.sort( ( a, b ) => a.label.localeCompare( b.label ) )
			.map( keystrokeDefinition => this._createGroupRow( keystrokeDefinition ) )
			.flat();

		const elements: Array<HTMLElement> = [
			createElement( document, 'dl', {}, definitionAndDescriptionElements )
		];

		if ( groupDefinition.label ) {
			elements.unshift( createElement( document, 'h4', {}, groupDefinition.label ) );
		}

		return elements;
	}

	/**
	 * Creates `<dt>Keystroke label</dt><dd>Keystroke definition</dd>` elements for each keystroke in a group.
	 */
	private _createGroupRow( keystrokeDefinition: KeystrokeInfoDefinition ): [ HTMLElement, HTMLElement ] {
		const t = this.locale!.t;
		const dt = createElement( document, 'dt' );
		const dd = createElement( document, 'dd' );
		const normalizedKeystrokeDefinition = normalizeKeystrokeDefinition( keystrokeDefinition.keystroke );
		const keystrokeAlternativeHTMLs = [];

		for ( const keystrokeAlternative of normalizedKeystrokeDefinition ) {
			keystrokeAlternativeHTMLs.push( keystrokeAlternative.map( keystrokeToEnvKbd ).join( '' ) );
		}

		dt.innerHTML = keystrokeDefinition.label;
		dd.innerHTML = keystrokeAlternativeHTMLs.join( ', ' ) +
			( keystrokeDefinition.mayRequireFn && env.isMac ? ` ${ t( '(may require <kbd>Fn</kbd>)' ) }` : '' );

		return [ dt, dd ];
	}
}

function keystrokeToEnvKbd( keystroke: string ): string {
	return getEnvKeystrokeText( keystroke )
		.split( '+' )
		.map( part => `<kbd>${ part }</kbd>` )
		.join( '+' );
}

function normalizeKeystrokeDefinition( definition: KeystrokeInfoDefinition[ 'keystroke' ] ): Array<Array<string>> {
	if ( typeof definition === 'string' ) {
		return [ [ definition ] ];
	}

	if ( typeof definition[ 0 ] === 'string' ) {
		return [ definition as Array<string> ];
	}

	return definition as Array<Array<string>>;
}
