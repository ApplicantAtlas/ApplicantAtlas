import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 z-30 transition duration-300 ease-in-out bg-white shadow-md lg:hidden`}
      >
        <div
          className="flex items-center justify-between p-6"
          onClick={() => setIsMenuOpen(false)}
        >
          <Link href="/">
            <span className="font-bold text-2xl lg:text-4xl">
              ApplicantAtlas
            </span>
          </Link>
        </div>
        <ul className="space-y-6 p-6">
          <li>
            <Link href="#features" onClick={() => setIsMenuOpen(false)}>
              <span className="block py-2 font-bold text-gray-700">
                Features
              </span>
            </Link>
          </li>
          <li>
            <Link href="#pricing" onClick={() => setIsMenuOpen(false)}>
              <span className="block py-2 font-bold text-gray-700">
                Pricing
              </span>
            </Link>
          </li>
          <li>
            <Link href="#about" onClick={() => setIsMenuOpen(false)}>
              <span className="block py-2 font-bold text-gray-700">About</span>
            </Link>
          </li>
          <li>
            <Link href="#contact" onClick={() => setIsMenuOpen(false)}>
              <span className="block py-2 font-bold text-gray-700">
                Contact
              </span>
            </Link>
          </li>
        </ul>

        <div className="absolute bottom-0 w-full p-6 flex justify-center">
          <Link href="/register">
            <button className="bg-primary rounded-lg py-2 hover:scale-105">
              <span className="px-4 font-bold text-white text-lg">Get Started</span>
            </button>
          </Link>
        </div>
      </div>

      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <span className="font-bold text-2xl lg:text-4xl">
              ApplicantAtlas
            </span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <div className="block lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 focus:outline-none h-8 w-8"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:block">
            <ul className="inline-flex items-center">
              <li className="mx-3">
                <Link href="#features">
                  <span className="font-bold text-gray-700 hover:text-gray-900">
                    Features
                  </span>
                </Link>
              </li>
              <li className="mx-3">
                <Link href="#pricing">
                  <span className="font-bold text-gray-700 hover:text-gray-900">
                    Pricing
                  </span>
                </Link>
              </li>
              <li className="mx-3">
                <Link href="#about">
                  <span className="font-bold text-gray-700 hover:text-gray-900">
                    About
                  </span>
                </Link>
              </li>
              <li className="mx-3">
                <Link href="#contact">
                  <span className="font-bold text-gray-700 hover:text-gray-900">
                    Contact
                  </span>
                </Link>
              </li>
              <li className="mx-1.5">
                <Link href="/register">
                  <button className="bg-primary rounded-lg py-2 hover:scale-105">
                    <span className="px-3 font-bold text-white">
                      Get Started
                    </span>
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}

function MenuIcon() {
  // SVG code for menu icon
  return (
    <svg
      enable-background="new 0 0 32 32"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      id="fi_6015685"
    >
      <g id="Layer_1" fill="rgb(0,0,0)">
        <path d="m29 8h-26c-1.1045 0-2-.8955-2-2s.8955-2 2-2h26c1.1045 0 2 .8955 2 2s-.8955 2-2 2z"></path>
        <path d="m29 28h-26c-1.1045 0-2-.8955-2-2s.8955-2 2-2h26c1.1045 0 2 .8955 2 2s-.8955 2-2 2z"></path>
        <path d="m29 18h-26c-1.1045 0-2-.8955-2-2s.8955-2 2-2h26c1.1045 0 2 .8955 2 2s-.8955 2-2 2z"></path>
      </g>
    </svg>
  );
}

function CloseIcon() {
  // SVG code for close icon
  return (
    <svg
      id="fi_2976286"
      enable-background="new 0 0 320.591 320.591"
      viewBox="0 0 320.591 320.591"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <g id="close_1_">
          <path d="m30.391 318.583c-7.86.457-15.59-2.156-21.56-7.288-11.774-11.844-11.774-30.973 0-42.817l257.812-257.813c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875l-259.331 259.331c-5.893 5.058-13.499 7.666-21.256 7.288z"></path>
          <path d="m287.9 318.583c-7.966-.034-15.601-3.196-21.257-8.806l-257.813-257.814c-10.908-12.738-9.425-31.908 3.313-42.817 11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414-6.35 5.522-14.707 8.161-23.078 7.288z"></path>
        </g>
      </g>
    </svg>
  );
}
