import React from "react";
import {
  Leaf,
  ShieldCheck,
  Truck,
  PackageCheck,
  MapPin,
  LockKeyhole,
  PhoneCall,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import StatisticalData from "./Creators/StatisticalData";
import { motion as Motion } from "framer-motion";
import Linkedin from "../assets/Linkedin.png"
import Twitter from "../assets/twitter.png"

const Home = () => {
  let states = [
    "MP",
    "Maharashtra",
    "Rajasthan",
    "Gujarat",
    "Odisha",
    "Karnataka",
    "Sikkim",
    "Uttar Pradesh",
  ];
  const navigate = useNavigate()

  const loopStates = [...states, ...states, ...states];

  return (
    <div className="w-full bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="w-full bg-green-100 py-4 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-3xl lg:text-5xl font-extrabold leading-snug text-black  mb-6 [text-shadow:2px_1px_0_green]"
          >
            Bridging Farmers and Buyers with Trust &amp; Technology
          </h2>

          <p className="text-black max-w-3xl mx-auto text-sm sm:text-lg leading-relaxed">
            CropConnect lets farmers showcase and sell certified crops directly, cutting out middlemen and raising incomes.
          </p>
        </div>
      </section>

      {/* Organic Farming */}
      <section className="bg-white w-full py-4 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl lg:text-4xl font-bold text-green-700 mb-8">
            Growing Organic Movement 🍃
          </h3>
          <p className="text-gray-700 max-w-4xl mx-auto mb-6 text-sm sm:text-lg leading-relaxed">
            India leads globally with over 4.4 million organic farmers—and has
            nearly 2.78 million hectares under certification, though it
            comprises just ~2% of national farmland.
          </p>

          {/* Infinite carousel for states */}
          <div className="relative overflow-hidden w-full">
            {/* Fade effect overlay (left + right) */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />

            <Motion.div
              className="flex gap-4 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                duration: 25,
                ease: "linear",
              }}
            >
              {loopStates.map((state, idx) => (
                <div
                  key={idx}
                  className="border border-green-300 bg-white py-3 px-6 rounded-xl shadow-sm text-gray-700 inline-block min-w-[120px] sm:min-w-[160px] text-center text-sm sm:text-base hover:shadow-md transition"
                >
                  {state}
                </div>
              ))}
            </Motion.div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-4">
            (Top organic states per APEDA 2022-23)
          </p>
        </div>
      </section>



      {/* Snapshot Facts */}
      <section className="w-full py-4 px-4 sm:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl lg:text-4xl font-bold text-green-700 mb-8">
            India's Agriculture Snapshot 📈
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FactCard number="16 %" label="of GDP from agriculture" />
            <FactCard
              number="394M acres"
              label="2nd Largest Farmland"
            />
            <FactCard number="48.3 %" label="of cropland is irrigated" />
            <FactCard number="354 MT" label="Grain Forecast 2025" />
          </div>
        </div>
      </section>
      {/* Statistical Highlights */}
      <p className="bg-white text-center text-lg font-semibold text-green-700 ">
        Agricultural Insights
      </p>

      <StatisticalData />

      {/* Features */}
      <section className="w-full py-4 px-4 sm:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl lg:text-4xl font-bold text-green-700 mb-8">
            --Power in Your Hands--
          </h3>

          <div className="grid grid-cols-4 gap-4">
            {[
              {
                icon: Leaf,
                title: "Organic Listings",
                desc: "Upload certified organic produce with transparent pricing and verification.",
              },
              {
                icon: MapPin,
                title: "Smart Filters",
                desc: "Easily search crops by category, variety, or location for quick access.",
              },
              {
                icon: ShieldCheck,
                title: "Verification",
                desc: "Secure and reliable trading through verified accounts and listings.",
              },
              {
                icon: PackageCheck,
                title: "Weather Insights",
                desc: "Stay informed with real-time, crop-friendly weather updates and alerts.",
              },
              {
                icon: LockKeyhole,
                title: "Secure Login",
                desc: "Protect your account with JWT-secured login and password reset options.",
              },
              {
                icon: Truck,
                title: "Direct Sales",
                desc: "Eliminate middlemen by connecting directly with trusted farmers and buyers.",
              },
              {
                icon: LockKeyhole,
                title: "Role-Based Access",
                desc: "Manage access and permissions securely based on user roles and rights.",
              },
              {
                icon: Truck,
                title: "Seasonal Calendar",
                desc: "Access guides and resources to grow crops effectively each season.",
              },
            ].map(({ icon: _icon, title, desc }) => {
              const IconComponent = _icon;
              return (
                <div
                  key={title}
                  className="bg-green-50 p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center space-y-3"
                >
                  <IconComponent className="w-8 h-8 text-green-600" />
                  <p className="font-semibold sm:text-xl text-green-800 text-center">
                    {title}
                  </p>
                  <p className="hidden sm:block text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="bg-white w-full py-2 px-4 sm:px-8 lg:px-16  text-black text-center">
        <div className="max-w-4xl mx-auto">


          <h2
            className="text-2xl sm:text-3xl lg:text-5xl font-extrabold leading-snug text-black  mb-6 [text-shadow:2px_1px_0_green]"
          >
            Ready to Empower Farmers?
          </h2>
          <span className="font-bold text-black">  Join CropConnect today and be part of transforming India's agricultural future.</span>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1 
                 text-2xl sm:text-3xl lg:text-3xl font-bold 
                 px-4 sm:px-6 lg:px-8 rounded-md sm:py-3 hover:underline hover:decoration-blue-500 hover:underline-offset-2"
          >
            <span className="inline text-yellow-500 font-bold m-0">Get</span>
            <span className="inline text-green-700 font-bold m-0">Started</span>
          </Link>


        </div>


      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-300 py-6 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">

          {/* Brand Info */}
          <div className="text-center sm:text-left">

            <h4 className="font-semibold mb-2 text-lg hover:underline hover:text-blue-500 cursor-pointer" onClick={() => {
              navigate("/");
              window.scrollTo(0, 0); // optional: scroll to top
            }}>
              <span className="text-green-800 border-yellow-500 px-1 font-bold rounded bg-yellow-500">Crop</span>
              <span className="text-white">Connect</span>

            </h4>
            <p className="text-sm">
              Empowering farmers, buyers with direct market access and digital tools for a sustainable future.
            </p>
          </div>


          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold  mb-2 text-lg text-center">Quick Links</h4>
            <ul className="grid grid-cols-2 text-sm ">
              <li><Link to="/SeasonalGuide" className="hover:underline">Crop Calendar</Link></li>
              <li><Link to="/FarmLaw" className="hover:underline">Farmer Laws</Link></li>
              <li><Link to="/weather" className="hover:underline">Weathercast</Link></li>
              <li><Link to="/signup" className="hover:underline">Register</Link></li>
            </ul>
          </div>


          {/* Support */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-2 text-lg">Support</h4>
            <p className="flex justify-center sm:justify-start items-center gap-2 text-sm mb-1">
              <PhoneCall className="w-4 h-4" /> +91-xxxxx-xxxxx
            </p>
            <p className="text-sm">Email: support@cropconnect.in</p>
          </div>

          {/* Social Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-2 text-lg">Follow Us</h4>
            <div className="flex justify-center sm:justify-start items-center gap-4">
              <a
                href="https://x.com/vmodi5425"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform duration-200"
              >
                <img src={Twitter} alt="Twitter" className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/bikash-prasad-barnwal/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform duration-200"
              >
                <img src={Linkedin} alt="LinkedIn" className="w-6 h-6" />
              </a>
              <a
                href="https://heybikash.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-semibold hover:underline"
              >
                Portfolio
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="text-center mt-6 text-xs text-gray-500">
          © {new Date().getFullYear()} CropConnect. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

const FactCard = ({ number, label }) => (
  <div className="bg-green-50 py-2 rounded-xl shadow hover:shadow-md transition">
    <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700">
      {number}
    </h4>
    <p className="mt-2 text-sm sm:text-base text-gray-700">{label}</p>
  </div>
);

export default Home;
