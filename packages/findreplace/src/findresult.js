import React from "react";
import PropTypes from "prop-types";

const FindResult = ({result, onClickFn, onReplace, markerToText, isActive}) => {
  const {marker} = result;

  // Unfortunately, this fails when re-rendering on destroyed marker:
  // const markerRange = marker.getRange();

  return (
    <li className={isActive ? "active" : ""}>
      {markerToText(marker)}
      <br/>
      <span className="keyword-location">
        {/* Location: {markerRange.start.parent.name} -{" "} */}
        {/* {String(markerRange.start.path)} - {String(markerRange.end.path)} */}
      </span>
      <button type="button" title="Scroll to" onClick={onClickFn}>
        Scroll to
      </button>
      <button type="button" onClick={onReplace}>
        Replace
      </button>
    </li>
  );
};

FindResult.propTypes = {
  result: PropTypes.shape({
    marker: PropTypes.shape({
      getRange: PropTypes.func,
    }),
  }).isRequired,
  onClickFn: PropTypes.func.isRequired,
  onReplace: PropTypes.func.isRequired,
  markerToText: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired
};

export default FindResult;
