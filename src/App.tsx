import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import Login from './screens/Login';
import Register from './screens/Register';
import OfferInfo from './screens/OfferInfo';

import React from 'react';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Home" element={<HomeScreen />} />
        <Route path="/register" element={<Register />} />
        <Route path="/offer/:id" element={<OfferInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
