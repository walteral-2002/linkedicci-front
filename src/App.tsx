import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import Login from './screens/Login';
import Register from './screens/Register';
import OfferInfo from './screens/OfferInfo';
import OfferApplicants from './screens/OfferApplicants';
import Applications from './screens/Applications';
import CV from './screens/CV';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Home" element={<HomeScreen />} />
        <Route path="/register" element={<Register />} />
        <Route path="/offer/:id" element={<OfferInfo />} />
        <Route path="/offer/applicants/:offerId" element={<OfferApplicants />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/cv" element={<CV />} />
      </Routes>
    </Router>
  );
}

export default App;
