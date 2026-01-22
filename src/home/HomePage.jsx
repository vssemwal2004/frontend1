import HeroSection from './HeroSection';

const HomePage = () => {
  return (
    <div>
      <HeroSection />

      {/* Future home sections can go here */}
      <section className="bg-white">
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card card-hover">
              <h3 className="text-lg font-semibold text-neutral-900">Live seat availability</h3>
              <p className="mt-2 text-neutral-600">
                Choose your preferred route and date with real-time seat availability.
              </p>
            </div>
            <div className="card card-hover">
              <h3 className="text-lg font-semibold text-neutral-900">Secure payments</h3>
              <p className="mt-2 text-neutral-600">
                Multiple payment options with secure checkout and instant confirmation.
              </p>
            </div>
            <div className="card card-hover">
              <h3 className="text-lg font-semibold text-neutral-900">Reliable support</h3>
              <p className="mt-2 text-neutral-600">
                Get help anytime with a smooth booking experience end-to-end.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
