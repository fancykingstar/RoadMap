import React, { useState } from 'react';

//import css
import '../css/Pagination.css';

//import assets
import left from '../assets/images/pageleft.svg';
import right from '../assets/images/pageright.svg';

export default function Pagination(props) {

    const [state, setState] = useState({
        pages: props.pages,
        pagination: props.paginate,
        selected: 0
    });

    const handlePagination = (e, value) => {
        let selection = state.selected;
        if (value === "left" && selection > 0) {
            selection -= 1;
        }

        else if (value === "right" && selection < (state.pages - 1)) {
            selection += 1;
        }
        else if (typeof value === "number") {
            selection = value;
        }
        setState(prev => ({
            ...prev,
            selected: selection
        }))
        state.pagination(selection);
        props.scrollToTop();
    }

    let PageNumbers = () => {
        return <div className="pageNumberContainer">{Array.from(Array(state.pages), (e, i) => {
            return <div className={"pageNumber" + (i === state.selected ? " pageSelected" : "")} onClick={(e) => handlePagination(e, i)} key={i}>{i + 1}</div>
        })}</div>
    }

    return (
        <div className="paginator">
            <img className="paginationArrow pageLeft" onClick={(e) => handlePagination(e, "left")} src={left} alt="page left"></img>
            <PageNumbers />
            <img className="paginationArrow pageRight" onClick={(e) => handlePagination(e, "right")} src={right} alt="page right"></img>
        </div>
    )

};