import { SearchIcon } from "../Icons.jsx";

function SearchInput({ value, onChange }) {
    return (
        <form className="vt-search" role="search" onSubmit={(e) => e.preventDefault()}>
            <label className="vt-visually-hidden" htmlFor="search-input">Rechercher une vitamine</label>
            <input
                className="vt-search-input"
                type="search"
                value={value}
                onChange={onChange}
                placeholder="Rechercher une vitamine"
                id="search-input"
                autoComplete="off"
            />
            <button type="submit" className="vt-search-button" aria-label="Rechercher">
                <SearchIcon size={18} />
            </button>
        </form>
    );
}

export default SearchInput;
