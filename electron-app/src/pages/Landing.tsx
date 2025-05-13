import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Printer, Clock, CreditCard, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const features = [
    {
      id: 'print',
      title: 'Simplified Printing',
      description: 'Manage your entire print shop workflow from a single dashboard',
      icon: Printer,
    },
    {
      id: 'time',
      title: 'Save Time',
      description: 'Automate order processing and reduce administrative overhead',
      icon: Clock,
    },
    {
      id: 'payment',
      title: 'Easy Payments',
      description: 'Integrated payment processing for seamless transactions',
      icon: CreditCard,
    },
    {
      id: 'security',
      title: 'Secure & Reliable',
      description: 'Keep your customer data and print files safe and protected',
      icon: Shield,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.2,
        delay: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const heroTextVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: 'easeOut' 
      } 
    },
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-20 px-4 md:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            className="flex-1 space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight"
              variants={heroTextVariants}
            >
              Manage Your Print Shop <span className="text-primary">Effortlessly</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-600 max-w-xl"
              variants={heroTextVariants}
            >
              A complete solution for print shops to manage orders, track inventory, 
              and grow your business all in one place.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <Button 
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white rounded-lg px-8 py-6 text-lg"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 rounded-lg px-8 py-6 text-lg"
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
            <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.5,
              ease: [0, 0.71, 0.2, 1.01]
            }}
          >
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-primary rounded-xl transform rotate-3"></div>
              <img 
                src="/placeholder.svg" 
                alt="Print Shop Dashboard" 
                className="relative z-10 w-full h-auto rounded-xl shadow-xl"
              />
              
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg z-20 transform rotate-3 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <p className="font-medium text-gray-800">Order Complete!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="w-full py-16 bg-background px-4 md:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Everything You Need to Run Your Print Shop
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Streamline your workflow, improve customer satisfaction, and grow your business
              with our comprehensive print shop management solution.
            </p>
          </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.id}
                className={`p-6 rounded-lg shadow-md border border-gray-100 transition-all duration-300 ${
                  isHovering === feature.id ? 'bg-primary/5 transform scale-105' : 'bg-white'
                }`}
                onMouseEnter={() => setIsHovering(feature.id)}
                onMouseLeave={() => setIsHovering(null)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-4 p-3 inline-block rounded-full bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button 
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary/90 text-white rounded-lg px-8 py-6 text-lg"
              size="lg"
            >
              <span>Get Started Today</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
        {/* Testimonial Section */}
      <section className="w-full py-16 px-4 md:px-6 lg:px-12 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="bg-primary rounded-lg p-8 md:p-12 text-white shadow-lg overflow-hidden relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 transform -translate-x-1/3 translate-y-1/3"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 max-w-md">
                Join thousands of print shops already using our platform
              </h2>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg flex-1">
                  <p className="italic text-white mb-4">
                    "Since implementing Print Project, we've reduced our administrative work by 70%
                    and increased our order processing capacity by 30%. The best investment we've made this year!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20"></div>
                    <div>
                      <p className="font-medium">Sarah Johnson</p>
                      <p className="text-sm text-white/80">Quick Print Solutions</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg flex-1">
                  <p className="italic text-white mb-4">
                    "Our customers love the tracking system and automated notifications. 
                    Customer satisfaction is up, and so are our profits. Couldn't be happier!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20"></div>
                    <div>
                      <p className="font-medium">Michael Rodriguez</p>
                      <p className="text-sm text-white/80">Metro Print & Design</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 flex flex-wrap gap-3">
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-white text-primary hover:bg-white/90 rounded-lg"
                >
                  Create Your Account
                </Button>
                <Button 
                  onClick={() => {}}
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 rounded-lg"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
        {/* CTA Section */}
      <section className="w-full py-16 px-4 md:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Ready to Transform Your Print Shop?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of print shops already using our platform to streamline operations,
              increase profits, and deliver exceptional customer experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white rounded-lg px-8 py-6 text-lg"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 rounded-lg px-8 py-6 text-lg"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full py-8 px-4 md:px-6 lg:px-12 bg-primary text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-xl font-bold mb-4 md:mb-0">Print Project</p>
          
          <div className="flex gap-8">
            <a href="#" className="hover:text-white/80 transition-colors">About</a>
            <a href="#" className="hover:text-white/80 transition-colors">Features</a>
            <a href="#" className="hover:text-white/80 transition-colors">Pricing</a>
            <a href="#" className="hover:text-white/80 transition-colors">Contact</a>
          </div>
          
          <p className="mt-4 md:mt-0 text-sm text-white/80">© 2025 Print Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;