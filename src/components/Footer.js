import React, { Component } from 'react';

//import custom components
import { Button } from '../components/Button';


//import css
import '../css/Footer.css';

//import assets
import facebook from '../assets/images/footer-icons/facebook-social.svg';
import twitter from '../assets/images/footer-icons/twitter-social.svg';
import youtube from '../assets/images/footer-icons/youtube-social.svg';
import linkedin from '../assets/images/footer-icons/linkedin-social.svg';
import email from '../assets/images/footer-icons/email-social.svg';

import FooterMobile from './FooterMobile';

class Footer extends Component {
  render() {
    return (
      <div className="page-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="link-container">
              <div className="title">Quick Links</div>
                <div className="links">
                  <ul>
                    <li><a href="https://www.sap.com/why-sap.html">Why SAP</a></li>
                    <li><a href="https://www.sap.com/products/intelligent-enterprise.html">Intelligent Enterprise</a></li>
                    <li><a href="https://www.sap.com/products/sme-business-software.html">Small and Midsize Enterprises</a></li>
                    <li><a href="https://www.sap.com/products/financial-management.html">Finance</a></li>
                    <li><a href="https://www.sap.com/products/roadmaps.html">Product Roadmaps</a></li>
                    <li><a href="https://developers.sap.com/">Developer</a></li>
                    <li><a href="https://support.sap.com/en/index.html">Support Portal</a></li>
                  </ul>
                </div>
            </div>
             <div className="link-container">
              <div className="title">About SAP</div>
                <div className="links">
                  <ul>
                    <li><a href="https://www.sap.com/corporate/en/company.html">Company Information</a></li>
                    <li><a href="https://www.sap.com/corporate/en/company/office-locations.html">Worldwide Directory</a></li>
                    <li><a href="https://www.sap.com/corporate/en/investors.html">Investor Relations</a></li>
                    <li><a href="https://news.sap.com/">News and Press</a></li>
                    <li><a href="https://www.sap.com/about/events.html">Events</a></li>
                    <li><a href="https://www.sap.com/about/customer-involvement/customer-stories.html">Customer Stories</a></li>
                    <li><a href="https://www.sap.com/registration/newsletter.html">Newsletter</a></li>
                  </ul>
                </div> 
            </div>
             <div className="link-container">
              <div className="title">Site Information</div>
                <div className="links">
                  <ul>
                    <li><a href="https://www.sap.com/about/legal/privacy.html">Privacy</a></li>
                    <li><a href="https://www.sap.com/corporate/en/legal/terms-of-use.html">Terms of Use</a></li>
                    <li><a href="https://www.sap.com/about/legal/impressum.html">Legal Disclosure</a></li>
                    <li><a href="https://www.sap.com/about/legal/copyright.html">Copyright</a></li>
                    <li><a href="https://www.sap.com/about/legal/trademark.html">Trademark</a></li>
                    <li><a href="https://www.sap.com/site-map.html">Sitemap</a></li>
                  </ul>
                </div>
            </div>
            <div className="subscribe-container">
              <div className="title">Stay tuned.</div>
              <div className="form-container">
                <input className="email-input" type="text" placeholder="Enter your email" />
                <Button label="Subscribe" />
              </div>
              
              <div className="social-container">
                <a href="https://www.facebook.com/SAP" className="social-link" title="facebook">
                  <img src={facebook} alt="facebook"></img>
                </a>
                <a href="https://twitter.com/sap" className="social-link" title="twitter">
                  <img src={twitter} alt="twitter"></img>
                </a>
                <a href="https://www.youtube.com/user/SAP" className="social-link" title="youtube">
                  <img src={youtube} alt="youtube"></img>
                </a>
                <a href="https://www.linkedin.com/company/sap/" className="social-link" title="linkedin">
                  <img src={linkedin} alt="linkedin"></img>
                </a>
                <a href="mailto:?body=https%3A%2F%2Fwww.sap.com%2Fproducts%2Froadmaps.html?source=social-atw-mailto" className="social-link" title="email">
                  <img src={email} alt="email"></img>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Footer;