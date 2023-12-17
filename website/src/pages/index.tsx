import FeatureCard from "@/components/Landing/FeatureCard";
import Header from "@/components/Landing/Header";
import Hero from "@/components/Landing/Hero";

export default function Component() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1">
        <Hero />

        <section id="features" className="py-12 md:py-24 lg:p-32">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Features</h2>
            <p className="py-6">Everything you need to manage your event</p>
          </div>
          
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                title="Easy Registration"
                description="Create a custom registration form and collect all the information you need from your applicants."
              />

              <FeatureCard 
                title="Applicant Tracking"
                description="Efficiently manage and track applicant progress from initial application to final selection with our comprehensive dashboard."
              />

              <FeatureCard
                title="Open Source"
                description="Enjoy the flexibility of an open-source platform that allows for customizations and integrations to suit your event's unique needs."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Pricing</h2>
            <p className="py-6">A pricing plan for every event</p>
          </div>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="card bg-gray-100 shadow-xl hover:bg-base-500 hover:shadow-2xl transform hover:scale-105 transition duration-300">
                <div className="card-body">
                  <h3 className="card-title">Free Plan</h3>
                  <p>
                    Get started with our basic features at no cost. Ideal for
                    small events and new organizers.
                  </p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary">Choose Plan</button>
                  </div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="card bg-gray-100 shadow-xl hover:bg-base-500 hover:shadow-2xl transform hover:scale-105 transition duration-300">
                <div className="card-body">
                  <h3 className="card-title">Pro Plan</h3>
                  <p>
                    Enhanced features and support for growing events.
                    $14.99/month.
                  </p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary">Choose Plan</button>
                  </div>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="card bg-gray-100 shadow-xl hover:bg-base-500 hover:shadow-2xl transform hover:scale-105 transition duration-300">
                <div className="card-body">
                  <h3 className="card-title">Enterprise Plan</h3>
                  <p>
                    Our full suite of features and premium support for
                    large-scale events. Custom pricing.
                  </p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-primary">Contact Us</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-6">About Us</h2>
            <p>
              ApplicantAtlas is dedicated to revolutionizing the hackathon
              experience. Our team of passionate developers and event organizers
              has created a platform that simplifies event management and
              enhances participant engagement. We believe in the power of
              community and open-source collaboration to create the best
              possible product.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-12 md:py-24 lg:py-32 bg-gray-200">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
            <p>
              If you have any questions or feedback, feel free to reach out to
              us.
            </p>
            <p>Email: contact@applicantatlas.com</p>
            <p>Phone: +1 (123) 456-7890</p>
          </div>
        </section>
      </main>

      <footer className="footer footer-center p-4 bg-blue-900 text-white">
        <div>
          <p>© 2023 ApplicantAtlas. All rights reserved. GPLv3 Licensed.</p>
        </div>
      </footer>
    </div>
  );
}
