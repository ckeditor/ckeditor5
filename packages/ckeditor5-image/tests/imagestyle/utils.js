/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import utils from '../../src/imagestyle/utils.js';

describe( 'ImageStyle utils', () => {
	const { getDefaultStylesConfiguration, DEFAULT_OPTIONS, DEFAULT_ICONS } = utils;
	const allStyles = Object.values( DEFAULT_OPTIONS );
	const allStyleNames = Object.keys( DEFAULT_OPTIONS );

	describe( 'default styles', () => {
		describe( 'styles', () => {
			it( 'should have the #DEFAULT_OPTIONS properly defined', () => {
				expect( DEFAULT_OPTIONS ).to.be.an( 'object' ).that.has.all.keys( [
					'inline', 'alignLeft', 'alignRight', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'block', 'side'
				] );
			} );

			it( 'should have always properly defined keys', () => {
				allStyles.forEach( style => {
					expect( style ).to.be.an( 'object' ).that.includes.keys( [ 'name', 'title', 'icon', 'modelElements' ] );
					expect( style ).to.have.any.keys( [ 'className', 'isDefault' ] );
				} );
			} );

			it( 'should have a single default style defined for the inline and block images', () => {
				const blockDefault = allStyles.filter( style =>
					style.isDefault && style.modelElements.includes( 'imageBlock' ) );

				const inlineDefault = allStyles.filter( style =>
					style.isDefault && style.modelElements.includes( 'imageInline' ) );

				expect( blockDefault ).to.have.lengthOf( 1 );
				expect( blockDefault[ 0 ] ).to.not.have.key( 'className' );

				expect( inlineDefault ).to.have.lengthOf( 1 );
				expect( inlineDefault[ 0 ] ).to.not.have.key( 'className' );
			} );

			it( 'should always have #modelElements properly defined', () => {
				allStyles.forEach( style => {
					const modelElements = style.modelElements;

					expect( modelElements ).to.be.an( 'array' );
					expect( modelElements ).to.contain.oneOf( [ 'imageBlock', 'imageInline' ] );

					modelElements.forEach( elementName => {
						expect( elementName ).to.match( /[image,imageInline]/ );
					} );
				} );
			} );

			it( 'should always have properly defined #name and #icon', () => {
				for ( const style in DEFAULT_OPTIONS ) {
					expect( style ).to.equal( DEFAULT_OPTIONS[ style ].name );
					expect( DEFAULT_OPTIONS[ style ].icon ).to.be.a( 'string' );
				}
			} );

			it( 'should always return new configuration object for each style', () => {
				allStyleNames.forEach( styleName => {
					expect( DEFAULT_OPTIONS[ styleName ] ).to.not.equal( DEFAULT_OPTIONS[ styleName ] );
					expect( DEFAULT_OPTIONS[ styleName ].modelElements ).to.not.equal( DEFAULT_OPTIONS[ styleName ].modelElements );
				} );
			} );
		} );
	} );

	describe( 'getDefaultStylesConfiguration()', () => {
		it( 'should return the proper config if both image editing plugins are loaded', async () => {
			const config = getDefaultStylesConfiguration( true, true );

			expect( config ).to.deep.equal( {
				options: [
					'inline', 'alignLeft', 'alignRight',
					'alignCenter', 'alignBlockLeft', 'alignBlockRight',
					'block', 'side'
				]
			} );
		} );

		it( 'should return the proper config if only the inline image editing plugin is loaded', () => {
			const config = getDefaultStylesConfiguration( false, true );

			expect( config ).to.deep.equal( {
				options: [ 'inline', 'alignLeft', 'alignRight' ]
			} );
		} );

		it( 'should return the proper config if only the block image editing plugin is loaded', () => {
			const config = getDefaultStylesConfiguration( true, false );

			expect( config ).to.deep.equal( {
				options: [ 'block', 'side' ]
			} );
		} );

		it( 'should return an empty object if neither image editing plugins are loaded', () => {
			const config = getDefaultStylesConfiguration( false, false );

			expect( config ).to.deep.equal( {} );
		} );
	} );

	describe( 'normalizeImageStyles()', () => {
		function normalizeStyles(
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

		testUtils.createSinonSandbox();

		beforeEach( () => {
			testUtils.sinon.stub( console, 'warn' );
		} );

		describe( 'style', () => {
			describe( 'set as a string in the editor config', () => {
				it( 'should return the proper default style if #name matches', () => {
					for ( const style in DEFAULT_OPTIONS ) {
						const normalizedStyles = normalizeStyles( [ style ] );

						expect( normalizedStyles[ 0 ] ).to.not.equal( DEFAULT_OPTIONS[ style ] );
						expect( normalizedStyles ).to.deep.equal( [ DEFAULT_OPTIONS[ style ] ] );
					}

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and omit the style if the #name not found in default styles', () => {
					expect( normalizeStyles( [ 'foo' ] ) ).to.deep.equal( [] );

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-configuration-definition-invalid/ ),
						{ style: { name: 'foo' } },
						sinon.match.string // Link to the documentation
					);
				} );
			} );

			describe( 'set as an object in the editor config', () => {
				it( 'should pass through if #name not found in the default styles', () => {
					const style = { name: 'foo', modelElements: [ 'imageBlock' ] };

					expect( normalizeStyles( [ style ] ) ).to.deep.equal( [ style ] );

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should use one of default icons if #icon matches', () => {
					for ( const icon in DEFAULT_ICONS ) {
						const style = { name: 'custom', modelElements: [ 'imageBlock' ], icon };

						expect( normalizeStyles( [ style ] ) ).to.deep.equal( [ { ...style, icon: DEFAULT_ICONS[ icon ] } ] );
					}

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should pass the icon if is not a string', () => {
					const style = { name: 'custom', modelElements: [ 'imageBlock' ], icon: {} };

					expect( normalizeStyles( [ style ] ) ).to.deep.equal( [ style ] );

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and filter out the style which has no modelElements defined', () => {
					const style = { name: 'foo' };

					expect( normalizeStyles( [ style ] ) ).to.deep.equal( [] );

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-configuration-definition-invalid/ ),
						{ style },
						sinon.match.string // Link to the documentation
					);
				} );

				it( 'should warn and filter out the style which has modelElements defined as an empty array', () => {
					const style = { name: 'foo', modelElements: [] };

					expect( normalizeStyles( [ style ] ) ).to.deep.equal( [] );

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-configuration-definition-invalid/ ),
						{ style },
						sinon.match.string // Link to the documentation
					);
				} );

				it( 'should warn and filter out the style which is not supported by any of the loaded editing plugins', () => {
					const style = { name: 'foo', modelElements: [ 'imageBlock' ] };

					// ImageBlockEditing plugin is not loaded
					expect( normalizeStyles( [ style ], false, true ) ).to.deep.equal( [] );

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-missing-dependency/ ),
						{ style, missingPlugins: [ 'ImageBlockEditing' ] },
						sinon.match.string // Link to the documentation
					);
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

					const normalizedStyles = normalizeStyles( [ style ] );

					expect( normalizedStyles[ 0 ] ).to.not.equal( DEFAULT_OPTIONS.alignLeft );
					expect( normalizedStyles ).to.deep.equal( [ { ...style, icon: DEFAULT_ICONS.inline } ] );

					sinon.assert.notCalled( console.warn );
				} );
			} );
		} );

		describe( 'getDefaultDropdownDefinitions', () => {
			it( 'should return default drop-downs list if both image editing plugins are loaded', () => {
				expect( utils.getDefaultDropdownDefinitions( { has: () => true } ) ).to.deep.equal( utils.DEFAULT_DROPDOWN_DEFINITIONS );
			} );

			it( 'should return an empty array if only `ImageBlockEditing` plugin is loaded', () => {
				expect( utils.getDefaultDropdownDefinitions( { has: pluginName => pluginName === 'ImageBlockEditing' } ) )
					.to.deep.equal( [] );
			} );

			it( 'should return an empty array if only `ImageInlineEditing` plugin is loaded', () => {
				expect( utils.getDefaultDropdownDefinitions( { has: pluginName => pluginName === 'ImageInlineEditing' } ) )
					.to.deep.equal( [] );
			} );

			it( 'should always return a new instance of the drop-downs list', () => {
				expect( utils.getDefaultDropdownDefinitions( { has: () => true } ) ).to.not.equal( utils.DEFAULT_DROPDOWN_DEFINITIONS );
			} );
		} );
	} );
} );
