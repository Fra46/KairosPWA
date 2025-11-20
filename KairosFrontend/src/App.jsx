import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import LoginForm from './components/loginForm';
import './App.css'

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="flex-grow-1">
        <div className="container-fluid py-4">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;