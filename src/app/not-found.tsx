
export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/bg5.jpg')] bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 bg-black opacity-70"></div>
      </div>

    
      <div className="relative z-10 text-center text-white space-y-6">
        <h1 className="text-5xl font-bold text-red-500">404 - Page Not Found</h1>
        <p className="text-lg text-gray-300">
          Oops! The page you&#39;re looking for doesn&#39;t exist.
        </p>
        <a
          href="/"
          className="inline-block bg-black-600 hover:bg-grey-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-300"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}
