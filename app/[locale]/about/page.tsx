import Link from "next/link"
import { ArrowLeft, Target, Users, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-balance">About GMB Platform</h1>

        <div className="space-y-12">
          <section>
            <p className="text-xl text-gray-300 leading-relaxed">
              GMB Platform is a premium Google My Business management solution designed for digital marketing agencies
              and businesses managing multiple locations. We combine powerful automation with AI-driven insights to help
              you maximize your local search presence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              To empower businesses with enterprise-grade tools that simplify Google My Business management, enhance
              customer engagement, and drive measurable results through intelligent automation and data-driven insights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#0A0A0A] border border-orange-500/20 rounded-lg p-6">
                <Target className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Innovation</h3>
                <p className="text-gray-400 text-sm">
                  Continuously pushing boundaries with AI-powered features and cutting-edge technology.
                </p>
              </div>
              <div className="bg-[#0A0A0A] border border-orange-500/20 rounded-lg p-6">
                <Users className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Customer Success</h3>
                <p className="text-gray-400 text-sm">
                  Dedicated to helping our clients achieve their local marketing goals and grow their business.
                </p>
              </div>
              <div className="bg-[#0A0A0A] border border-orange-500/20 rounded-lg p-6">
                <Zap className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Efficiency</h3>
                <p className="text-gray-400 text-sm">
                  Streamlining workflows and automating repetitive tasks to save time and resources.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Why Choose Us</h2>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">•</span>
                <span>Enterprise-grade security and reliability</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">•</span>
                <span>AI-powered insights and automation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">•</span>
                <span>Real-time synchronization with Google My Business</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">•</span>
                <span>Dedicated support team</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">•</span>
                <span>Scalable solution for businesses of all sizes</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
