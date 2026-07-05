import React from "react";
import { useNavigate } from "react-router-dom";

const SeasonalGuide = () => {
  const navigate = useNavigate();
  return (
    <>
      <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
        >
          Seasonal Guide on Cropping Seasons
        </h1>

        <section>
          <h2 style={{ fontSize: "20px", fontWeight: "600" }}>Introduction</h2>
          <p>
            India's diverse climate and geography enable year-round agricultural
            activity. The country has three primary cropping seasons:{" "}
            <strong>Kharif</strong>, <strong>Rabi</strong>, and{" "}
            <strong>Zaid</strong>. These seasons determine the cultivation
            cycles of various crops, significantly influencing food production
            and economic stability.
          </p>
        </section>

        <section>
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginTop: "16px" }}
          >
            Kharif Season
          </h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>
              <strong>Sowing Period:</strong> June - July (start of monsoon)
            </li>
            <li>
              <strong>Harvesting Period:</strong> September - October
            </li>
            <li>
              <strong>Climate:</strong> Requires high temperature and
              significant rainfall.
            </li>
            <li>
              <strong>Examples:</strong> Rice, Maize, Jowar, Bajra, Cotton,
              Groundnut, Soybean, Sugarcane, Turmeric, Coffee, Tea
            </li>
          </ul>
        </section>

        <section>
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginTop: "16px" }}
          >
            Rabi Season
          </h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>
              <strong>Sowing Period:</strong> October - November (after monsoon)
            </li>
            <li>
              <strong>Harvesting Period:</strong> February - April
            </li>
            <li>
              <strong>Climate:</strong> Requires cooler temperatures and less
              water.
            </li>
            <li>
              <strong>Examples:</strong> Wheat, Barley, Oats, Mustard, Chickpea,
              Lentils, Linseed, Peas
            </li>
          </ul>
        </section>

        <section>
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginTop: "16px" }}
          >
            Zaid Season
          </h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>
              <strong>Sowing Period:</strong> March - June (between Rabi and
              Kharif)
            </li>
            <li>
              <strong>Harvesting Period:</strong> June (early summer)
            </li>
            <li>
              <strong>Climate:</strong> Requires warm, dry weather and longer
              daylight.
            </li>
            <li>
              <strong>Examples:</strong> Watermelon, Muskmelon, Cucumber, Bitter
              Gourd, Pumpkin, Fodder crops
            </li>
          </ul>
        </section>

        <section>
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginTop: "16px" }}
          >
            Impact of Cropping Patterns on Agriculture
          </h2>
          <p>
            Cropping patterns in India are influenced by soil type, monsoon
            variability, irrigation facilities, and technological advancements.
          </p>
        </section>

        <section>
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginTop: "16px" }}
          >
            Challenges and Innovations
          </h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>
              <strong>Water Scarcity:</strong> Adoption of efficient irrigation
              techniques like drip irrigation.
            </li>
            <li>
              <strong>Soil Degradation:</strong> Promotion of sustainable
              farming, crop rotation, and organic fertilizers.
            </li>
            <li>
              <strong>Technological Advancements:</strong> Implementation of
              AI-driven monitoring and precision agriculture.
            </li>
          </ul>
        </section>

        <section>
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginTop: "16px" }}
          >
            Further Reading
          </h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>
              <a
                href="https://byjus.com/free-ias-prep/major-cropping-seasons-in-india/"
                style={{ color: "blue" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Major Cropping Seasons in India
              </a>
            </li>
            <li>
              <a
                href="https://krishijagran.com/crop-calendar"
                style={{ color: "blue" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Crop Calendar by Krishi Jagran
              </a>
            </li>
            <li>
              <a
                href="https://www.allthatgrows.in/blogs/posts/vegetable-growing-season-chart-india"
                style={{ color: "blue" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Vegetable Growing Season Chart
              </a>
            </li>
            <li>
              <a
                href="https://www.indianexpress.com/article/upsc-current-affairs/upsc-essentials/cropping-pattern-dynamics-in-india-and-its-impact-upsc-9548138/"
                style={{ color: "blue" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cropping Pattern Dynamics
              </a>
            </li>
          </ul>
        </section>
      </div>
     <div className="flex justify-center mb-4">
               <button className="bg-white-500 " onClick={()=>navigate("/")}>Home</button> 

      </div>
    </>
  );
};

export default SeasonalGuide;
