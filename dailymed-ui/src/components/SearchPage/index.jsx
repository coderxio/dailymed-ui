import React from 'react';

import RxTermsSearch from '../RxTermsSearch';
import DailyMedApi from '../DailyMedApi';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class SearchPage extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        filters: {
          rxcui: '',
          inactiveIngredientUnii: '',
        },
      };
  }

  handleFilterChange(filters) {
      // NOTE: fix this so it doesn't wipe other filters
      this.setState({ filters });
  }

  render() {
        const { filters } = this.state;
        return (
          <Container>
            <Row>
              <Col>
                <RxTermsSearch onFilterChange={(filters) => this.handleFilterChange(filters)} />
                <DailyMedApi filters={filters} />
              </Col>
            </Row>
          </Container>
        );
    }
}
