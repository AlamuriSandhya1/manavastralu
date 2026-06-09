
import React, { useState } from "react";
import "./ProductToolbar.css";
import { FaSortAmountDown, FaThLarge, FaTh, FaGripVertical } from "react-icons/fa";

function ProductToolbar({ setColumns, setSortType, filters, setFilters }) {

  const [openFilter, setOpenFilter] = useState(false);

  // checkbox handler
  const handleCheck = (category, value) => {
    setFilters(prev => {
      const exists = prev[category].includes(value);

      return {
        ...prev,
        [category]: exists
          ? prev[category].filter(v => v !== value)
          : [...prev[category], value]
      };
    });
  };

  return (
    <>
      <div className="toolbar">

        {/* LEFT : FILTER BUTTON */}
        <div className="toolbar-left" onClick={() => setOpenFilter(true)}>
          <FaSortAmountDown className="tool-icon" />
          <span>Filter</span>
        </div>

        {/* CENTER : VIEW */}
        <div className="toolbar-center">
          <span className="view-label">View as</span>

          <FaGripVertical className="view-icon" onClick={() => setColumns(2)} />
          <FaTh className="view-icon" onClick={() => setColumns(3)} />
          <FaThLarge className="view-icon" onClick={() => setColumns(5)} />
        </div>

        {/* RIGHT : SORT */}
        <div className="toolbar-left">
          <FaSortAmountDown className="tool-icon" />
          <span>Sort By</span>

          <select className="sort-dropdown" onChange={(e) => setSortType(e.target.value)}>
            <option value="best">Best Selling</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="new">Newest First</option>
            <option value="old">Oldest First</option>
          </select>
        </div>

      </div>

      {/* FILTER SIDEBAR */}
      {openFilter && (
        <div className="filter-overlay" onClick={() => setOpenFilter(false)}>
          <div className="filter-sidebar" onClick={(e) => e.stopPropagation()}>

            <h2>Filters</h2>

            {/* PRICE */}
            <div className="filter-group">
              <div className="filter-title">Price</div>

              <label>
                <input type="checkbox" onChange={() => handleCheck("price","under1000")} />
                Under ₹1000
              </label>

              <label>
                <input type="checkbox" onChange={() => handleCheck("price","1000-3000")} />
                ₹1000 - ₹3000
              </label>

              <label>
                <input type="checkbox" onChange={() => handleCheck("price","3000-6000")} />
                ₹3000 - ₹6000
              </label>

              <label>
                <input type="checkbox" onChange={() => handleCheck("price","above6000")} />
                Above ₹6000
              </label>
            </div>

            <button className="apply-btn" onClick={() => setOpenFilter(false)}>
              SHOW RESULT
            </button>

          </div>
        </div>
      )}
    </>
  );
}

export default ProductToolbar;
