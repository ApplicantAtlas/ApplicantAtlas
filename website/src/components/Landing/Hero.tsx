export default function Hero() {
  return (
    <header className="flex flex-wrap items-center justify-between px-10 py-20 bg-gray-100">
      <div className="w-full lg:w-1/2">
        <h1 className="text-5xl font-bold leading-tight mb-4">
          Transform your Hackathon experience with ApplicantAtlas
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          The open-source platform designed to facilitate seamless hackathon
          events and applicant tracking.
        </p>
        <div className="flex space-x-4">
          <button className="btn btn-primary py-2 px-4 rounded-md shadow-lg">
            Get Started
          </button>
          <button className="btn btn-outline btn-secondary py-2 px-4 rounded-md shadow-lg">
            Learn More
          </button>
        </div>
      </div>
      <div className="w-full lg:w-1/2 lg:flex lg:justify-end mt-8 lg:mt-0">
        <img
          src="https://via.placeholder.com/400x400"
          alt="Placeholder"
          className="rounded-lg shadow-lg object-cover object-center w-full h-auto max-w-sm lg:max-w-md"
        />
      </div>
    </header>
  );
}
