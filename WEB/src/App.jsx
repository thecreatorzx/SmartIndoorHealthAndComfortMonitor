import { useState, useEffect } from 'react'
import api from './api/axios.js'
import './App.css'
import Header from './components/Header.jsx'
import Main from './components/Main.jsx'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'


const ProtectedRoute = ({user, children}) => {
  return user? children : <Navigate to ="/" replace />
}

const PublicOnlyRoute = ({user, children}) => {
  return !user? children: <Navigate to="/dashboard" replace />
}

function App() {
  const [user, setUser] = useState(null);
  const [loading,setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    setUser(null);
    Navigate("/");
  }
};
  if (loading) return <div>Loading...</div>

  return (
      <Routes> 
        <Route path= "/" element={<LandingPage user = {user}/>}/>
        
        <Route path= "/login" element = {
          <PublicOnlyRoute user = {user}>
            <Login onLogin = {setUser} />
          </PublicOnlyRoute>
        }/>
        <Route path= "/signup" element = {
          <PublicOnlyRoute user = {user}>
            <SignUp onLogin = {setUser} />
          </PublicOnlyRoute>
        } />
        <Route path = "/dashboard" element= {
          <ProtectedRoute user = {user}>
            <div className="App w-screen bg-gray-100 flex flex-col items-center text-gray-700">
              <Header user={user} onLogout={handleLogout}/>
              <Main />
            </div>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}

export default App
