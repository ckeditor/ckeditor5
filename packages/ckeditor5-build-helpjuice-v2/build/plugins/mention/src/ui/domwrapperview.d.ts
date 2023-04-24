/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module mention/ui/domwrapperview
 */
import { View } from 'ckeditor5/src/ui';
import type { Locale } from 'ckeditor5/src/utils';
/**
 * This class wraps DOM element as a CKEditor5 UI View.
 *
 * It allows to render any DOM element and use it in mentions list.
 */
export default class DomWrapperView extends View {
    /**
     * The DOM element for which wrapper was created.
     */
    domElement: HTMLElement;
    /**
     * Controls whether the dom wrapper view is "on". This is in line with {@link module:ui/button/button~Button#isOn} property.
     *
     * @observable
     * @default true
     */
    isOn: boolean;
    /**
     * Creates an instance of {@link module:mention/ui/domwrapperview~DomWrapperView} class.
     *
     * Also see {@link #render}.
     */
    constructor(locale: Locale, domElement: HTMLElement);
    /**
     * @inheritDoc
     */
    render(): void;
}
