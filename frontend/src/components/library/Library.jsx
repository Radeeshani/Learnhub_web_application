import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiExternalLink, FiSearch, FiGrid, FiList, FiStar, FiVideo, FiImage, FiFileText } from 'react-icons/fi';

const Library = () => {
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Comprehensive library data with online resources
  const libraryData = {
    'Grade 1': {
      'Mathematics': [
        {
          id: 1,
          title: 'Basic Addition and Subtraction',
          description: 'Learn fundamental math operations with fun examples and interactive exercises',
          type: 'pdf',
          url: 'https://www.mathlearningcenter.org/sites/default/files/pdfs/MathAtHome1.pdf',
          thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=200&fit=crop',
          rating: 4.8,
          tags: ['math', 'addition', 'subtraction', 'beginner']
        },
        {
          id: 2,
          title: 'Counting Numbers 1-100',
          description: 'Interactive counting exercises and number recognition activities',
          type: 'interactive',
          url: 'https://www.khanacademy.org/early-math/cc-early-math-counting-topic',
          thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
          rating: 4.9,
          tags: ['math', 'counting', 'numbers', 'interactive']
        }
      ],
      'Language Arts': [
        {
          id: 3,
          title: 'Phonics Fundamentals',
          description: 'Learn letter sounds and basic reading skills with video lessons',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=saF3-f0XWAY',
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
          rating: 4.7,
          tags: ['reading', 'phonics', 'letters', 'beginner']
        },
        {
          id: 4,
          title: 'Sight Words Practice',
          description: 'Common sight words for early readers with printable worksheets',
          type: 'pdf',
          url: 'https://www.sightwords.com/sight-words/fry/',
          thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop',
          rating: 4.6,
          tags: ['reading', 'sight words', 'vocabulary']
        }
      ],
      'Science': [
        {
          id: 5,
          title: 'Animal Kingdom Introduction',
          description: 'Learn about different types of animals and their habitats',
          type: 'interactive',
          url: 'https://www.natgeokids.com/uk/category/discover/animals/',
          thumbnail: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=300&h=200&fit=crop',
          rating: 4.8,
          tags: ['science', 'animals', 'nature', 'interactive']
        }
      ]
    },
    'Grade 2': {
      'Mathematics': [
        {
          id: 6,
          title: 'Multiplication Tables',
          description: 'Learn multiplication from 1 to 12 with practice worksheets',
          type: 'pdf',
          url: 'https://www.math-aids.com/Multiplication/Multiplication_Worksheets_Tables.html',
          thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop',
          rating: 4.7,
          tags: ['math', 'multiplication', 'tables', 'intermediate']
        },
        {
          id: 7,
          title: 'Money and Coins',
          description: 'Understanding currency and basic financial concepts',
          type: 'interactive',
          url: 'https://www.usmint.gov/learn/kids',
          thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop',
          rating: 4.9,
          tags: ['math', 'money', 'coins', 'finance']
        }
      ],
      'Language Arts': [
        {
          id: 8,
          title: 'Reading Comprehension',
          description: 'Short stories with comprehension questions and activities',
          type: 'pdf',
          url: 'https://www.readworks.org/',
          thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
          rating: 4.8,
          tags: ['reading', 'comprehension', 'stories', 'questions']
        }
      ]
    },
    'Grade 3': {
      'Mathematics': [
        {
          id: 9,
          title: 'Division Concepts',
          description: 'Understanding division and remainders with examples',
          type: 'video',
          url: 'https://www.khanacademy.org/math/arithmetic-home/multiply-divide/division-intro',
          thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=200&fit=crop',
          rating: 4.6,
          tags: ['math', 'division', 'arithmetic', 'intermediate']
        }
      ],
      'Science': [
        {
          id: 10,
          title: 'Solar System Exploration',
          description: 'Learn about planets, stars, and space exploration',
          type: 'interactive',
          url: 'https://solarsystem.nasa.gov/solar-system/our-solar-system/overview/',
          thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d0bd843e8?w=300&h=200&fit=crop',
          rating: 4.9,
          tags: ['science', 'space', 'planets', 'solar system']
        }
      ]
    },
    'Grade 4': {
      'Mathematics': [
        {
          id: 11,
          title: 'Fractions and Decimals',
          description: 'Understanding fractions, decimals, and percentages',
          type: 'pdf',
          url: 'https://www.mathlearningcenter.org/sites/default/files/pdfs/MathAtHome4.pdf',
          thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop',
          rating: 4.7,
          tags: ['math', 'fractions', 'decimals', 'percentages']
        }
      ],
      'Social Studies': [
        {
          id: 12,
          title: 'World Geography',
          description: 'Explore countries, capitals, and cultures around the world',
          type: 'interactive',
          url: 'https://www.nationalgeographic.org/education/',
          thumbnail: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=300&h=200&fit=crop',
          rating: 4.8,
          tags: ['geography', 'countries', 'cultures', 'world']
        }
      ]
    },
    'Grade 5': {
      'Mathematics': [
        {
          id: 13,
          title: 'Geometry Basics',
          description: 'Shapes, angles, and geometric concepts with examples',
          type: 'video',
          url: 'https://www.khanacademy.org/math/geometry-home',
          thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop',
          rating: 4.6,
          tags: ['math', 'geometry', 'shapes', 'angles']
        }
      ],
      'Science': [
        {
          id: 14,
          title: 'Ecosystems and Food Chains',
          description: 'Understanding how living things interact in nature',
          type: 'interactive',
          url: 'https://www.bbc.co.uk/bitesize/topics/zbnnb9q',
          thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
          rating: 4.8,
          tags: ['science', 'ecosystems', 'food chains', 'biology']
        }
      ]
    },
    'Grade 6': {
      'Mathematics': [
        {
          id: 15,
          title: 'Algebra Introduction',
          description: 'Basic algebraic concepts and equations for beginners',
          type: 'pdf',
          url: 'https://www.mathlearningcenter.org/sites/default/files/pdfs/MathAtHome6.pdf',
          thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop',
          rating: 4.7,
          tags: ['math', 'algebra', 'equations', 'variables']
        }
      ],
      'Language Arts': [
        {
          id: 16,
          title: 'Essay Writing Skills',
          description: 'Learn to write structured essays with examples',
          type: 'video',
          url: 'https://www.youtube.com/watch?v=JZUqXKJTf8g',
          thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
          rating: 4.8,
          tags: ['writing', 'essays', 'structure', 'composition']
        }
      ]
    }
  };

  const grades = Object.keys(libraryData);
  const categories = ['all', 'Mathematics', 'Language Arts', 'Science', 'Social Studies'];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FiFileText className="h-5 w-5" />;
      case 'video': return <FiVideo className="h-5 w-5" />;
      case 'interactive': return <FiGrid className="h-5 w-5" />;
      case 'image': return <FiImage className="h-5 w-5" />;
      default: return <FiBook className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-600 border-red-200';
      case 'video': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'interactive': return 'bg-green-100 text-green-600 border-green-200';
      case 'image': return 'bg-purple-100 text-purple-600 border-purple-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const filteredResources = () => {
    let resources = [];
    
    Object.entries(libraryData).forEach(([grade, subjects]) => {
      if (selectedGrade === 'all' || grade === selectedGrade) {
        Object.entries(subjects).forEach(([subject, subjectResources]) => {
          if (selectedCategory === 'all' || subject === selectedCategory) {
            resources.push(...subjectResources);
          }
        });
      }
    });

    if (searchQuery) {
      resources = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return resources;
  };

  const handleResourceClick = (resource) => {
    window.open(resource.url, '_blank');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg mb-6"
            >
              <FiBook className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4"
            >
              Digital Library
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Explore educational resources organized by grade level and subject.
            </motion.p>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="all">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Subjects' : category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Resources */}
          <div className="mb-8">
            {filteredResources().length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-6">
                  <FiBook className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Resources Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find more resources.
                </p>
                <button
                  onClick={() => {
                    setSelectedGrade('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold text-emerald-600">{filteredResources().length}</span> resources
                    {selectedGrade !== 'all' && ` for ${selectedGrade}`}
                    {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                  </p>
                </div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredResources().map((resource) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => handleResourceClick(resource)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={resource.thumbnail}
                          alt={resource.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(resource.type)}`}>
                            {getTypeIcon(resource.type)}
                            <span className="ml-1 capitalize">{resource.type}</span>
                          </span>
                        </div>
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                            <FiStar className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-700">{resource.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {resource.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resource.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105">
                          <FiExternalLink className="h-4 w-4 mr-2" />
                          Open Resource
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center text-gray-500 text-sm"
          >
            <p>
              All resources are external links to trusted educational websites. 
              Click on any resource to open it in a new tab.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Library;
