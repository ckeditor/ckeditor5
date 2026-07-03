/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	utils,
	DEFAULT_DROPDOWN_DEFINITIONS,
	DEFAULT_OPTIONS,
	DEFAULT_ICONS
} from '../../src/imagestyle/utils.js';

describe( 'ImageStyle utils', () => {
	const allStyles = Object.values( DEFAULT_OPTIONS );
	const allStyleNames = Object.keys( DEFAULT_OPTIONS );

	describe( 'default styles', () => {
		describe( 'styles', () => {
			it( 'should have the #DEFAULT_OPTIONS properly defined', () => {
				expect( DEFAULT_OPTIONS ).toBeTypeOf( 'object' );
				expect( Object.keys( DEFAULT_OPTIONS ) ).toEqual( expect.arrayContaining( [
					'inline', 'alignLeft', 'alignRight', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'block', 'side'
				] ) );
				expect( Object.keys( DEFAULT_OPTIONS ) ).toHaveLength( 8 );
			} );

			it( 'should have always properly defined keys', () => {
				allStyles.forEach( style => {
					expect( style ).toBeTypeOf( 'object' );
					expect( style ).toHaveProperty( 'name' );
					expect( style ).toHaveProperty( 'title' );
					expect( style ).toHaveProperty( 'icon' );
					expect( style ).toHaveProperty( 'modelElements' );
					expect( 'className' in style || 'isDefault' in style ).toBe( true );
				} );
			} );

			it( 'should have a single default style defined for the inline and block images', () => {
				const blockDefault = allStyles.filter( style =>
					style.isDefault && style.modelElements.includes( 'imageBlock' ) );

				const inlineDefault = allStyles.filter( style =>
					style.isDefault && style.modelElements.includes( 'imageInline' ) );

				expect( blockDefault ).toHaveLength( 1 );
				expect( blockDefault[ 0 ] ).not.toHaveProperty( 'className' );

				expect( inlineDefault ).toHaveLength( 1 );
				expect( inlineDefault[ 0 ] ).not.toHaveProperty( 'className' );
			} );

			it( 'should always have #modelElements properly defined', () => {
				allStyles.forEach( style => {
					const modelElements = style.modelElements;

					expect( Array.isArray( modelElements ) ).toBe( true );
					expect( modelElements.some( el => el === 'imageBlock' || el === 'imageInline' ) ).toBe( true );

					modelElements.forEach( elementName => {
						expect( elementName ).toMatch( /[image,imageInline]/ );
					} );
				} );
			} );

			it( 'should always have properly defined #name and #icon', () => {
				for ( const style in DEFAULT_OPTIONS ) {
					expect( style ).toBe( DEFAULT_OPTIONS[ style ].name );
					expect( typeof DEFAULT_OPTIONS[ style ].icon ).toBe( 'string' );
				}
			} );

			it( 'should always return new configuration object for each style', () => {
				allStyleNames.forEach( styleName => {
					expect( DEFAULT_OPTIONS[ styleName ] ).not.toBe( DEFAULT_OPTIONS[ styleName ] );
					expect( DEFAULT_OPTIONS[ styleName ].modelElements ).not.toBe( DEFAULT_OPTIONS[ styleName ].modelElements );
				} );
			} );
		} );
	} );

	describe( 'getDefaultStylesConfiguration()', () => {
		it( 'should return the proper config if both image editing plugins are loaded', async () => {
			const config = utils.getDefaultStylesConfiguration( true, true );

			expect( config ).toEqual( {
				options: [
					'inline', 'alignLeft', 'alignRight',
					'alignCenter', 'alignBlockLeft', 'alignBlockRight',
					'block', 'side'
				]
			} );
		} );

		it( 'should return the proper config if only the inline image editing plugin is loaded', () => {
			const config = utils.getDefaultStylesConfiguration( false, true );

			expect( config ).toEqual( {
				options: [ 'inline', 'alignLeft', 'alignRight' ]
			} );
		} );

		it( 'should return the proper config if only the block image editing plugin is loaded', () => {
			const config = utils.getDefaultStylesConfiguration( true, false );

			expect( config ).toEqual( {
				options: [ 'block', 'side' ]
			} );
		} );

		it( 'should return an empty object if neither image editing plugins are loaded', () => {
			const config = utils.getDefaultStylesConfiguration( false, false );

			expect( config ).toEqual( {} );
		} );
	} );

	describe( 'normalizeImageStyles()', () => {
		function _normalizeStyles(
			options = allStyles,
			isBlockPluginLoaded = true,
			isInlinePluginLoaded = true
		) {
			return utils.normalizeStyles( {
				configuredStyles: { options },
				isBlockPluginLoaded,
				isInlinePluginLoaded
			} );
		}

		beforeEach( () => {
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		} );

		describe( 'style', () => {
			describe( 'set as a string in the editor config', () => {
				it( 'should return the proper default style if #name matches', () => {
					for ( const style in DEFAULT_OPTIONS ) {
						const normalizedStyles = _normalizeStyles( [ style ] );

						expect( normalizedStyles[ 0 ] ).not.toBe( DEFAULT_OPTIONS[ style ] );
						expect( normalizedStyles ).toEqual( [ DEFAULT_OPTIONS[ style ] ] );
					}

					expect( console.warn ).not.toHaveBeenCalled();
				} );

				it( 'should warn and omit the style if the #name not found in default styles', () => {
					expect( _normalizeStyles( [ 'foo' ] ) ).toEqual( [] );

					expect( console.warn ).toHaveBeenCalledOnce();
					expect( console.warn ).toHaveBeenCalledWith(
						expect.stringMatching( /^image-style-configuration-definition-invalid/ ),
						{ style: { name: 'foo' } },
						expect.any( String ) // Link to the documentation
					);
				} );

				it( 'should return an empty array when configuredStyles has no options field', () => {
					const result = utils.normalizeStyles( {
						configuredStyles: {},
						isBlockPluginLoaded: true,
						isInlinePluginLoaded: true
					} );

					expect( result ).toEqual( [] );
					expect( console.warn ).not.toHaveBeenCalled();
				} );
			} );

			describe( 'set as an object in the editor config', () => {
				it( 'should pass through if #name not found in the default styles', () => {
					const style = { name: 'foo', modelElements: [ 'imageBlock' ] };

					expect( _normalizeStyles( [ style ] ) ).toEqual( [ style ] );

					expect( console.warn ).not.toHaveBeenCalled();
				} );

				it( 'should use one of default icons if #icon matches', () => {
					for ( const icon in DEFAULT_ICONS ) {
						const style = { name: 'custom', modelElements: [ 'imageBlock' ], icon };

						expect( _normalizeStyles( [ style ] ) ).toEqual( [ { ...style, icon: DEFAULT_ICONS[ icon ] } ] );
					}

					expect( console.warn ).not.toHaveBeenCalled();
				} );

				it( 'should pass the icon if is not a string', () => {
					const style = { name: 'custom', modelElements: [ 'imageBlock' ], icon: {} };

					expect( _normalizeStyles( [ style ] ) ).toEqual( [ style ] );

					expect( console.warn ).not.toHaveBeenCalled();
				} );

				it( 'should warn and filter out the style which has no modelElements defined', () => {
					const style = { name: 'foo' };

					expect( _normalizeStyles( [ style ] ) ).toEqual( [] );

					expect( console.warn ).toHaveBeenCalledOnce();
					expect( console.warn ).toHaveBeenCalledWith(
						expect.stringMatching( /^image-style-configuration-definition-invalid/ ),
						{ style },
						expect.any( String ) // Link to the documentation
					);
				} );

				it( 'should warn and filter out the style which has modelElements defined as an empty array', () => {
					const style = { name: 'foo', modelElements: [] };

					expect( _normalizeStyles( [ style ] ) ).toEqual( [] );

					expect( console.warn ).toHaveBeenCalledOnce();
					expect( console.warn ).toHaveBeenCalledWith(
						expect.stringMatching( /^image-style-configuration-definition-invalid/ ),
						{ style },
						expect.any( String ) // Link to the documentation
					);
				} );

				it( 'should warn and filter out the style which is not supported by any of the loaded editing plugins', () => {
					const style = { name: 'foo', modelElements: [ 'imageBlock' ] };

					// ImageBlockEditing plugin is not loaded
					expect( _normalizeStyles( [ style ], false, true ) ).toEqual( [] );

					expect( console.warn ).toHaveBeenCalledOnce();
					expect( console.warn ).toHaveBeenCalledWith(
						expect.stringMatching( /^image-style-missing-dependency/ ),
						{ style, missingPlugins: [ 'ImageBlockEditing' ] },
						expect.any( String ) // Link to the documentation
					);
				} );

				it( 'should warn and filter out an inline style when only ImageBlockEditing is loaded', () => {
					const style = { name: 'foo', modelElements: [ 'imageInline' ] };

					// ImageInlineEditing plugin is not loaded
					expect( _normalizeStyles( [ style ], true, false ) ).toEqual( [] );

					expect( console.warn ).toHaveBeenCalledOnce();
					expect( console.warn ).toHaveBeenCalledWith(
						expect.stringMatching( /^image-style-missing-dependency/ ),
						{ style, missingPlugins: [ 'ImageInlineEditing' ] },
						expect.any( String ) // Link to the documentation
					);
				} );

				it( 'should pass through a block style when only ImageBlockEditing is loaded', () => {
					const style = { name: 'foo', modelElements: [ 'imageBlock' ] };

					expect( _normalizeStyles( [ style ], true, false ) ).toEqual( [ style ] );

					expect( console.warn ).not.toHaveBeenCalled();
				} );

				it( 'should extend one of default styles if #name found in the default styles', () => {
					const style = {
						name: 'alignLeft',
						title: 'customTitle',
						modelElements: [ 'imageBlock' ],
						icon: 'inline',
						isDefault: true,
						className: 'custom-class',
						customProp: 'customProp'
					};

					const normalizedStyles = _normalizeStyles( [ style ] );

					expect( normalizedStyles[ 0 ] ).not.toBe( DEFAULT_OPTIONS.alignLeft );
					expect( normalizedStyles ).toEqual( [ { ...style, icon: DEFAULT_ICONS.inline } ] );

					expect( console.warn ).not.toHaveBeenCalled();
				} );

				it( 'should fill missing properties from the default style when a partial object override is given', () => {
					// Only 'name' is supplied — all other properties (title, icon, modelElements, className) must
					// be inherited from the DEFAULT_OPTIONS.alignLeft definition.
					const style = { name: 'alignLeft' };

					const normalizedStyles = _normalizeStyles( [ style ] );

					expect( normalizedStyles ).toHaveLength( 1 );
					expect( normalizedStyles[ 0 ] ).toMatchObject( {
						name: 'alignLeft',
						title: DEFAULT_OPTIONS.alignLeft.title,
						icon: DEFAULT_OPTIONS.alignLeft.icon,
						modelElements: DEFAULT_OPTIONS.alignLeft.modelElements,
						className: DEFAULT_OPTIONS.alignLeft.className
					} );

					expect( console.warn ).not.toHaveBeenCalled();
				} );
			} );
		} );

		describe( 'getDefaultDropdownDefinitions', () => {
			it( 'should return default drop-downs list if both image editing plugins are loaded', () => {
				expect( utils.getDefaultDropdownDefinitions( { has: () => true } ) ).toEqual( DEFAULT_DROPDOWN_DEFINITIONS );
			} );

			it( 'should return an empty array if only `ImageBlockEditing` plugin is loaded', () => {
				expect( utils.getDefaultDropdownDefinitions( { has: pluginName => pluginName === 'ImageBlockEditing' } ) )
					.toEqual( [] );
			} );

			it( 'should return an empty array if only `ImageInlineEditing` plugin is loaded', () => {
				expect( utils.getDefaultDropdownDefinitions( { has: pluginName => pluginName === 'ImageInlineEditing' } ) )
					.toEqual( [] );
			} );

			it( 'should always return a new instance of the drop-downs list', () => {
				expect( utils.getDefaultDropdownDefinitions( { has: () => true } ) ).not.toBe( DEFAULT_DROPDOWN_DEFINITIONS );
			} );
		} );
	} );
} );
