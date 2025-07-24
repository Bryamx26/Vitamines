function SearchInput({ value, onChange }) {
    return (
        <div className="searchInput">
            <label className="inputSearchDiv" htmlFor={"search-input"} >
                <input
                    className="inputSearch"
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder="Rechercher"
                    id="search-input"
                    autoComplete="off"

                />
                <label className={"inputSearchLabelImage"}  htmlFor={"search-input"}><img src={"/images/search.svg"} alt="Search" style={{ width: "15px" , height: "15px" }} /></label>

            </label>
        </div>
    );
}

export default SearchInput;
