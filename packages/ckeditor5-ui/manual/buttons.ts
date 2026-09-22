/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconCheck } from '@ckeditor/ckeditor5-icons';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { Locale } from '@ckeditor/ckeditor5-utils';

import '../theme/index-editor.css';

interface ContentVariant {
	label: string;
	showIcon: boolean;
	withText: boolean;
}

interface ButtonState {
	label: string;
	isEnabled: boolean;
	isOn: boolean;
	isHovered: boolean;
}

interface ButtonVariant {
	label: string;
	className: string;

	// Save/Cancel are one-shot action buttons that never toggle on, so the active (.ck-on) columns
	// do not apply. Defaults to true.
	supportsOnState?: boolean;
}

const contentVariants: Array<ContentVariant> = [
	{ label: 'Just label', showIcon: false, withText: true },
	{ label: 'Label & icon', showIcon: true, withText: true },
	{ label: 'Just icon', showIcon: true, withText: false }
];

const states: Array<ButtonState> = [
	{ label: 'Default', isEnabled: true, isOn: false, isHovered: false },
	{ label: 'Hover', isEnabled: true, isOn: false, isHovered: true },
	{ label: 'Disabled', isEnabled: false, isOn: false, isHovered: false },
	{ label: 'Active', isEnabled: true, isOn: true, isHovered: false },
	{ label: 'Active hover', isEnabled: true, isOn: true, isHovered: true }
];

const buttonVariants: Array<ButtonVariant> = [
	{ label: 'Action', className: 'ck-button-action' },
	{ label: 'Action small', className: 'ck-button-action ck-button_small' },
	{ label: 'Save', className: 'ck-button-save', supportsOnState: false },
	{ label: 'Save + surface', className: 'ck-button-save ck-button_surface', supportsOnState: false },
	{ label: 'Cancel', className: 'ck-button-cancel', supportsOnState: false },
	{ label: 'Cancel + surface', className: 'ck-button-cancel ck-button_surface', supportsOnState: false },
	{ label: 'Surface', className: 'ck-button_surface' },
	{ label: 'Outline', className: 'ck-button_outline' },
	{ label: 'Outline small', className: 'ck-button_outline ck-button_small' },
	{ label: 'Small', className: 'ck-button_small' },
	{ label: 'Standard', className: 'ck-button_standard' }
];

const locale = new Locale();

// The manual harness has no real pointer, so fake :hover with a .ck-force-hover class that mirrors
// the button's live hover background. The background resolves per variant and on-state through the
// same --ck-button-hover-background token, so this one rule covers every "Hover"/"Active hover" cell.
const forceHoverStyle = document.createElement( 'style' );

forceHoverStyle.textContent =
	'.ck.ck-button.ck-force-hover:not(.ck-disabled){background:var(--ck-button-hover-background)}';

document.head.appendChild( forceHoverStyle );

renderTable( document.querySelector( '#buttons' )! );

function renderTable( table: Element ): void {
	const thead = document.createElement( 'thead' );
	const tbody = document.createElement( 'tbody' );

	table.appendChild( thead );
	table.appendChild( tbody );

	const contentRow = document.createElement( 'tr' );
	const stateRow = document.createElement( 'tr' );

	thead.appendChild( contentRow );
	thead.appendChild( stateRow );

	contentRow.appendChild( createHeaderCell( ' ' ) );
	stateRow.appendChild( createHeaderCell( ' ' ) );

	for ( const content of contentVariants ) {
		const contentHeader = createHeaderCell( content.label );

		contentHeader.colSpan = states.length;
		contentRow.appendChild( contentHeader );

		for ( const state of states ) {
			stateRow.appendChild( createHeaderCell( state.label ) );
		}
	}

	for ( const variant of buttonVariants ) {
		const row = document.createElement( 'tr' );

		tbody.appendChild( row );
		row.appendChild( createVariantHeaderCell( variant ) );

		for ( const content of contentVariants ) {
			for ( const state of states ) {
				// Skip the active (.ck-on) columns for variants that never toggle on - render an empty cell.
				if ( state.isOn && variant.supportsOnState === false ) {
					row.appendChild( document.createElement( 'td' ) );

					continue;
				}

				row.appendChild( createButtonCell( locale, variant.className, content, state ) );
			}
		}
	}
}

function createButtonCell(
	locale: Locale,
	className: string,
	content: ContentVariant,
	state: ButtonState
): HTMLTableCellElement {
	const buttonView = new ButtonView( locale );
	const classes: Array<string> = [];

	if ( className ) {
		classes.push( className );
	}

	if ( state.isHovered ) {
		classes.push( 'ck-force-hover' );
	}

	buttonView.set( {
		label: 'Button',
		withText: content.withText,
		class: classes.join( ' ' ) || undefined,
		isEnabled: state.isEnabled,
		isOn: state.isOn,
		...content.showIcon && { icon: IconCheck }
	} );

	buttonView.render();

	const td = document.createElement( 'td' );

	td.classList.add( 'ck', 'ck-reset_all' );
	// The button's icon/label gap is direction-scoped ([dir="ltr"]/[dir="rtl"]), so it needs a
	// direction on an ancestor - a real editor UI root has one; here the cell provides it.
	td.setAttribute( 'dir', 'ltr' );
	td.appendChild( buttonView.element! );

	return td;
}

function createHeaderCell( text: string ): HTMLTableCellElement {
	const th = document.createElement( 'th' );

	th.textContent = text;

	return th;
}

// Row header for a variant: the friendly label plus the actual class name(s) it maps to.
function createVariantHeaderCell( variant: ButtonVariant ): HTMLTableCellElement {
	const th = createHeaderCell( variant.label );

	if ( variant.className ) {
		const code = document.createElement( 'code' );

		code.textContent = variant.className.trim().split( /\s+/ ).map( name => `.${ name }` ).join( '' );
		code.style.display = 'block';
		code.style.fontWeight = 'normal';
		code.style.opacity = '0.7';

		th.appendChild( code );
	}

	return th;
}
