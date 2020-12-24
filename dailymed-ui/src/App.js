import logo from './logo.svg';
import './App.css';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import RxTermsSearch from './components/RxTermsSearch';

function App() {
  return (
    <Container>
      <Row>
        <Col md={4}>
          <RxTermsSearch />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
