/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ButtonView } from '../../src/button/buttonview.js';
import { IconView } from '../../src/icon/iconview.js';
import { View } from '../../src/view.js';
import { ViewCollection } from '../../src/viewcollection.js';
import { env } from '@ckeditor/ckeditor5-utils';
import { ButtonLabelView } from '../../src/index.js';

describe( 'ButtonView', () => {
	let locale, view;

	beforeEach( () => {
		locale = { t() {} };

		view = new ButtonView( locale );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'creates view#children collection', () => {
			expect( view.children ).toBeInstanceOf( ViewCollection );
		} );

		it( 'creates #labelView', () => {
			expect( view.labelView ).toBeInstanceOf( View );
			expect( view.labelView.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.labelView.element.classList.contains( 'ck-button__label' ) ).toBe( true );
		} );

		it( 'creates #keystrokeView', () => {
			expect( view.keystrokeView ).toBeInstanceOf( View );
		} );

		it( 'creates #iconView', () => {
			expect( view.iconView ).toBeInstanceOf( IconView );
		} );

		describe( 'label', () => {
			it( 'uses ButtonLabelView by default', () => {
				expect( view.labelView ).toBeInstanceOf( ButtonLabelView );

				view.set( {
					labelStyle: 'color: red',
					label: 'bar'
				} );

				expect( view.labelView.id ).toBe( view.element.getAttribute( 'aria-labelledby' ) );
				expect( view.labelView.element.getAttribute( 'style' ) ).toBe( 'color: red' );
				expect( view.labelView.element.textContent ).toBe( 'bar' );
			} );

			it( 'accepts a custom label instance that implements the same button label interface', () => {
				class CustomLabel extends View {
					constructor() {
						super();

						const bind = this.bindTemplate;

						this.set( {
							text: undefined,
							style: undefined,
							id: undefined
						} );

						this.setTemplate( {
							tag: 'span',
							attributes: {
								id: bind.to( 'id' ),
								style: bind.to( 'style' )
							},
							children: [
								{ text: bind.to( 'text' ) }
							]
						} );
					}
				}

				const view = new ButtonView( locale, new CustomLabel() );

				view.set( {
					labelStyle: 'color: red',
					label: 'bar'
				} );

				view.render();

				expect( view.labelView ).toBeInstanceOf( CustomLabel );
				expect( view.labelView.element.id ).toBe( view.element.getAttribute( 'aria-labelledby' ) );
				expect( view.labelView.element.getAttribute( 'style' ) ).toBe( 'color: red' );
				expect( view.labelView.element.textContent ).toBe( 'bar' );

				view.destroy();
			} );
		} );
	} );

	describe( '<button> bindings', () => {
		describe( 'class', () => {
			it( 'is set initially', () => {
				expect( view.element.classList ).toHaveLength( 3 );
				expect( view.element.classList.contains( 'ck' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-button' ) ).toBe( true );
				expect( view.element.classList.contains( 'ck-disabled' ) ).toBe( false );
				expect( view.element.classList.contains( 'ck-off' ) ).toBe( true );
			} );

			it( 'reacts on view#isEnabled', () => {
				view.isEnabled = true;
				expect( view.element.classList.contains( 'ck-disabled' ) ).toBe( false );

				view.isEnabled = false;
				expect( view.element.classList.contains( 'ck-disabled' ) ).toBe( true );
			} );

			it( 'reacts on view#isOn', () => {
				view.isOn = true;
				expect( view.element.classList.contains( 'ck-on' ) ).toBe( true );

				view.isOn = false;
				expect( view.element.classList.contains( 'ck-on' ) ).toBe( false );
			} );

			it( 'reacts on view#isVisible', () => {
				view.isVisible = true;
				expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( false );

				view.isVisible = false;
				expect( view.element.classList.contains( 'ck-hidden' ) ).toBe( true );
			} );

			it( 'reacts on view#withText', () => {
				view.withText = true;
				expect( view.element.classList.contains( 'ck-button_with-text' ) ).toBe( true );

				view.withText = false;
				expect( view.element.classList.contains( 'ck-button_with-text' ) ).toBe( false );
			} );

			it( 'reacts on view#withKeystroke', () => {
				view.withKeystroke = true;
				expect( view.element.classList.contains( 'ck-button_with-keystroke' ) ).toBe( true );

				view.withKeystroke = false;
				expect( view.element.classList.contains( 'ck-button_with-keystroke' ) ).toBe( false );
			} );

			it( 'reacts on view#type', () => {
				// Default value.
				expect( view.element.getAttribute( 'type' ) ).toBe( 'button' );

				view.type = 'submit';
				expect( view.element.getAttribute( 'type' ) ).toBe( 'submit' );

				// Default value.
				view.type = null;
				expect( view.element.getAttribute( 'type' ) ).toBe( 'button' );
			} );

			it( 'reacts on view#class', () => {
				view.set( 'class', 'foo' );

				expect( view.element.classList.contains( 'foo' ) ).toBe( true );
			} );
		} );

		describe( 'labelView', () => {
			it( 'reacts on view#labelStyle', () => {
				expect( view.labelView.element.attributes.getNamedItem( 'style' ) ).toBeNull();

				view.labelStyle = 'color: red';

				expect( view.labelView.element.attributes.getNamedItem( 'style' ).value ).toBe( 'color: red' );
			} );
		} );

		describe( 'tooltip', () => {
			it( 'is initially set', () => {
				expect( view.element.dataset.ckeTooltipText ).toBeUndefined();
				expect( view.element.dataset.ckeTooltipPosition ).toBe( 's' );
			} );

			it( 'it reacts to #tooltipPosition attribute', () => {
				view.tooltip = 'foo';
				view.icon = '<svg></svg>';

				expect( view.tooltipPosition ).toBe( 's' );
				expect( view.element.dataset.ckeTooltipPosition ).toBe( 's' );

				view.tooltipPosition = 'n';
				expect( view.element.dataset.ckeTooltipPosition ).toBe( 'n' );
			} );

			describe( 'defined as a Boolean', () => {
				it( 'renders tooltip text out of #label and #keystroke', () => {
					view.tooltip = true;
					view.label = 'bar';
					view.keystroke = 'A';

					expect( view.element.dataset.ckeTooltipText ).toBe( 'bar (A)' );
				} );

				it( 'not render tooltip text when #tooltip value is false', () => {
					view.tooltip = false;
					view.label = 'bar';
					view.keystroke = 'A';

					expect( view.element.dataset.ckeTooltipText ).toBeUndefined();
				} );

				it( 'reacts to changes in #label and #keystroke', () => {
					view.tooltip = true;
					view.label = 'foo';
					view.keystroke = 'B';

					expect( view.element.dataset.ckeTooltipText ).toBe( 'foo (B)' );

					view.label = 'baz';
					view.keystroke = false;

					expect( view.element.dataset.ckeTooltipText ).toBe( 'baz' );
				} );
			} );

			describe( 'defined as a String', () => {
				it( 'renders as a plain text', () => {
					view.tooltip = 'bar';
					view.label = 'foo';
					view.keystroke = 'A';

					expect( view.element.dataset.ckeTooltipText ).toBe( 'bar' );
				} );

				it( 'reacts to changes of #tooltip', () => {
					view.tooltip = 'bar';

					expect( view.element.dataset.ckeTooltipText ).toBe( 'bar' );

					view.tooltip = 'foo';
					expect( view.element.dataset.ckeTooltipText ).toBe( 'foo' );
				} );
			} );

			describe( 'defined as a Function', () => {
				it( 'generates a tooltip text when passed #label and #keystroke', () => {
					view.tooltip = ( l, k ) => `${ l } - ${ k }`;
					view.label = 'foo';
					view.keystroke = 'A';

					expect( view.element.dataset.ckeTooltipText ).toBe( 'foo - A' );
				} );

				it( 'reacts to changes of #label and #keystroke', () => {
					view.tooltip = ( l, k ) => `${ l } - ${ k }`;
					view.label = 'foo';
					view.keystroke = 'A';

					expect( view.element.dataset.ckeTooltipText ).toBe( 'foo - A' );

					view.label = 'bar';
					view.keystroke = 'B';

					expect( view.element.dataset.ckeTooltipText ).toBe( 'bar - B' );
				} );
			} );
		} );

		describe( 'role', () => {
			it( 'is not initially set ', () => {
				expect( view.element.attributes.role ).toBeUndefined();
			} );

			it( 'reacts on view#role', () => {
				view.role = 'foo';

				expect( view.element.attributes.role.value ).toBe( 'foo' );
			} );
		} );

		describe( 'text', () => {
			it( 'is not initially set ', () => {
				expect( view.element.textContent ).toBe( '' );
			} );

			it( 'reacts on view#label', () => {
				view.label = 'bar';

				expect( view.element.textContent ).toBe( 'bar' );
			} );
		} );

		describe( 'tabindex', () => {
			it( 'is initially set ', () => {
				expect( view.element.attributes.tabindex.value ).toBe( '-1' );
			} );

			it( 'reacts on view#tabindex', () => {
				view.tabindex = 3;

				expect( view.element.attributes.tabindex.value ).toBe( '3' );
			} );
		} );

		describe( 'aria', () => {
			it( '-labelledby is set', () => {
				expect( view.element.attributes[ 'aria-labelledby' ].value )
					.toBe( view.element.lastChild.id );
				expect( view.element.attributes[ 'aria-labelledby' ].value )
					.toMatch( /^ck-editor__aria-label_\w+$/ );
			} );

			it( '-labelledby reacts to #ariaLabelledBy', () => {
				view.ariaLabelledBy = 'foo';
				expect( view.element.attributes[ 'aria-labelledby' ].value )
					.toBe( 'foo' );
			} );

			it( '-disabled reacts to #isEnabled', () => {
				view.isEnabled = true;
				expect( view.element.attributes[ 'aria-disabled' ] ).toBeUndefined();

				view.isEnabled = false;
				expect( view.element.attributes[ 'aria-disabled' ].value ).toBe( 'true' );
			} );

			it( '-pressed has correct default value for toggleable button', () => {
				view.isToggleable = true;
				view.isOn = undefined;
				expect( view.element.attributes[ 'aria-pressed' ].value ).toBe( 'false' );
			} );

			it( '-pressed reacts to #isOn', () => {
				view.isToggleable = true;
				view.isOn = true;

				expect( view.element.attributes[ 'aria-pressed' ].value ).toBe( 'true' );
				expect( view.element.hasAttribute( 'aria-checked' ) ).toBe( false );

				view.isOn = false;

				expect( view.element.attributes[ 'aria-pressed' ].value ).toBe( 'false' );
				expect( view.element.hasAttribute( 'aria-checked' ) ).toBe( false );
			} );

			it( '-pressed is not present for non–toggleable button', () => {
				view.isOn = true;

				expect( view.element.hasAttribute( 'aria-pressed' ) ).toBe( false );
				expect( view.element.hasAttribute( 'aria-checked' ) ).toBe( false );

				view.isOn = false;

				expect( view.element.hasAttribute( 'aria-pressed' ) ).toBe( false );
				expect( view.element.hasAttribute( 'aria-checked' ) ).toBe( false );
			} );

			for ( const role of [ 'radio', 'checkbox', 'option', 'switch', 'menuitemcheckbox', 'menuitemradio' ] ) {
				it( `-checked reacts to #isOn and "${ role }" button role`, () => {
					view.role = role;
					view.isToggleable = true;
					view.isOn = true;

					expect( view.element.attributes[ 'aria-checked' ].value ).toBe( 'true' );
					expect( view.element.hasAttribute( 'aria-pressed' ) ).toBe( false );

					view.isOn = false;

					expect( view.element.attributes[ 'aria-checked' ].value ).toBe( 'false' );
					expect( view.element.hasAttribute( 'aria-pressed' ) ).toBe( false );
				} );
			}

			it( '-label reacts on #ariaLabel', () => {
				view.ariaLabel = undefined;
				expect( view.element.hasAttribute( 'aria-label' ) ).toBe( false );

				view.ariaLabel = 'Foo';
				expect( view.element.attributes[ 'aria-label' ].value ).toBe( 'Foo' );
			} );

			it( '-checked is not present', () => {
				view.isOn = true;
				expect( view.element.hasAttribute( 'aria-checked' ) ).toBe( false );
			} );
		} );

		describe( 'mousedown event', () => {
			it( 'should not be prevented', () => {
				const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

				expect( ret ).toBe( true );
			} );

			describe( 'in Safari', () => {
				let view, clock;

				beforeEach( () => {
					vi.spyOn( env, 'isSafari', 'get' ).mockReturnValue( true );
					vi.useFakeTimers();
					clock = { tick: ms => vi.advanceTimersByTime( ms ) };
					view = new ButtonView( locale );
					view.render();
				} );

				afterEach( () => {
					vi.useRealTimers();
					view.destroy();
				} );

				it( 'the button is focused', () => {
					const spy = vi.spyOn( view.element, 'focus' );
					view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );
					clock.tick( 0 );

					expect( spy ).toHaveBeenCalledTimes( 1 );
				} );

				it( 'does not steal focus from other element if the focus already moved', () => {
					const spy = vi.spyOn( view.element, 'focus' );
					view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );
					view.element.dispatchEvent( new Event( 'mouseup', { cancelable: true } ) );

					document.body.focus();
					clock.tick( 0 );

					expect( spy ).toHaveBeenCalledTimes( 0 );
				} );

				it( 'the event is not prevented', () => {
					const ret = view.element.dispatchEvent( new Event( 'mousedown', { cancelable: true } ) );

					expect( ret ).toBe( true );
				} );
			} );
		} );

		describe( 'execute event', () => {
			it( 'triggers view#execute event if button is not disabled', () => {
				const spy = vi.fn();

				view.on( 'execute', spy );
				view.set( 'isEnabled', true );

				view.element.dispatchEvent( new Event( 'click' ) );
				expect( spy ).toHaveBeenCalledTimes( 1 );

				view.isEnabled = false;

				view.element.dispatchEvent( new Event( 'click' ) );
				expect( spy ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( '#iconView', () => {
		it( 'is omited in #children when view#icon is not defined', () => {
			view = new ButtonView( locale );
			view.render();

			expect( view.element.childNodes ).toHaveLength( 1 );
			expect( view.iconView.element ).toBeNull();
		} );

		it( 'is added to the #children when view#icon is defined', () => {
			view = new ButtonView( locale );
			view.icon = '<svg></svg>';
			view.render();

			expect( view.element.childNodes ).toHaveLength( 2 );
			expect( view.element.childNodes[ 0 ] ).toBe( view.iconView.element );

			expect( view.iconView ).toBeInstanceOf( IconView );
			expect( view.iconView.content ).toBe( '<svg></svg>' );
			expect( view.iconView.element.classList.contains( 'ck-button__icon' ) ).toBe( true );

			view.icon = '<svg>bar</svg>';
			expect( view.iconView.content ).toBe( '<svg>bar</svg>' );
		} );

		it( 'is added to the #children when view#icon is defined after render', () => {
			view = new ButtonView( locale );
			view.render();

			view.icon = '<svg></svg>';
			expect( view.element.childNodes ).toHaveLength( 2 );
			expect( view.element.childNodes[ 0 ] ).toBe( view.iconView.element );

			expect( view.iconView ).toBeInstanceOf( IconView );
			expect( view.iconView.content ).toBe( '<svg></svg>' );
			expect( view.iconView.element.classList.contains( 'ck-button__icon' ) ).toBe( true );

			view.icon = '<svg>bar</svg>';
			expect( view.iconView.content ).toBe( '<svg>bar</svg>' );
		} );

		it( 'is removed from the #children when view#icon is removed', () => {
			view = new ButtonView( locale );
			view.icon = '<svg></svg>';
			view.render();

			expect( view.element.childNodes ).toHaveLength( 2 );
			expect( view.element.childNodes[ 0 ] ).toBe( view.iconView.element );
			expect( view.element.childNodes[ 1 ] ).toBe( view.labelView.element );

			view.icon = undefined;
			expect( view.element.childNodes ).toHaveLength( 1 );
			expect( view.element.childNodes[ 0 ] ).toBe( view.labelView.element );
		} );

		it( 'is destroyed with the view', () => {
			view = new ButtonView( locale );
			view.icon = '<svg></svg>';
			view.render();

			const spy = vi.spyOn( view.iconView, 'destroy' );

			view.destroy();
			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( '#keystrokeView', () => {
		it( 'is omitted in #children when view#withKeystroke is not set', () => {
			view = new ButtonView( locale );
			view.render();

			expect( view.element.childNodes ).toHaveLength( 1 );
			expect( view.keystrokeView.element ).toBeNull();
		} );

		it( 'is added to the #children when view#withKeystroke is true', () => {
			vi.spyOn( env, 'isMac', 'get' ).mockReturnValue( false );

			view = new ButtonView( locale );
			view.keystroke = 'Ctrl+A';
			view.withKeystroke = true;
			view.render();

			expect( view.element.childNodes ).toHaveLength( 2 );
			expect( view.element.childNodes[ 1 ] ).toBe( view.keystrokeView.element );

			expect( view.keystrokeView.element.classList.contains( 'ck' ) ).toBe( true );
			expect( view.keystrokeView.element.classList.contains( 'ck-button__keystroke' ) ).toBe( true );

			expect( view.keystrokeView ).toBeInstanceOf( View );
			expect( view.keystrokeView.element.textContent ).toBe( 'Ctrl+A' );
		} );

		it( 'is omitted in #children when view#keystroke is not defined', () => {
			// (https://github.com/ckeditor/ckeditor5/issues/9412)
			view = new ButtonView( locale );
			view.withKeystroke = true;
			view.render();

			expect( view.element.childNodes ).toHaveLength( 1 );
			expect( view.keystrokeView.element ).toBeNull();
		} );

		it( 'usese fancy keystroke preview on Mac', () => {
			vi.spyOn( env, 'isMac', 'get' ).mockReturnValue( true );

			view = new ButtonView( locale );
			view.keystroke = 'Ctrl+A';
			view.withKeystroke = true;
			view.render();

			expect( view.keystrokeView.element.textContent ).toBe( '⌘A' );
		} );

		it( 'is destroyed with the view', () => {
			view = new ButtonView( locale );
			view.keystroke = 'Ctrl+A';
			view.withKeystroke = true;
			view.render();

			const spy = vi.spyOn( view.keystrokeView, 'destroy' );

			view.destroy();
			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the button in DOM', () => {
			const spy = vi.spyOn( view.element, 'focus' );

			view.focus();

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );
} );
