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

	testUtils.createSinonSandbox();

	describe( 'default styles', () => {
		describe( 'arrangements', () => {
			it( 'should have the #DEFAULT_ARRANGMENTS properly defined', () => {
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
				'full', 'left', 'right', 'center', 'inLineLeft', 'inLineRight', 'inLine'
			] );
		} );
	} );

	describe( 'getDefaultStylesConfiguration()', () => {
		it( 'should return the proper config if both image editing plugins are loaded', async () => {
			const config = getDefaultStylesConfiguration( true, true );

			expect( config ).to.deep.equal( {
				arrangements: [
					'inline', 'alignLeft', 'alignRight',
					'alignCenter', 'alignBlockLeft', 'alignBlockRight'
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

		it( 'should return an empty object if neither image editing plugins are loaed', () => {
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

					testUtils.sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and ommit the arrangement if the #name not found in default arrangements', () => {
					expect( normalizeStyles(
						[ 'foo' ]
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					testUtils.sinon.assert.calledOnce( console.warn );
					testUtils.sinon.assert.calledWithExactly( console.warn,
						testUtils.sinon.match( /^image-style-invalid/ ),
						{ arrangement: { name: 'foo' } },
						testUtils.sinon.match.string // Link to the documentation
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

					testUtils.sinon.assert.notCalled( console.warn );
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

					testUtils.sinon.assert.notCalled( console.warn );
				} );

				it( 'should pass the icon if is not a string', () => {
					const arrangement = { name: 'custom', modelElements: [ 'image' ], icon: {} };

					expect( normalizeStyles(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [ arrangement ], groups: [] }
					);

					testUtils.sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and filter out the arrangement which has no modelElements defined', () => {
					const arrangement = { name: 'foo' };

					expect( normalizeStyles(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					testUtils.sinon.assert.calledOnce( console.warn );
					testUtils.sinon.assert.calledWithExactly( console.warn,
						testUtils.sinon.match( /^image-style-invalid/ ),
						{ arrangement },
						testUtils.sinon.match.string // Link to the documentation
					);
				} );

				it( 'should warn and filter out the arrangement which has modelElements defined as an empty array', () => {
					const arrangement = { name: 'foo', modelElements: [] };

					expect( normalizeStyles(
						[ arrangement ]
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					testUtils.sinon.assert.calledOnce( console.warn );
					testUtils.sinon.assert.calledWithExactly( console.warn,
						testUtils.sinon.match( /^image-style-invalid/ ),
						{ arrangement },
						testUtils.sinon.match.string // Link to the documentation
					);
				} );

				it( 'should warn and filter out the arrangement which is not supported by any of the loaded editing plugins', () => {
					const arrangement = { name: 'foo', modelElements: [ 'imageInline' ] };

					expect( normalizeStyles(
						[ arrangement ], [], true, false // ImageInlineEditing plugin is not loaded
					) ).to.deep.equal(
						{ arrangements: [], groups: [] }
					);

					testUtils.sinon.assert.calledOnce( console.warn );
					testUtils.sinon.assert.calledWithExactly( console.warn,
						testUtils.sinon.match( /^image-style-unsupported/ ),
						{ arrangement: arrangement.name, missingPlugins: [ 'ImageInlineEditing' ] },
						testUtils.sinon.match.string // Link to the documentation
					);
				} );

				it( 'should extend one of default styles if #name found in the default arrangements', () => {
					const arrangement = {
						name: 'alignLeft',
						title: 'customTitle',
						modelElements: [ 'image' ],
						icon: 'inLine',
						isDefault: true,
						className: 'custom-class',
						customProp: 'customProp'
					};

					const normalizedStyles = normalizeStyles( [ arrangement ] );

					expect( normalizedStyles.arrangements[ 0 ] ).to.not.equal( DEFAULT_ARRANGEMENTS.alignLeft );
					expect( normalizedStyles ).to.deep.equal(
						{ arrangements: [ { ...arrangement, icon: DEFAULT_ICONS.inLine } ], groups: [] }
					);

					testUtils.sinon.assert.notCalled( console.warn );
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

					testUtils.sinon.assert.notCalled( console.warn );
				} );

				it( 'should warn and ommit the group if a #name not found in default groups', () => {
					expect( normalizeStyles(
						allArrangements, [ 'foo' ]
					) ).to.deep.equal(
						{ groups: [], arrangements: allArrangements }
					);

					testUtils.sinon.assert.calledOnce( console.warn );
					testUtils.sinon.assert.calledWithExactly( console.warn,
						testUtils.sinon.match( /^image-style-invalid/ ),
						{ group: { name: 'foo' } },
						testUtils.sinon.match.string // Link to the documentation
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

						testUtils.sinon.assert.notCalled( console.warn );
					} );

					it( 'should warn and ommit if no valid #items are present', () => {
						const group = { name: 'breakText', items: [ 'foo' ] };

						expect( normalizeStyles(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: { ...DEFAULT_GROUPS.breakText, ...group } },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if no #items are present', () => {
						const group = { name: 'breakText', items: null };

						expect( normalizeStyles(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: { ...DEFAULT_GROUPS.breakText, ...group } },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if #items are empty', () => {
						const group = { name: 'breakText', items: [] };

						expect( normalizeStyles(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: { ...DEFAULT_GROUPS.breakText, ...group } },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if #defaultItem is not a string', () => {
						const group = { name: 'breakText', items: [ 'alignLeft' ], defaultItem: { name: 'alignLeft' } };

						expect( normalizeStyles(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: { ...DEFAULT_GROUPS.breakText, ...group } },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if #defaultItem is not present in items', () => {
						const group = { name: 'breakText', items: [ 'alignLeft' ], defaultItem: 'alignRight' };

						expect( normalizeStyles(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: { ...DEFAULT_GROUPS.breakText, ...group } },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and filter out the items that are not defined as the arrangements', () => {
						expect( normalizeStyles(
							allArrangements, [ { name: 'breakText', items: [ 'alignLeft', 'foo', 'bar' ], defaultItem: 'alignLeft' } ]
						) ).to.deep.equal( {
							arrangements: allArrangements,
							groups: [ { ...DEFAULT_GROUPS.breakText, items: [ 'alignLeft' ], defaultItem: 'alignLeft' } ]
						} );

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'bar' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and filter out the items which are not supported by any of the loaded editing plugins', () => {
						expect( normalizeStyles(
							[ { name: 'foo', modelElements: [ 'imageInline' ] }, 'alignLeft' ],
							[ { name: 'wrapText', items: [ 'foo', 'alignLeft' ] } ],
							true,
							false // ImageInlineEditing plugin is not loaded
						) ).to.deep.equal( {
							arrangements: [ DEFAULT_ARRANGEMENTS.alignLeft ],
							groups: [ { name: 'wrapText', defaultItem: 'alignLeft', title: 'Wrap text', items: [ 'alignLeft' ] } ]
						} );

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-unsupported/ ),
							{ arrangement: 'foo', missingPlugins: [ 'ImageInlineEditing' ] },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
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

						testUtils.sinon.assert.notCalled( console.warn );
					} );

					it( 'should warn and ommit if no valid #items are present', () => {
						const invalidGroup = { name: 'foo', items: [ 'foo' ], defaultItem: 'foo' };

						expect( normalizeStyles(
							allArrangements, [ invalidGroup, 'wrapText' ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [ DEFAULT_GROUPS.wrapText ] }
						);

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group: invalidGroup },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if no #items are present', () => {
						const group = { name: 'foo' };

						expect( normalizeStyles(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if #items are empty', () => {
						const group = { name: 'foo', items: [] };

						expect( normalizeStyles(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if #defaultItem is not a string', () => {
						const group = { name: 'foo', items: [ 'alignLeft' ], defaultItem: { name: 'alignLeft' } };

						expect( normalizeStyles(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if defaultItem is not defined', () => {
						const group = { name: 'foo', items: [ 'alignLeft' ] };

						expect( normalizeStyles(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and ommit if defaultItem is not present in items', () => {
						const group = { name: 'foo', items: [ 'alignLeft' ], defaultItem: [ 'alignRight' ] };

						expect( normalizeStyles(
							allArrangements, [ group ]
						) ).to.deep.equal(
							{ arrangements: allArrangements, groups: [] }
						);

						testUtils.sinon.assert.calledOnce( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ group },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and filter out the items that are not defined as the arrangements', () => {
						expect( normalizeStyles(
							allArrangements, [ { name: 'foo', items: [ 'alignLeft', 'foo', 'bar' ], defaultItem: 'alignLeft' } ]
						) ).to.deep.equal( {
							arrangements: allArrangements,
							groups: [ { name: 'foo', items: [ 'alignLeft' ], defaultItem: 'alignLeft' } ]
						} );

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'bar' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );

					it( 'should warn and filter out the items which are not supported by any of the loaded editing plugins', () => {
						expect( normalizeStyles(
							[ { name: 'foo', modelElements: [ 'imageInline' ] }, 'alignLeft' ],
							[ { name: 'bar', defaultItem: 'alignLeft', items: [ 'foo', 'alignLeft' ] } ],
							true,
							false // ImageInlineEditing plugin is not loaded
						) ).to.deep.equal( {
							arrangements: [ DEFAULT_ARRANGEMENTS.alignLeft ],
							groups: [ { name: 'bar', defaultItem: 'alignLeft', items: [ 'alignLeft' ] } ]
						} );

						testUtils.sinon.assert.calledTwice( console.warn );
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-unsupported/ ),
							{ arrangement: 'foo', missingPlugins: [ 'ImageInlineEditing' ] },
							testUtils.sinon.match.string // Link to the documentation
						);
						testUtils.sinon.assert.calledWithExactly( console.warn,
							testUtils.sinon.match( /^image-style-invalid/ ),
							{ groupItem: 'foo' },
							testUtils.sinon.match.string // Link to the documentation
						);
					} );
				} );
			} );
		} );
	} );
} );
