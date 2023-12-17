import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <span className="font-bold text-2xl lg:text-4xl">ApplicantAtlas</span>
        </Link>
        <div className="block lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 focus:outline-none h-6 w-6"
          >
            {isMenuOpen ? (
              <svg
                viewBox="0 0 365.696 365.696"
                xmlns="http://www.w3.org/2000/svg"
                id="fi_1828774"
              >
                <path d="m243.1875 182.859375 113.132812-113.132813c12.5-12.5 12.5-32.765624 0-45.246093l-15.082031-15.082031c-12.503906-12.503907-32.769531-12.503907-45.25 0l-113.128906 113.128906-113.132813-113.152344c-12.5-12.5-32.765624-12.5-45.246093 0l-15.105469 15.082031c-12.5 12.503907-12.5 32.769531 0 45.25l113.152344 113.152344-113.128906 113.128906c-12.503907 12.503907-12.503907 32.769531 0 45.25l15.082031 15.082031c12.5 12.5 32.765625 12.5 45.246093 0l113.132813-113.132812 113.128906 113.132812c12.503907 12.5 32.769531 12.5 45.25 0l15.082031-15.082031c12.5-12.503906 12.5-32.769531 0-45.25zm0 0"></path>
              </svg>
            ) : (
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
            )}
          </button>
        </div>
        <div className="hidden lg:block">
          <ul className="inline-flex">
            <li>
              <Link href="#features">
                <span className="px-4 font-bold">Features</span>
              </Link>
            </li>
            <li>
              <Link href="#pricing">
                <span className="px-4 font-bold">Pricing</span>
              </Link>
            </li>
            <li>
              <Link href="#about">
                <span className="px-4 font-bold">About</span>
              </Link>
            </li>
            <li>
              <Link href="#contact">
                <span className="px-4 font-bold">Contact</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } lg:hidden bg-white shadow-md px-12`}
      >
        <ul>
          <li>
            <Link href="#features">
              <span className="block px-6 py-2 font-bold text-gray-700 hover:bg-gray-100">
                Features
              </span>
            </Link>
          </li>
          <li>
            <Link href="#pricing">
              <span className="block px-6 py-2 font-bold text-gray-700 hover:bg-gray-100">
                Pricing
              </span>
            </Link>
          </li>
          <li>
            <Link href="#about">
              <span className="block px-6 py-2 font-bold text-gray-700 hover:bg-gray-100">
                About
              </span>
            </Link>
          </li>
          <li>
            <Link href="#contact">
              <span className="block px-6 py-2 font-bold text-gray-700 hover:bg-gray-100">
                Contact
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
