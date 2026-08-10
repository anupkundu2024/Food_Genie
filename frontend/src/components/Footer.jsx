import { Link } from "react-router-dom";

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.9.07s-3.6 0-4.9-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.14 0-3.5 0-4.74.07-.9.04-1.38.19-1.7.31-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.12.32-.27.8-.31 1.7C3.43 8.5 3.43 8.86 3.43 12s0 3.5.07 4.74c.04.9.19 1.38.31 1.7.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.12.8.27 1.7.31 1.24.07 1.6.07 4.74.07s3.5 0 4.74-.07c.9-.04 1.38-.19 1.7-.31.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.12-.32.27-.8.31-1.7.07-1.24.07-1.6.07-4.74s0-3.5-.07-4.74c-.04-.9-.19-1.38-.31-1.7a2.85 2.85 0 0 0-.69-1.06 2.85 2.85 0 0 0-1.06-.69c-.32-.12-.8-.27-1.7-.31C15.5 4 15.14 4 12 4Zm0 3.06A4.94 4.94 0 1 1 12 17a4.94 4.94 0 0 1 0-9.88Zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28Zm5.14-.3a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M22 5.9c-.7.32-1.5.53-2.3.63.83-.5 1.46-1.28 1.76-2.22-.78.46-1.63.8-2.55.98A4.02 4.02 0 0 0 12 8.9c0 .32.03.63.1.92A11.4 11.4 0 0 1 3.8 5.6a4.02 4.02 0 0 0 1.24 5.37c-.65-.02-1.26-.2-1.8-.5v.05a4.02 4.02 0 0 0 3.23 3.94c-.32.09-.65.13-.99.13-.24 0-.48-.02-.72-.07a4.02 4.02 0 0 0 3.76 2.8A8.07 8.07 0 0 1 2 19.07a11.38 11.38 0 0 0 6.16 1.8c7.4 0 11.44-6.13 11.44-11.44l-.01-.52A8.18 8.18 0 0 0 22 5.9Z" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
  </svg>
);

export default function Footer() {
  const year = 2026;

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 sm:py-12 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 text-xl font-black">
            <span>🍔</span>
            <span className="text-orange-500">Food Genie</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            AI-powered food delivery. Discover the best restaurants near you and
            get your favourite meals delivered hot and fresh.
          </p>
          <p className="mt-4 text-xs text-gray-500">
            © {year} Food Genie. All rights reserved.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="transition hover:text-orange-500">Home</Link></li>
            <li><a href="#" className="transition hover:text-orange-500">About Us</a></li>
            <li><a href="#" className="transition hover:text-orange-500">Contact</a></li>
            <li><a href="#" className="transition hover:text-orange-500">FAQs</a></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            For Restaurants
          </h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="transition hover:text-orange-500">Partner with us</a></li>
            <li><a href="#" className="transition hover:text-orange-500">Restaurant login</a></li>
            <li><a href="#" className="transition hover:text-orange-500">Business blog</a></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            Follow Us
          </h3>
          <p className="mb-3 text-sm text-gray-400">
            Stay updated with offers and new restaurants.
          </p>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition hover:bg-orange-600 hover:text-white">
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition hover:bg-orange-600 hover:text-white">
              <TwitterIcon className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition hover:bg-orange-600 hover:text-white">
              <FacebookIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
