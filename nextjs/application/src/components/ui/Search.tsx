"use client";
import React, { useState } from 'react';

import SearchIcon from '@/components/icon/SearchIcon';

type Props = {
}

const Search: React.FC<Props> = ({ }) => {

    return (
        <div className="m-Search">
            <button type="button" className="m-SearchButton">
                <SearchIcon className="m-SearchButton_icon"/>
                <span className="m-SearchButton_text">SEARCH</span>
            </button>
        </div>
    );
}

export default Search;