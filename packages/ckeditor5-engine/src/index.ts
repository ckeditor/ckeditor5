/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine
 */

export * from './view/placeholder';

// Controller.
export { default as EditingController } from './controller/editingcontroller';
export { default as DataController, type DataControllerSetEvent } from './controller/datacontroller';

// Conversion.
export { default as Conversion } from './conversion/conversion';
export type {
	default as DowncastDispatcher,
	DowncastAttributeEvent,
	DowncastConversionApi,
	DowncastInsertEvent,
	DowncastRemoveEvent,
	DowncastSelectionEvent
} from './conversion/downcastdispatcher';
export type {
	default as UpcastDispatcher,
	UpcastConversionApi,
	UpcastElementEvent,
	UpcastTextEvent
} from './conversion/upcastdispatcher';
export type {
	AddHighlightCallback,
	AttributeDescriptor,
	ElementCreatorFunction,
	HighlightDescriptor,
	RemoveHighlightCallback
} from './conversion/downcasthelpers';
export type {
	default as Mapper,
	MapperModelToViewPositionEvent,
	MapperViewToModelPositionEvent
} from './conversion/mapper';
export type { default as ModelConsumable } from './conversion/modelconsumable';
export type { Consumables } from './conversion/viewconsumable';

// DataProcessor.
export { default as HtmlDataProcessor } from './dataprocessor/htmldataprocessor';

// Model / Operation.
export type { default as Operation } from './model/operation/operation';
export { default as InsertOperation } from './model/operation/insertoperation';
export { default as MarkerOperation } from './model/operation/markeroperation';
export { default as OperationFactory } from './model/operation/operationfactory';
export type { default as AttributeOperation } from './model/operation/attributeoperation';
export type { default as RenameOperation } from './model/operation/renameoperation';
export { transformSets } from './model/operation/transform';

// Model.
export { default as DocumentSelection, type DocumentSelectionChangeRangeEvent } from './model/documentselection';
export { default as Range } from './model/range';
export { default as LiveRange } from './model/liverange';
export { default as LivePosition } from './model/liveposition';
export { default as Model } from './model/model';
export { default as TreeWalker } from './model/treewalker';
export { default as Element } from './model/element';
export { default as Position } from './model/position';
export { default as DocumentFragment } from './model/documentfragment';
export { default as History } from './model/history';
export { default as Text } from './model/text';
export type { default as Batch } from './model/batch';
export type { DiffItem } from './model/differ';
export type { default as Item } from './model/item';
export type { default as Node } from './model/node';
export type { default as Schema } from './model/schema';
export type { default as Selection } from './model/selection';
export type { default as Writer } from './model/writer';
export type { default as TypeCheckable } from './model/typecheckable';

export { findOptimalInsertionRange } from './model/utils/findoptimalinsertionrange';

// Model Events.
export type { DocumentChangeEvent } from './model/document';
export type { DocumentSelectionChangeEvent } from './model/documentselection';
export type {
	ModelApplyOperationEvent,
	ModelDeleteContentEvent,
	ModelGetSelectedContentEvent,
	ModelInsertContentEvent,
	ModelInsertObjectEvent,
	ModelModifySelectionEvent
} from './model/model';
export type { SelectionChangeRangeEvent } from './model/selection';

// View.
export { default as DataTransfer } from './view/datatransfer';
export { default as DomConverter } from './view/domconverter';
export { default as Renderer } from './view/renderer';
export { default as View } from './view/view';
export { default as ViewDocument } from './view/document';
export { default as ViewText } from './view/text';
export { default as ViewElement } from './view/element';
export { default as ViewContainerElement } from './view/containerelement';
export { default as ViewEditableElement } from './view/editableelement';
export { default as ViewAttributeElement } from './view/attributeelement';
export { default as ViewEmptyElement } from './view/emptyelement';
export { default as ViewRawElement } from './view/rawelement';
export { default as ViewUIElement } from './view/uielement';
export { default as ViewDocumentFragment } from './view/documentfragment';
export type { default as ViewItem } from './view/item';
export type { default as ViewNode } from './view/node';
export type { default as ViewDocumentSelection } from './view/documentselection';
export type { default as ViewPosition } from './view/position';
export type { default as ViewRange } from './view/range';
export type { default as ViewSelection, ViewSelectionChangeEvent } from './view/selection';
export type { default as ViewTypeCheckable } from './view/typecheckable';

export { getFillerOffset } from './view/containerelement';

// View / Observer.
export { default as Observer } from './view/observer/observer';
export { default as ClickObserver } from './view/observer/clickobserver';
export { default as DomEventObserver } from './view/observer/domeventobserver';
export { default as MouseObserver } from './view/observer/mouseobserver';
export { default as TabObserver } from './view/observer/tabobserver';

export { default as DowncastWriter } from './view/downcastwriter';
export { default as UpcastWriter } from './view/upcastwriter';
export { default as Matcher } from './view/matcher';

export { default as BubblingEventInfo } from './view/observer/bubblingeventinfo';
export { default as DomEventData } from './view/observer/domeventdata';

// View / Events.
export type { BubblingEvent } from './view/observer/bubblingemittermixin';
export type { ViewDocumentArrowKeyEvent } from './view/observer/arrowkeysobserver';
export type { ViewDocumentCompositionEvent } from './view/observer/compositionobserver';
export type { ViewDocumentInputEvent } from './view/observer/inputobserver';
export type { ViewDocumentKeyEvent } from './view/observer/keyobserver';
export type { ViewDocumentLayoutChangedEvent } from './view/document';
export type { ViewDocumentMouseEvent } from './view/observer/mouseobserver';
export type { ViewDocumentTabEvent } from './view/observer/tabobserver';

// View / Styles.
export { StylesProcessor } from './view/stylesmap';
export * from './view/styles/background';
export * from './view/styles/border';
export * from './view/styles/margin';
export * from './view/styles/padding';
export * from './view/styles/utils';
