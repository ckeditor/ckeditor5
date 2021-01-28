/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine
 */

export * from './view/placeholder';

export { default as EditingController } from './controller/editingcontroller';
export { default as DataController } from './controller/datacontroller';

export { default as Conversion } from './conversion/conversion';

export { default as HtmlDataProcessor } from './dataprocessor/htmldataprocessor';

export { default as InsertOperation } from './model/operation/insertoperation';
export { default as MarkerOperation } from './model/operation/markeroperation';
export { default as OperationFactory } from './model/operation/operationfactory';
export { transformSets } from './model/operation/transform';

export { default as DocumentSelection } from './model/documentselection';
export { default as Range } from './model/range';
export { default as LiveRange } from './model/liverange';
export { default as LivePosition } from './model/liveposition';
export { default as Model } from './model/model';
export { default as TreeWalker } from './model/treewalker';
export { default as Element } from './model/element';

export { default as DomConverter } from './view/domconverter';
export { default as ViewDocument } from './view/document';

export { getFillerOffset } from './view/containerelement';
export { default as Observer } from './view/observer/observer';
export { default as ClickObserver } from './view/observer/clickobserver';
export { default as DomEventObserver } from './view/observer/domeventobserver';
export { default as MouseObserver } from './view/observer/mouseobserver';
export { default as DowncastWriter } from './view/downcastwriter';
export { default as UpcastWriter } from './view/upcastwriter';
export { default as Matcher } from './view/matcher';

export { default as DomEventData } from './view/observer/domeventdata';

export { StylesProcessor } from './view/stylesmap';
export * from './view/styles/background';
export * from './view/styles/border';
export * from './view/styles/margin';
export * from './view/styles/padding';
export * from './view/styles/utils';
