function SearchInput({ value, onChange }) {
    return (
        <div className="searchInput">
            <input
                className="inputSearch"
                type="text"
                value={value}
                onChange={onChange}
                placeholder="Rechercher"
            />
        </div>
    );
}

export default SearchInput;
