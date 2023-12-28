import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserFull, getJWTUser } from "@/services/UserService";
import { User } from "@/types/models/User";

export interface MenuItem {
  label: string;
  href: string;
  onClick?: () => void;
}

export interface PrimaryButton {
  label: string;
  href: string;
  onClick?: () => void;
}

export interface HeaderProps {
  menuItems: MenuItem[];
  brandName?: string;
  customStyles?: {
    overlay?: string;
    sidebar?: string;
    brand?: string;
    header?: string;
  };
  MenuIconComponent?: React.ComponentType;
  CloseIconComponent?: React.ComponentType;
  primaryButton?: PrimaryButton;
  showUserProfile?: boolean;
}

export default function Header({
  menuItems,
  brandName = "ApplicantAtlas",
  customStyles = {},
  MenuIconComponent = MenuIcon,
  CloseIconComponent = CloseIcon,
  primaryButton = undefined,
  showUserProfile = false,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getJWTUser()
      .then(setUser)
      .catch(() => {
        getUserFull()
          .then(setUser)
          .catch(() => {});
      });
  }, []);

  const userSubmenuItems: MenuItem[] = [
    {
      label: "Settings",
      href: "/user/settings",
    },
  ];

  return (
    <>
      {/* Overlay for Mobile Menu */}
      {isMenuOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${customStyles.overlay}`}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar Menu for Mobile */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 z-30 transition duration-300 ease-in-out bg-white shadow-md lg:hidden ${
          customStyles.sidebar
        }`}
      >
        {/* Brand Name */}
        <div className="flex items-center justify-between p-6">
          <Link href="/">
            <span
              className={`font-bold text-2xl lg:text-4xl cursor-pointer ${customStyles.brand}`}
            >
              {brandName}
            </span>
          </Link>
        </div>

        {/* Mobile Menu Items */}
        <ul className="space-y-6 p-6">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link href={item.href}>
                <span
                  className="block py-2 font-bold text-gray-700 cursor-pointer"
                  onClick={() => {
                    setIsMenuOpen(false);
                    item.onClick && item.onClick();
                  }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          ))}

          {/* User Profile Section */}
          {showUserProfile && user && (
            userSubmenuItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href}>
                  <span
                    className="block py-2 font-bold text-gray-700 cursor-pointer"
                    onClick={() => {
                      setIsMenuOpen(false);
                      item.onClick && item.onClick();
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>

        {/* Registration Button for Mobile */}
        {primaryButton && (
          <div className="absolute bottom-0 w-full p-6 flex justify-center">
            <Link href={primaryButton.href}>
              <button className="bg-primary rounded-lg py-2 hover:scale-105">
                <span className="px-4 font-bold text-white text-lg">
                  {primaryButton.label}
                </span>
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Main Header */}
      <header className={`bg-white shadow-md ${customStyles.header}`}>
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Brand Name for Desktop */}
          <Link href="/">
            <span
              className={`font-bold text-2xl lg:text-4xl cursor-pointer ${customStyles.brand}`}
            >
              {brandName}
            </span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <div className="block lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 focus:outline-none h-8 w-8"
            >
              {isMenuOpen ? <CloseIconComponent /> : <MenuIconComponent />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center">
            <ul className="inline-flex items-center">
              {menuItems.map((item, index) => (
                <li key={index} className="mx-3">
                  <Link href={item.href}>
                    <span className="font-bold text-gray-700 hover:text-gray-900">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Registration Button for Desktop */}
            {primaryButton && (
              <div className="ml-4">
                <Link href={primaryButton.href}>
                  <button className="bg-primary rounded-lg py-2 hover:scale-105">
                    <span className="px-3 font-bold text-white">
                      {primaryButton.label}
                    </span>
                  </button>
                </Link>
              </div>
            )}

            {/* User Profile Section */}
            {showUserProfile && user && (
              <div className="ml-4 relative">
                {/* User Profile Button and Dropdown */}
                <details className="dropdown">
                  <summary className="btn btn-ghost btn-circle avatar online placeholder cursor-pointer">
                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                      <span className="text-lg">
                        {user.firstName.charAt(0).toUpperCase() +
                          user.lastName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </summary>

                  {/* Dropdown Menu */}
                  <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40">
                    {userSubmenuItems.map((item, index) => (
                      <li key={index}>
                        <Link href={item.href}>
                          <span
                            className="block py-2 font-bold text-gray-700 cursor-pointer"
                            onClick={() => {
                              item.onClick && item.onClick();
                            }}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
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
      enableBackground="new 0 0 32 32"
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
      enableBackground="new 0 0 320.591 320.591"
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
