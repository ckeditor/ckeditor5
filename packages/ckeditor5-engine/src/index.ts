/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine
 */

export {
	type PlaceholderableElement,
	disablePlaceholder,
	enablePlaceholder,
	hidePlaceholder,
	needsPlaceholder,
	showPlaceholder
} from './view/placeholder.js';

// Controller.
export { EditingController } from './controller/editingcontroller.js';
export {
	DataController,
	type DataControllerInitEvent,
	type DataControllerSetEvent,
	type DataControllerToModelEvent,
	type DataControllerToViewEvent,
	type DataControllerReadyEvent,
	type DataControllerGetEvent
} from './controller/datacontroller.js';

// Conversion.
export { Conversion, type ConversionType } from './conversion/conversion.js';
export { ConversionHelpers } from './conversion/conversionhelpers.js';
export type {
	DowncastDispatcher,
	DowncastDispatcherEventMap,
	DowncastAddMarkerEvent,
	DowncastAttributeEvent,
	DowncastConversionApi,
	DowncastInsertEvent,
	DowncastRemoveEvent,
	DowncastRemoveMarkerEvent,
	DowncastSelectionEvent,
	DowncastReduceChangesEvent,
	DowncastReduceChangesEventData,
	DowncastEvent,
	DowncastCleanSelectionEvent
} from './conversion/downcastdispatcher.js';
export type {
	UpcastDispatcher,
	UpcastConversionApi,
	UpcastConversionData,
	UpcastElementEvent,
	UpcastTextEvent,
	UpcastViewCleanupEvent,
	UpcastEvent,
	UpcastDocumentFragmentEvent
} from './conversion/upcastdispatcher.js';
export { UpcastHelpers } from './conversion/upcasthelpers.js';
export {
	DowncastHelpers,
	type DowncastStructureCreatorFunction,
	type DowncastAttributeElementCreatorFunction,
	type DowncastElementCreatorFunction,
	type DowncastHighlightDescriptor,
	type DowncastSlotFilter,
	type DowncastAttributeDescriptor,
	type DowncastMarkerElementCreatorFunction,
	type DowncastAddHighlightCallback,
	type DowncastHighlightDescriptorCreatorFunction,
	type DowncastRemoveHighlightCallback,
	type DowncastMarkerDataCreatorFunction
} from './conversion/downcasthelpers.js';

export type {
	UpcastElementCreatorFunction,
	UpcastAttributeCreatorFunction,
	UpcastMarkerFromElementCreatorFunction,
	UpcastMarkerFromAttributeCreatorFunction
} from './conversion/upcasthelpers.js';

export type {
	Mapper,
	MapperModelToViewPositionEvent,
	MapperViewToModelPositionEvent,
	MapperModelToViewPositionEventData,
	MapperViewToModelPositionEventData
} from './conversion/mapper.js';
export type { ModelConsumable } from './conversion/modelconsumable.js';
export type { Consumables, ViewConsumable } from './conversion/viewconsumable.js';

// DataProcessor.
export type { DataProcessor } from './dataprocessor/dataprocessor.js';
export type { DataProcessorHtmlWriter } from './dataprocessor/htmlwriter.js';

export { HtmlDataProcessor } from './dataprocessor/htmldataprocessor.js';
export { XmlDataProcessor } from './dataprocessor/xmldataprocessor.js';

// Model / Operation.
export type { Operation } from './model/operation/operation.js';
export { InsertOperation } from './model/operation/insertoperation.js';
export { MoveOperation } from './model/operation/moveoperation.js';
export { MergeOperation } from './model/operation/mergeoperation.js';
export { SplitOperation } from './model/operation/splitoperation.js';
export { MarkerOperation } from './model/operation/markeroperation.js';
export { OperationFactory } from './model/operation/operationfactory.js';
export { AttributeOperation } from './model/operation/attributeoperation.js';
export { RenameOperation } from './model/operation/renameoperation.js';
export { RootAttributeOperation } from './model/operation/rootattributeoperation.js';
export { RootOperation } from './model/operation/rootoperation.js';
export { NoOperation } from './model/operation/nooperation.js';
export { transformOperationSets, type TransformOperationSetsResult } from './model/operation/transform.js';

// Model.
export {
	ModelDocumentSelection,
	type ModelDocumentSelectionChangeRangeEvent,
	type ModelDocumentSelectionChangeMarkerEvent,
	type ModelDocumentSelectionChangeAttributeEvent
} from './model/documentselection.js';
export { ModelRange } from './model/range.js';
export {
	ModelLiveRange,
	type ModelLiveRangeChangeRangeEvent,
	type ModelLiveRangeChangeContentEvent,
	type ModelLiveRangeChangeEvent
} from './model/liverange.js';
export { ModelLivePosition, type ModelLivePositionChangeEvent } from './model/liveposition.js';
export { Model } from './model/model.js';
export {
	ModelTreeWalker,
	type ModelTreeWalkerValue,
	type ModelTreeWalkerValueType,
	type ModelTreeWalkerDirection,
	type ModelTreeWalkerOptions
} from './model/treewalker.js';
export { ModelElement } from './model/element.js';
export {
	ModelPosition,
	type ModelPositionOffset,
	type ModelPositionRelation,
	type ModelPositionStickiness
} from './model/position.js';
export { ModelDocumentFragment } from './model/documentfragment.js';
export { ModelDocument, type ModelPostFixer } from './model/document.js';
export { History } from './model/history.js';
export { ModelText } from './model/text.js';
export { ModelTextProxy } from './model/textproxy.js';
export {
	MarkerCollection,
	type Marker,
	type MarkerData,
	type MarkerChangeRangeEvent,
	type MarkerCollectionChangeContentEvent,
	type MarkerChangeEvent,
	type MarkerCollectionUpdateEvent
} from './model/markercollection.js';
export { Batch, type BatchType } from './model/batch.js';
export {
	Differ,
	type DifferItem,
	type DifferItemAttribute,
	type DifferItemInsert,
	type DifferItemRemove,
	type DifferItemAction,
	type DifferItemReinsert,
	type DifferItemRoot
} from './model/differ.js';
export type { ModelItem } from './model/item.js';
export { ModelNode, type ModelNodeAttributes } from './model/node.js';
export { ModelNodeList } from './model/nodelist.js';
export { ModelRootElement } from './model/rootelement.js';
export {
	ModelSchemaContext,
	type ModelSchema,
	type ModelSchemaCheckChildEvent,
	type ModelSchemaCheckAttributeEvent,
	type ModelSchemaAttributeCheckCallback,
	type ModelSchemaChildCheckCallback,
	type ModelAttributeProperties,
	type ModelSchemaItemDefinition,
	type ModelSchemaCompiledItemDefinition,
	type ModelSchemaContextDefinition,
	type ModelSchemaContextItem
} from './model/schema.js';
export {
	ModelSelection,
	type ModelSelectionChangeEvent,
	type ModelSelectionChangeRangeEvent,
	type ModelSelectionChangeAttributeEvent,
	type ModelSelectable,
	type ModelPlaceOrOffset
} from './model/selection.js';
export { ModelTypeCheckable } from './model/typecheckable.js';
export { ModelWriter } from './model/writer.js';

// Model utils.
export {
	autoParagraphEmptyRoots,
	isParagraphable,
	wrapInParagraph
} from './model/utils/autoparagraphing.js';

// Model Events.
export type { ModelDocumentChangeEvent } from './model/document.js';
export type { ModelDocumentSelectionChangeEvent } from './model/documentselection.js';
export type {
	ModelApplyOperationEvent,
	ModelDeleteContentEvent,
	ModelGetSelectedContentEvent,
	ModelInsertContentEvent,
	ModelInsertObjectEvent,
	ModelModifySelectionEvent,
	ModelCanEditAtEvent
} from './model/model.js';
export type { ModelSelectionChangeRangeEvent as SelectionChangeRangeEvent } from './model/selection.js';

// View.
export { DataTransfer } from './view/datatransfer.js';
export { DomConverter, type BlockFillerMode } from './view/domconverter.js';
export { Renderer } from './view/renderer.js';
export { EditingView } from './view/view.js';
export { ViewDocument } from './view/document.js';
export { ViewText } from './view/text.js';
export { ViewElement, type ElementAttributes as ViewElementAttributes } from './view/element.js';
export { ViewContainerElement } from './view/containerelement.js';
export { ViewEditableElement } from './view/editableelement.js';
export { ViewRootEditableElement } from './view/rooteditableelement.js';
export { ViewAttributeElement } from './view/attributeelement.js';
export { ViewEmptyElement } from './view/emptyelement.js';
export { ViewRawElement } from './view/rawelement.js';
export { ViewUIElement } from './view/uielement.js';
export { ViewDocumentFragment } from './view/documentfragment.js';
export { ViewTreeWalker, type TreeWalkerValue as ViewTreeWalkerValue } from './view/treewalker.js';
export type { ViewElementDefinition, ElementObjectDefinition } from './view/elementdefinition.js';
export { ViewDocumentSelection } from './view/documentselection.js';
export { AttributeElement } from './view/attributeelement.js';
export type { ViewItem } from './view/item.js';
export { ViewNode } from './view/node.js';
export { ViewPosition, type PositionOffset as ViewPositionOffset } from './view/position.js';
export { ViewRange } from './view/range.js';
export { ViewSelection, type ViewSelectionChangeEvent, type Selectable as ViewSelectable } from './view/selection.js';
export type { ViewTypeCheckable } from './view/typecheckable.js';

export { getFillerOffset } from './view/containerelement.js';

// View / Observer.
export { Observer } from './view/observer/observer.js';
export { ClickObserver } from './view/observer/clickobserver.js';
export { DomEventObserver } from './view/observer/domeventobserver.js';
export { MouseObserver } from './view/observer/mouseobserver.js';
export { TabObserver } from './view/observer/tabobserver.js';
export { TouchObserver } from './view/observer/touchobserver.js';

export {
	FocusObserver,
	type ViewDocumentBlurEvent,
	type ViewDocumentFocusEvent
} from './view/observer/focusobserver.js';

export { DowncastWriter } from './view/downcastwriter.js';
export { UpcastWriter } from './view/upcastwriter.js';
export { Matcher, type MatcherPattern, type MatcherObjectPattern, type Match, type MatchResult } from './view/matcher.js';

export { BubblingEventInfo } from './view/observer/bubblingeventinfo.js';
export { DomEventData } from './view/observer/domeventdata.js';

// View / Events.
export type { BubblingEvent } from './view/observer/bubblingemittermixin.js';
export type { ViewDocumentArrowKeyEvent } from './view/observer/arrowkeysobserver.js';
export type {
	ViewDocumentCompositionStartEvent,
	ViewDocumentCompositionUpdateEvent,
	ViewDocumentCompositionEndEvent
} from './view/observer/compositionobserver.js';
export type { ViewDocumentInputEvent } from './view/observer/inputobserver.js';
export type { ViewDocumentMutationsEvent, MutationData } from './view/observer/mutationobserver.js';
export type { ViewDocumentKeyDownEvent, ViewDocumentKeyUpEvent, KeyEventData } from './view/observer/keyobserver.js';
export type { ViewDocumentLayoutChangedEvent } from './view/document.js';
export type {
	ViewDocumentMouseDownEvent,
	ViewDocumentMouseUpEvent,
	ViewDocumentMouseOverEvent,
	ViewDocumentMouseOutEvent
} from './view/observer/mouseobserver.js';
export type {
	ViewDocumentTouchEndEvent,
	ViewDocumentTouchMoveEvent,
	ViewDocumentTouchStartEvent
} from './view/observer/touchobserver.js';
export type { ViewDocumentTabEvent } from './view/observer/tabobserver.js';
export type { ViewDocumentClickEvent } from './view/observer/clickobserver.js';
export type { ViewDocumentSelectionChangeEvent } from './view/observer/selectionobserver.js';
export type { ViewRenderEvent, ViewScrollToTheSelectionEvent } from './view/view.js';

// View / Styles.
export { StylesMap, StylesProcessor, type BoxSides } from './view/stylesmap.js';
export { addBackgroundRules } from './view/styles/background.js';
export { addBorderRules } from './view/styles/border.js';
export { addMarginRules } from './view/styles/margin.js';
export { addPaddingRules } from './view/styles/padding.js';
export {
	isColor,
	isLineStyle,
	isLength,
	isPercentage,
	isRepeat,
	isPosition,
	isAttachment,
	isURL,
	getBoxSidesValues,
	getBoxSidesValueReducer,
	getBoxSidesShorthandValue,
	getPositionShorthandNormalizer,
	getShorthandValues
} from './view/styles/utils.js';

// Development / testing utils.
export {
	_getModelData,
	_setModelData,
	_parseModel,
	_stringifyModel
} from './dev-utils/model.js';

export {
	_getViewData,
	_setViewData,
	_parseView,
	_stringifyView
} from './dev-utils/view.js';

export {
	convertMapToTags as _convertMapToTags,
	convertMapToStringifiedObject as _convertMapToStringifiedObject,
	dumpTrees as _dumpTrees,
	initDocumentDumping as _initDocumentDumping,
	logDocument as _logDocument
} from './dev-utils/utils.js';

// Internals
export {
	insertText as _downcastInsertText,
	insertAttributesAndChildren as _downcastInsertAttributesAndChildren,
	remove as _downcastRemove,
	createViewElementFromDowncastHighlightDescriptor as _downcastCreateViewElementFromDowncastHighlightDescriptor,
	convertRangeSelection as _downcastConvertRangeSelection,
	convertCollapsedSelection as _downcastConvertCollapsedSelection,
	cleanSelection as _downcastCleanSelection,
	wrap as _downcastWrap,
	insertElement as _downcastInsertElement,
	insertStructure as _downcastInsertStructure,
	insertUIElement as _downcastInsertUIElement,
	type ConsumerFunction as _DowncastConsumerFunction
} from './conversion/downcasthelpers.js';

export { MapperCache as _MapperCache } from './conversion/mapper.js';
export {
	convertToModelFragment as _upcastConvertToModelFragment,
	convertText as _upcastConvertText,
	convertSelectionChange as _upcastConvertSelectionChange
} from './conversion/upcasthelpers.js';

export {
	ViewElementConsumables as _ViewElementConversionConsumables,
	normalizeConsumables as _normalizeConversionConsumables
} from './conversion/viewconsumable.js';

export { BasicHtmlWriter as _DataProcessorBasicHtmlWriter } from './dataprocessor/basichtmlwriter.js';
export { OperationReplayer as _OperationReplayer } from './dev-utils/operationreplayer.js';

export type { DifferSnapshot as _DifferSnapshot } from './model/differ.js';
export type {
	BeforeChangesEvent as _ModelBeforeChangesEvent,
	AfterChangesEvent as _ModelAfterChangesEvent
} from './model/model.js';

export { DetachOperation as _DetachOperation } from './model/operation/detachoperation.js';
export {
	transform as _operationTransform,
	type TransformationContext as _OperationTransformationContext
} from './model/operation/transform.js';

export {
	_insert as _insertIntoModelNodeList,
	_remove as _removeFromModelNodeList,
	_move as _moveInModelNodeList,
	_setAttribute as _setAttributeInModelNodeList,
	_normalizeNodes as _normalizeInModelNodeList,
	type ModelNodeSet
} from './model/operation/utils.js';

export {
	getTextNodeAtPosition as _getModelTextNodeAtPosition,
	getNodeAfterPosition as _getModelNodeAfterPosition,
	getNodeBeforePosition as _getModelNodeBeforePosition
} from './model/position.js';

export {
	autoParagraphEmptyRoots as _autoParagraphEmptyModelRoots,
	isParagraphable as _isParagraphableModelNode,
	wrapInParagraph as _wrapInModelParagraph
} from './model/utils/autoparagraphing.js';

export { deleteContent as _deleteModelContent } from './model/utils/deletecontent.js';
export { getSelectedContent as _getSelectedModelContent } from './model/utils/getselectedcontent.js';
export { insertContent as _insertModelContent } from './model/utils/insertcontent.js';
export { insertObject as _insertModelObject } from './model/utils/insertobject.js';
export { modifySelection as _modifyModelSelection } from './model/utils/modifyselection.js';

export {
	injectSelectionPostFixer as _injectModelSelectionPostFixer,
	tryFixingRange as _tryFixingModelRange,
	mergeIntersectingRanges as _mergeIntersectingModelRanges
} from './model/utils/selection-post-fixer.js';

export {
	NBSP_FILLER as _VIEW_NBSP_FILLER,
	MARKED_NBSP_FILLER as _VIEW_MARKED_NBSP_FILLER,
	BR_FILLER as _VIEW_BR_FILLER,
	INLINE_FILLER_LENGTH as _VIEW_INLINE_FILLER_LENGTH,
	INLINE_FILLER as _VIEW_INLINE_FILLER,
	startsWithFiller as _startsWithViewFiller,
	isInlineFiller as _isInlineViewFiller,
	getDataWithoutFiller as _getDataWithoutViewFiller,
	injectQuirksHandling as _injectViewQuirksHandling
} from './view/filler.js';

export {
	isPatternMatched as _isViewPatternMatched,
	type NormalizedPropertyPattern as _NormalizedViewPropertyPattern
} from './view/matcher.js';

export { injectUiElementHandling as _injectViewUIElementHandling } from './view/uielement.js';
