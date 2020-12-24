import React from 'react';

import { Typeahead } from 'react-bootstrap-typeahead';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import 'bootstrap/dist/css/bootstrap.min.css';

import 'react-bootstrap-typeahead/css/Typeahead.css';

export default class RxTermsSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            settings: {
                drugNameMinLength: 3,
                highlightOnlyResult: true,
                paginate: true,
                maxResults: 7,   
            },
            options: {
                drugName: [],
                drugStrengthAndForm: [],
            },
            selected: {
                drugName: '',
                drugStrengthAndForm: '',
                rxcui: '',
            }
        };
    }

    handleDrugNameChange(text) {
        const { settings, options } = this.state;

        if (text.length >= settings.drugNameMinLength) {
            fetch(`https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?ef=DISPLAY_NAME,STRENGTHS_AND_FORMS,RXCUIS&maxList=&terms=${text}`)
            .then(resp => resp.json())
            .then(json => {
                // NOTE: use total later when customizing the "pagination" display to be more like RxTerms
                // const total = json[0];
                const count = json[1].length;
                const data = json[2];
                var drugNameOptions = [];
                
                // this series of nested loops could probably be optimized
                for (var i = 0; i < count; i++) {
                    const displayName = data.DISPLAY_NAME[i];
                    const strengthsAndForms = data.STRENGTHS_AND_FORMS[i];
                    const rxcuis = data.RXCUIS[i];
                    drugNameOptions[i] = {
                        displayName: displayName,
                        strengthsAndForms: []
                    }
                    for (var j = 0; j < strengthsAndForms.length; j++) {
                        drugNameOptions[i].strengthsAndForms.push({
                            strengthAndForm: strengthsAndForms[j],
                            rxcui: rxcuis[j]
                        });
                    }
                }
                console.log(drugNameOptions)
                options.drugName = drugNameOptions;
                // NOTE: also clear selected when this changes
                this.setState({ options, selected: [] });
            });
        }
    }

    handleDrugStrengthAndFormChange(text) {
        // NOTE: also clear selected when this changes
        this.setState({ selected: [] });       
    }

    setDrugName(selection) {
        const { options, selected } = this.state;

        if (selection.length > 0) {
            selected.drugName = selection[0].displayName;
            options.drugStrengthAndForm = selection[0].strengthsAndForms;
        }
        this.setState({ options, selected });
    }

    setDrugStrengthAndForm(selection) {
        const { selected } = this.state;

        if (selection.length > 0) {
            selected.drugStrengthAndForm = selection[0].strengthAndForm;
            selected.rxcui = selection[0].rxcui;
        }
        this.setState({ selected });
    }


    render() {
        const { settings, options, selected } = this.state;      
        return (
            <div>
                <Form.Group>
                    <Form.Label>Drug name</Form.Label>
                    <Typeahead
                        id="drug-name-typeahead"
                        minLength={settings.drugNameMinLength}
                        highlightOnlyResult={settings.highlightOnlyResult}
                        paginate={settings.paginate}
                        maxResults={settings.maxResults}
                        labelKey={'displayName'}
                        onInputChange={(text) => this.handleDrugNameChange(text)}
                        onChange={(selection) => this.setDrugName(selection)}
                        options={options.drugName}
                        placeholder="Enter a drug name"
                    />
                    <Form.Text>Minimum {settings.drugNameMinLength} characters.</Form.Text>
                </Form.Group>

                <Form.Group>
                    <Form.Label>Drug strength and form</Form.Label>
                    <Typeahead
                        id="drug-strength-typeahead"
                        minLength={0}
                        highlightOnlyResult={settings.highlightOnlyResult}
                        paginate={settings.paginate}
                        maxResults={settings.maxResults}
                        labelKey={'strengthAndForm'}
                        onInputChange={(text) => this.handleDrugStrengthAndFormChange(text)}
                        onChange={(selection) => this.setDrugStrengthAndForm(selection)}
                        options={options.drugStrengthAndForm}
                        placeholder="Choose a strength and form"
                    />
                </Form.Group>

                <div className="float-right">
                    <Button variant="light">Reset</Button>{' '}
                    <Button variant="primary" disabled={!selected.rxcui}>Next</Button>{' '}
                </div>

            </div>      
        );
    }
}
