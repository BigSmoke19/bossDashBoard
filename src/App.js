
import { Route,Routes,HashRouter as Router } from 'react-router-dom';
import Home from './home.js';
import Add from './add.js';
import Edit from './edit.js';
import Item from './item.js';
import Login from './login.js';
import Categories from './categories.js';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
        <Route
              exact path='/'
              element={<Login />}
            />
            <Route
              exact path='/home'
              element={<Home />}
            />
            <Route
              exact path='/add'
              element={<Add />}
            />
            <Route
              exact path='/edit'
              element={<Edit />}
            />
            <Route
               path='/item'
              element={
              <Item/>
            }
            />
            <Route
               path='/categories'
              element={
              <Categories/>
            }
            />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
