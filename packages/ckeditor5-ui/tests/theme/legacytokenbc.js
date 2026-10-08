/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';

// These tests assert the legacy-token backward-compatibility bridges against the real theme
// stylesheets, which the test runner loads into the document for every test in this package.
//
// Each bridged usage reads the legacy name first: `var( --ck-old, var( --ck-new ) )`. So an
// integrator override of the old name wins (override backward-compatibility), and with no
// override the value equals the new token (value-neutral, no regression). A token that a
// component re-defines keeps its own value, because the legacy read alias is not loaded by
// default — that is the exact guard against the eager-alias regression that once blanked tooltips.

describe( 'legacy token backward-compatibility bridges', () => {
	const overridden = [];
	const appended = [];

	function override( token, value ) {
		document.documentElement.style.setProperty( token, value );
		overridden.push( token );
	}

	afterEach( () => {
		while ( overridden.length ) {
			document.documentElement.style.removeProperty( overridden.pop() );
		}

		while ( appended.length ) {
			appended.pop().remove();
		}
	} );

	const background = element => window.getComputedStyle( element ).backgroundColor;
	const color = element => window.getComputedStyle( element ).color;
	const prop = ( element, token ) => window.getComputedStyle( element ).getPropertyValue( token ).trim();

	// Integration: a real ClassicEditor, so the bridges are checked against the DOM the editor
	// actually renders (the real toolbar and the real active button), not hand-made elements.
	describe( 'on a live ClassicEditor', () => {
		let editor, element;

		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicEditor.create( element, {
				plugins: [ Essentials, Paragraph, Bold ],
				toolbar: [ 'bold' ]
			} );
		} );

		afterEach( async () => {
			await editor.destroy();
			element.remove();
		} );

		it( 'honours a legacy toolbar background override on the rendered toolbar', () => {
			const toolbar = editor.ui.view.toolbar.element;
			const original = background( toolbar );

			override( '--ck-color-toolbar-background', 'rgb(1, 2, 3)' );

			expect( background( toolbar ) ).to.equal( 'rgb(1, 2, 3)' );
			expect( original ).to.not.equal( 'rgb(1, 2, 3)' );
		} );

		it( 'keeps the rendered toolbar background equal to the new token without an override', () => {
			const toolbar = editor.ui.view.toolbar.element;
			const reference = document.createElement( 'div' );

			reference.style.background = 'var(--ck-toolbar-background-color)';
			document.body.appendChild( reference );
			appended.push( reference );

			expect( background( toolbar ) ).to.equal( background( reference ) );
		} );

		it( 'honours legacy re-defined button-on overrides on the active toolbar button', () => {
			editor.setData( '<p>foo</p>' );
			editor.execute( 'selectAll' );
			editor.execute( 'bold' );

			const onButton = editor.ui.view.toolbar.element.querySelector( '.ck-button.ck-on' );

			override( '--ck-color-button-on-background', 'rgb(7, 8, 9)' );
			override( '--ck-color-button-on-color', 'rgb(10, 11, 12)' );

			expect( onButton ).to.be.instanceOf( HTMLElement );
			expect( background( onButton ) ).to.equal( 'rgb(7, 8, 9)' );
			expect( color( onButton ) ).to.equal( 'rgb(10, 11, 12)' );
		} );

		it( 'honours a legacy rounded-corners-radius override on the editable', () => {
			// The editable's top corners are squared off, so the bridged radius shows on the bottom ones.
			const editable = editor.ui.view.editable.element;
			const radius = () => window.getComputedStyle( editable ).borderBottomLeftRadius;
			const original = radius();

			override( '--ck-rounded-corners-radius', '9px' );

			expect( radius() ).to.equal( '9px' );
			expect( original ).to.not.equal( '9px' );
		} );
	} );

	// CSS contract: resolution that does not depend on editor interaction. Each legacy name is read
	// through a real root-level bridged token, spreading coverage across token families (font size,
	// radius, focus shadow). Every token resolves without an override (no regression) and takes the
	// override of its legacy name (override backward-compatibility).
	describe( 'theme contract across token families', () => {
		const READABLE_BRIDGES = [
			{ legacy: '--ck-font-size-tiny', token: '--ck-tooltip-text-font-size', value: '99px' },
			// `--ck-radius-corners` resolves the legacy radius only under the `.ck-rounded-corners` switch.
			{ legacy: '--ck-border-radius', token: '--ck-radius-corners', value: '3px', className: 'ck ck-rounded-corners' },
			{ legacy: '--ck-focus-outer-shadow', token: '--ck-interactive-focus-shadow', value: '0 0 0 1px black' },
			{ legacy: '--ck-focus-disabled-outer-shadow', token: '--ck-interactive-focus-disabled-shadow', value: '0 0 0 2px black' },
			{ legacy: '--ck-focus-error-outer-shadow', token: '--ck-interactive-focus-error-shadow', value: '0 0 0 3px black' }
		];

		function probe( className = 'ck' ) {
			const element = document.createElement( 'div' );

			element.className = className;
			document.body.appendChild( element );
			appended.push( element );

			return element;
		}

		for ( const { legacy, token, value, className } of READABLE_BRIDGES ) {
			it( `honours a legacy override of ${ legacy }`, () => {
				const element = probe( className );

				// Resolves to the new token when nothing overrides the legacy name (no regression).
				expect( prop( element, token ) ).to.not.equal( '' );

				override( legacy, value );

				expect( prop( element, token ) ).to.equal( value );
			} );
		}

		it( 'keeps the tooltip background distinct from a generic balloon panel (eager-alias guard)', () => {
			const panel = probe( 'ck ck-balloon-panel' );
			const tooltip = probe( 'ck ck-balloon-panel ck-tooltip' );

			// With no override, and the legacy read alias intentionally not loaded by default, the
			// tooltip keeps its own (inverse) background rather than inheriting the generic panel
			// default. If the legacy alias leaked back in, both would collapse to the same value.
			expect( background( tooltip ) ).to.not.equal( background( panel ) );
		} );

		it( 'collapses the tooltip onto the panel when the legacy panel name is pinned at the root', () => {
			const panel = probe( 'ck ck-balloon-panel' );
			const tooltip = probe( 'ck ck-balloon-panel ck-tooltip' );

			// The balloon background reads the legacy name first:
			// `var( --ck-color-panel-background, var( --ck-balloon-panel-background-color ) )`. The tooltip
			// re-defines only the new name in its own scope, so it lives in the fallback operand. Pinning the
			// legacy name at the root satisfies the first operand everywhere, so the fallback — and with it the
			// tooltip's re-definition — is never read, and the tooltip collapses onto the generic panel. This is
			// why the legacy-theme preset keeps pinning the new `--ck-balloon-panel-*` names for re-themed
			// surfaces instead of the legacy names: for those tokens the legacy name is override-only, not a
			// value the preset itself may set globally.
			override( '--ck-color-panel-background', 'rgb(13, 14, 15)' );

			expect( background( panel ) ).to.equal( 'rgb(13, 14, 15)' );
			expect( background( tooltip ) ).to.equal( 'rgb(13, 14, 15)' );
		} );

		it( 'applies a legacy override scoped to a wrapper, not just :root', () => {
			// The point of the usage-site bridges: in v48 components read the legacy name directly, so an
			// integrator could override it on any selector. The balloon panel background reads
			// `var( --ck-color-panel-background, … )` at the usage, so a legacy override set on a wrapper
			// (a narrower selector than :root) resolves at the panel inside it. A :root-only bridge would not.
			const scope = document.createElement( 'div' );

			scope.style.setProperty( '--ck-color-panel-background', 'rgb(1, 2, 3)' );

			const panel = probe( 'ck ck-balloon-panel' );

			scope.appendChild( panel );
			document.body.appendChild( scope );
			appended.push( scope );

			expect( background( panel ) ).to.equal( 'rgb(1, 2, 3)' );
		} );
	} );
} );
