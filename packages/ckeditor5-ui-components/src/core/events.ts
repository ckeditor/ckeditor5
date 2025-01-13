/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/core/events
 */

import type CKComponent from './ckcomponent.js';

type ConstructorType<T> = new ( ...args: Array<any> ) => T;

export type CKComponentConstructor = ConstructorType<CKComponent>;
