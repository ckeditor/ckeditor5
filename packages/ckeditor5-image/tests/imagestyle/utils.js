/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import utils from '../../src/imagestyle/utils';

describe( 'ImageStyle utils', () => {
	const { getDefaultStylesConfiguration, DEFAULT_OPTIONS, DEFAULT_GROUPS, DEFAULT_ICONS } = utils;
	const allStyles = Object.values( DEFAULT_OPTIONS );
	const allGroups = Object.values( DEFAULT_GROUPS );

	describe( 'default styles', () => {
		describe( 'styles', () => {
			it( 'should have the #DEFAULT_OPTIONS properly defined', () => {
				expect( DEFAULT_OPTIONS ).to.be.an( 'object' ).that.has.all.keys( [
					'inline', 'alignLeft', 'alignRight', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'full', 'side'
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
					style.isDefault && style.modelElements.includes( 'image' ) );

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
					expect( modelElements ).to.contain.oneOf( [ 'image', 'imageInline' ] );

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
		} );

		describe( 'groups', () => {
			it( 'should have the #DEFAULT_GROUPS properly defined', () => {
				expect( DEFAULT_GROUPS ).to.be.an( 'object' ).that.has.all.keys( [ 'wrapText', 'breakText' ] );
			} );

			it( 'should have always properly defined keys', () => {
				allGroups.forEach( group => {
					expect( group ).to.be.an( 'object' ).that.has.all.keys( 'name', 'title', 'defaultItem', 'items' );
				} );
			} );

			it( 'should have properly defined #items and #defaultItem', () => {
				allGroups.forEach( group => {
					expect( group.items ).to.include( group.defaultItem );

					expect( DEFAULT_OPTIONS ).to.include.keys( group.items );
				} );
			} );

			it( 'should have properly defined #name', () => {
				for ( const group in DEFAULT_GROUPS ) {
					expect( group ).to.equal( DEFAULT_GROUPS[ group ].name );
				}
			} );
		} );

		it( 'should have the #DEFAULT_ICONS properly defined', () => {
			expect( DEFAULT_ICONS ).to.be.an( 'object' ).that.has.all.keys( [
				'full', 'left', 'right', 'center', 'inlineLeft', 'inlineRight', 'inline'
			] );
		} );
	} );

	describe( 'getDefaultStylesConfiguration()', () => {
		it( 'should return the proper config if both image editing plugins are loaded', async () => {
			const config = getDefaultStylesConfiguration( true, true );

			expect( config ).to.deep.equal( {
				options: [
					'inline', 'alignLeft', 'alignRight',
					'alignCenter', 'alignBlockLeft', 'alignBlockRight',
					'full', 'side'
				],
				groups: [ 'wrapText', 'breakText' ]
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
				options: [ 'full', 'side' ]
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
			groups = [],
			isBlockPluginLoaded = true,
			isInlinePluginLoaded = true
		) {
			return utils.normalizeStyles( {
				configuredStyles: { options, groups },
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

						expect( normalizedStyles.options[ 0 ] ).to.not.equal( DEFAULT_OPTIONS[ style ] );
						expect( normalizedStyles ).to.deep.equal(
							{ options: [ DEFAULT_OPTIONS[ style ] ], groups: [] }
						);
					}

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and omit the style if the #name not found in default styles', () => {
					expect( normalizeStyles(
						[ 'foo' ]
					) ).to.deep.equal(
						{ options: [], groups: [] }
					);

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
					const style = { name: 'foo', modelElements: [ 'image' ] };

					expect( normalizeStyles(
						[ style ]
					) ).to.deep.equal(
						{ options: [ style ], groups: [] }
					);

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should use one of default icons if #icon matches', () => {
					for ( const icon in DEFAULT_ICONS ) {
						const style = { name: 'custom', modelElements: [ 'image' ], icon };

						expect( normalizeStyles(
							[ style ]
						) ).to.deep.equal(
							{ options: [ { ...style, icon: DEFAULT_ICONS[ icon ] } ], groups: [] }
						);
					}

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should pass the icon if is not a string', () => {
					const style = { name: 'custom', modelElements: [ 'image' ], icon: {} };

					expect( normalizeStyles(
						[ style ]
					) ).to.deep.equal(
						{ options: [ style ], groups: [] }
					);

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and filter out the style which has no modelElements defined', () => {
					const style = { name: 'foo' };

					expect( normalizeStyles(
						[ style ]
					) ).to.deep.equal(
						{ options: [], groups: [] }
					);

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-configuration-definition-invalid/ ),
						{ style },
						sinon.match.string // Link to the documentation
					);
				} );

				it( 'should warn and filter out the style which has modelElements defined as an empty array', () => {
					const style = { name: 'foo', modelElements: [] };

					expect( normalizeStyles(
						[ style ]
					) ).to.deep.equal(
						{ options: [], groups: [] }
					);

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-configuration-definition-invalid/ ),
						{ style },
						sinon.match.string // Link to the documentation
					);
				} );

				it( 'should warn and filter out the style which is not supported by any of the loaded editing plugins', () => {
					const style = { name: 'foo', modelElements: [ 'image' ] };

					expect( normalizeStyles(
						[ style ], [], false, true // ImageBlockEditing plugin is not loaded
					) ).to.deep.equal(
						{ options: [], groups: [] }
					);

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
						modelElements: [ 'image' ],
						icon: 'inline',
						isDefault: true,
						className: 'custom-class',
						customProp: 'customProp'
					};

					const normalizedStyles = normalizeStyles( [ style ] );

					expect( normalizedStyles.options[ 0 ] ).to.not.equal( DEFAULT_OPTIONS.alignLeft );
					expect( normalizedStyles ).to.deep.equal(
						{ options: [ { ...style, icon: DEFAULT_ICONS.inline } ], groups: [] }
					);

					sinon.assert.notCalled( console.warn );
				} );
			} );
		} );

		describe( 'group', () => {
			describe( 'set as a string in the editor config', () => {
				it( 'should return the proper default group if #name matches', () => {
					for ( const group in DEFAULT_GROUPS ) {
						const currentGroup = DEFAULT_GROUPS[ group ];
						const normalizedStyles = normalizeStyles( allStyles, [ group ] );

						expect( normalizedStyles.groups[ 0 ] ).to.not.equal( currentGroup );
						expect( normalizedStyles ).to.deep.equal(
							{ options: allStyles, groups: [ currentGroup ] } );
					}

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and omit the group if a #name not found in default groups', () => {
					expect( normalizeStyles(
						allStyles, [ 'foo' ]
					) ).to.deep.equal(
						{ groups: [], options: allStyles }
					);
				} );
			} );

			describe( 'set as an object in the editor config', () => {
				describe( '#name found in the default groups', () => {
					it( 'should pass through and extend if definition is valid', () => {
						const group = { name: 'wrapText', items: [ 'alignLeft' ], defaultItem: 'alignLeft', customProp: 'customProp' };
						const normalizedStyles = normalizeStyles( allStyles, [ group ] );

						expect( normalizedStyles.groups[ 0 ] ).to.not.equal( DEFAULT_GROUPS.wrapText );
						expect( normalizedStyles ).to.deep.equal(
							{ options: allStyles, groups: [ { ...DEFAULT_GROUPS.wrapText, ...group } ] }
						);

						sinon.assert.notCalled( console.warn );
					} );

					it( 'should omit if no #items are present', () => {
						expect( normalizeStyles(
							allStyles, [ { name: 'breakText', items: null } ]
						) ).to.deep.equal(
							{ options: allStyles, groups: [] }
						);
					} );

					it( 'should omit if #items are empty', () => {
						expect( normalizeStyles(
							allStyles, [ { name: 'breakText', items: [] } ]
						) ).to.deep.equal(
							{ options: allStyles, groups: [] }
						);
					} );

					it( 'should warn about items not supported by any of the loaded editing plugins', () => {
						const style = { name: 'foo', modelElements: [ 'imageInline' ] };

						expect( normalizeStyles(
							[ style, 'alignLeft' ],
							[ { name: 'wrapText', items: [ 'foo', 'alignLeft' ] } ],
							true,
							false // ImageInlineEditing plugin is not loaded
						) ).to.deep.equal( {
							options: [ DEFAULT_OPTIONS.alignLeft ],
							groups: [ { name: 'wrapText', defaultItem: 'alignLeft', title: 'Wrap text', items: [ 'foo', 'alignLeft' ] } ]
						} );

						sinon.assert.calledOnce( console.warn );
						sinon.assert.calledWithExactly( console.warn,
							sinon.match( /^image-style-missing-dependency/ ),
							{ style, missingPlugins: [ 'ImageInlineEditing' ] },
							sinon.match.string // Link to the documentation
						);
					} );
				} );

				describe( '#name not found in the default groups', () => {
					it( 'should pass through if definition is valid', () => {
						const groups = [ { name: 'inline', items: [ 'alignLeft' ], defaultItem: 'alignLeft' } ];

						expect( normalizeStyles(
							allStyles, groups
						) ).to.deep.equal(
							{ options: allStyles, groups }
						);

						sinon.assert.notCalled( console.warn );
					} );

					it( 'should omit if no #items are present', () => {
						expect( normalizeStyles(
							allStyles, [ { name: 'foo' } ]
						) ).to.deep.equal(
							{ options: allStyles, groups: [] }
						);
					} );

					it( 'should omit if #items are empty', () => {
						expect( normalizeStyles(
							allStyles, [ { name: 'foo', items: [] } ]
						) ).to.deep.equal(
							{ options: allStyles, groups: [] }
						);
					} );

					it( 'should warn and filter out the items which are not supported by any of the loaded editing plugins', () => {
						const style = { name: 'foo', modelElements: [ 'imageInline' ] };
						const groups = [ { name: 'bar', defaultItem: 'alignLeft', items: [ 'foo', 'alignLeft' ] } ];

						expect( normalizeStyles(
							[ style, 'alignLeft' ],
							groups,
							true,
							false // ImageInlineEditing plugin is not loaded
						) ).to.deep.equal( {
							options: [ DEFAULT_OPTIONS.alignLeft ],
							groups
						} );

						sinon.assert.calledOnce( console.warn );
						sinon.assert.calledWithExactly( console.warn,
							sinon.match( /^image-style-missing-dependency/ ),
							{ style, missingPlugins: [ 'ImageInlineEditing' ] },
							sinon.match.string // Link to the documentation
						);
					} );
				} );
			} );
		} );
	} );
} );
