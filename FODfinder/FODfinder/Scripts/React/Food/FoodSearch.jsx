﻿class FoodSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: "",
            isUpc: false,
            requireAllWords: false,
            isCollapsed: true,
            includeItem: "",
            includeList: [],
            excludeItem: "",
            excludeList: []
        };

        this.onQueryChanged.bind(this);
        this.onQuerySubmit.bind(this);
        this.onUpcToggle.bind(this);
        this.onRequireAllWords.bind(this);
        this.onCollapse.bind(this);
        this.addToIncludeList.bind(this);
        this.addToExcludeList.bind(this);
        this.showExcludeList.bind(this);
    }

    async onQueryChanged(event) {
        await this.setState({ query: event.target.value });
    }

    async onUpcToggle(toggled) {
        await this.setState({ isUpc: toggled });
    }

    async onRequireAllWords(toggled) {
        await this.setState({ requireAllWords: toggled })
    }

    async onCollapse(toggled) {
        await this.setState({ isCollapsed: toggled })
    }

    async onAddInclude(item) {
        await this.setState({ includeItem: item.target.value })
    }

    async addToIncludeList() {
        var {  includeItem, includeList  } = this.state;
        if (!includeList.includes(includeItem) && includeItem != "") {
            await this.setState({ includeList: [...includeList,includeItem] });
        }
        console.log("Include list: " + this.state.includeList)
    }

    showIncludeList() {
        if (this.state.includeList.length != 0) {
            return (
                <div className="shadow rounded">
                    <ul className="list-group">
                        {this.state.includeList.map(item => (<li className="list-group-item" key={item}>{item}</li>))}
                    </ul>
                </div>
            );
        }
    }

    async onAddExclude(item) {
        await this.setState({ excludeItem: item.target.value })
    }

    async addToExcludeList() {
        var {  excludeItem, excludeList  } = this.state;
        if (!excludeList.includes(excludeItem) && excludeItem != "") {
            await this.setState({ excludeList: [...excludeList,excludeItem] });
        }
        console.log("Exclude list: " + this.state.excludeList)
    }

    showExcludeList() {
        if (this.state.excludeList.length != 0) {
            return (
                <div className="shadow rounded">
                    <ul className="list-group">
                        {this.state.excludeList.map(item => (<li className="list-group-item" key={item}>{item}</li>))}
                    </ul>
                </div>
            );
        }
    }

    removeLeadingZeros(query) {
        return parseInt(query).toString();
    }

    onQuerySubmit(event) {
        event.preventDefault();
        var { isUpc, query, requireAllWords, includeList, excludeList } = this.state;
        var searchQuery = new URLSearchParams();
        var totalIngredientList = [...includeList.map(ingr => ingr.includes(" ") ? `"${ingr}"` : ingr), ...excludeList.map(ingr => ingr.includes(" ") ? `-"${ingr}"` : `-${ingr}`)];
        if (totalIngredientList.length > 0) {
            searchQuery.append("ingredients", totalIngredientList.join(" "))
        }
        searchQuery.append("query", isUpc ? ("gtinUpc:*" + this.removeLeadingZeros(query)) : query)
        searchQuery.append("requireAllWords", requireAllWords)
        if (query != "") {
            let url = "/Food/Index?" + searchQuery.toString();
            window.location.href = url;
        }
    }

    render() {
        var { isUpc, requireAllWords, isCollapsed } = this.state;
        return (
            <div className="container px-0">
                <form className="form w-100" onSubmit={(e) => { this.onQuerySubmit(e) }}>
                    <div className="form-group w-100 mb-0">
                        <div className="input-group w-100">
                            <div className="input-group-prepend">
                                <span className="input-group-text">
                                    Search
                                </span>
                            </div>
                            <input type={(!isUpc ? "text" : "number")} required={true} onChangeCapture={(e) => { this.onQueryChanged(e) }} className="form-control border-left-0 border-right-0" />
                            <div className="input-group-append">
                                <div className="btn-group">
                                    <button type="button" className="btn btn-block btn-primary rounded-0" data-toggle="collapse" data-target="#CollapseFilter" onClick={ () => this.onCollapse(!isCollapsed) }>
                                        <span className="small">
                                            {isCollapsed ? "▼" : "▲"}
                                        </span>
                                    </button>
                                    <button className="btn btn-primary" type="submit">Go</button>
                                </div>
                            </div>
                        </div>             
                    </div>
                </form>
                <div className="collapse" id="CollapseFilter">
                    <div className="card card-body shadow bg-secondary">
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-6">
                                <div className="input-group py-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            Search by
                                        </span>
                                    </div>
                                    <div className="input-group-append">
                                        <button type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" id="SearchByButton">
                                            {!isUpc ? "Name" : "UPC"}
                                        </button>
                                        <div className="dropdown-menu bg-secondary" aria-labelledby="SearchByButton">
                                            <a href="#" className={"dropdown-item text-gray" + (!isUpc ? " active bg-primary" : "")} onClick={() => { this.onUpcToggle(false) }}>
                                                Name
                                            </a>
                                            <a href="#" className={"dropdown-item text-gray" + (isUpc ? " active bg-primary" : "")} onClick={() => { this.onUpcToggle(true) }}>
                                                UPC
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="input-group py-2">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">
                                            Exact phrase search
                                        </span>
                                    </div>
                                    <div className="input-group-append">
                                        <button className={"btn " + (isUpc ? "btn-danger" : !requireAllWords ? "btn-danger" : "btn-success")} disabled={isUpc ? "disabled" : ""} onClick={() => { this.onRequireAllWords(!requireAllWords) }}>
                                            {isUpc ? "Disabled" : !requireAllWords ? "Disabled" : "Enabled"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row d-flex justify-content-center">
                            <div className="col-lg-6">
                                <div className="input-group py-2">
                                    <div className="input-group-prepend text-center">
                                        <span id="IncludeExclude" className="input-group-text">
                                            Include
                                        </span>
                                    </div>
                                    <input type="text" className="form-control" disabled={isUpc ? "disabled" : ""} onChange={(e) => { this.onAddInclude(e) }} />
                                    <div className="input-group-append">
                                        <button className="btn btn-primary" disabled={isUpc ? "disabled" : ""} onClick={() => this.addToIncludeList()}>
                                            Add
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    {this.showIncludeList()}
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="input-group py-2">
                                    <div className="input-group-prepend text-center">
                                        <span id="IncludeExclude" className="input-group-text">
                                            Exclude
                                        </span>
                                    </div>
                                    <input type="text" className="form-control" disabled={isUpc ? "disabled" : ""} onChange={(e) => { this.onAddExclude(e) }} />
                                    <div className="input-group-append">
                                        <button type="submit" className="btn btn-primary" disabled={isUpc ? "disabled" : ""} onClick={() => this.addToExcludeList()}>
                                            Add
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    {this.showExcludeList()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}