import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Form from 'react-bootstrap/Form'

import 'bootstrap/dist/css/bootstrap.min.css';

import 'react-bootstrap-typeahead/css/Typeahead.css';

export default class DrugStrengthSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            options: [],
            minLength: 0,
            highlightOnlyResult: true,
            paginate: true,
            maxResults: 7,
            clearButton: true,
            labelKey: 'strengthAndForm',
            selected: [],
        };

        this.setSingleSelections = this.setSingleSelections.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props != nextProps) {
            this.setState({ options: nextProps.selected.strengthsAndForms });
        }
    }

    handleInputChange(text) {
        const { options, minLength } = this.state;
        return options;
    }

    setSingleSelections(selected) {
        console.log(selected);
        this.setState({ selected: selected.length > 0 ? selected[0] : [] });
    }
 
    render() {
        const { options, minLength, highlightOnlyResult, paginate, maxResults, clearButton, labelKey, selected } = this.state;      
        return (
            <div>
                <Form.Group>
                    <Typeahead
                        id="drug-strength-typeahead"
                        minLength={minLength}
                        highlightOnlyResult={highlightOnlyResult}
                        paginate={paginate}
                        maxResults={maxResults}
                        clearButton={clearButton}
                        labelKey={labelKey}
                        onInputChange={(text) => this.handleInputChange(text)}
                        onChange={(selected) => this.setSingleSelections(selected)}
                        options={options}
                        placeholder="Choose a strength and form..."
                    />
                </Form.Group>

                <h1>{selected.strengthAndForm}</h1>
                <h1>{selected.rxcui}</h1>
            </div>      
        );
    }
}
