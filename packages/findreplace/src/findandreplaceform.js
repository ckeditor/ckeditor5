import { scrollViewportToShowTarget } from "@ckeditor/ckeditor5-utils/src/dom/scroll";
import React, { useState } from "react";
import PropTypes from "prop-types";
// import { rangeToText } from "./findandreplaceformediting";
// import FindResults from "./findresults";
import { Button } from "@namespace/namespace-react--button";
import { TextInput } from "@namespace/namespace-react--text-input";
import i18n from "@namespace/i18n";

/**
 * Highlight search result with given id.
 *
 * @param {String} searchResultId
 * @param editor
 */
const highlightResult = (searchResultId, editor) => {
  if (searchResultId) {
    const marker = editor.model.markers.get(searchResultId);

    if (!marker) {
      return;
    }

    // Set selection to search result marker - it will be highlighted by the F&R editing plugin.
    const markerRange = marker.getRange();
    editor.model.change((writer) => writer.setSelection(markerRange));

    // Scroll to the search result marker.
    const viewRange = editor.editing.mapper.toViewRange(markerRange);
    const domRange = editor.editing.view.domConverter.viewRangeToDom(viewRange);

    scrollViewportToShowTarget({
      target: domRange,
      viewportOffset: 40, // last result is hidden by CKInspector
    });
  }
};

/**
 * Turn tree walker value to a simplified "compare object".
 *
 * For text nodes it will return
 *
 *    {
 *			// Text of the node:
 *			text: 'Text node value',
 *			// Attributes set on node:
 *			attributes: {
 *				bold: true
 *			}
 *		}
 *
 * @param treeWalkerValue
 * @returns {Object}
 */
// function toCompareObject({ item }) {
//   if (item.is("text") || item.is("textProxy")) {
//     return {
//       text: item.data,
//       attributes: Object.fromEntries(item.getAttributes()),
//     };
//   }
//
//   return {
//     text: false,
//     name: item.name,
//     attributes: Object.fromEntries(item.getAttributes()),
//   };
// }

/**
 * Returns true if text nodes have the same text and attributes.
 *
 * This function works on "compare objects".
 *
 * @param {Object} reference
 * @param {Object} compared
 * @returns {Boolean}
 */
// function areTextNodesEqual(reference, compared) {
//   if (reference.text !== compared.text) {
//     return false;
//   }
//   const referenceKeys = Object.keys(reference.attributes || {});
//   const comparedKeys = Object.keys(compared.attributes || {});
//
//   if (referenceKeys.length !== comparedKeys.length) {
//     return false;
//   }
//
//   return referenceKeys.every((attribute) => {
//     return reference.attributes[attribute] === compared.attributes[attribute];
//   });f
// }

/**
 * Provides exact matching of "compare objects".
 *
 * The idea behind is that items returned by tree walker must have the same attributes as in reference. CKEditor groups characters from
 * block with the same attributes in one text node. For instance
 *
 *    <b>CK<i>Source</i></b>
 *
 * will be represented as two simplified nodes:
 *
 *    [
 *      { text: 'CK', attributes: { strong: true } },
 *      { text: 'Source', attributes: { strong: true, italic: true } }
 *    ]
 *
 * Comparing by "any" attributes requires more work to create a compare function.
 *
 * @param {Array.<Object>} reference
 * @param {Array.<Object>} compare
 * @returns {Boolean}
 */
/*
function areTextAndAttributesMatching(reference, compare) {
  if (reference.length !== compare.length) {
    return false;
  }

  for (let i = 0; i < reference.length; i += 1) {
    if (!areTextNodesEqual(reference[i], compare[i])) {
      return false;
    }
  }

  return true;
}


function getShiftedStart(position, shiftBy) {
  const offset = position.offset > shiftBy ? shiftBy : shiftBy - position.offset;

  return position.getShiftedBy(-offset);
}

function getShiftedEnd(position, shiftBy) {
  const { maxOffset } = position.parent;
  const offset = position.offset + shiftBy > maxOffset ? maxOffset - position.offset : shiftBy;

  return position.getShiftedBy(offset);
}
*/
function regexpMatchToFindResult(matchResult, isExact) {
  const matchStart = matchResult.index;

  if (!isExact) {
    const matchResultElement = matchResult[0];

    return {
      label: matchResultElement,
      start: matchStart,
      end: matchStart + matchResultElement.length,
    };
  }

  const resultElement = matchResult[2];
  const whiteSpaceLength = matchResult[1].length;

  const start = matchStart + whiteSpaceLength;
  const end = start + resultElement.length;

  return {
    label: resultElement,
    start,
    end,
  };
}

function wildcardToRegExpPattern(pattern) {
  return pattern.replace(/\*+/g, "[\\S]+").replace(/\?/g, "[\\S]?");
}

function createFindByTextCallback(searchTerm, isExact) {
  const pattern = wildcardToRegExpPattern(isExact ? `(\\s|^)(${searchTerm})(\\s|$)` : `${searchTerm}`);

  const regExp = new RegExp(pattern, "igu");

  function searchCallback({ text }) {
    const matches = [...text.matchAll(regExp)];

    return matches.map((result) => regexpMatchToFindResult(result, isExact));
  }

  return searchCallback;
}

/**
 * Find by HTML input is done as a two-step search:
 *
 * 1. Broad search by text match.
 * 2. Narrow results by comparing text attributes on found text chunks.
 *
 * @param editor
 * @returns {Function}
 */
// function createFindByHTMLCallback(editor) {
//   const { model } = editor;
//
//   // Hardcoded search input.
//   // a. Nodes
//   const referenceTextNodes = [
//     { text: "ca", attributes: { bold: true } },
//     { text: "n" },
//     { text: "dy", attributes: { italic: true } },
//   ];
//   // b. text representation for broad search.
//   const searchTerm = referenceTextNodes.reduce((term, { text }) => term + text, "");
//
//   // Step 1: Broad search.
//   const broadSearchCallback = createFindByTextCallback(searchTerm);
//
//   function searchCallback({ item, text }) {
//     // Step 2: Narrow search results by comparing text nodes attributes.
//     return broadSearchCallback({ item, text }).filter(({ start, end }) => {
//       const matchedRange = model.createRange(model.createPositionAt(item, start), model.createPositionAt(item, end));
//
//       return areTextAndAttributesMatching(referenceTextNodes, [...matchedRange].map(toCompareObject));
//     });
//   }
//
//   return searchCallback;
// }

function getNextSearchResultId(activeSearch, currentResultId) {
  const currentIndex = activeSearch.getIndex(currentResultId);
  const nextItemIndex = (currentIndex + 1) % activeSearch.length;

  const item = activeSearch.get(nextItemIndex);

  return item ? item.id : null;
}

const FindAndReplaceForm = ({ editor }) => {
  // const { model } = editor;
  const FindAndReplaceFormApi = editor.plugins.get("FindAndReplaceForm");

  const [searchTerm, setSearchTerm] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [isExact] = useState(false);
  const [currentResultId, setCurrentResultId] = useState(null);
  const [activeSearch, setActiveSearch] = useState(null);

  const findByCallback = (callback) => {
    if (activeSearch) {
      FindAndReplaceFormApi.stop();
    }
    const findResults = FindAndReplaceFormApi.find(callback);

    if (findResults.length) {
      setCurrentResultId(findResults.get(0).id);
    }

    setActiveSearch(findResults);
  };

  const onFindByText = () => {
    if (searchTerm.length < 1) {
      console.warn("Search term should be at least 1 character long.");
      return;
    }

    if (currentResultId !== null) {
      const nextItemId = getNextSearchResultId(activeSearch, currentResultId);
      setCurrentResultId(nextItemId);
      highlightResult(nextItemId, editor);

      return;
    }

    findByCallback(createFindByTextCallback(searchTerm, isExact));
  };

  /*
  const onFindByHTML = () => findByCallback(createFindByHTMLCallback(editor));

  const onReplaceAll = () => {
    FindAndReplaceFormApi.replaceAll(replaceWith); // text or callback support...
  };

  const onReplaceAllBolded = () => {
    FindAndReplaceFormApi.replaceAll((writer) => {
      return writer.createText(replaceWith, { bold: true });
    });
  };

  const onReplaceClick = (result) => {
    FindAndReplaceFormApi.replace(result, (writer) => {
      return writer.createText(replaceWith);
    });
  };
  const handleExactMatchChange = (event) => setIsExact(!!event.target.checked);

  const markerToText = (marker) => {
      const markerRange = marker.getRange();

      const start = getShiftedStart(markerRange.start, 10);
      const end = getShiftedEnd(markerRange.end, 10);

      const expandedRange = model.createRange(start, end);

      return rangeToText(expandedRange);
    };
  */
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentResultId(null);
  };
  const handleReplaceWithChange = (event) => setReplaceWith(event.target.value);

  return (
    <>
      <div className="sidebar-panel-body">
        <TextInput
          label={i18n.t("sidebar.findAndReplace.findWhat")}
          onChange={handleSearchChange}
          value={searchTerm}
          data-cke-ignore-events
        />
        <TextInput
          label={i18n.t("sidebar.findAndReplace.replaceWith")}
          onChange={handleReplaceWithChange}
          value={replaceWith}
          data-cke-ignore-events
        />
      </div>
      <div className="sidebar-panel-footer">
        <div className="o-namespace-flex-layout o-namespace-flex-layout--gutters-1o2">
          <div className="o-namespace-flex-layout__item">
            <Button
              htmlType={Button.HtmlTypes.BUTTON}
              className="c-namespace-button--x-small"
              onClick={handleReplaceWithChange}
            >
              {i18n.t("sidebar.findAndReplace.replaceAll")}
            </Button>
          </div>
          <div className="o-namespace-flex-layout__item ">
            <Button
              htmlType={Button.HtmlTypes.BUTTON}
              className="c-namespace-button--x-small"
              onClick={handleReplaceWithChange}
            >
              {i18n.t("sidebar.findAndReplace.replace")}
            </Button>
          </div>
          <div className="o-namespace-flex-layout__item o-namespace-flex-layout__item--grow">
            <Button
              htmlType={Button.HtmlTypes.BUTTON}
              type={Button.Types.SECONDARY}
              className="c-namespace-button--x-small"
              onClick={onFindByText}
            >
              {i18n.t("sidebar.findAndReplace.find")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

FindAndReplaceForm.propTypes = {
  editor: PropTypes.shape({
    plugins: PropTypes.shape({
      get: PropTypes.func,
    }),
    model: PropTypes.shape({
      createRange: PropTypes.func,
    }),
  }).isRequired,
};

export default FindAndReplaceForm;
