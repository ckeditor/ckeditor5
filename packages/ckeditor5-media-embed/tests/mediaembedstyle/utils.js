/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeStyles } from '../../src/mediaembedstyle/utils.js';
import {
	DEFAULT_DROPDOWN_DEFINITIONS,
	DEFAULT_ICONS,
	DEFAULT_OPTIONS
} from '../../src/mediaembedstyle/constants.js';

describe( 'MediaEmbedStyle utils', () => {
	beforeEach( () => {
		vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	describe( 'DEFAULT_OPTIONS', () => {
		it( 'lists exactly the five built-in styles in canonical order', () => {
			expect( Object.keys( DEFAULT_OPTIONS ) ).toEqual( [
				'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight'
			] );
		} );

		it( 'has each entry keyed by its own `name`', () => {
			for ( const [ key, definition ] of Object.entries( DEFAULT_OPTIONS ) ) {
				expect( definition.name, `${ key }.name` ).toBe( key );
			}
		} );

		it( 'has non-empty title and icon on every entry', () => {
			for ( const [ key, definition ] of Object.entries( DEFAULT_OPTIONS ) ) {
				expect( typeof definition.title, `${ key }.title` ).toBe( 'string' );
				expect( definition.title ).not.toBe( '' );
				expect( typeof definition.icon, `${ key }.icon` ).toBe( 'string' );
				expect( definition.icon ).not.toBe( '' );
			}
		} );

		it( 'has exactly one isDefault entry — alignCenter — and it omits className', () => {
			const defaults = Object.values( DEFAULT_OPTIONS ).filter( s => s.isDefault );

			expect( defaults ).toHaveLength( 1 );
			expect( defaults[ 0 ].name ).toBe( 'alignCenter' );
			expect( defaults[ 0 ].className ).toBeUndefined();
		} );

		it( 'has className on every non-default entry', () => {
			for ( const definition of Object.values( DEFAULT_OPTIONS ) ) {
				if ( !definition.isDefault ) {
					expect( typeof definition.className, `${ definition.name }.className` ).toBe( 'string' );
					expect( definition.className ).not.toBe( '' );
				}
			}
		} );
	} );

	describe( 'DEFAULT_ICONS', () => {
		it( 'exposes exactly the five short aliases (matching image)', () => {
			expect( Object.keys( DEFAULT_ICONS ) ).toEqual(
				expect.arrayContaining( [ 'inlineLeft', 'left', 'center', 'right', 'inlineRight' ] )
			);
			expect( Object.keys( DEFAULT_ICONS ) ).toHaveLength( 5 );
		} );

		it( 'maps every alias to a non-empty SVG XML string', () => {
			for ( const [ alias, svg ] of Object.entries( DEFAULT_ICONS ) ) {
				expect( typeof svg, alias ).toBe( 'string' );
				expect( svg ).toMatch( /<svg/ );
			}
		} );
	} );

	describe( 'DEFAULT_DROPDOWN_DEFINITIONS', () => {
		it( 'lists mediaEmbed:wrapText and mediaEmbed:breakText', () => {
			expect( DEFAULT_DROPDOWN_DEFINITIONS.map( d => d.name ) ).toEqual(
				expect.arrayContaining( [ 'mediaEmbed:wrapText', 'mediaEmbed:breakText' ] )
			);
		} );

		it( 'stores items as prefixed component names (matches the public dropdown-definition surface)', () => {
			for ( const definition of DEFAULT_DROPDOWN_DEFINITIONS ) {
				for ( const item of definition.items ) {
					expect( item, `${ definition.name } item` ).toMatch( /^mediaEmbed:/ );
				}
			}
		} );

		it( 'every item and defaultItem references an existing built-in style', () => {
			for ( const definition of DEFAULT_DROPDOWN_DEFINITIONS ) {
				const defaultStyleName = definition.defaultItem.replace( /^mediaEmbed:/, '' );

				expect( DEFAULT_OPTIONS, `${ definition.name } defaultItem` )
					.toHaveProperty( defaultStyleName );

				for ( const item of definition.items ) {
					const styleName = item.replace( /^mediaEmbed:/, '' );

					expect( DEFAULT_OPTIONS, `${ definition.name } item "${ item }"` )
						.toHaveProperty( styleName );
				}
			}
		} );
	} );

	describe( 'normalizeStyles()', () => {
		it( 'returns an empty array when options is empty or absent', () => {
			expect( normalizeStyles( { options: [] } ) ).toEqual( [] );
			expect( normalizeStyles( {} ) ).toEqual( [] );
			expect( normalizeStyles( { options: null } ) ).toEqual( [] );
			expect( normalizeStyles( { options: undefined } ) ).toEqual( [] );

			expect( console.warn ).not.toHaveBeenCalled();
		} );

		describe( 'string entries', () => {
			it( 'resolves a built-in name to a clone of the matching default', () => {
				const result = normalizeStyles( { options: [ 'alignLeft' ] } );

				expect( result ).toHaveLength( 1 );
				expect( result[ 0 ] ).toEqual( DEFAULT_OPTIONS.alignLeft );
				expect( result[ 0 ], 'should be a clone, not the same reference' )
					.not.toBe( DEFAULT_OPTIONS.alignLeft );

				expect( console.warn ).not.toHaveBeenCalled();
			} );

			it( 'resolves every built-in name', () => {
				const result = normalizeStyles( {
					options: [ 'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight' ]
				} );

				expect( result.map( s => s.name ) ).toEqual( [
					'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight'
				] );

				expect( console.warn ).not.toHaveBeenCalled();
			} );

			it( 'warns and drops a string referencing an unknown built-in', () => {
				const result = normalizeStyles( { options: [ 'doesNotExist' ] } );

				expect( result ).toEqual( [] );
				expect( console.warn ).toHaveBeenCalledOnce();
				expect( console.warn ).toHaveBeenCalledWith(
					expect.stringMatching( /^media-style-configuration-definition-invalid/ ),
					{ style: { name: 'doesNotExist' } },
					expect.any( String )
				);
			} );
		} );

		describe( 'object entries — overriding a built-in', () => {
			it( 'shallow-merges over the matching default (title swapped, other fields inherited)', () => {
				const result = normalizeStyles( {
					options: [ { name: 'alignLeft', title: 'My label' } ]
				} );

				expect( result[ 0 ] ).toEqual( {
					name: 'alignLeft',
					title: 'My label',
					icon: DEFAULT_OPTIONS.alignLeft.icon,
					className: DEFAULT_OPTIONS.alignLeft.className
				} );

				expect( console.warn ).not.toHaveBeenCalled();
			} );

			it( 'resolves a short icon alias to the corresponding SVG', () => {
				const result = normalizeStyles( {
					options: [ { name: 'alignLeft', icon: 'left' } ]
				} );

				expect( result[ 0 ].icon ).toBe( DEFAULT_ICONS.left );
			} );

			it( 'leaves an unrecognized icon string untouched (treated as raw SVG)', () => {
				const customSvg = '<svg data-custom="1"></svg>';
				const result = normalizeStyles( {
					options: [ { name: 'alignLeft', icon: customSvg } ]
				} );

				expect( result[ 0 ].icon ).toBe( customSvg );
			} );

			it( 'can demote a default style by setting isDefault: false + className', () => {
				const result = normalizeStyles( {
					options: [
						{ name: 'alignCenter', isDefault: false, className: 'my-explicit-center' }
					]
				} );

				expect( result[ 0 ].isDefault ).toBe( false );
				expect( result[ 0 ].className ).toBe( 'my-explicit-center' );
				expect( result[ 0 ].name ).toBe( 'alignCenter' );
				// Title and icon stay inherited from the default.
				expect( result[ 0 ].title ).toBe( DEFAULT_OPTIONS.alignCenter.title );
				expect( result[ 0 ].icon ).toBe( DEFAULT_OPTIONS.alignCenter.icon );
			} );

			it( 'does not mutate DEFAULT_OPTIONS when overriding a built-in', () => {
				const originalAlignLeft = { ...DEFAULT_OPTIONS.alignLeft };

				normalizeStyles( {
					options: [ { name: 'alignLeft', title: 'Mutated?', icon: '<svg id="x"/>' } ]
				} );

				expect( DEFAULT_OPTIONS.alignLeft ).toEqual( originalAlignLeft );
			} );
		} );

		describe( 'object entries — custom styles', () => {
			it( 'registers a custom alignment-flavored style', () => {
				const customSvg = '<svg/>';
				const result = normalizeStyles( {
					options: [ {
						name: 'alignFull',
						title: 'Full',
						icon: customSvg,
						className: 'media-style-align-full'
					} ]
				} );

				expect( result ).toEqual( [ {
					name: 'alignFull',
					title: 'Full',
					icon: customSvg,
					className: 'media-style-align-full'
				} ] );

				expect( console.warn ).not.toHaveBeenCalled();
			} );

			it( 'registers a custom semantical style (e.g. "side")', () => {
				const result = normalizeStyles( {
					options: [ {
						name: 'side',
						title: 'Side media',
						icon: '<svg/>',
						className: 'media-style-side'
					} ]
				} );

				expect( result[ 0 ].name ).toBe( 'side' );
				expect( result[ 0 ].className ).toBe( 'media-style-side' );

				expect( console.warn ).not.toHaveBeenCalled();
			} );

			it( 'registers a custom default style (isDefault: true, no className required)', () => {
				const result = normalizeStyles( {
					options: [ {
						name: 'natural',
						title: 'Natural',
						icon: 'center',
						isDefault: true
					} ]
				} );

				expect( result[ 0 ] ).toMatchObject( {
					name: 'natural',
					title: 'Natural',
					icon: DEFAULT_ICONS.center,
					isDefault: true
				} );
				expect( result[ 0 ].className ).toBeUndefined();

				expect( console.warn ).not.toHaveBeenCalled();
			} );

			// Each entry omits one required field. Validation drops it with a warning. The exact
			// warning payload format is asserted in the "unknown built-in" test above.
			for ( const [ missingField, config ] of [
				[ 'className (and not isDefault)', { name: 'broken', title: 'Broken', icon: '<svg/>' } ],
				[ 'title', { name: 'noTitle', icon: '<svg/>', className: 'x' } ],
				[ 'icon', { name: 'noIcon', title: 'No icon', className: 'x' } ]
			] ) {
				it( `warns and drops a custom style missing ${ missingField }`, () => {
					expect( normalizeStyles( { options: [ config ] } ) ).toEqual( [] );

					expect( console.warn ).toHaveBeenCalledOnce();
				} );
			}
		} );

		describe( 'multiple entries', () => {
			it( 'keeps valid entries and drops invalid ones (one warning per invalid)', () => {
				const result = normalizeStyles( {
					options: [
						'alignLeft',
						'unknown',
						{ name: 'side', title: 'Side', icon: '<svg/>', className: 'media-style-side' },
						{ name: 'broken' }
					]
				} );

				expect( result.map( s => s.name ) ).toEqual( [ 'alignLeft', 'side' ] );
				expect( console.warn ).toHaveBeenCalledTimes( 2 );
			} );

			it( 'preserves the configured order', () => {
				const result = normalizeStyles( {
					options: [ 'alignBlockRight', 'alignLeft', 'alignCenter' ]
				} );

				expect( result.map( s => s.name ) ).toEqual( [
					'alignBlockRight', 'alignLeft', 'alignCenter'
				] );
			} );
		} );
	} );
} );
