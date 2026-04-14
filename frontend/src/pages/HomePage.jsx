import {
  BookOpen,
  ArrowRight,
  Star,
  Code,
  BarChart3,
  Palette,
  Megaphone,
  Briefcase,
  Camera,
  UserPlus,
  Search,
  GraduationCap,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import useInView from '../hooks/useInView'

// Static featured course data for homepage display
const featuredCourses = [
  { id: 1, title: 'Introduction to Web Development', instructor: 'Dr. Sarah Chen', category: 'Development', students: 1240, rating: 4.8, thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop' },
  { id: 2, title: 'Data Science Fundamentals', instructor: 'Prof. James Miller', category: 'Data Science', students: 980, rating: 4.7, thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop' },
  { id: 3, title: 'UI/UX Design Masterclass', instructor: 'Emily Rodriguez', category: 'Design', students: 756, rating: 4.9, thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop' },
  { id: 4, title: 'Digital Marketing Strategy', instructor: 'Michael Park', category: 'Marketing', students: 1102, rating: 4.6, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop' },
]

// Platform statistics
const stats = [
  { label: 'Courses', value: '500+' },
  { label: 'Students', value: '25,000+' },
  { label: 'Instructors', value: '120+' },
]

// Course categories with icons and descriptions
const categories = [
  { name: 'Development', icon: Code, description: 'Web, mobile, and software engineering' },
  { name: 'Data Science', icon: BarChart3, description: 'Analytics, ML, and visualization' },
  { name: 'Design', icon: Palette, description: 'UI/UX, graphic, and product design' },
  { name: 'Marketing', icon: Megaphone, description: 'Digital strategy and growth' },
  { name: 'Business', icon: Briefcase, description: 'Leadership, finance, and strategy' },
  { name: 'Photography', icon: Camera, description: 'Capture, edit, and compose' },
]

// Three-step onboarding process
const steps = [
  { number: '01', icon: UserPlus, title: 'Create an Account', description: 'Sign up in seconds and set your learning preferences' },
  { number: '02', icon: Search, title: 'Find Your Course', description: 'Browse hundreds of courses across every discipline' },
  { number: '03', icon: GraduationCap, title: 'Start Learning', description: 'Learn at your pace with lifetime access to content' },
]

// Social proof testimonials
const testimonials = [
  { name: 'Priya Sharma', role: 'Computer Science Student', quote: 'EduVista transformed how I approach learning. The course quality and instructor engagement are unmatched.' },
  { name: 'David Chen', role: 'Marketing Professional', quote: 'I completed three courses in digital marketing and landed a promotion within two months. Highly recommended.' },
  { name: 'Sarah Mitchell', role: 'Career Switcher', quote: 'As someone transitioning into tech, the structured learning paths gave me the confidence to make the leap.' },
]

// Extracts initials from a full name
const getInitials = (name) => name.split(' ').map((n) => n[0]).join('')

// Landing page with hero, stats, categories, courses, process, testimonials, CTA, and footer
const HomePage = () => {
  const { user } = useSelector((state) => state.auth)

  const [statsRef, statsInView] = useInView()
  const [categoriesRef, categoriesInView] = useInView()
  const [coursesRef, coursesInView] = useInView()
  const [howItWorksRef, howItWorksInView] = useInView()
  const [testimonialsRef, testimonialsInView] = useInView()
  const [ctaRef, ctaInView] = useInView()

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 flex items-center">
          {/* Left column */}
          <div className="w-full md:w-3/5 lg:w-1/2">
            <span
              className="animate-fade-in inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB] mb-6"
              style={{ animationDelay: '100ms' }}
            >
              Online Learning Platform
            </span>
            <h1
              className="animate-fade-in-up font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#1E3A8A] leading-[1.1] mb-6"
              style={{ animationDelay: '200ms' }}
            >
              Expand Your Knowledge Without Boundaries
            </h1>
            <p
              className="animate-fade-in-up text-lg text-[#6B7280] max-w-lg mb-8 leading-relaxed"
              style={{ animationDelay: '400ms' }}
            >
              Build skills with courses from expert instructors. Start your learning journey today with hundreds of courses across every topic.
            </p>
            <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              {user ? (
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#2563EB] transition-colors duration-300"
                >
                  View Courses <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#2563EB] transition-colors duration-300"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            {/* Trust indicator */}
            <div
              className="animate-fade-in flex items-center gap-3 mt-10"
              style={{ animationDelay: '800ms' }}
            >
              <div className="flex -space-x-2">
                {['A', 'K', 'R'].map((initial, i) => (
                  <div
                    key={initial}
                    className="w-8 h-8 rounded-full bg-[#DBEAFE] border-2 border-white flex items-center justify-center text-[#1E3A8A] text-xs font-bold"
                    style={{ zIndex: 3 - i }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <span className="text-sm text-[#6B7280]">
                Join <span className="font-semibold text-[#111827]">25,000+</span> learners worldwide
              </span>
            </div>
          </div>

          {/* Right column — decorative composition */}
          <div className="hidden md:flex w-2/5 lg:w-1/2 justify-center items-center relative" aria-hidden="true">
            <div className="relative w-72 h-72 lg:w-80 lg:h-80">
              {/* Large base circle */}
              <div
                className="animate-fade-in absolute inset-0 rounded-full bg-[#DBEAFE]"
                style={{ animationDelay: '300ms' }}
              />
              {/* Spinning ring */}
              <div
                className="animate-fade-in animate-spin-slow absolute -top-4 -right-4 w-32 h-32 rounded-full border-2 border-dashed border-[#2563EB]"
                style={{ animationDelay: '500ms', animationDuration: '0.6s, 20s' }}
              />
              {/* Floating small circle */}
              <div
                className="animate-fade-in animate-float absolute -bottom-2 -left-6 w-16 h-16 rounded-full bg-[#1E3A8A]"
                style={{ animationDelay: '600ms', animationDuration: '0.6s, 6s' }}
              />
              {/* Accent dot */}
              <div
                className="animate-fade-in absolute top-8 -left-8 w-5 h-5 rounded-full bg-[#2563EB]"
                style={{ animationDelay: '700ms' }}
              />
              {/* Editorial lines */}
              <div
                className="animate-fade-in absolute bottom-16 -right-10 w-14 h-0.5 bg-[#2563EB] rotate-[-20deg]"
                style={{ animationDelay: '650ms' }}
              />
              <div
                className="animate-fade-in absolute bottom-12 -right-6 w-8 h-0.5 bg-[#2563EB] rotate-[-20deg]"
                style={{ animationDelay: '700ms' }}
              />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen
                  className="animate-fade-in w-16 h-16 text-[#1E3A8A]"
                  style={{ animationDelay: '500ms' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center gap-2 py-6 sm:py-0 ${
                index < stats.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-[#E5E7EB]' : ''
              }`}
            >
              <span
                className={`font-serif text-4xl md:text-5xl font-normal text-[#1E3A8A] overflow-hidden ${
                  statsInView ? 'animate-count-reveal' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {stat.value}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#6B7280] font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section ref={categoriesRef} className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1E3A8A] mb-3">Explore Topics</h2>
        <p className="text-[#6B7280] text-lg mb-10">Find the right course for your goals</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, index) => (
            <div
              key={cat.name}
              className={`reveal-on-scroll border border-[#E5E7EB] rounded-xl p-6 cursor-pointer hover:border-[#2563EB] hover:-translate-y-1 hover:shadow-sm transition-all duration-300 ${
                categoriesInView ? 'revealed' : ''
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <cat.icon className="w-9 h-9 text-[#2563EB] mb-4" />
              <h3 className="font-semibold text-[#111827] text-base mb-1">{cat.name}</h3>
              <p className="text-sm text-[#6B7280]">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section ref={coursesRef} className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1E3A8A] mb-3">Featured Courses</h2>
        <p className="text-[#6B7280] text-lg mb-10">Handpicked courses from our top instructors</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredCourses.map((course, index) => (
            <div
              key={course.id}
              className={`reveal-on-scroll border border-[#E5E7EB] rounded-xl overflow-hidden cursor-pointer hover:border-[#2563EB] hover:-translate-y-1 hover:shadow-sm transition-all duration-300 ${
                coursesInView ? 'revealed' : ''
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="h-44 bg-[#DBEAFE] overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <span className="inline-block bg-[#DBEAFE] text-[#1E3A8A] text-xs font-medium px-3 py-1 rounded-full mb-3">
                  {course.category}
                </span>
                <h3 className="font-semibold text-[#111827] text-base mb-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-sm text-[#6B7280] mb-4">{course.instructor}</p>
                <div className="flex items-center justify-between text-sm text-[#6B7280]">
                  <span>{course.students.toLocaleString()} students</span>
                  <span className="flex items-center gap-1 font-medium text-[#111827]">
                    <Star className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]" />
                    {course.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section ref={howItWorksRef} className="bg-[#F9FAFB] border-y border-[#E5E7EB] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl text-[#1E3A8A] mb-3">How It Works</h2>
            <p className="text-[#6B7280] text-lg">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 relative">
            {/* Dashed connector line on desktop */}
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] border-t-2 border-dashed border-[#E5E7EB]" />
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`reveal-on-scroll flex flex-col items-center text-center relative z-10 ${
                  howItWorksInView ? 'revealed' : ''
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-white border-2 border-[#DBEAFE] flex items-center justify-center mb-5">
                  <step.icon className="w-7 h-7 text-[#1E3A8A]" />
                </div>
                <span className="text-xs font-bold text-[#2563EB] tracking-widest mb-2">
                  {step.number}
                </span>
                <h3 className="font-semibold text-lg text-[#111827] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6B7280] max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl text-[#1E3A8A] mb-3">What Our Learners Say</h2>
          <p className="text-[#6B7280] text-lg">Real stories from real students</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div
              key={t.name}
              className={`reveal-on-scroll border border-[#E5E7EB] rounded-xl p-8 ${
                testimonialsInView ? 'revealed' : ''
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <span className="font-serif text-5xl text-[#DBEAFE] leading-none select-none">&ldquo;</span>
              <p className="text-[#111827] text-base leading-relaxed mt-1 mb-6">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[#1E3A8A] font-semibold text-sm">
                  {getInitials(t.name)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#111827]">{t.name}</p>
                  <p className="text-xs text-[#6B7280]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section
        ref={ctaRef}
        className={`reveal-on-scroll bg-[#1E3A8A] py-20 ${ctaInView ? 'revealed' : ''}`}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-[#BFDBFE] text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of learners already building their future with EduVista.
          </p>
          {user ? (
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-white text-[#1E3A8A] px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#DBEAFE] transition-colors duration-300"
            >
              Browse Courses <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-[#1E3A8A] px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-[#DBEAFE] transition-colors duration-300"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-[#1E3A8A]" />
                <span className="font-serif text-xl text-[#1E3A8A]">EduVista</span>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Empowering learners worldwide with quality education from expert instructors.
              </p>
            </div>
            {/* Platform */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-[#111827] mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5">
                <li><Link to="/courses" className="text-sm text-[#6B7280] hover:text-[#1E3A8A] transition-colors">Browse Courses</Link></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-[#1E3A8A] transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-[#1E3A8A] transition-colors">Become an Instructor</a></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-[#111827] mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-[#1E3A8A] transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-[#1E3A8A] transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-[#1E3A8A] transition-colors">Community</a></li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-[#111827] mb-4">
                Company
              </h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-[#1E3A8A] transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-[#1E3A8A] transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-[#6B7280] hover:text-[#1E3A8A] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-[#E5E7EB] text-center">
            <span className="text-sm text-[#6B7280]">&copy; 2026 EduVista. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
