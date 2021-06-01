import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import FindResult from "./findresult";

const FindResults = ({ activeSearch, searchTerm, scrollTo, replaceWith, markerToText, currentResultId }) => {
  const [, setResults] = useState([]);

  useEffect(() => {
    const updateResults = () => {
      setResults([...activeSearch]);
    };

    if (activeSearch) {
      activeSearch.on("add", updateResults);
      activeSearch.on("remove", updateResults);

      setResults([...activeSearch]);
    }

    return () => {
      if (!activeSearch) {
        return;
      }

      activeSearch.off("add", updateResults);
      activeSearch.off("remove", updateResults);
    };
  }, [activeSearch]);

  return activeSearch ? (
    <div className="find-results">
      <ul>
        {[...activeSearch].map((result) => (
          <FindResult
            result={result}
            key={result.id}
            searchTerm={searchTerm}
            onClickFn={() => scrollTo(result.id)}
            onReplace={() => replaceWith(result)}
            markerToText={markerToText}
            isActive={currentResultId === result.id}
          />
        ))}
      </ul>
    </div>
  ) : (
    <div />
  );
};

FindResults.defaultProps = {
  activeSearch: PropTypes.shape({
    on: () => {},
    off: () => {},
  }),
  currentResultId: "",
};

FindResults.propTypes = {
  activeSearch: PropTypes.shape({
    on: PropTypes.func,
    off: PropTypes.func,
  }),
  searchTerm: PropTypes.string.isRequired,
  scrollTo: PropTypes.func.isRequired,
  replaceWith: PropTypes.func.isRequired,
  markerToText: PropTypes.func.isRequired,
  currentResultId: PropTypes.string,
};

export default FindResults;
