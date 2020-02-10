/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Watchdog from '../src/watchdog';

describe( 'Watchdog', () => {
	it( 'should not be created directly', () => {
		expect( () => {
			// eslint-disable-next-line no-unused-vars
			const watchdog = new Watchdog( {} );
		} ).to.throw( /Please, use `EditorWatchdog` if you have used the `Watchdog` class previously\./ );
	} );

	it( 'should be created using the inheritance', () => {
		class FooWatchdog extends Watchdog {
			_restart() {}
			_isErrorComingFromThisItem() {}
		}

		expect( () => {
			// eslint-disable-next-line no-unused-vars
			const fooWatchdog = new FooWatchdog( {} );
		} ).to.not.throw();
	} );
} );
