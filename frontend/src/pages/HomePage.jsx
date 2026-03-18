import { BookOpen, Users, Award, PlayCircle, ArrowRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

// Static featured course data for homepage display
const featuredCourses = [
  { id: 1, title: 'Introduction to Web Development', instructor: 'Dr. Sarah Chen', category: 'Development', students: 1240, rating: 4.8 },
  { id: 2, title: 'Data Science Fundamentals', instructor: 'Prof. James Miller', category: 'Data Science', students: 980, rating: 4.7 },
  { id: 3, title: 'UI/UX Design Masterclass', instructor: 'Emily Rodriguez', category: 'Design', students: 756, rating: 4.9 },
  { id: 4, title: 'Digital Marketing Strategy', instructor: 'Michael Park', category: 'Marketing', students: 1102, rating: 4.6 },
]

// Platform statistics shown in the hero section
const stats = [
  { icon: PlayCircle, label: 'Courses', value: '500+' },
  { icon: Users, label: 'Students', value: '25,000+' },
  { icon: Award, label: 'Instructors', value: '120+' },
]

// Course category list for the browse section
const categories = ['Development', 'Data Science', 'Design', 'Marketing', 'Business', 'Photography']

// Landing page with hero, stats, categories, and featured courses
const HomePage = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#1E3A8A] py-20 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Learn without limits
          </h1>
          <p className="text-lg text-[#BFDBFE] max-w-2xl mx-auto mb-8">
            Build skills with courses from expert instructors. Start your learning journey today with hundreds of courses across every topic.
          </p>
          {user ? (
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-white text-[#1E3A8A] px-6 py-3 rounded-lg font-medium hover:bg-[#DBEAFE] transition-colors"
            >
              View Courses <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-[#1E3A8A] px-6 py-3 rounded-lg font-medium hover:bg-[#DBEAFE] transition-colors"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#E5E7EB] bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <stat.icon className="w-8 h-8 text-[#2563EB]" />
              <span className="text-3xl font-bold text-[#111827]">{stat.value}</span>
              <span className="text-[#6B7280]">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-[#111827] mb-6">Browse Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div
              key={cat}
              className="border border-[#E5E7EB] rounded-lg py-3 px-4 text-center text-sm font-medium text-[#111827] hover:bg-[#DBEAFE] transition-colors cursor-pointer"
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-[#111827] mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredCourses.map((course) => (
            <div
              key={course.id}
              className="border border-[#E5E7EB] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-36 bg-[#DBEAFE] flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-[#2563EB]" />
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-[#2563EB] mb-1 block">{course.category}</span>
                <h3 className="font-semibold text-[#111827] text-sm mb-2 leading-snug">{course.title}</h3>
                <p className="text-xs text-[#6B7280] mb-3">{course.instructor}</p>
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span>{course.students.toLocaleString()} students</span>
                  <span className="font-medium text-[#111827]">⭐ {course.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1E3A8A]" />
            <span className="font-semibold text-[#1E3A8A]">EduVista</span>
          </div>
          <span>© 2026 EduVista. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
