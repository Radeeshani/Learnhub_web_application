import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Welcome from './components/Welcome'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Welcome />} />
            {/* More routes will be added in future steps */}
          </Routes>
        </motion.div>
      </div>
    </Router>
  )
}

export default App 