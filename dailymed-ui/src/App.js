import './App.css';
import { Switch, Route } from 'react-router-dom'

import SearchPage from './components/SearchPage';
import DailyMedApi from './components/DailyMedApi';

function App() {
  return (
    <Switch>
      <Route exact path="/" component={SearchPage}/>
      <Route path="/:rxcui" component={DailyMedApi}/>
    </Switch>
  );
}

export default App;
