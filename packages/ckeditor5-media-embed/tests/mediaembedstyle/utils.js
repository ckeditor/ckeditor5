/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { normalizeStyles } from '../../src/mediaembedstyle/utils.js';
import {
	DEFAULT_DROPDOWN_DEFINITIONS,
	DEFAULT_ICONS,
	DEFAULT_OPTIONS
} from '../../src/mediaembedstyle/constants.js';

describe( 'MediaEmbedStyle utils', () => {
	testUtils.createSinonSandbox();

	beforeEach( () => {
		testUtils.sinon.stub( console, 'warn' );
	} );

	describe( 'DEFAULT_OPTIONS', () => {
		it( 'lists exactly the five built-in styles in canonical order', () => {
			expect( Object.keys( DEFAULT_OPTIONS ) ).to.deep.equal( [
				'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight'
			] );
		} );

		it( 'has each entry keyed by its own `name`', () => {
			for ( const [ key, definition ] of Object.entries( DEFAULT_OPTIONS ) ) {
				expect( definition.name, `${ key }.name` ).to.equal( key );
			}
		} );

		it( 'has non-empty title and icon on every entry', () => {
			for ( const [ key, definition ] of Object.entries( DEFAULT_OPTIONS ) ) {
				expect( definition.title, `${ key }.title` ).to.be.a( 'string' ).and.not.empty;
				expect( definition.icon, `${ key }.icon` ).to.be.a( 'string' ).and.not.empty;
			}
		} );

		it( 'has exactly one isDefault entry — alignCenter — and it omits className', () => {
			const defaults = Object.values( DEFAULT_OPTIONS ).filter( s => s.isDefault );

			expect( defaults ).to.have.lengthOf( 1 );
			expect( defaults[ 0 ].name ).to.equal( 'alignCenter' );
			expect( defaults[ 0 ].className ).to.be.undefined;
		} );

		it( 'has className on every non-default entry', () => {
			for ( const definition of Object.values( DEFAULT_OPTIONS ) ) {
				if ( !definition.isDefault ) {
					expect( definition.className, `${ definition.name }.className` ).to.be.a( 'string' ).and.not.empty;
				}
			}
		} );
	} );

	describe( 'DEFAULT_ICONS', () => {
		it( 'exposes exactly the five short aliases (matching image)', () => {
			expect( Object.keys( DEFAULT_ICONS ) ).to.have.members( [
				'inlineLeft', 'left', 'center', 'right', 'inlineRight'
			] );
		} );

		it( 'maps every alias to a non-empty SVG XML string', () => {
			for ( const [ alias, svg ] of Object.entries( DEFAULT_ICONS ) ) {
				expect( svg, alias ).to.be.a( 'string' ).and.match( /<svg/ );
			}
		} );
	} );

	describe( 'DEFAULT_DROPDOWN_DEFINITIONS', () => {
		it( 'lists mediaEmbed:wrapText and mediaEmbed:breakText', () => {
			expect( DEFAULT_DROPDOWN_DEFINITIONS.map( d => d.name ) ).to.have.members( [
				'mediaEmbed:wrapText', 'mediaEmbed:breakText'
			] );
		} );

		it( 'stores items as prefixed component names (matches the public dropdown-definition surface)', () => {
			for ( const definition of DEFAULT_DROPDOWN_DEFINITIONS ) {
				for ( const item of definition.items ) {
					expect( item, `${ definition.name } item` ).to.match( /^mediaEmbed:/ );
				}
			}
		} );

		it( 'every item and defaultItem references an existing built-in style', () => {
			for ( const definition of DEFAULT_DROPDOWN_DEFINITIONS ) {
				const defaultStyleName = definition.defaultItem.replace( /^mediaEmbed:/, '' );

				expect( DEFAULT_OPTIONS, `${ definition.name } defaultItem` )
					.to.have.property( defaultStyleName );

				for ( const item of definition.items ) {
					const styleName = item.replace( /^mediaEmbed:/, '' );

					expect( DEFAULT_OPTIONS, `${ definition.name } item "${ item }"` )
						.to.have.property( styleName );
				}
			}
		} );
	} );

	describe( 'normalizeStyles()', () => {
		it( 'returns an empty array when options is empty or absent', () => {
			expect( normalizeStyles( { options: [] } ) ).to.deep.equal( [] );
			expect( normalizeStyles( {} ) ).to.deep.equal( [] );
			expect( normalizeStyles( { options: null } ) ).to.deep.equal( [] );
			expect( normalizeStyles( { options: undefined } ) ).to.deep.equal( [] );

			sinon.assert.notCalled( console.warn );
		} );

		describe( 'string entries', () => {
			it( 'resolves a built-in name to a clone of the matching default', () => {
				const result = normalizeStyles( { options: [ 'alignLeft' ] } );

				expect( result ).to.have.lengthOf( 1 );
				expect( result[ 0 ] ).to.deep.equal( DEFAULT_OPTIONS.alignLeft );
				expect( result[ 0 ], 'should be a clone, not the same reference' )
					.to.not.equal( DEFAULT_OPTIONS.alignLeft );

				sinon.assert.notCalled( console.warn );
			} );

			it( 'resolves every built-in name', () => {
				const result = normalizeStyles( {
					options: [ 'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight' ]
				} );

				expect( result.map( s => s.name ) ).to.deep.equal( [
					'alignLeft', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'alignRight'
				] );

				sinon.assert.notCalled( console.warn );
			} );

			it( 'warns and drops a string referencing an unknown built-in', () => {
				const result = normalizeStyles( { options: [ 'doesNotExist' ] } );

				expect( result ).to.deep.equal( [] );
				sinon.assert.calledOnce( console.warn );
				sinon.assert.calledWithExactly( console.warn,
					sinon.match( /^media-style-configuration-definition-invalid/ ),
					{ style: { name: 'doesNotExist' } },
					sinon.match.string
				);
			} );
		} );

		describe( 'object entries — overriding a built-in', () => {
			it( 'shallow-merges over the matching default (title swapped, other fields inherited)', () => {
				const result = normalizeStyles( {
					options: [ { name: 'alignLeft', title: 'My label' } ]
				} );

				expect( result[ 0 ] ).to.deep.equal( {
					name: 'alignLeft',
					title: 'My label',
					icon: DEFAULT_OPTIONS.alignLeft.icon,
					className: DEFAULT_OPTIONS.alignLeft.className
				} );

				sinon.assert.notCalled( console.warn );
			} );

			it( 'resolves a short icon alias to the corresponding SVG', () => {
				const result = normalizeStyles( {
					options: [ { name: 'alignLeft', icon: 'left' } ]
				} );

				expect( result[ 0 ].icon ).to.equal( DEFAULT_ICONS.left );
			} );

			it( 'leaves an unrecognized icon string untouched (treated as raw SVG)', () => {
				const customSvg = '<svg data-custom="1"></svg>';
				const result = normalizeStyles( {
					options: [ { name: 'alignLeft', icon: customSvg } ]
				} );

				expect( result[ 0 ].icon ).to.equal( customSvg );
			} );

			it( 'can demote a default style by setting isDefault: false + className', () => {
				const result = normalizeStyles( {
					options: [
						{ name: 'alignCenter', isDefault: false, className: 'my-explicit-center' }
					]
				} );

				expect( result[ 0 ].isDefault ).to.equal( false );
				expect( result[ 0 ].className ).to.equal( 'my-explicit-center' );
				expect( result[ 0 ].name ).to.equal( 'alignCenter' );
				// Title and icon stay inherited from the default.
				expect( result[ 0 ].title ).to.equal( DEFAULT_OPTIONS.alignCenter.title );
				expect( result[ 0 ].icon ).to.equal( DEFAULT_OPTIONS.alignCenter.icon );
			} );

			it( 'does not mutate DEFAULT_OPTIONS when overriding a built-in', () => {
				const originalAlignLeft = { ...DEFAULT_OPTIONS.alignLeft };

				normalizeStyles( {
					options: [ { name: 'alignLeft', title: 'Mutated?', icon: '<svg id="x"/>' } ]
				} );

				expect( DEFAULT_OPTIONS.alignLeft ).to.deep.equal( originalAlignLeft );
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

				expect( result ).to.deep.equal( [ {
					name: 'alignFull',
					title: 'Full',
					icon: customSvg,
					className: 'media-style-align-full'
				} ] );

				sinon.assert.notCalled( console.warn );
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

				expect( result[ 0 ].name ).to.equal( 'side' );
				expect( result[ 0 ].className ).to.equal( 'media-style-side' );

				sinon.assert.notCalled( console.warn );
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

				expect( result[ 0 ] ).to.include( {
					name: 'natural',
					title: 'Natural',
					icon: DEFAULT_ICONS.center,
					isDefault: true
				} );
				expect( result[ 0 ].className ).to.be.undefined;

				sinon.assert.notCalled( console.warn );
			} );

			// Each entry omits one required field. Validation drops it with a warning. The exact
			// warning payload format is asserted in the "unknown built-in" test above.
			for ( const [ missingField, config ] of [
				[ 'className (and not isDefault)', { name: 'broken', title: 'Broken', icon: '<svg/>' } ],
				[ 'title', { name: 'noTitle', icon: '<svg/>', className: 'x' } ],
				[ 'icon', { name: 'noIcon', title: 'No icon', className: 'x' } ]
			] ) {
				it( `warns and drops a custom style missing ${ missingField }`, () => {
					expect( normalizeStyles( { options: [ config ] } ) ).to.deep.equal( [] );

					sinon.assert.calledOnce( console.warn );
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

				expect( result.map( s => s.name ) ).to.deep.equal( [ 'alignLeft', 'side' ] );
				sinon.assert.calledTwice( console.warn );
			} );

			it( 'preserves the configured order', () => {
				const result = normalizeStyles( {
					options: [ 'alignBlockRight', 'alignLeft', 'alignCenter' ]
				} );

				expect( result.map( s => s.name ) ).to.deep.equal( [
					'alignBlockRight', 'alignLeft', 'alignCenter'
				] );
			} );
		} );
	} );
} );
