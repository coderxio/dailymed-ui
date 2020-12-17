import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Form from 'react-bootstrap/Form'

import 'bootstrap/dist/css/bootstrap.min.css';

import 'react-bootstrap-typeahead/css/Typeahead.css';

export default class DrugNameSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            options: [],
            minLength: 3,
            highlightOnlyResult: true,
            paginate: true,
            maxResults: 7,
            clearButton: true
        };

        this.setSingleSelections = this.setSingleSelections.bind(this);
    }

    handleInputChange(text) {
        const { minLength } = this.state;

        if (text.length >= minLength) {
            fetch(`https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?ef=DISPLAY_NAME,STRENGTHS_AND_FORMS,RXCUIS&maxList=&terms=${text}`)
            .then(resp => resp.json())
            .then(json => {
                const total = json[0];
                const count = json[1].length;
                const data = json[2];
                var options = [];
                
                // this series of nested loops could probably be optimized
                for (var i = 0; i < count; i++) {
                    const displayName = data.DISPLAY_NAME[i];
                    const strengthsAndForms = data.STRENGTHS_AND_FORMS[i];
                    const rxcuis = data.RXCUIS[i];
                    options[i] = {
                        displayName: displayName,
                        strengthsAndForms: []
                    }
                    for (var j = 0; j < strengthsAndForms.length; j++) {
                        options[i].strengthsAndForms.push({
                            strengthAndForm: strengthsAndForms[j],
                            rxcui: rxcuis[j]
                        });
                    }
                }
                this.setState({ options });
            });
        };
    }

    setSingleSelections(selected) {
        console.log(selected);
    }
 
    render() {
        const { options, minLength, highlightOnlyResult, paginate, maxResults, clearButton } = this.state;      
        return (
            <div>
                <Form.Group>
                    <Typeahead
                        id="basic-typeahead-single"
                        minLength={minLength}
                        highlightOnlyResult={highlightOnlyResult}
                        paginate={paginate}
                        maxResults={maxResults}
                        clearButton={clearButton}
                        labelKey="displayName"
                        onInputChange={(text) => this.handleInputChange(text)}
                        onChange={(selected) => this.setSingleSelections(selected)}
                        options={options}
                        placeholder="Choose a medication..."
                    />
                </Form.Group>
            </div>      
        );
    }
}
