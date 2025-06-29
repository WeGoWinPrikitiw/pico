export function Footer() {
  return (
    <footer className="bg-[#CE0AFF] text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header section with logo and P icon */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <img
              src="/brand/pico-logo-dark.svg"
              alt="PICO"
              className="w-[200px]"
            />
          </div>
        </div>

        {/* Main heading */}
        <div className="mb-16">
          <h1
            className={`text-2xl md:text-3xl font-bold leading-tight font-lexend`}
          >
            The ultimate art marketplace
            <br />
            where creativity meets blockchain.
          </h1>
        </div>

        {/* Footer content grid */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 mb-12">
          {/* Left side - 3 column grid for navigation and social */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Navigation */}
            <div>
              <h3 className={`text-lg font-bold mb-4 font-lexend`}>
                Navigation
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/" className="hover:text-gray-300 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/explore"
                    className="hover:text-gray-300 transition-colors"
                  >
                    Explore NFTs
                  </a>
                </li>
                <li>
                  <a
                    href="/upload"
                    className="hover:text-gray-300 transition-colors"
                  >
                    Create NFT
                  </a>
                </li>
                <li>
                  <a
                    href="/forums"
                    className="hover:text-gray-300 transition-colors"
                  >
                    Forums
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className={`text-lg font-bold mb-4 font-lexend`}>
                Community
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className={`text-lg font-bold mb-4 font-lexend`}>
                Follow Us
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-300 transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Newsletter section */}
          <div className="md:text-right">
            <h3 className={`text-lg font-bold mb-4 font-lexend`}>
              We're still in development!
              <br />
              Subscribe to our newsletter to
              <br />
              receive updates and special offers.
            </h3>
          </div>
        </div>
      </div>
      {/* Copyright section */}
      <div className="bg-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-center text-gray-600 text-sm">
            © 2025 PICO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
