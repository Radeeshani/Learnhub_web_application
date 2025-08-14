import { motion } from 'framer-motion'
import { BookOpenIcon, UserGroupIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-accent mb-6">
            Homework Application
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            for Primary Education
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </motion.div>

        {/* Features Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2">
              Interactive Learning
            </h3>
            <p className="text-gray-600">
              Engaging homework assignments with modern UI
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2">
              Multi-Role Access
            </h3>
            <p className="text-gray-600">
              Teachers, Students, Parents & Admins
            </p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardDocumentListIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2">
              Progress Tracking
            </h3>
            <p className="text-gray-600">
              Real-time submission and analytics
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button 
            className="btn-primary"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-gray-500 text-sm mt-12"
        >
          🔧 Project setup complete! Ready for authentication implementation.
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Welcome 