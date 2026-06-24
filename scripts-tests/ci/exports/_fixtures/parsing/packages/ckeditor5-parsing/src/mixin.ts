/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Test fixture for the module re-exports validator.
 *
 * @publicApi
 */

import { ParsingMixin, type ParsingMixinConstructor } from './observable.js';

const ParsingObservableBase: ParsingMixinConstructor = ParsingMixin();

export class ParsingObservable extends ParsingObservableBase {}
