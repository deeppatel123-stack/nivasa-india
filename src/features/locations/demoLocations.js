/**
 * A curated index of REAL Indian places and their approximate coordinates.
 * These are geographic reference points, not property listings. An arbitrary
 * location search requires a geocoding provider in a later phase.
 */
export const DEMO_PLACES = [
    // Cities
    { id: 'ahmedabad', name: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', type: 'city', coordinates: { lat: 23.0225, lng: 72.5714 }, context: 'Ahmedabad, Gujarat', aliases: ['amdavad'] },
    { id: 'mumbai', name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', type: 'city', coordinates: { lat: 19.076, lng: 72.8777 }, context: 'Mumbai, Maharashtra', aliases: ['bombay'] },
    { id: 'bengaluru', name: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', type: 'city', coordinates: { lat: 12.9716, lng: 77.5946 }, context: 'Bengaluru, Karnataka', aliases: ['bangalore', 'bangaluru'] },
    { id: 'pune', name: 'Pune', city: 'Pune', state: 'Maharashtra', type: 'city', coordinates: { lat: 18.5204, lng: 73.8567 }, context: 'Pune, Maharashtra' },
    { id: 'delhi', name: 'Delhi', city: 'Delhi', state: 'Delhi', type: 'city', coordinates: { lat: 28.6139, lng: 77.209 }, context: 'Delhi, India', aliases: ['new delhi'] },
    { id: 'hyderabad', name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', type: 'city', coordinates: { lat: 17.385, lng: 78.4867 }, context: 'Hyderabad, Telangana' },
    { id: 'chennai', name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', type: 'city', coordinates: { lat: 13.0827, lng: 80.2707 }, context: 'Chennai, Tamil Nadu', aliases: ['madras'] },
    { id: 'jaipur', name: 'Jaipur', city: 'Jaipur', state: 'Rajasthan', type: 'city', coordinates: { lat: 26.9124, lng: 75.7873 }, context: 'Jaipur, Rajasthan' },
    { id: 'indore', name: 'Indore', city: 'Indore', state: 'Madhya Pradesh', type: 'city', coordinates: { lat: 22.7196, lng: 75.8577 }, context: 'Indore, Madhya Pradesh' },
    { id: 'kolkata', name: 'Kolkata', city: 'Kolkata', state: 'West Bengal', type: 'city', coordinates: { lat: 22.5726, lng: 88.3639 }, context: 'Kolkata, West Bengal', aliases: ['calcutta'] },
    { id: 'noida', name: 'Noida', city: 'Noida', state: 'Uttar Pradesh', type: 'city', coordinates: { lat: 28.5355, lng: 77.391 }, context: 'Noida, Uttar Pradesh' },
    { id: 'gurugram', name: 'Gurugram', city: 'Gurugram', state: 'Haryana', type: 'city', coordinates: { lat: 28.4595, lng: 77.0266 }, context: 'Gurugram, Haryana', aliases: ['gurgaon'] },
    { id: 'vadodara', name: 'Vadodara', city: 'Vadodara', state: 'Gujarat', type: 'city', coordinates: { lat: 22.3072, lng: 73.1812 }, context: 'Vadodara, Gujarat' },
    { id: 'chandigarh', name: 'Chandigarh', city: 'Chandigarh', state: 'Chandigarh', type: 'city', coordinates: { lat: 30.7333, lng: 76.7794 }, context: 'Chandigarh, India' },
    { id: 'kochi', name: 'Kochi', city: 'Kochi', state: 'Kerala', type: 'city', coordinates: { lat: 9.9312, lng: 76.2673 }, context: 'Kochi, Kerala' },
    // Universities & colleges
    { id: 'nirma-university', name: 'Nirma University', city: 'Ahmedabad', state: 'Gujarat', type: 'university', coordinates: { lat: 22.7756, lng: 72.3056 }, context: 'Ahmedabad, Gujarat', aliases: ['nirma', 'nu'] },
    { id: 'iim-ahmedabad', name: 'IIM Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', type: 'college', coordinates: { lat: 23.0762, lng: 72.5801 }, context: 'Ahmedabad, Gujarat', aliases: ['iima'] },
    { id: 'iit-bombay', name: 'IIT Bombay', city: 'Mumbai', state: 'Maharashtra', type: 'university', coordinates: { lat: 19.1334, lng: 72.9133 }, context: 'Powai, Mumbai', aliases: ['iitb', 'iit bombay powai'] },
    { id: 'iit-delhi', name: 'IIT Delhi', city: 'Delhi', state: 'Delhi', type: 'university', coordinates: { lat: 28.5459, lng: 77.1929 }, context: 'Hauz Khas, Delhi', aliases: ['iitd'] },
    { id: 'du-north-campus', name: 'Delhi University North Campus', city: 'Delhi', state: 'Delhi', type: 'university', coordinates: { lat: 28.7314, lng: 77.1852 }, context: 'Delhi, India', aliases: ['du', 'du north campus', 'north campus'] },
    { id: 'symbiosis-pune', name: 'Symbiosis International University', city: 'Pune', state: 'Maharashtra', type: 'university', coordinates: { lat: 18.5374, lng: 73.8295 }, context: 'Pune, Maharashtra', aliases: ['symbiosis', 'siu'] },
    { id: 'iit-madras', name: 'IIT Madras', city: 'Chennai', state: 'Tamil Nadu', type: 'university', coordinates: { lat: 13.011, lng: 80.2361 }, context: 'Chennai, Tamil Nadu', aliases: ['iitm'] },
    { id: 'vit-vellore', name: 'VIT Vellore', city: 'Vellore', state: 'Tamil Nadu', type: 'university', coordinates: { lat: 12.97, lng: 79.1633 }, context: 'Vellore, Tamil Nadu', aliases: ['vit'] },
    { id: 'anna-university', name: 'Anna University', city: 'Chennai', state: 'Tamil Nadu', type: 'university', coordinates: { lat: 13.0117, lng: 80.2374 }, context: 'Chennai, Tamil Nadu' },
    // Companies & tech parks
    { id: 'infosys-bengaluru', name: 'Infosys Electronic City', city: 'Bengaluru', state: 'Karnataka', type: 'company', coordinates: { lat: 12.8399, lng: 77.677 }, context: 'Bengaluru, Karnataka', aliases: ['infosys', 'infosys electronics city'] },
    { id: 'hinjewadi-it-park', name: 'Hinjewadi IT Park', city: 'Pune', state: 'Maharashtra', type: 'tech_park', coordinates: { lat: 18.5915, lng: 73.7389 }, context: 'Pune, Maharashtra', aliases: ['hinjawadi', 'rajiv gandhi infotech park'] },
    { id: 'hitec-city', name: 'HITEC City', city: 'Hyderabad', state: 'Telangana', type: 'tech_park', coordinates: { lat: 17.444, lng: 78.3793 }, context: 'Hyderabad, Telangana', aliases: ['hitec city', 'hitech city'] },
    { id: 'cyber-city-gurugram', name: 'Cyber City Gurugram', city: 'Gurugram', state: 'Haryana', type: 'tech_park', coordinates: { lat: 28.6315, lng: 77.0477 }, context: 'Gurugram, Haryana', aliases: ['cyber city'] },
    { id: 'whitefield', name: 'Whitefield IT Corridor', city: 'Bengaluru', state: 'Karnataka', type: 'tech_park', coordinates: { lat: 12.9698, lng: 77.7499 }, context: 'Bengaluru, Karnataka', aliases: ['whitefield'] },
    { id: 'manyata-tech-park', name: 'Manyata Tech Park', city: 'Bengaluru', state: 'Karnataka', type: 'tech_park', coordinates: { lat: 13.0356, lng: 77.6439 }, context: 'Bengaluru, Karnataka' },
    { id: 'noida-it-corridor', name: 'Noida IT Corridor', city: 'Noida', state: 'Uttar Pradesh', type: 'tech_park', coordinates: { lat: 28.509, lng: 77.398 }, context: 'Noida, Uttar Pradesh' },
    // Localities
    { id: 'gota', name: 'Gota', city: 'Ahmedabad', state: 'Gujarat', type: 'locality', coordinates: { lat: 22.7618, lng: 72.3157 }, context: 'Ahmedabad, Gujarat' },
    { id: 'sg-highway', name: 'SG Highway', city: 'Ahmedabad', state: 'Gujarat', type: 'locality', coordinates: { lat: 22.7689, lng: 72.3683 }, context: 'Ahmedabad, Gujarat', aliases: ['sarkhej gandhinagar highway'] },
    { id: 'powai', name: 'Powai', city: 'Mumbai', state: 'Maharashtra', type: 'locality', coordinates: { lat: 19.1176, lng: 72.906 }, context: 'Mumbai, Maharashtra' },
    { id: 'andheri-west', name: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', type: 'locality', coordinates: { lat: 19.1136, lng: 72.8697 }, context: 'Mumbai, Maharashtra' },
    { id: 'koramangala', name: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', type: 'locality', coordinates: { lat: 12.9352, lng: 77.6245 }, context: 'Bengaluru, Karnataka' },
    { id: 'electronic-city', name: 'Electronic City', city: 'Bengaluru', state: 'Karnataka', type: 'locality', coordinates: { lat: 12.8452, lng: 77.6604 }, context: 'Bengaluru, Karnataka' },
    { id: 'gachibowli', name: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', type: 'locality', coordinates: { lat: 17.4399, lng: 78.3489 }, context: 'Hyderabad, Telangana' },
    { id: 'vasant-kunj', name: 'Vasant Kunj', city: 'Delhi', state: 'Delhi', type: 'locality', coordinates: { lat: 28.5245, lng: 77.1555 }, context: 'Delhi, India' },
];
export const POPULAR_CITIES = DEMO_PLACES.filter((place) => place.type === 'city').slice(0, 8);
export const POPULAR_UNIVERSITIES = DEMO_PLACES.filter((place) => place.type === 'university' || place.type === 'college').slice(0, 6);
export const POPULAR_TECH_HUBS = DEMO_PLACES.filter((place) => place.type === 'tech_park' || place.type === 'company').slice(0, 6);
