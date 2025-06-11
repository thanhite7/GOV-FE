import './App.css'
import NavBar from './component/NavBar'
import ErrorBoundary from './component/ErrorBoundary'
import { Outlet } from 'react-router-dom'

function App() {
  return (
    <ErrorBoundary>
      <NavBar />
      <Outlet />
    </ErrorBoundary>
  )
}

export default App
