import React from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';
import Pagination from 'react-bootstrap/Pagination';
import PageItem from 'react-bootstrap/PageItem';
import Badge from 'react-bootstrap/Badge';

import 'bootstrap/dist/css/bootstrap.min.css';

import 'react-bootstrap-typeahead/css/Typeahead.css';

export default class DailyMedApi extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            limit: 20,
            count: 0,
            offset: 0,
            spls: [],
            activeNdcs: [],
            activeSpls: [],
            url: '',
            loading: false,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.filters !== prevProps.filters || this.state.offset !== prevState.offset) {
            this.getSpls();
        }
    }

    getRxnorm() {
        const rxcui = this.props.filters.rxcui;
        if (rxcui) {
            const url = `https://rxnav.nlm.nih.gov/REST/ndcproperties.json?id=${rxcui}`;
            this.setState({ loading: true, activeNdcs: [], activeSpls: [] });
            fetch(url)
                .then(resp => resp.json())
                .then(json => {
                    const activeNdcs = json.ndcPropertyList.ndcProperty.map(ndcProp => ndcProp.ndc9);
                    const activeSpls = json.ndcPropertyList.ndcProperty.map(ndcProp => ndcProp.splSetIdItem);
                    this.setState({ activeNdcs, activeSpls });
                })    
        }
    }

    getSpls() {
        const { limit, offset } = this.state;
        const filters = this.props.filters;
        const rxcui = filters.rxcui;
        if (rxcui) {
            this.setState({ loading: true, spls: [] });
            fetch(`https://dailymed.calebdunn.tech/api/v1/set/?set_id=&labeler=&package_ndc=&product_ndc=&product_name=&inactive_ingredient_name=&inactive_ingredient_unii=&rxcui=${rxcui}&rxstring=&limit=${limit}&offset=${offset}&format=json`)
                .then(resp => resp.json())
                .then(json => {
                    console.log(json);
                    const count = json.count;
                    const sets = json.results;
                    this.setState({ count });
                    return sets;
                })
                .then(sets => {
                    const requests = sets.map(set => fetch(`https://dailymed.calebdunn.tech/api/v1/spl/?set_id=${set.id}&labeler=&package_ndc=&product_ndc=&product_name=&inactive_ingredient_name=&inactive_ingredient_unii=&format=json`));
    
                    return Promise.all(requests)
                        .then(responses => Promise.all(responses.map(r => r.json())))
                        .then(spls => spls.map(spl => spl.results[0]));
                })
                .then(spls => {
                    fetch(`https://rxnav.nlm.nih.gov/REST/ndcproperties.json?id=${rxcui}`)
                        .then(resp => resp.json())
                        .then(json => {
                            const activeNdcs = json.ndcPropertyList.ndcProperty.map(ndcProp => ndcProp.ndc9);
                            const activeSpls = json.ndcPropertyList.ndcProperty.map(ndcProp => ndcProp.splSetIdItem);
                            spls = spls.filter(spl => activeSpls.find(element => element == spl.set));
                            this.setState({ loading: false, spls, activeNdcs });
                        });
                });    
        }
    }

    render() {
        const { spls, loading, activeNdcs, offset, limit, count } = this.state;
        
        let items = [];
        const active = (offset + limit) / limit;
        for (let number = 1; number <= Math.ceil(count/limit); number++) {
            items.push(
                <Pagination.Item 
                    key={number}
                    active={number === active}
                    onClick={() => this.setState({ offset: (number-1)*limit })}
                >
                {number}
                </Pagination.Item>,
            );
        }
        return (
          <div>
            {loading === true &&
                <div>
                    <Spinner animation="border" /> Loading...
                </div>
            }
            {loading === false && count == 0 &&
                <p>Please complete search above.</p>
            }
            {loading === false && count > 0 &&
                <div>
                    <p>{offset+1}-{count > offset+limit ? offset+limit : count} of {count} total results for RXCUI {this.props.filters.rxcui}.</p>
                    <Card>
                        <ListGroup variant="flush">
                            {spls.map((spl, index) => 
                                <ListGroup.Item key={'spl_' + index}>
                                    <div>
                                        <span className="mr-2">
                                            <a href={`https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${spl.set}`} target="_blank">DailyMed Link</a>
                                        </span> / 
                                        <span className="ml-2 mr-2">
                                            <a href={`https://dailymed.calebdunn.tech/api/v1/set/${spl.set}/`} target="_blank">DailyMed API Set Link</a>
                                        </span> / 
                                        <span className="ml-2 mr-2">
                                            <a href={`https://dailymed.calebdunn.tech/api/v1/spl/${spl.id}/`} target="_blank">DailyMed API SPL Link</a>
                                        </span> / 
                                        <span className="ml-2 mr-2">
                                            {spl.set}
                                        </span>
                                    </div>
                                    {spl.products.filter(product => activeNdcs.find(element => element == product.code)).map((product, index) =>
                                        <div key={'product_' + spl.set + '_' + index}>
                                            <div><strong>{product.name}</strong> <code>{product.code}</code> <a href={`https://rxnav.nlm.nih.gov/REST/ndcproperties.json?id=${product.code}`} target="_blank">RxNorm API Link</a></div>
                                            <div>
                                                {spl.labeler}
                                            </div>
                                            {product.inactive_ingredients.map((inactive_ingredient, index) =>
                                                <Badge title={inactive_ingredient.unii} className="mr-2" variant="light" key={'inactive_ingredient_' + index}>{inactive_ingredient.name}</Badge>
                                            )}
                                        </div>
                                    )}
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>

                    <Pagination className="mt-3">{items}</Pagination>
                </div>
            }
          </div>
        );
    }
}
