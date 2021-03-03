/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import utils from '../../src/imagestyle/utils';

describe( 'ImageStyle utils', () => {
	const { getDefaultStylesConfiguration, DEFAULT_ARRANGEMENTS, DEFAULT_GROUPS, DEFAULT_ICONS } = utils;
	const allArrangements = Object.values( DEFAULT_ARRANGEMENTS );
	const allGroups = Object.values( DEFAULT_GROUPS );

	describe( 'default styles', () => {
		describe( 'arrangements', () => {
			it( 'should have the #DEFAULT_ARRANGEMENTS properly defined', () => {
				expect( DEFAULT_ARRANGEMENTS ).to.be.an( 'object' ).that.has.all.keys( [
					'inline', 'alignLeft', 'alignRight', 'alignBlockLeft', 'alignCenter', 'alignBlockRight', 'full', 'side'
				] );
			} );

			it( 'should have always properly defined keys', () => {
				allArrangements.forEach( arrangement => {
					expect( arrangement ).to.be.an( 'object' ).that.includes.keys( [ 'name', 'title', 'icon', 'modelElements' ] );
					expect( arrangement ).to.have.any.keys( [ 'className', 'isDefault' ] );
				} );
			} );

			it( 'should have a single default arrangement defined for the inline and block images', () => {
				const blockDefault = allArrangements.filter( arrangement =>
					arrangement.isDefault && arrangement.modelElements.includes( 'image' ) );

				const inlineDefault = allArrangements.filter( arrangement =>
					arrangement.isDefault && arrangement.modelElements.includes( 'imageInline' ) );

				expect( blockDefault ).to.have.lengthOf( 1 );
				expect( blockDefault[ 0 ] ).to.not.have.key( 'className' );

				expect( inlineDefault ).to.have.lengthOf( 1 );
				expect( inlineDefault[ 0 ] ).to.not.have.key( 'className' );
			} );

			it( 'should always have #modelElements properly defined', () => {
				allArrangements.forEach( arrangement => {
					const modelElements = arrangement.modelElements;

					expect( modelElements ).to.be.an( 'array' );
					expect( modelElements ).to.contain.oneOf( [ 'image', 'imageInline' ] );

					modelElements.forEach( elementName => {
						expect( elementName ).to.match( /[image,imageInline]/ );
					} );
				} );
			} );

			it( 'should always have properly defined #name and #icon', () => {
				for ( const arrangement in DEFAULT_ARRANGEMENTS ) {
					expect( arrangement ).to.equal( DEFAULT_ARRANGEMENTS[ arrangement ].name );
					expect( DEFAULT_ARRANGEMENTS[ arrangement ].icon ).to.be.a( 'string' );
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

					expect( DEFAULT_ARRANGEMENTS ).to.include.keys( group.items );
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
				arrangements: [
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
				arrangements: [ 'inline', 'alignLeft', 'alignRight' ]
			} );
		} );

		it( 'should return the proper config if only the block image editing plugin is loaded', () => {
			const config = getDefaultStylesConfiguration( true, false );

			expect( config ).to.deep.equal( {
				arrangements: [ 'full', 'side' ]
			} );
		} );

		it( 'should return an empty object if neither image editing plugins are loaded', () => {
			const config = getDefaultStylesConfiguration( false, false );

			expect( config ).to.deep.equal( {} );
		} );
	} );

	describe( 'normalizeImageStyles()', () => {
		function normalizeStyles(
			arrangements = allArrangements,
			groups = [],
			isBlockPluginLoaded = true,
			isInlinePluginLoaded = true
		) {
			return utils.normalizeStyles( {
				configuredStyles: { arrangements, groups },
				isBlockPluginLoaded,
				isInlinePluginLoaded
			} );
		}

		testUtils.createSinonSandbox();

		beforeEach( () => {
			testUtils.sinon.stub( console, 'warn' );
		} );

		describe( 'arrangement', () => {
			describe( 'set as a string in the editor config', () => {
				it( 'should return the proper default arrangement if #name matches', () => {
					for ( const arrangement in DEFAULT_ARRANGEMENTS ) {
						const normalizedStyles = normalizeStyles( [ arrangement ] );

						expect( normalizedStyles.arrangements[ 0 ] ).to.not.equal( DEFAULT_ARRANGEMENTS[ arrangement ] );
						expect( normalizedStyles ).to.deep.equal(
							{ arrangements: [ DEFAULT_ARRANGEMENTS[ arrangement ] ], groups: [] }
						);
					}

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and omit the arrangement if the #name not found in default arrangements', () => {
					expect( normalizeStyles(
						[ 'foo' ]
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-configuration-definition-invalid/ ),
						{ arrangement: { name: 'foo' } },
						sinon.match.string // Link to the documentation
					);
				} );
			} );

			describe( 'set as an object in the editor config', () => {
				it( 'should pass through if #name not found in the default arrangements', () => {
					const arrangement = { name: 'foo', modelElements: [ 'image' ] };

					expect( normalizeStyles(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [ arrangement ], groups: [] }
					);

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should use one of default icons if #icon matches', () => {
					for ( const icon in DEFAULT_ICONS ) {
						const arrangement = { name: 'custom', modelElements: [ 'image' ], icon };

						expect( normalizeStyles(
							[ arrangement ]
						) ).to.deep.equal(
							{ arrangements: [ { ...arrangement, icon: DEFAULT_ICONS[ icon ] } ], groups: [] }
						);
					}

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should pass the icon if is not a string', () => {
					const arrangement = { name: 'custom', modelElements: [ 'image' ], icon: {} };

					expect( normalizeStyles(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [ arrangement ], groups: [] }
					);

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and filter out the arrangement which has no modelElements defined', () => {
					const arrangement = { name: 'foo' };

					expect( normalizeStyles(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-configuration-definition-invalid/ ),
						{ arrangement },
						sinon.match.string // Link to the documentation
					);
				} );

				it( 'should warn and filter out the arrangement which has modelElements defined as an empty array', () => {
					const arrangement = { name: 'foo', modelElements: [] };

					expect( normalizeStyles(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-configuration-definition-invalid/ ),
						{ arrangement },
						sinon.match.string // Link to the documentation
					);
				} );

				it( 'should warn and filter out the arrangement which is not supported by any of the loaded editing plugins', () => {
					const arrangement = { name: 'foo', modelElements: [ 'image' ] };

					expect( normalizeStyles(
						[ arrangement ], [], false, true // ImageBlockEditing plugin is not loaded
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					sinon.assert.calledOnce( console.warn );
					sinon.assert.calledWithExactly( console.warn,
						sinon.match( /^image-style-missing-dependency/ ),
						{ arrangement, missingPlugins: [ 'ImageBlockEditing' ] },
						sinon.match.string // Link to the documentation
					);
				} );

				it( 'should extend one of default styles if #name found in the default arrangements', () => {
					const arrangement = {
						name: 'alignLeft',
						title: 'customTitle',
						modelElements: [ 'image' ],
						icon: 'inline',
						isDefault: true,
						className: 'custom-class',
						customProp: 'customProp'
					};

					const normalizedStyles = normalizeStyles( [ arrangement ] );

					expect( normalizedStyles.arrangements[ 0 ] ).to.not.equal( DEFAULT_ARRANGEMENTS.alignLeft );
					expect( normalizedStyles ).to.deep.equal(
						{ arrangements: [ { ...arrangement, icon: DEFAULT_ICONS.inline } ], groups: [] }
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
						const normalizedStyles = normalizeStyles( allArrangements, [ group ] );

						expect( normalizedStyles.groups[ 0 ] ).to.not.equal( currentGroup );
						expect( normalizedStyles ).to.deep.equal(
							{ arrangements: allArrangements, groups: [ currentGroup ] } );
					}

					sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and omit the group if a #name not found in default groups', () => {
					expect( normalizeStyles(
						allArrangements, [ 'foo' ]
					) ).to.deep.equal(
						{ groups: [], arrangements: allArrangements }
					);
				} );
			} );

			describe( 'set as an object in the editor config', () => {
				describe( '#name found in the default groups', () => {
					it( 'should pass through and extend if definition is valid', () => {
						const group = { name: 'wrapText', items: [ 'alignLeft' ], defaultItem: 'alignLeft', customProp: 'customProp' };
						const normalizedStyles = normalizeStyles( allArrangements, [ group ] );

						expect( normalizedStyles.groups[ 0 ] ).to.not.equal( DEFAULT_GROUPS.wrapText );
						expect( normalizedStyles ).to.deep.equal(
							{ arrangements: allArrangements, groups: [ { ...DEFAULT_GROUPS.wrapText, ...group } ] }
						);

						sinon.assert.notCalled( console.warn );
					} );

					it( 'should omit if no #items are present', () => {
						expect( normalizeStyles(
							allArrangements, [ { name: 'breakText', items: null } ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);
					} );

					it( 'should omit if #items are empty', () => {
						expect( normalizeStyles(
							allArrangements, [ { name: 'breakText', items: [] } ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);
					} );

					it( 'should warn about items not supported by any of the loaded editing plugins', () => {
						const arrangement = { name: 'foo', modelElements: [ 'imageInline' ] };

						expect( normalizeStyles(
							[ arrangement, 'alignLeft' ],
							[ { name: 'wrapText', items: [ 'foo', 'alignLeft' ] } ],
							true,
							false // ImageInlineEditing plugin is not loaded
						) ).to.deep.equal( {
							arrangements: [ DEFAULT_ARRANGEMENTS.alignLeft ],
							groups: [ { name: 'wrapText', defaultItem: 'alignLeft', title: 'Wrap text', items: [ 'foo', 'alignLeft' ] } ]
						} );

						sinon.assert.calledOnce( console.warn );
						sinon.assert.calledWithExactly( console.warn,
							sinon.match( /^image-style-missing-dependency/ ),
							{ arrangement, missingPlugins: [ 'ImageInlineEditing' ] },
							sinon.match.string // Link to the documentation
						);
					} );
				} );

				describe( '#name not found in the default groups', () => {
					it( 'should pass through if definition is valid', () => {
						const groups = [ { name: 'inline', items: [ 'alignLeft' ], defaultItem: 'alignLeft' } ];

						expect( normalizeStyles(
							allArrangements, groups
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups }
						);

						sinon.assert.notCalled( console.warn );
					} );

					it( 'should omit if no #items are present', () => {
						expect( normalizeStyles(
							allArrangements, [ { name: 'foo' } ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);
					} );

					it( 'should omit if #items are empty', () => {
						expect( normalizeStyles(
							allArrangements, [ { name: 'foo', items: [] } ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);
					} );

					it( 'should warn and filter out the items which are not supported by any of the loaded editing plugins', () => {
						const arrangement = { name: 'foo', modelElements: [ 'imageInline' ] };
						const groups = [ { name: 'bar', defaultItem: 'alignLeft', items: [ 'foo', 'alignLeft' ] } ];

						expect( normalizeStyles(
							[ arrangement, 'alignLeft' ],
							groups,
							true,
							false // ImageInlineEditing plugin is not loaded
						) ).to.deep.equal( {
							arrangements: [ DEFAULT_ARRANGEMENTS.alignLeft ],
							groups
						} );

						sinon.assert.calledOnce( console.warn );
						sinon.assert.calledWithExactly( console.warn,
							sinon.match( /^image-style-missing-dependency/ ),
							{ arrangement, missingPlugins: [ 'ImageInlineEditing' ] },
							sinon.match.string // Link to the documentation
						);
					} );
				} );
			} );
		} );
	} );
} );
