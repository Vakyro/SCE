import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Atom, Lightbulb } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header with Try It button */}
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            <span className="font-bold text-xl">ElectricSim</span>
          </div>
          <Link href="/simulator" prefetch={false}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
              Try It Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Electric Field <span className="text-purple-600">Simulator</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600">
              Visualize and explore electric fields created by different charges in an interactive environment.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/simulator" prefetch={false}>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-lg">
                  Launch Simulator
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg rounded-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-8 aspect-square flex items-center justify-center">
            <div className="relative w-full h-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xl">-</span>
              </div>
              <div className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xl">+</span>
              </div>
              <div className="absolute w-full h-full">
                {/* Simplified field lines visualization */}
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-purple-400" />
                    </marker>
                  </defs>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <path
                      key={i}
                      d={`M ${100 + 20 * Math.cos((i * Math.PI) / 4)},${100 + 20 * Math.sin((i * Math.PI) / 4)} Q ${200},${200} ${300 + 20 * Math.cos((i * Math.PI) / 4 + Math.PI)},${300 + 20 * Math.sin((i * Math.PI) / 4 + Math.PI)}`}
                      fill="none"
                      stroke="currentColor"
                      className="text-purple-400"
                      strokeWidth="1.5"
                      markerEnd="url(#arrowhead)"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-purple-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Atom className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Charges</h3>
              <p className="text-gray-600">
                Drag and drop electrons, protons, and custom charges to create and visualize electric fields in
                real-time.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dynamic Field Lines</h3>
              <p className="text-gray-600">
                See electric field lines update instantly as you move charges around the simulation space.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Educational Insights</h3>
              <p className="text-gray-600">
                View detailed field data and charge information to understand the physics behind electric fields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ElectricSim. Educational tool for physics visualization.</p>
        </div>
      </footer>
    </div>
  )
}

