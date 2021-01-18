import React from 'react';

import { AsyncTypeahead, Typeahead } from "react-bootstrap-typeahead";
import Form from 'react-bootstrap/Form';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';

export default class RxTermsSearch extends React.Component {
  constructor(props) {
      super(props);
      // State object for the typeahead 
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
          drugName: "",
          drugStrengthAndForm: "",
          rxcui: "",
          },
          loading: false,
      };
  }

  handleFilterChange() {
    const { selected } = this.state;
    this.props.onFilterChange({ 'rxcui': selected.rxcui });
  }

  /** Adds queried drug names and strengths to the typeahead options list and empties the selected array.
   * @param {string} text - The current text entered into the input
  */
 handleDrugNameChange(text) {
  this.setState({ loading: true });
  const { settings, options } = this.state;

  if (text.length >= settings.drugNameMinLength) {
    fetch(
        `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?ef=DISPLAY_NAME,STRENGTHS_AND_FORMS,RXCUIS&maxList=&terms=${text}`
    )
    .then((resp) => resp.json())
    .then((json) => {
        //** Deconstruct the fetch result */
        const { DISPLAY_NAME: names, STRENGTHS_AND_FORMS: forms, RXCUIS: cuis } = json[2];
        //**If names are returned, set the dropdown options to the returned names */
        if (names && forms) 
          options.drugName = names.map((name, nameIndex) => {
              return {
                  displayName: name,
                  strengthsAndForms: forms[nameIndex].map((form, formIndex) => {
                    return {
                      strengthAndForm: form,
                      rxcui: cuis[nameIndex][formIndex]
                    };
                  })
              };
          });

          const loading = false;
          const selected = [];
          this.setState({ loading, options, selected }, this.handleFilterChange);
    });
  }
}

handleDrugStrengthAndFormChange(text) {
      // NOTE: also clear selected when this changes
      const selected = [];
      this.setState({ selected }, this.handleFilterChange);
  }

  setDrugName(selection) {
      const { options, selected } = this.state;

      if (selection.length > 0) {
          selected.drugName = selection[0].displayName;
          options.drugStrengthAndForm = selection[0].strengthsAndForms;
      }
      this.setState({ options, selected }, this.handleFilterChange);
  }

  setDrugStrengthAndForm(selection) {
      const { selected } = this.state;

      if (selection.length > 0) {
          selected.drugStrengthAndForm = selection[0].strengthAndForm;
          selected.rxcui = selection[0].rxcui;
      }
      this.setState({ selected }, this.handleFilterChange);
  }

  render() {
        const { settings, options, loading } = this.state;
        return (
          <div>
            <Form.Group>
              <Form.Label>Drug name</Form.Label>
              <AsyncTypeahead
                id="drug-name-typeahead"
                labelKey={"displayName"}
                // The dropdown options available for selection
                options={options.drugName}
                minLength={settings.drugNameMinLength}
                highlightOnlyResult={settings.highlightOnlyResult}
                maxResults={settings.maxResults}
                paginate={settings.paginate}
                placeholder="Enter a drug name..."
                // Text shown in the dropdown box when a search is being fetched
                searchText="Searching..."
                // Whether the dropdown should show the loading icon
                isLoading={loading}
                // Runs when any text is being typed into the typeahead
                onSearch={(text) => this.handleDrugNameChange(text)}
                // Function that runs on a selected dropdown option
                onChange={(selection) => this.setDrugName(selection)}
              />
              <Form.Text>
                Minimum {settings.drugNameMinLength} characters.
              </Form.Text>
            </Form.Group>

            <Form.Group>
              <Form.Label>Drug strength and form</Form.Label>
              <Typeahead
                id="drug-strength-typeahead"
                labelKey={"strengthAndForm"}
                options={options.drugStrengthAndForm}
                minLength={0}
                highlightOnlyResult={settings.highlightOnlyResult}
                maxResults={settings.maxResults}
                paginate={settings.paginate}
                placeholder="Choose a strength and form..."
                onInputChange={(text) => this.handleDrugStrengthAndFormChange(text)}
                onChange={(selection) => this.setDrugStrengthAndForm(selection)}
              />
            </Form.Group>
          </div>
        );
    }
}
