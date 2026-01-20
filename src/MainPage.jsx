import React, { useState } from "react";
import { useEffect } from "react";
import "./styles/main.css"

const MainPage = ({ onFileSelected }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const updatedFile = e.target.files[0];
    if (updatedFile) {
      setFile(updatedFile);
      onFileSelected(updatedFile);
    }
  };

  useEffect(() => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  document.querySelectorAll(".reveal-nav").forEach(el => observer.observe(el));

  return () => observer.disconnect();
}, []);

  return (
    <div className="main-container">

      <div className="navbar reveal-nav">

        <div className="navbar-title nav-animation" >
          <a href="#main" className="a-link">GPX Viewer</a>
        </div>

        <div className="navbar-links">
          <div class="links-about">
            <div class="links-about-text nav-animation">
              <a href="#about" class="a-link">About Us</a>
            </div>
            <div class="links-about-text-line"></div>
          </div>

          <div class="links-get-started">
            <div class="links-get-started-text nav-animation">
              <a href="#getstarted" class="a-link">Get Started</a>
            </div>
            <div class="links-get-started-text-line"></div>
          </div>

        </div>
        
      </div>
      <section className="section hero-section" id="main">
        <div className="main-titles reveal">
          <h1 className="main-title">GPX Viewer</h1>
          <h3 className="main-subtitle">The solution to perfect marathons</h3>
        </div>

        <div className="main-btn reveal">
          <div className="main-btn-text">
            <a href="#about" className="a-link">Learn more</a>
          </div>
        </div>
      </section>

      <section className="section about-section" id="about">
        <h1 className="main-title reveal">About Us</h1>
        <div className="subtitle-container reveal" style={{width: "80%"}}>
          <h3 className="main-subtitle about-subtitle">GPX Viewer is an open-source application created to analyze GPX Tracks providing information like: </h3>
          <br />
          <ul>
            <li className="about-list-item">Viewing the track on a map</li>
            <li className="about-list-item">Hourly weather forecast</li>
            <li className="about-list-item">Track length</li>
            <li className="about-list-item">Chart that displays elevation change</li>
            <li className="about-list-item">Trekking poles recommendation</li>
          </ul>
        </div>
      </section>

      <section className="section start-section" id="getstarted">

        <h1 className="main-title reveal">Upload a file to get Started</h1>
        <div className="upload-input reveal">
            <img
              src="/icons/upload.svg"
              height="50"
              width="50"
              alt="Upload icon"
            />
            <input
          id="files"
          type="file"
          accept=".gpx"
          onChange={handleFileChange}
        />
            <label htmlFor="files" style={{cursor: "pointer"}}>Upload a file</label>
        </div>
      </section>
      

      
        
    </div>
    
  );
};

export default MainPage;
