import logo from './logo.svg';
import './App.css';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import DrugNameSearch from './components/DrugNameSearch'

function App() {
  return (
    <Container>
      <Row>
        <Col>
          <DrugNameSearch />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
