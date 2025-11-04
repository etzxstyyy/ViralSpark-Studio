import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-fuchsia-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-3">
         <svg
            className="w-10 h-10 text-fuchsia-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1.283 14.283-2.121-2.121 4.596-4.596 2.121 2.121-4.596 4.596zM12 8a.997.997 0 0 0-.707.293L8.464 11.121l-2.121-2.121L9.172 6.172a3.002 3.002 0 0 1 4.242 0l2.829 2.829a3.002 3.002 0 0 1 0 4.242l-2.829 2.829-2.121-2.121L14.121 11.121A.997.997 0 0 0 12 8z" />
          </svg>
        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          ViralSpark Studio
        </h1>
      </div>
    </header>
  );
};

export default Header;
