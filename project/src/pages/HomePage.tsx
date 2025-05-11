import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Upload, Clock, Check, Settings, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-xerox-gray-900 to-xerox-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                <span className="text-xerox-red">Xerox Wall</span> <br />
                Campus Printing Solution
              </h1>
              <p className="text-lg text-xerox-gray-300 max-w-lg">
                Submit, manage, and print your documents from anywhere on campus.
                Fast, reliable, and hassle-free printing service for students and faculty.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Submit Document
                </Button>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Settings className="w-5 h-5 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-xerox-red to-purple-600 rounded-lg blur opacity-75"></div>
                <div className="relative bg-xerox-gray-900 p-6 rounded-lg shadow-xl">
                  <div className="bg-xerox-gray-800 p-4 rounded-md mb-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-xerox-red h-3 w-3 rounded-full mr-1"></div>
                      <div className="bg-yellow-500 h-3 w-3 rounded-full mr-1"></div>
                      <div className="bg-green-500 h-3 w-3 rounded-full"></div>
                      <div className="ml-3 text-sm text-xerox-gray-300">Document Queue</div>
                    </div>
                    <div className="space-y-2">
                      {["Research_Paper.pdf", "Physics_Assignment.pdf", "Group_Project.pdf"].map((filename, idx) => (
                        <div key={idx} className="bg-xerox-gray-700 p-2 rounded-md flex items-center justify-between">
                          <div className="flex items-center">
                            <Check className={`w-4 h-4 ${idx === 0 ? 'text-xerox-green-500' : 'text-xerox-gray-500'}`} />
                            <span className="ml-2 text-sm">{filename}</span>
                          </div>
                          <span className={`text-xs ${idx === 0 ? 'text-xerox-green-500' : 'text-xerox-gray-400'}`}>
                            {idx === 0 ? 'Ready' : idx === 1 ? 'Queue #1' : 'Queue #2'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-xerox-gray-300">
                    <span>Status: Active</span>
                    <span>3 printers available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-xerox-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-xerox-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-xerox-gray-600 max-w-2xl mx-auto">
              Xerox Wall makes campus printing simple and efficient
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-xerox-red/10 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-xerox-red" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload</h3>
              <p className="text-xerox-gray-600">
                Submit your document through our easy-to-use web portal. Support for PDF, Word, PowerPoint, and more.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-xerox-blue-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-xerox-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Wait</h3>
              <p className="text-xerox-gray-600">
                Your document enters the print queue. Track its status in real-time through the dashboard.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-xerox-green-50 rounded-full flex items-center justify-center mb-4">
                <Printer className="w-6 h-6 text-xerox-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Collect</h3>
              <p className="text-xerox-gray-600">
                Once printed, collect your documents from the designated printer location. Simple as that!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-xerox-gray-900">Features</h2>
            <p className="mt-4 text-lg text-xerox-gray-600 max-w-2xl mx-auto">
              Designed to make campus printing efficient and hassle-free
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 bg-xerox-red/10 rounded-full flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-xerox-red" />
                  </div>
                  Real-time tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xerox-gray-600">
                  Monitor your print jobs in real-time. Know exactly when your documents are printing and ready for pickup.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 bg-xerox-red/10 rounded-full flex items-center justify-center mr-3">
                    <Settings className="w-4 h-4 text-xerox-red" />
                  </div>
                  Multiple print options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xerox-gray-600">
                  Choose from various print settings including color, double-sided, multiple copies, and paper size.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 bg-xerox-red/10 rounded-full flex items-center justify-center mr-3">
                    <Printer className="w-4 h-4 text-xerox-red" />
                  </div>
                  Campus-wide access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xerox-gray-600">
                  Print to any Xerox printer across campus. Choose the most convenient location for pickup.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 bg-xerox-red/10 rounded-full flex items-center justify-center mr-3">
                    <Upload className="w-4 h-4 text-xerox-red" />
                  </div>
                  Easy submission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xerox-gray-600">
                  Submit documents from any device with an internet connection. Compatible with all major file formats.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-xerox-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to start printing?
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of students and faculty who use Xerox Wall for their printing needs. Fast, reliable, and convenient.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-xerox-red hover:bg-white/90">
              Submit Document
            </Button>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Go to Dashboard
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;